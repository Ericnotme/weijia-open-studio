// Deterministic monthly scenarios. These are invented stress paths, not BTC history.
export const SCENARIOS = {
 cycle: {label:'周期大致重复', note:'人为构造的 48 个月涨跌；特意包含有利于择时的情景。'},
 trend: {label:'一路上涨 · 卖飞', note:'卖出后继续上涨，检验等待下一次低点的机会成本。'},
 fade: {label:'周期逐渐消失', note:'波动逐轮减弱；规则不随结果重新优化。'},
 crash: {label:'长期下跌 · 无反弹', note:'价格逐步跌去约 90%；等待不保证回本。'},
 flat: {label:'长期横盘', note:'价格不变，直接观察交易与软件费用侵蚀。'}
};
export const DEFAULTS={capital:10000,months:96,scenario:'trend',shift:0,buy:3,sell:33,satellite:15,feeBps:10,slippageBps:10,annualCost:0};
export function validateConfig(c){
 for(const [key,min,max,integer] of [['capital',100,1e8,false],['months',12,240,true],['shift',-12,12,true],['buy',0,46,true],['sell',1,47,true],['satellite',0,100,false],['feeBps',0,500,false],['slippageBps',0,500,false],['annualCost',0,1e6,false]]){
  if(!Number.isFinite(c[key])||c[key]<min||c[key]>max||(integer&&!Number.isInteger(c[key])))throw new Error('实验参数超出允许范围：'+key);
 }
 if(c.buy>=c.sell)throw new Error('每轮卖出月份必须晚于买入月份。');
 if(!SCENARIOS[c.scenario])throw new Error('请选择已有情景。');return c;
}
export function scenarioPrices(c){
 validateConfig(c);
 const cycle=t=>0.012*t+0.95*Math.sin(2*Math.PI*(t-14-c.shift)/48);
 const value=t=>c.scenario==='flat'?0:c.scenario==='trend'?0.018*t:c.scenario==='crash'?-Math.log(10)*t/c.months:c.scenario==='fade'?0.005*t+0.95*Math.exp(-t/55)*Math.sin(2*Math.PI*(t-14-c.shift)/48):cycle(t);
 return Array.from({length:c.months+1},(_,i)=>({date:`M${i}`,price:50000*Math.exp(value(i)-value(0))}));
}
export function parsePriceCSV(text){
 if(typeof text!=='string'||text.length>100000)throw new Error('价格文件不能超过 100 KB。');
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.shift()?.trim().toLowerCase()!=='date,price')throw new Error('首行应为 date,price；每月一个美元价格。');
 if(lines.length<13||lines.length>241)throw new Error('需要 13～241 个月度价格点（连续月份）。');
 let previous=null;
 return lines.map((line,i)=>{
  const parts=line.trim().split(',');if(parts.length!==2)throw new Error(`第 ${i+2} 行需要日期和价格两列。`);
  const [date,raw]=parts.map(s=>s.trim());
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error(`第 ${i+2} 行日期应为 YYYY-MM-DD。`);
  const d=new Date(date+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)throw new Error(`第 ${i+2} 行日期无效。`);
  const serial=d.getUTCFullYear()*12+d.getUTCMonth();
  if(previous!==null&&serial!==previous+1)throw new Error('月份必须连续、升序、每月一条；不自动填补缺失价格。');previous=serial;
  const price=Number(raw);if(!raw||!Number.isFinite(price)||price<=0||price>1e9)throw new Error(`第 ${i+2} 行价格无效。`);
  return {date,price};
 });
}
export function compare(c,rows=scenarioPrices(c)){
 validateConfig(c);
 if(!Array.isArray(rows)||rows.length<13||rows.length>241||rows.some(r=>!Number.isFinite(r.price)||r.price<=0||r.price>1e9))throw new Error('价格序列无效。');
 const months=rows.length-1,fee=c.feeBps/10000,slip=c.slippageBps/10000;
 const run=(kind,ratio)=>{
  const core={cash:c.capital*(1-ratio),btc:0},sat={cash:c.capital*ratio,btc:0};
  let costs=0,subscription=0,trades=0,insolvent=false;const values=[];
  const buy=(a,budget,p)=>{const spend=Math.min(a.cash,Math.max(0,budget));if(spend<1e-8)return;const q=spend/(p*(1+slip)*(1+fee));a.cash-=spend;a.btc+=q;costs+=spend-q*p;trades++;};
  const sell=(a,q,p)=>{q=Math.min(q,a.btc);if(q<1e-12)return;const net=q*p*(1-slip)*(1-fee);a.btc-=q;a.cash+=net;costs+=q*p-net;trades++;};
  const charge=(due,p)=>{
   for(const a of [sat,core]){const pay=Math.min(a.cash,due);a.cash-=pay;due-=pay;subscription+=pay;}
   for(const a of [sat,core]){if(due<=1e-8)break;const q=Math.min(a.btc,due/(p*(1-slip)*(1-fee)));sell(a,q,p);const pay=Math.min(a.cash,due);a.cash-=pay;due-=pay;subscription+=pay;}
   if(due>1e-6)insolvent=true;
  };
  rows.forEach(({price:p},i)=>{
   if(i===0&&kind!=='dca')buy(core,core.cash,p);
   if(kind==='dca'&&i<months)buy(core,c.capital/months,p);
   if(kind==='cycle'||kind==='blend'){
    if(i<months&&i%48===c.buy)buy(sat,sat.cash,p);
    if(i%48===c.sell)sell(sat,sat.btc,p);
    if(i>0)charge(c.annualCost/12,p);
   }
   if(i===months){sell(core,core.btc,p);sell(sat,sat.btc,p);}
   values.push(core.cash+sat.cash+(core.btc+sat.btc)*p);
  });
  let peak=c.capital,drawdown=0;for(const v of values){peak=Math.max(peak,v);drawdown=Math.max(drawdown,1-v/peak);}
  return {kind,values,final:values.at(-1),returnPct:(values.at(-1)/c.capital-1)*100,drawdown:drawdown*100,costs,subscription,trades,insolvent};
 };
 return [run('hold',0),run('dca',0),run('cycle',1),run('blend',c.satellite/100)];
}
export function makeSnapshot(config,source,rows,results,now=new Date()){
 validateConfig(config);
 return {schema:1,type:'clock-experiment',createdAt:now.toISOString(),source,config:{...config},prices:rows.map(r=>({...r})),results:results.map(r=>({kind:r.kind,final:r.final,returnPct:r.returnPct,drawdown:r.drawdown,costs:r.costs,subscription:r.subscription})),limitations:['Local browser timestamp, not independent proof or immutable registration.','Synthetic paths are not history. Imported data provenance is not independently verified.','Monthly observations miss intramonth drawdowns. No tax, interest, inflation, liquidity limits or guaranteed fills.','Not a prospective performance record.']};
}
