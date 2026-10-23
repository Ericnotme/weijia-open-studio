export const DAY=86400000;
export const SCHEMA=1;
export function dateMs(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('请输入完整日期。');
 const n=Date.parse(value+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw new Error('日期无效。');return n;
}
export function addDays(date,days){return new Date(dateMs(date)+days*DAY).toISOString().slice(0,10);}
export function addYears(date,years){const d=new Date(dateMs(date));const month=d.getUTCMonth();d.setUTCFullYear(d.getUTCFullYear()+years);if(d.getUTCMonth()!==month)d.setUTCDate(0);return d.toISOString().slice(0,10);}
export function validatePlan(plan){
 if(!plan||typeof plan!=='object'||typeof plan.id!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(plan.id))throw new Error('计划编号无效。');
 const buy=dateMs(plan.buyDate),sell=dateMs(plan.sellDate);
 if(buy>=sell)throw new Error('卖出日期必须晚于买入日期。');
 if(sell>=dateMs(addYears(plan.buyDate,4)))throw new Error('卖出日期必须位于同一个四年周期内。');
 if(buy<dateMs('2009-01-03')||sell>=dateMs('2200-01-01'))throw new Error('请选择 2009～2199 年的日期。');
 if(![2500,5000,10000].includes(plan.allocationBps))throw new Error('仓位比例无效。');
 if(!Number.isInteger(plan.feeBps)||plan.feeBps<0||plan.feeBps>500)throw new Error('手续费应为 0～500 个基点。');
 if(typeof plan.repeat!=='boolean')throw new Error('重复周期设置无效。');return plan;
}
export function newAccount(){return {schema:SCHEMA,cashCents:1000000,btcSats:0,trades:[],enabled:false};}
export function validateAccount(state){
 if(!state||state.schema!==SCHEMA||!Number.isSafeInteger(state.cashCents)||state.cashCents<0||!Number.isSafeInteger(state.btcSats)||state.btcSats<0||!Array.isArray(state.trades)||state.trades.length>1000||typeof state.enabled!=='boolean')throw new Error('模拟账户数据无效，请重置模拟账户。');
 for(const t of state.trades)if(typeof t.id!=='string'||!['buy','sell'].includes(t.side)||!Number.isSafeInteger(t.quantitySats)||t.quantitySats<1||!Number.isSafeInteger(t.priceCents)||t.priceCents<1||!Number.isSafeInteger(t.feeCents)||t.feeCents<0||!Number.isFinite(Date.parse(t.executedAt)))throw new Error('模拟成交记录无效。');
 if(new Set(state.trades.map(t=>t.id)).size!==state.trades.length)throw new Error('模拟成交记录重复。');return state;
}
export function restorePaperBackup(input){
 if(!input||input.mode!=='paper'||input.schema!==1)throw new Error('只接受 Clock 模拟计划备份。');
 const p=validatePlan(input.plan),s=validateAccount(input.account);
 const plan={schema:1,id:p.id,buyDate:p.buyDate,sellDate:p.sellDate,allocationBps:p.allocationBps,feeBps:p.feeBps,repeat:p.repeat};
 const trades=s.trades.map(t=>{
  if(typeof t.executedAt!=='string'||!Number.isInteger(t.cycle)||t.cycle<0||t.cycle>50||(!p.repeat&&t.cycle!==0)||!Number.isSafeInteger(t.grossCents)||t.grossCents<0)throw new Error('成交记录字段无效。');
  const event=eventsForCycle(p,t.cycle).find(e=>e.side===t.side);
  if(t.id!==event.id||t.date!==event.date)throw new Error('成交记录与计划不一致。');
  return {...event,executedAt:t.executedAt,quantitySats:t.quantitySats,priceCents:t.priceCents,grossCents:t.grossCents,feeCents:t.feeCents,quoteSource:t.quoteSource==='coinbase'?'coinbase':'manual',mode:'paper'};
 });
 return {schema:1,plan,state:{schema:1,cashCents:s.cashCents,btcSats:s.btcSats,enabled:false,trades}};
}
export function cycleIndex(plan,now){let index=Math.max(0,Math.floor((new Date(now).getUTCFullYear()-Number(plan.buyDate.slice(0,4)))/4));if(index>0&&dateMs(addYears(plan.buyDate,index*4))>now)index--;return index;}
export function eventsForCycle(plan,cycle){return ['buy','sell'].map(side=>({id:`${plan.id}-${cycle}-${side}`,cycle,side,date:addYears(side==='buy'?plan.buyDate:plan.sellDate,cycle*4)}));}
export function nextEvent(plan,state,now){
 validatePlan(plan);const index=plan.repeat?cycleIndex(plan,now):0;
 for(let c=index;c<=index+(plan.repeat?1:0);c++)for(const event of eventsForCycle(plan,c))if(!state.trades.some(t=>t.id===event.id)&&now<dateMs(event.date)+DAY)return event;
 return null;
}
const ceilDiv=(a,b)=>(a+b-1n)/b;
export function executePaper(plan,account,quote,now=Date.now()){
 validatePlan(plan);validateAccount(account);
 if(!Number.isFinite(now))throw new Error('当前时间无效。');
 const state=structuredClone(account);
 const out=(status,message,trade=null)=>({state,status,message,trade});
 if(!state.enabled)return out('paused','模拟执行已暂停。');
 const cycle=plan.repeat?cycleIndex(plan,now):0;
 const event=eventsForCycle(plan,cycle).find(e=>now>=dateMs(e.date)&&now<dateMs(e.date)+DAY);
 if(!event)return out('waiting','未到执行日，或该日已错过；不会事后补单。');
 if(state.trades.some(t=>t.id===event.id))return out('done','本周期的这个动作已执行，不会重复下单。');
 if(!quote||!Number.isSafeInteger(quote.priceCents)||quote.priceCents<1||quote.priceCents>100000000000||!Number.isFinite(quote.at)||now-quote.at>5*60000||quote.at-now>30000)return out('stale','参考价缺失或已超过 5 分钟，请更新价格后重试。');
 const price=BigInt(quote.priceCents),feeBps=BigInt(plan.feeBps),sats=100000000n;
 let quantity,cost,fee;
 if(event.side==='buy'){
  if(state.btcSats!==0)return out('blocked','仍持有上一笔模拟 BTC；不会叠加买入。');
  const budget=BigInt(state.cashCents)*BigInt(plan.allocationBps)/10000n;
  const gross=budget*10000n/(10000n+feeBps);quantity=gross*sats/price;
  if(quantity===0n)return out('blocked','模拟现金不足以购买 1 聪。');
  cost=ceilDiv(quantity*price,sats);fee=ceilDiv(cost*feeBps,10000n);
  if(cost+fee>BigInt(state.cashCents))return out('blocked','模拟现金不足。');
  state.cashCents-=Number(cost+fee);state.btcSats+=Number(quantity);
 }else{
  if(!state.trades.some(t=>t.id===`${plan.id}-${cycle}-buy`)||state.btcSats===0)return out('blocked','本周期没有已成交买单；不会卖空，也不会补买。');
  quantity=BigInt(state.btcSats);cost=quantity*price/sats;fee=ceilDiv(cost*feeBps,10000n);
  state.cashCents+=Number(cost-fee);state.btcSats=0;
 }
 const trade={...event,executedAt:new Date(now).toISOString(),quantitySats:Number(quantity),priceCents:quote.priceCents,grossCents:Number(cost),feeCents:Number(fee),quoteSource:quote.source==='coinbase'?'coinbase':'manual',mode:'paper'};
 state.trades.push(trade);validateAccount(state);return out('filled',`${event.side==='buy'?'买入':'卖出'}模拟成交。`,trade);
}
export function demoCycle(day,buyPrice,sellPrice){
 if(!Number.isInteger(day)||day<0||day>1461||![buyPrice,sellPrice].every(p=>Number.isFinite(p)&&p>=1&&p<=1e9))throw new Error('请输入有效的示意价格。');
 const plan={id:'isolated-demo',buyDate:'2030-01-31',sellDate:addDays('2030-01-01',1100),allocationBps:10000,feeBps:10,repeat:false};
 let state={...newAccount(),enabled:true};
 if(day>=30)state=executePaper(plan,state,{priceCents:Math.round(buyPrice*100),at:dateMs(plan.buyDate),source:'manual'},dateMs(plan.buyDate)).state;
 if(day>=1100)state=executePaper(plan,state,{priceCents:Math.round(sellPrice*100),at:dateMs(plan.sellDate),source:'manual'},dateMs(plan.sellDate)).state;
 const mark=day<1100?buyPrice:sellPrice;
 return {state,equity:state.cashCents/100+state.btcSats/1e8*mark,stage:day<30?'等待买入':day<1100?'已买入 · 持有中':'已卖出 · 等待下一周期'};
}
export function calendar(plan){validatePlan(plan);const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Clock//Paper Plan//ZH','CALSCALE:GREGORIAN',...eventsForCycle(plan,0).flatMap(e=>['BEGIN:VEVENT',`UID:${e.id}@clock.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${e.date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(e.date,1).replaceAll('-','')}`,`SUMMARY:Clock ${e.side==='buy'?'模拟买入':'模拟卖出'}计划`,'DESCRIPTION:模拟计划提醒。不是已确认市场极值或真实自动交易。','END:VEVENT']),'END:VCALENDAR',''].join('\r\n');}
