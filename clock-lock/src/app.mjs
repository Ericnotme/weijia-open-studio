import {initLab} from './lab-ui.mjs';
import {DAY,dateMs,addDays,addYears,validatePlan,newAccount,validateAccount,restorePaperBackup,executePaper,nextEvent,cycleIndex,demoCycle,calendar} from './strategy.mjs';
import {Capacitor} from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import {Share} from '@capacitor/share';
const $=id=>document.getElementById(id),STORE='clock.paper.v1';
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
const btc=sats=>(sats/1e8).toFixed(8);
let state=newAccount(),plan=null,quote={priceCents:10000000,at:0,source:'manual'};
let toastTimer,checking=false;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5500);}
function persist(){localStorage.setItem(STORE,JSON.stringify({schema:1,state,plan}));}
try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved){state=validateAccount(saved.state);if(saved.plan)plan=validatePlan(saved.plan);}}catch{$('log-status').textContent='本机数据暂时无法读取；请检查隐私模式或重置模拟账户。';}
function restoreInputs(){if(!plan)return;$('buy-date').value=plan.buyDate;$('sell-date').value=plan.sellDate;$('allocation').value=String(plan.allocationBps/10000);$('fee-bps').value=String(plan.feeBps);$('repeat-plan').checked=plan.repeat;}
function render(){
 const now=Date.now(),event=plan?nextEvent(plan,state,now):null;
 $('cash').textContent=money(state.cashCents/100);$('btc').textContent=btc(state.btcSats);
 $('equity').textContent=money(state.cashCents/100+state.btcSats/1e8*quote.priceCents/100);
 $('cycle-status').textContent=state.enabled?'模拟执行中':plan?'模拟已暂停':'尚未启用';
 $('plan-state').textContent=plan?'计划已保存':'未设置';$('toggle-plan').disabled=$('check-now').disabled=!plan;
 $('toggle-plan').textContent=state.enabled?'暂停模拟执行':'启用模拟执行';$('toggle-plan').classList.toggle('secondary',state.enabled);
 const target=event?dateMs(event.date):dateMs('2026-10-05');
 $('countdown').textContent=Math.max(0,Math.ceil((target-now)/DAY)).toLocaleString();
 $('countdown-label').textContent=event?`距计划${event.side==='buy'?'买入':'卖出'}`:'距候选窗口';
 $('countdown-unit').textContent=event?'天 · UTC 日期':'天 · 不是交易信号';
 let progress=0;if(plan){const c=plan.repeat?cycleIndex(plan,now):0,start=dateMs(addYears(plan.buyDate,c*4)),end=dateMs(addYears(plan.buyDate,(c+1)*4));progress=Math.max(0,Math.min(1,(now-start)/(end-start)));}
 $('cycle-arc').setAttribute('stroke-dashoffset',String(622*(1-progress)));
 $('next-action').textContent=event?`${event.date} · ${event.side==='buy'?'买入一次':'卖出一次'} · ${state.enabled?'已启用':'已暂停'}`:plan?'本计划已结束；没有待执行动作':'先设定买入和卖出日期';
 const current=plan?(plan.repeat?cycleIndex(plan,now):0):0;
 $('trade-count').textContent=`${state.trades.filter(t=>t.cycle===current).length} / 2 · 当前周期`;
 const rows=state.trades.slice().reverse().map(t=>{const row=document.createElement('tr');for(const value of [t.executedAt.replace('T',' ').slice(0,19),t.side==='buy'?'模拟买入':'模拟卖出',btc(t.quantitySats),money(t.priceCents/100),money(t.feeCents/100)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}return row;});
 if(!rows.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=5;cell.className='empty-row';cell.textContent='时间未到，安静等待。';row.append(cell);rows.push(row);}$('trades').replaceChildren(...rows);
}
async function check(manual=false){
 if(checking||!plan)return;checking=true;
 try{
  const action=()=>{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(!saved?.plan)return;plan=validatePlan(saved.plan);state=validateAccount(saved.state);const result=executePaper(plan,state,quote);state=result.state;persist();$('log-status').textContent=result.message;if(manual||result.trade)toast(result.message);render();};
  // One shared lock avoids two open tabs recording the same action.
  if(navigator.locks)await navigator.locks.request('clock-paper-execution',action);else action();
 }catch(e){state.enabled=false;try{persist();}catch{}toast(e.message);$('log-status').textContent=e.message;render();}finally{checking=false;}
}
$('plan-form').onsubmit=e=>{
 e.preventDefault();try{
  if(state.trades.length)throw new Error('已成交计划不能改写。请先导出记录；要重新实验可重置模拟账户。');
  const candidate=validatePlan({schema:1,id:plan?.id||crypto.randomUUID(),buyDate:$('buy-date').value,sellDate:$('sell-date').value,allocationBps:Math.round(Number($('allocation').value)*10000),feeBps:Number($('fee-bps').value),repeat:$('repeat-plan').checked});
  plan=candidate;state.enabled=false;persist();$('plan-error').textContent='';toast('计划已保存。启用后只会操作模拟资金。');render();
 }catch(err){$('plan-error').textContent=err.message;}
};
$('toggle-plan').onclick=()=>{if(!plan)return;try{state.enabled=!state.enabled;persist();render();if(state.enabled)check(true);}catch(e){state.enabled=false;toast('无法保存执行状态：'+e.message);render();}};
$('check-now').onclick=()=>check(true);
$('set-price').onclick=()=>{const price=Number($('manual-price').value);if(!Number.isFinite(price)||price<1||price>1e9){toast('请输入有效的 BTC 参考价。');return;}quote={priceCents:Math.round(price*100),at:Date.now(),source:'manual'};$('quote-source').textContent='手动示例价 · '+new Date(quote.at).toLocaleTimeString('zh-CN');render();if(state.enabled)check();};
$('refresh-price').onclick=async()=>{
 const button=$('refresh-price');button.disabled=true;button.textContent='正在获取…';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot',{credentials:'omit',cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('公开报价服务暂不可用');const json=await response.json(),price=Number(json.data?.amount);if(json.data?.currency!=='USD'||!Number.isFinite(price)||price<1||price>1e9)throw new Error('报价格式无效');quote={priceCents:Math.round(price*100),at:Date.now(),source:'coinbase'};$('manual-price').value=price;$('quote-source').textContent='Coinbase 公开现价 · '+new Date().toLocaleTimeString('zh-CN')+' · 非成交报价';render();if(state.enabled)check();}
 catch{toast('暂时无法获取公开报价。可输入手动示例价继续模拟。');}
 finally{clearTimeout(timeout);button.disabled=false;button.textContent='获取公开参考价 ↻';}
};
$('derive-window').onclick=()=>{try{const date=$('halving-date').value;if(dateMs(date)>Date.now())throw new Error('请输入已经发生的减半日期。');$('halving-result').textContent=`候选窗口：${addDays(date,525)} ～ ${addDays(date,546)}。这是日期推算，不是价格预测。`;}catch(e){$('halving-result').textContent=e.message;}};
async function download(name,text,type){if(Capacitor.isNativePlatform()){await Share.share({title:name,text,dialogTitle:'导出 Clock 计划'});return;}const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export-plan').onclick=()=>{if(!plan){toast('请先保存周期计划。');return;}download('clock-plan.json',JSON.stringify({schema:1,mode:'paper',plan,account:state},null,2),'application/json').catch(e=>toast(e.message));};
$('export-calendar').onclick=()=>{if(!plan){toast('请先保存周期计划。');return;}download('clock-plan.ics',calendar(plan),'text/calendar').catch(e=>toast(e.message));};
$('native-notify').onclick=async()=>{if(!plan){toast('请先保存周期计划。');return;}if(!Capacitor.isNativePlatform()){toast('网页请使用「导出日历」；设备提醒可在 iPhone 应用工程中使用。');return;}try{const permission=await LocalNotifications.requestPermissions();if(permission.display!=='granted')throw new Error('尚未允许提醒，请在设备设置中开启。');const notifications=[['buy',plan.buyDate],['sell',plan.sellDate]].map(([side,date],i)=>({id:9101+i,title:'Clock 周期计划提醒',body:`今天是你设置的${side==='buy'?'模拟买入':'模拟卖出'}日期。打开应用查看计划；这不是价格极值确认。`,schedule:{at:new Date(dateMs(date)+9*3600000)}})).filter(n=>n.schedule.at.getTime()>Date.now());if(!notifications.length)throw new Error('本周期提醒日期已过去。');await LocalNotifications.cancel({notifications:[{id:9101},{id:9102}]});await LocalNotifications.schedule({notifications});toast(`已安排 ${notifications.length} 个设备提醒。`);}catch(e){toast(e.message);}};
const reset=document.createElement('button');reset.className='text-button';reset.textContent='重置模拟账户';reset.onclick=()=>{if(!confirm('清除模拟计划和成交记录，恢复 $10,000 模拟现金？实验快照不受影响。'))return;state=newAccount();plan=null;persist();$('plan-form').reset();$('plan-error').textContent='';$('log-status').textContent='模拟账户已重置。';render();};document.querySelector('.plan-tools').append(reset);
$('privacy').onclick=()=>$('privacy-dialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
function renderDemo(){try{const day=Number($('demo-slider').value),result=demoCycle(day,Number($('demo-buy-price').value),Number($('demo-sell-price').value));$('demo-stage').textContent=`第 ${day.toLocaleString()} 天 / ${result.stage}`;$('demo-value').textContent=`模拟总值 ${money(result.equity)} · 现金 ${money(result.state.cashCents/100)} · BTC ${btc(result.state.btcSats)} · 已执行 ${result.state.trades.length} / 2 次`;}catch(e){$('demo-value').textContent=e.message;}}
$('demo').onclick=()=>{renderDemo();$('demo-dialog').showModal();};['demo-slider','demo-buy-price','demo-sell-price'].forEach(id=>$(id).oninput=renderDemo);
for(let i=0;i<60;i++){const a=(i*6-90)*Math.PI/180,inner=i%5===0?117:121;const line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [key,v] of Object.entries({x1:130+inner*Math.cos(a),y1:130+inner*Math.sin(a),x2:130+126*Math.cos(a),y2:130+126*Math.sin(a),stroke:i%5===0?'#8cabae':'#3b5054','stroke-width':i%5===0?2:1}))line.setAttribute(key,v);$('clock-ticks').append(line);}
window.addEventListener('storage',e=>{if(e.key===STORE){try{const saved=JSON.parse(e.newValue);if(saved){state=validateAccount(saved.state);plan=saved.plan?validatePlan(saved.plan):null;restoreInputs();render();}}catch{state.enabled=false;toast('另一页面的数据无法读取，模拟执行已暂停。');}}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.enabled)check();});
restoreInputs();render();setInterval(()=>{render();if(state.enabled&&!document.hidden)check();},15000);
if('serviceWorker' in navigator&&!Capacitor.isNativePlatform())navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_clock_plan',title:'读取 Clock 模拟计划',description:'Read only the non-secret paper account and cycle plan. Never exposes wallet keys or mnemonic.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({mode:'paper',plan,state,next:plan?nextEvent(plan,state,Date.now()):null})});}catch{}}

initLab(download,toast);

$('import-plan-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{
 if(file.size>1000000)throw new Error('备份文件不能超过 1 MB。');const input=JSON.parse(await file.text());
 const restored=restorePaperBackup(input);
 if(!confirm('恢复将替换本机模拟计划与成交记录。继续？'))return;
 localStorage.setItem(STORE,JSON.stringify(restored));plan=restored.plan;state=restored.state;restoreInputs();render();toast('已恢复模拟备份，执行保持暂停。');
 }catch(err){toast('未导入：'+err.message);}finally{e.target.value='';}};
