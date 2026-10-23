import {SYSTEM_PROMPT,boundaryReply,validateMessages} from './persona.mjs';
export const LOCAL_MODEL='llama3.2:latest';
const ENDPOINT='http://127.0.0.1:11434';
export async function localStatus(fetcher=fetch) {
  try {
    const response=await fetcher(ENDPOINT+'/api/tags',{signal:AbortSignal.timeout(2000),redirect:'error'});
    if(!response.ok) throw new Error();
    const data=await response.json();
    const model=data.models?.find(m=>m.name===LOCAL_MODEL && m.size>1e9 && !m.remote_host && !m.remote_model);
    return {ready:!!model,mode:'local',model:LOCAL_MODEL,reason:model?'本机模型已连接':'未发现已安装的本地模型'};
  } catch { return {ready:false,mode:'local',model:LOCAL_MODEL,reason:'本机模型服务不可用'}; }
}
export async function generateLocal(value,signal,fetcher=fetch) {
  const messages=validateMessages(value);
  const boundary=boundaryReply(messages.at(-1).content);
  if(boundary)return {text:boundary,source:'boundary',model:null};
  const response=await fetcher(ENDPOINT+'/api/chat',{
    method:'POST',headers:{'content-type':'application/json'},redirect:'error',signal,
    body:JSON.stringify({model:LOCAL_MODEL,stream:false,messages:[{role:'system',content:SYSTEM_PROMPT},...messages],options:{temperature:0.35,num_predict:320,num_ctx:4096},keep_alive:'5m'})
  });
  if(!response.ok) throw new Error('模型服务未完成请求');
  const data=await response.json();
  const text=data.message?.content?.trim();
  if(!text || data.done!==true)throw new Error('模型没有返回完整回复');
  return {text:text.slice(0,800),source:'model',model:LOCAL_MODEL};
}
