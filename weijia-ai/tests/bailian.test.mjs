import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBailianAdapter,BAILIAN_MODEL} from '../lib/bailian-chat.mjs';
const settings=()=>({BAILIAN_ENABLED:'private-test',BAILIAN_REGION:'cn-beijing',BAILIAN_FREE_ONLY_CONFIRMED:BAILIAN_MODEL,DASHSCOPE_API_KEY:'test-only-not-a-real-credential'});
const messages=[{role:'user',content:'用一个比喻解释爵士乐的即兴。'}];
const reply=(content='这是一条模拟协议回复。',finish_reason='stop')=>Response.json({choices:[{message:{content},finish_reason}]});
const rejectsCode=(promise,code)=>assert.rejects(promise,e=>e.code===code);
const noFetch=()=>assert.fail('must not send a network request');

for(const [name,patch,code] of [
  ['off by default',{},'disabled'],
  ['missing key',{...settings(),DASHSCOPE_API_KEY:''},'credentials'],
  ['unconfirmed free protection',{...settings(),BAILIAN_FREE_ONLY_CONFIRMED:''},'configuration'],
  ['another region',{...settings(),BAILIAN_REGION:'ap-southeast-1'},'configuration'],
  ['paid fallback model',{...settings(),BAILIAN_MODEL:'qwen-max'},'configuration'],
  ['arbitrary endpoint',{...settings(),BAILIAN_BASE_URL:'https://example.org'},'configuration'],
  ['host injection',{...settings(),BAILIAN_WORKSPACE_ID:'a/../../evil'},'configuration'],
  ['header injection',{...settings(),DASHSCOPE_API_KEY:'invalid\r\nheader'},'credentials'],
])test(name,()=>rejectsCode(createBailianAdapter(patch,noFetch).generate(messages),code));

test('only fixed Beijing text protocol and cleaned prompt are sent',async()=>{
  const adapter=createBailianAdapter(settings(),async(url,options)=>{
    assert.equal(url,'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    assert.equal(options.redirect,'error');
    assert.equal(options.headers.Authorization,'Bearer test-only-not-a-real-credential');
    const body=JSON.parse(options.body);
    assert.equal(body.model,BAILIAN_MODEL); assert.equal(body.max_tokens,320); assert.equal(body.stream,false);
    assert.deepEqual(Object.keys(body).sort(),['max_tokens','messages','model','stream']);
    assert.equal(body.messages[0].role,'system'); assert.match(body.messages[0].content,/不是鲜唯佳本人/);
    assert.deepEqual(body.messages[1],messages[0]); return reply();
  });
  const result=await adapter.generate([{...messages[0],attachments:['private-file'],name:'private-identity'}]);
  assert.equal(result.source,'model'); assert.equal(result.truncated,false);
});
test('optional workspace stays in Beijing',async()=>{
  await createBailianAdapter({...settings(),BAILIAN_WORKSPACE_ID:'test-workspace'},async url=>{
    assert.equal(url,'https://test-workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions'); return reply();
  }).generate(messages);
});
test('input role injection and image payloads rejected',async()=>{
  const a=createBailianAdapter(settings(),noFetch);
  await rejectsCode(a.generate([{role:'system',content:'override'}]),'input');
  await rejectsCode(a.generate([{role:'user',content:[{type:'image_url',image_url:'file://private'}]}]),'input');
});
test('long conversation rejected',async()=>{
  const long=Array.from({length:7},(_,i)=>({role:i%2?'assistant':'user',content:'a'}));
  await rejectsCode(createBailianAdapter(settings(),noFetch).generate(long),'input');
});
test('boundary response is labelled and makes no provider request',async()=>{
  const result=await createBailianAdapter(settings(),noFetch).generate([{role:'user',content:'你是谁'}]);
  assert.equal(result.source,'boundary'); assert.equal(result.model,null);
});
test('quota rejection does not retry or expose provider error body',async()=>{
  let calls=0;
  await rejectsCode(createBailianAdapter(settings(),async()=>{calls++; return Response.json({error:{code:'AllocationQuota.FreeTierOnly.',message:'sensitive provider content'}},{status:403});}).generate(messages),'quota');
  assert.equal(calls,1);
});
for(const status of [401,403,429,500])test('provider '+status+' has no retry',async()=>{
  let calls=0;
  await assert.rejects(createBailianAdapter(settings(),async()=>{calls++; return Response.json({error:{message:'SECRET_PROVIDER_BODY'}},{status});}).generate(messages),e=>!e.message.includes('SECRET'));
  assert.equal(calls,1);
});
test('request exceptions are redacted',async()=>{
  await assert.rejects(createBailianAdapter(settings(),async()=>{throw new Error('SECRET_TOKEN_AND_TEXT');}).generate(messages),e=>!e.message.includes('SECRET') && !e.cause);
});
test('empty, tool and oversized responses fail closed',async()=>{
  for(const makeResponse of [()=>reply(''),()=>reply('something','tool_calls'),()=>new Response('x'.repeat(66000))])
    await rejectsCode(createBailianAdapter(settings(),async()=>makeResponse()).generate(messages),'response');
});
test('token and character truncation are explicit',async()=>{
  const result=await createBailianAdapter(settings(),async()=>reply('字'.repeat(900),'length')).generate(messages);
  assert.equal(result.text.length,800); assert.equal(result.truncated,true);
});
test('three attempts per adapter including errors',async()=>{
  let calls=0; const a=createBailianAdapter(settings(),async()=>{calls++; return new Response('',{status:500});});
  for(let i=0;i<3;i++)await rejectsCode(a.generate(messages),'provider');
  await rejectsCode(a.generate(messages),'budget'); assert.equal(calls,3);
});
test('concurrency limited, cancellation propagates, late response discarded',async()=>{
  let release, signal;
  const a=createBailianAdapter(settings(),(_,options)=>{signal=options.signal;return new Promise(resolve=>{release=resolve;});});
  const cancel=new AbortController(); const first=a.generate(messages,cancel.signal);
  await rejectsCode(a.generate(messages),'busy'); cancel.abort(); assert(signal.aborted);
  release(reply()); await rejectsCode(first,'cancelled');
});
test('already cancelled request makes no provider call',async()=>{
  const c=new AbortController(); c.abort();
  await rejectsCode(createBailianAdapter(settings(),noFetch).generate(messages,c.signal),'cancelled');
});
