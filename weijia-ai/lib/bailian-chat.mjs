// Server/CLI only. Do not import this module into browser components.
import {SYSTEM_PROMPT, boundaryReply, validateMessages} from './persona.mjs';

export const BAILIAN_MODEL = 'qwen3.7-plus';
const MESSAGES = {
  disabled: '百炼私有测试未启用。',
  configuration: '仅允许北京地域、qwen3.7-plus 和已确认的免费额度用完即停配置。',
  credentials: '尚未安全配置百炼凭据，未发起请求。',
  input: '测试输入格式错误或过长。',
  budget: '本次测试已达到3次请求上限，请停止并核对免费额度。',
  busy: '已有请求进行中，请先完成或取消。',
  cancelled: '请求已停止；已经消耗的额度可能仍会计入用量。',
  timeout: '模型请求超时，未自动重试。',
  quota: '免费额度不可用或已用尽，服务已停止，未切换付费模型。',
  authorization: '百炼未授权本次请求；请本人检查北京地域凭据和模型权限。',
  limited: '百炼暂时限流，未自动重试。',
  provider: '百炼未完成请求，未生成替代答案。',
  response: '百炼未返回可用的文字回复。',
};
export class BailianError extends Error {
  constructor(code) { super(MESSAGES[code] || MESSAGES.provider); this.name='BailianError'; this.code=code; }
}

// The marker records operator acknowledgement; it cannot enable or verify the
// provider's billing protection. The actual control must remain enabled there.
function resolveConfig(env) {
  if(env.BAILIAN_ENABLED!=='private-test')throw new BailianError('disabled');
  if(env.BAILIAN_REGION!=='cn-beijing' || env.BAILIAN_FREE_ONLY_CONFIRMED!==BAILIAN_MODEL ||
     (env.BAILIAN_MODEL && env.BAILIAN_MODEL!==BAILIAN_MODEL) || env.BAILIAN_BASE_URL)
    throw new BailianError('configuration');
  const workspace=env.BAILIAN_WORKSPACE_ID;
  if(workspace && !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$/.test(workspace))throw new BailianError('configuration');
  const key=env.DASHSCOPE_API_KEY;
  if(typeof key!=='string' || !key || key.length>1024 || /\s|[^\x21-\x7e]/.test(key))throw new BailianError('credentials');
  const host=workspace ? `${workspace}.cn-beijing.maas.aliyuncs.com` : 'dashscope.aliyuncs.com';
  return {key,endpoint:`https://${host}/compatible-mode/v1/chat/completions`};
}

async function boundedJson(response, signal) {
  if(!response.body)throw new BailianError('response');
  const reader=response.body.getReader(); let size=0; let raw=''; const decoder=new TextDecoder();
  try {
    while(true) {
      signal.throwIfAborted(); const {done,value}=await reader.read(); if(done)break;
      size+=value.byteLength;
      if(size>65536) { await reader.cancel(); throw new BailianError('response'); }
      raw+=decoder.decode(value,{stream:true});
    }
    return JSON.parse(raw+decoder.decode());
  } finally { reader.releaseLock(); }
}

// A deliberately small private test adapter, not a distributed public quota.
// The supplied env is server-side only. No env reads, network calls or logging
// happen on module import or during status checks.
export function createBailianAdapter(env, fetcher=fetch) {
  let attempts=0, active=false;
  return {
    async generate(value, callerSignal) {
      const config=resolveConfig(env); // Fail closed even for boundary replies.
      let messages;
      try {
        messages=validateMessages(value);
        if(messages.length>5 || messages.reduce((n,m)=>n+m.content.length,0)>4000)throw new Error();
      } catch { throw new BailianError('input'); }
      if(callerSignal?.aborted)throw new BailianError('cancelled');
      if(active)throw new BailianError('busy');
      if(attempts>=3)throw new BailianError('budget');
      const boundary=boundaryReply(messages.at(-1).content);
      if(boundary)return {text:boundary,source:'boundary',model:null};
      attempts++; active=true;
      const timeout=AbortSignal.timeout(20000);
      const signal=callerSignal ? AbortSignal.any([callerSignal,timeout]) : timeout;
      try {
        const response=await fetcher(config.endpoint,{
          method:'POST',redirect:'error',signal,
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${config.key}`},
          body:JSON.stringify({model:BAILIAN_MODEL,stream:false,max_tokens:320,
            messages:[{role:'system',content:SYSTEM_PROMPT},...messages]}),
        });
        signal.throwIfAborted();
        if(!response.ok) {
          let code='';
          if(response.status===403) {
            try { const error=await boundedJson(response,signal); code=error.error?.code || error.code || ''; } catch {}
          } else { await response.body?.cancel(); }
          if(response.status===403 && String(code).startsWith('AllocationQuota.FreeTierOnly'))throw new BailianError('quota');
          if(response.status===401 || response.status===403)throw new BailianError('authorization');
          throw new BailianError(response.status===429?'limited':'provider');
        }
        const data=await boundedJson(response,signal); signal.throwIfAborted();
        const choice=data.choices?.[0], content=choice?.message?.content;
        if(typeof content!=='string' || !content.trim() || !['stop','length'].includes(choice.finish_reason))throw new BailianError('response');
        const text=content.trim();
        return {text:text.slice(0,800),source:'model',model:BAILIAN_MODEL,truncated:choice.finish_reason==='length' || text.length>800};
      } catch(error) {
        if(callerSignal?.aborted)throw new BailianError('cancelled');
        if(timeout.aborted)throw new BailianError('timeout');
        if(error instanceof BailianError)throw error;
        // Never surface provider bodies, request headers, URLs or exception text.
        throw new BailianError('provider');
      } finally { active=false; }
    },
  };
}
