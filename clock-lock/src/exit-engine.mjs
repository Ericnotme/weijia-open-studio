// Amounts use integer asset units (1e-8) and USD cents. No signer or order endpoint.
export const UNIT=100000000;
const U=100000000n,B=10000n;
export const DEFAULT_EXIT={schema:1,symbol:'BTC',quantityUnits:50000000,referenceCents:10000000,targetCents:2000000,recoveredCents:0,reserveBps:3000,feeBps:10,slippageBps:20,fixedFeeCents:0,levels:[{priceCents:10000000,weight:50},{priceCents:12000000,weight:30},{priceCents:15000000,weight:20}]};
const integer=(v,min,max,label)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw new Error(label+'超出范围。');};
export function validateExit(p){
 if(!p||p.schema!==1||!['BTC','ETH','SOL'].includes(p.symbol))throw new Error('请选择支持的资产。');
 for(const [key,min,max,label] of [['quantityUnits',1,1e14,'持币数量'],['referenceCents',1,1e11,'参考价'],['targetCents',1,1e11,'现金目标'],['recoveredCents',0,1e11,'已回收金额'],['reserveBps',0,10000,'保留比例'],['feeBps',0,500,'手续费'],['slippageBps',0,1000,'滑点'],['fixedFeeCents',0,1e8,'每笔固定费用']])integer(p[key],min,max,label);
 if(!Array.isArray(p.levels)||p.levels.length!==3)throw new Error('需要三个卖出档位。');
 let last=0;for(const l of p.levels){integer(l.priceCents,1,1e11,'档位价格');integer(l.weight,1,98,'现金分配比例');if(l.priceCents<=last)throw new Error('三档价格必须依次升高。');last=l.priceCents;}
 if(p.levels.reduce((s,l)=>s+l.weight,0)!==100)throw new Error('三档现金分配比例合计必须为 100%。');
 return p;
}
export function canonicalExit(p){validateExit(p);return Object.fromEntries(Object.keys(DEFAULT_EXIT).map(k=>[k,k==='levels'?p.levels.map(l=>({priceCents:l.priceCents,weight:l.weight})):p[k]]));}
const ceil=(a,b)=>(a+b-1n)/b;
export function proceeds(quantityUnits,priceCents,p){
 const slipped=BigInt(priceCents)*BigInt(10000-p.slippageBps);
 const gross=BigInt(quantityUnits)*slipped/(U*B),fee=ceil(gross*BigInt(p.feeBps),B)+BigInt(p.fixedFeeCents);
 return {grossCents:Number(gross),feeCents:Number(fee),netCents:Number(gross-fee)};
}
export function unitsForNet(target,price,p){
 if(target<=0)return 0;
 const numerator=BigInt(target+p.fixedFeeCents+2)*U*B*B;
 const denominator=BigInt(price)*BigInt(10000-p.slippageBps)*BigInt(10000-p.feeBps);
 let hi=ceil(numerator,denominator)+1n;
 if(hi>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('目标需要的持币数量过大，请调整金额或价格。');
 let lo=0n;while(lo<hi){const mid=(lo+hi)/2n;if(proceeds(Number(mid),price,p).netCents>=target)hi=mid;else lo=mid+1n;}return Number(lo);
}
export function validateLedger(p,ledger){
 validateExit(p);if(!Array.isArray(ledger)||ledger.length>300)throw new Error('成交记录格式无效或超过 300 条。');
 let sold=0,total=0;const ids=new Set();
 for(const f of ledger){
  if(!f||typeof f.id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(f.id)||ids.has(f.id))throw new Error('成交编号无效或重复。');ids.add(f.id);
  integer(f.stage,0,2,'成交档位');integer(f.quantityUnits,1,p.quantityUnits,'成交数量');integer(f.priceCents,1,1e11,'成交价格');integer(f.feeCents,0,1e11,'实际费用');
  if(typeof f.at!=='string'||!Number.isFinite(Date.parse(f.at)))throw new Error('成交时间无效。');
  const gross=BigInt(f.quantityUnits)*BigInt(f.priceCents)/U;
  if(gross>BigInt(Number.MAX_SAFE_INTEGER)||BigInt(f.feeCents)>gross)throw new Error('成交金额过大或费用超过成交额。');
  sold+=f.quantityUnits;total+=Number(gross)-f.feeCents;
  if(sold>p.quantityUnits||!Number.isSafeInteger(total)||total>1e13)throw new Error('累计成交超出持仓或金额范围。');
 }
 return ledger;
}
export function compileExit(p,ledger=[]){
 validateLedger(p,ledger);
 const reserveUnits=Number(ceil(BigInt(p.quantityUnits)*BigInt(p.reserveBps),B));
 const soldUnits=ledger.reduce((s,f)=>s+f.quantityUnits,0),currentUnits=p.quantityUnits-soldUnits;
 const recoveredByStage=p.levels.map((_,i)=>ledger.filter(f=>f.stage===i).reduce((s,f)=>s+Number(BigInt(f.quantityUnits)*BigInt(f.priceCents)/U)-f.feeCents,0));
 const recovered=p.recoveredCents+recoveredByStage.reduce((a,b)=>a+b,0),remaining=Math.max(0,p.targetCents-recovered);
 const originalRemaining=Math.max(0,p.targetCents-p.recoveredCents);
 const targets=p.levels.map(l=>Math.floor(originalRemaining*l.weight/100));targets[2]=originalRemaining-targets[0]-targets[1];
 const raw=targets.map((t,i)=>Math.max(0,t-recoveredByStage[i])),rawSum=raw.reduce((a,b)=>a+b,0);
 // Credit any overfill to the overall goal; do not sell the same goal twice.
 const adjusted=raw.map(x=>rawSum?Number(BigInt(remaining)*BigInt(x)/BigInt(rawSum)):0);
 let residue=remaining-adjusted.reduce((a,b)=>a+b,0);for(let i=2;i>=0&&residue>0;i--)if(raw[i]>0){adjusted[i]+=residue;residue=0;}
 let cumulative=0;
 const rows=p.levels.map((l,i)=>{const qty=unitsForNet(adjusted[i],l.priceCents,p);cumulative+=qty;const flow=qty?proceeds(qty,l.priceCents,p):{grossCents:0,feeCents:0,netCents:0};return {stage:i,...l,targetCents:adjusted[i],quantityUnits:qty,...flow,afterUnits:currentUnits-cumulative};});
 const requiredUnits=rows.reduce((s,r)=>s+r.quantityUnits,0),availableUnits=Math.max(0,currentUnits-reserveUnits);
 const breach=currentUnits<reserveUnits,feasible=!breach&&requiredUnits<=availableUnits,completed=remaining===0;
 return {rows,reserveUnits,soldUnits,currentUnits,availableUnits,requiredUnits,recoveredCents:recovered,remainingCents:remaining,feasible,completed,breach,shortUnits:Math.max(0,requiredUnits-availableUnits),leftUnits:currentUnits-requiredUnits,blendedPriceCents:requiredUnits?rows.reduce((s,r)=>s+r.priceCents*r.quantityUnits,0)/requiredUnits:0};
}
export function appendFill(p,ledger,fill){validateLedger(p,[...ledger,fill]);return [...ledger,{id:fill.id,stage:fill.stage,quantityUnits:fill.quantityUnits,priceCents:fill.priceCents,feeCents:fill.feeCents,at:fill.at}];}
export function restoreExit(input){
 if(!input||input.schema!==1||input.type!=='exit-pilot-backup')throw new Error('只接受兑现计划备份。');
 const plan=canonicalExit(input.plan);validateLedger(plan,input.ledger);
 return {schema:1,type:'exit-pilot-backup',plan,ledger:input.ledger.map(f=>({id:f.id,stage:f.stage,quantityUnits:f.quantityUnits,priceCents:f.priceCents,feeCents:f.feeCents,at:f.at})),savedAt:typeof input.savedAt==='string'?input.savedAt:new Date().toISOString()};
}
export function simulateExit(p,ledger,prices){
 if(!Array.isArray(prices)||prices.length<1||prices.length>100)throw new Error('情景价格数量无效。');
 let simulation=structuredClone(ledger);const actions=[],points=[];
 for(const [i,price] of prices.entries()){
  integer(price,1,1e11,'情景价格');
  for(let stage=0;stage<3;stage++){
   const c=compileExit(p,simulation),row=c.rows[stage];
   if(!c.feasible||c.completed||!row.targetCents||price<row.priceCents)continue;
   const quantityUnits=unitsForNet(row.targetCents,price,p);if(quantityUnits>c.availableUnits)continue;
   const gross=Number(BigInt(quantityUnits)*BigInt(price)/U),net=proceeds(quantityUnits,price,p).netCents;
   const fill={id:`paper-${i}-${stage}`,stage,quantityUnits,priceCents:price,feeCents:gross-net,at:new Date(Date.UTC(2030,0,1+i)).toISOString()};
   simulation=appendFill(p,simulation,fill);actions.push({...fill,step:i,netCents:net});
  }
  const c=compileExit(p,simulation);points.push({step:i,priceCents:price,recoveredCents:c.recoveredCents,currentUnits:c.currentUnits,equityCents:c.recoveredCents+Number(BigInt(c.currentUnits)*BigInt(price)/U)});
 }
 return {actions,points,result:compileExit(p,simulation)};
}
export function ordersCSV(p,c){
 if(!c.feasible)throw new Error('计划不可行，不能导出待执行清单。');
 return 'mode,asset,stage,trigger_reference_usd,sell_quantity,target_net_usd,assumed_fee_bps,assumed_slippage_bps,fixed_fee_usd\r\n'+c.rows.filter(r=>r.quantityUnits>0).map(r=>['planning_only',p.symbol,r.stage+1,(r.priceCents/100).toFixed(2),(r.quantityUnits/UNIT).toFixed(8),(r.targetCents/100).toFixed(2),p.feeBps,p.slippageBps,(p.fixedFeeCents/100).toFixed(2)].join(',')).join('\r\n');
}
