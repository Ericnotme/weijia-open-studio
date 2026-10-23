// Paper-only persistent scheduler. There is no exchange credential, signer,
// transaction broadcast or live-order endpoint in this process.
import fs from 'node:fs';import path from 'node:path';
import {validatePlan,validateAccount,newAccount,executePaper,dateMs,DAY,cycleIndex,eventsForCycle} from '../src/strategy.mjs';
const args=process.argv.slice(2),arg=name=>args[args.indexOf(name)+1];
if(!args.includes('--config')){console.error('Usage: npm run clockd -- --config clock-plan.json [--state runtime/account.json] [--enable-paper] [--once]');process.exit(1);}
const config=JSON.parse(fs.readFileSync(path.resolve(arg('--config')),'utf8'));
if(config.mode!=='paper')throw new Error('This runner only accepts mode=paper. Live execution is not implemented.');
const plan=validatePlan(config.plan),statePath=path.resolve(args.includes('--state')?arg('--state'):'runtime/account.json');
fs.mkdirSync(path.dirname(statePath),{recursive:true,mode:0o700});
const lockPath=statePath+'.lock';let lock;
try{lock=fs.openSync(lockPath,'wx',0o600);fs.writeFileSync(lock,String(process.pid));}catch{throw new Error('A runner owns this account lock. Check the process before removing a stale .lock file.');}
process.on('exit',release);for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>process.exit(0));
let state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):config.account||newAccount();validateAccount(state);
if(state.planId&&state.planId!==plan.id)throw new Error('The state belongs to another plan. Use a separate --state path.');
state.planId=plan.id;if(args.includes('--enable-paper'))state.enabled=true;
function save(){const file=statePath+'.tmp';const fd=fs.openSync(file,'w',0o600);try{fs.writeFileSync(fd,JSON.stringify(state,null,2));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(file,statePath);}
function release(){if(lock!==undefined){fs.closeSync(lock);lock=undefined;try{fs.unlinkSync(lockPath);}catch{}}}

let busy=false;
async function tick(){
 if(busy)return;busy=true;
 try{
  const now=Date.now(),cycle=plan.repeat?cycleIndex(plan,now):0;
  const due=eventsForCycle(plan,cycle).find(e=>now>=dateMs(e.date)&&now<dateMs(e.date)+DAY&&!state.trades.some(t=>t.id===e.id));
  if(!state.enabled||!due){console.log(new Date().toISOString(),state.enabled?'WAITING · paper only':'PAUSED · paper only');return;}
  const response=await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Price service unavailable; no simulated fill');
  const json=await response.json(),price=Number(json.data?.amount);if(json.data?.currency!=='USD'||!Number.isFinite(price)||price<1)throw new Error('Invalid reference price');
  const result=executePaper(plan,state,{priceCents:Math.round(price*100),at:Date.now(),source:'coinbase'},Date.now());state=result.state;save();console.log(new Date().toISOString(),result.status,result.trade?JSON.stringify(result.trade):result.message);
 }catch(error){console.error(new Date().toISOString(),'NO FILL',error.message);}finally{busy=false;}
}
save();await tick();if(!args.includes('--once'))setInterval(tick,60000);
