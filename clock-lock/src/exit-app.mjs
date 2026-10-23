import {UNIT,DEFAULT_EXIT,canonicalExit,compileExit,appendFill,restoreExit,simulateExit,ordersCSV} from './exit-engine.mjs';
const $=id=>document.getElementById(id),KEY='clock.exit.v1';
const dollars=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100);
const coins=u=>(u/UNIT).toFixed(8).replace(/0+$/,'').replace(/\.$/,'')||'0';
const ids=['symbol','quantity','reference','target','recovered','reserve','fee','slippage','fixed-fee',...Array.from({length:3},(_,i)=>[`price-${i}`,`weight-${i}`]).flat()];
const key=p=>JSON.stringify({...p,referenceCents:0});
let saved=null,latest=null,timer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('toast').hidden=true,6000);}
function number(id,scale=1){const raw=$(id).value,n=Number(raw),v=n*scale;if(!raw.trim()||!Number.isFinite(n)||!Number.isSafeInteger(Math.round(v))||Math.abs(v-Math.round(v))>0.0001)throw new Error('请填写有效数字，并检查小数精度。');return Math.round(v);}
function read(){return canonicalExit({schema:1,symbol:$('symbol').value,quantityUnits:number('quantity',UNIT),referenceCents:number('reference',100),targetCents:number('target',100),recoveredCents:number('recovered',100),reserveBps:number('reserve',100),feeBps:number('fee',100),slippageBps:number('slippage',100),fixedFeeCents:number('fixed-fee',100),levels:Array.from({length:3},(_,i)=>({priceCents:number(`price-${i}`,100),weight:number(`weight-${i}`)}))});}
function populate(p){for(const [id,v] of Object.entries({symbol:p.symbol,quantity:p.quantityUnits/UNIT,reference:p.referenceCents/100,target:p.targetCents/100,recovered:p.recoveredCents/100,reserve:p.reserveBps/100,fee:p.feeBps/100,slippage:p.slippageBps/100,'fixed-fee':p.fixedFeeCents/100}))$(id).value=v;for(let i=0;i<3;i++){$(`price-${i}`).value=p.levels[i].priceCents/100;$(`weight-${i}`).value=p.levels[i].weight;}}
function write(next){localStorage.setItem(KEY,JSON.stringify(next));saved=next;}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function ledgerView(){
 const rows=saved?.ledger||[];$('ledger-count').textContent=rows.length+' 笔';$('undo-fill').disabled=!rows.length;
 $('fills-body').replaceChildren(...rows.slice().reverse().map(f=>{const tr=document.createElement('tr'),net=Number(BigInt(f.quantityUnits)*BigInt(f.priceCents)/BigInt(UNIT))-f.feeCents;for(const v of [new Date(f.at).toLocaleString('zh-CN'),String(f.stage+1),coins(f.quantityUnits)+' '+saved.plan.symbol,dollars(f.priceCents),dollars(net)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}return tr;}));
 if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.className='empty';td.textContent='还没有实际成交记录。预演中的模拟卖出不会出现在这里。';tr.append(td);$('fills-body').append(tr);}
 for(const id of ids)if(id!=='reference')$(id).disabled=!!rows.length;
}
function render(){
 try{
  const p=read(),aligned=saved&&key(saved.plan)===key(p),ledger=aligned?saved.ledger:[],c=compileExit(p,ledger);latest={p,c,ledger,aligned};
  const feasible=c.feasible;
  $('goal-error').textContent='';$('feasibility').textContent=c.breach?'保留底线已被突破':c.completed?'现金目标已完成':feasible?'数量约束可行':'目标存在冲突';$('feasibility').classList.toggle('danger',!feasible);
  $('outcome-title').textContent=c.breach?'实际成交已超出保留底线':c.completed?'目标已经达到，可以停止卖出':feasible?'这两个目标，可以同时写进计划':'现有可卖币量，不够完成这组目标';
  $('outcome-copy').textContent=c.breach?'剩余持仓已经少于预设保留数量。暂停生成新卖单，先核对成交记录。':c.completed?'剩余待卖数量归零；已达成的现金目标不会再次被分配。':feasible?'如果各档按假设价格与费用成交，现金目标和保留币量可以同时满足。':`当前档位下还缺 ${coins(c.shortUnits)} ${p.symbol} 的可卖数量。可调整现金目标、保留比例或档位；提高价格也会增加无法成交的可能。`;
  $('remaining').textContent=dollars(c.remainingCents);$('required').textContent=coins(c.requiredUnits)+' '+p.symbol;$('left').textContent=c.leftUnits>=0?coins(c.leftUnits)+' '+p.symbol:'持仓不足';$('floor').textContent=coins(c.reserveUnits)+' '+p.symbol;
  const sold=Math.min(500,c.soldUnits/p.quantityUnits*500),sell=Math.min(500-sold,c.requiredUnits/p.quantityUnits*500),keep=Math.max(0,500-sold-sell);
  for(const [id,x,width] of [['sold-bar',0,sold],['sell-bar',sold,sell],['keep-bar',sold+sell,keep]]){$(id).setAttribute('x',x);$(id).setAttribute('width',width);}
  const friction=c.rows.reduce((sum,r)=>sum+(r.quantityUnits?Number(BigInt(r.quantityUnits)*BigInt(r.priceCents)/BigInt(UNIT))-r.netCents:0),0);
  $('friction').textContent=`累计已回收 ${dollars(c.recoveredCents)}；待卖计划预计费用与滑点 ${dollars(friction)}。`;
  for(const r of c.rows){$(`qty-${r.stage}`).textContent=r.quantityUnits?coins(r.quantityUnits)+' '+p.symbol:'已完成';$(`net-${r.stage}`).textContent=dollars(r.netCents);$(`after-${r.stage}`).textContent=r.afterUnits>=0?coins(r.afterUnits):'超出持仓';}
  const triggered=c.rows.filter(r=>r.quantityUnits>0&&p.referenceCents>=r.priceCents).length;
  $('trigger-note').textContent=c.completed?'目标完成，没有待执行卖单。':!feasible?'计划不可行，清单导出与预演执行已停用。':triggered?`输入的参考价已达到 ${triggered} 档条件；这里只做提示，没有提交任何订单。`:'输入的参考价尚未达到待卖档位。';
  $('export-orders').disabled=!feasible||c.completed;$('save-plan').disabled=!feasible;$('run-scenario').disabled=!feasible;
  $('record-fill').disabled=!aligned;$('fill-note').textContent=aligned?'只记录你确认已发生的成交；不会下单。':'请先保存当前计划，再记录实际成交。';
  $('save-plan').textContent=aligned?'更新本机计划':'保存计划并开始跟踪';
  $('save-state').textContent=aligned?`本机已保存 · ${saved.ledger.length} 笔实际成交 · 关闭网页后没有后台自动交易。`:saved?'当前有未保存的修改；已有计划仍在本机，记录成交前请先保存。':'所有数据仅保存在当前浏览器。保存计划不会下单，也不会授权转账。';
  $('export-backup').disabled=false;
 }catch(e){latest=null;$('goal-error').textContent=e.message;$('feasibility').textContent='请检查输入';$('feasibility').classList.add('danger');$('outcome-title').textContent='修正输入后再生成计划';$('outcome-copy').textContent='上一组结果已清除，避免误用。';for(const id of ['remaining','required','left','floor'])$(id).textContent='—';for(let i=0;i<3;i++)for(const name of ['qty','net','after'])$(`${name}-${i}`).textContent='—';for(const id of ['sold-bar','sell-bar','keep-bar'])$(id).setAttribute('width',0);for(const id of ['export-orders','save-plan','run-scenario','record-fill','export-backup'])$(id).disabled=true;$('trigger-note').textContent='';$('friction').textContent='';}
 $('scenario-result').textContent='点击「运行预演」，查看这一组参数下的执行结果。';$('scenario-steps').replaceChildren();
}
for(const id of ids)$(id).addEventListener('input',()=>{$('input-mode').textContent='当前输入';render();});
$('goal-form').onsubmit=e=>e.preventDefault();
$('save-plan').onclick=()=>{if(!latest||!latest.c.feasible)return;try{const next={schema:1,type:'exit-pilot-backup',plan:latest.p,ledger:latest.aligned?saved.ledger:[],savedAt:new Date().toISOString()};write(next);$('input-mode').textContent='本机计划';ledgerView();render();toast('已保存。请在原有交易平台执行；这里不会自动下单。');}catch{toast('本机存储不可用，请使用备份导出保存。');}};
$('export-orders').onclick=()=>{try{if(latest)download('exit-pilot-orders.csv','\uFEFF'+ordersCSV(latest.p,latest.c),'text/csv;charset=utf-8');}catch(e){toast(e.message);}};
$('export-backup').onclick=()=>{if(!latest)return;download('exit-pilot-backup.json',JSON.stringify({schema:1,type:'exit-pilot-backup',plan:latest.p,ledger:latest.ledger,savedAt:saved?.savedAt||new Date().toISOString()},null,2),'application/json');};
$('restore-backup').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw new Error('备份文件不能超过 200 KB。');const next=restoreExit(JSON.parse(await file.text()));if(saved&&!confirm('恢复将替换本机兑现计划与成交记录。继续？'))return;write(next);populate(next.plan);$('input-mode').textContent='已恢复';ledgerView();render();toast('备份已恢复；没有启动真实交易。');}catch(err){toast('未恢复：'+err.message);}finally{e.target.value='';}};
$('get-quote').onclick=async()=>{const button=$('get-quote');button.disabled=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);try{const symbol=$('symbol').value,response=await fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`,{credentials:'omit',cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error();const json=await response.json(),price=Number(json.data?.amount);if(json.data?.currency!=='USD'||!Number.isFinite(price)||price<=0||price>1e9||symbol!==$('symbol').value)throw new Error();$('reference').value=price.toFixed(2);$('quote-state').textContent=`Coinbase 公开参考价 · ${new Date().toLocaleString('zh-CN')} · 非可成交报价`;render();}catch{$('quote-state').textContent='公开报价暂不可用；保留原输入，不冒充实时行情。';}finally{clearTimeout(timeout);button.disabled=false;}};
$('fill-form').onsubmit=e=>{e.preventDefault();if(!latest?.aligned)return;$('fill-error').textContent='';try{const fill={id:crypto.randomUUID(),stage:number('fill-stage'),quantityUnits:number('fill-quantity',UNIT),priceCents:number('fill-price',100),feeCents:number('fill-fee',100),at:new Date().toISOString()};const ledger=appendFill(saved.plan,saved.ledger,fill);write({...saved,ledger});ledgerView();render();$('fill-quantity').value='';toast('成交已记录，剩余现金目标与卖出数量已更新。');}catch(err){$('fill-error').textContent=err.message;}};
$('undo-fill').onclick=()=>{if(!saved?.ledger.length||!confirm('撤销最后一条记录？这只修正本机记录，不会撤销交易平台的成交。'))return;try{write({...saved,ledger:saved.ledger.slice(0,-1)});ledgerView();render();}catch{toast('无法保存修改。');}};
function reset(){if(saved&&!confirm('新建将替换本机计划与成交记录，请先导出备份。继续？'))return;try{localStorage.removeItem(KEY);saved=null;populate(DEFAULT_EXIT);$('input-mode').textContent='示例输入';$('fill-error').textContent='';$('quote-state').textContent='手动示例价，不是实时行情。';ledgerView();render();}catch{toast('本机数据无法清除，未新建。');}}
$('new-plan').onclick=reset;
$('load-demo').onclick=()=>{if(saved){toast('为保留你的记录，请先备份，再点击底部「新建计划」。');return;}populate(DEFAULT_EXIT);$('input-mode').textContent='示例输入';render();};
$('run-scenario').onclick=()=>{
 if(!latest)return;const {p,ledger}=latest,type=$('scenario').value;
 const multipliers={rally:[0.9,1,1.1,1.2,1.35,1.5,1.7],reversal:[0.9,1,1.1,1.22,0.8,0.5],fall:[0.95,0.8,0.6,0.4,0.2],gap:[0.9,1.8,1.5]};
 try{const prices=multipliers[type].map(x=>Math.max(1,Math.round(p.referenceCents*x))),sim=simulateExit(p,ledger,prices),r=sim.result,final=sim.points.at(-1);
  $('scenario-result').textContent=`${sim.actions.length} 次模拟卖出 · 累计拿回 ${dollars(r.recoveredCents)} · 剩余 ${coins(r.currentUnits)} ${p.symbol} · ${r.completed?'现金目标达到':'距离目标还差 '+dollars(r.remainingCents)}`;
  const intro=document.createElement('article');intro.className='step-card';const title=document.createElement('strong');title.textContent='情景结束时';const text=document.createElement('p');text.textContent=`假设价格 ${dollars(final.priceCents)}；累计回收额＋余币参考市值 ${dollars(final.equityCents)}。未扣取走或花掉的回收款，不是账户余额或利润。`;intro.append(title,text);$('scenario-steps').replaceChildren(intro);
  for(const action of sim.actions){const el=document.createElement('article');el.className='step-card';const title=document.createElement('strong');title.textContent=`第 ${action.step+1} 个价格点 · 第 ${action.stage+1} 档`;el.append(title);for(const txt of [`参考价 ${dollars(action.priceCents)}`,`模拟卖出 ${coins(action.quantityUnits)} ${p.symbol}`,`扣假设成本后 ${dollars(action.netCents)}`]){const p=document.createElement('p');p.textContent=txt;el.append(p);}$('scenario-steps').append(el);}
  const note=document.createElement('p');note.className='hint';note.textContent='人为路径：'+prices.map(dollars).join(' → ')+'。按当前价格触发，跳过未达到条件的档位；没有回填历史成交。';$('scenario-steps').append(note);
 }catch(e){$('scenario-result').textContent=e.message;}
};
$('scenario').onchange=()=>{$('scenario-result').textContent='情景已更改，请点击「运行预演」。';$('scenario-steps').replaceChildren();};
try{const raw=localStorage.getItem(KEY);if(raw){saved=restoreExit(JSON.parse(raw));populate(saved.plan);$('input-mode').textContent='本机计划';}}catch{toast('本机备份无法读取；未覆盖旧数据，可先检查或导出原备份。');}
ledgerView();render();
window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{saved=e.newValue?restoreExit(JSON.parse(e.newValue)):null;if(saved)populate(saved.plan);else populate(DEFAULT_EXIT);ledgerView();render();toast('另一页面更新了本机计划，已同步。');}catch{toast('另一页面的数据无法读取，请刷新前检查备份。');}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_exit_plan',title:'读取兑现计划',description:'Read the current local goal, calculated sell ladder and manually recorded fills. This cannot trade, sign or access wallet secrets.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({mode:'planning_only',plan:latest?.p||null,result:latest?.c||null,ledger:latest?.ledger||[]})});}catch{}}
