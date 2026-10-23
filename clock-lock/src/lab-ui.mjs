import {DEFAULTS,SCENARIOS,validateConfig,scenarioPrices,parsePriceCSV,compare,makeSnapshot} from './lab.mjs';
const $=id=>document.getElementById(id),KEY='clock.journal.v1';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const names={hold:'一直持有',dca:'分批买入',cycle:'全部择时',blend:'我的组合'};
const colors=['#b2c5d4','#9b9feb','#efb579','#80ded1'];
export function initLab(download,toast){
 let imported=null,importName='',latest=null,journal=[];
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))journal=saved.filter(e=>e&&e.schema===1&&e.type==='clock-experiment'&&typeof e.createdAt==='string'&&Array.isArray(e.results)).slice(0,30);}catch{toast('实验日志暂时无法读取；新的实验仍可导出。');}
 const config=()=>{const c={...DEFAULTS};for(const key of Object.keys(c)){const el=$('lab-'+key);c[key]=key==='scenario'?el.value:Number(el.value);}c.buy--;c.sell--;return validateConfig(c);};
 function chart(rows,results){
  const svg=$('comparison-chart');svg.querySelectorAll('g').forEach(g=>g.remove());
  const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');svg.append(g);
  const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;g.append(e);return e;};
  const max=Math.max(...results.flatMap(r=>r.values))*1.06,left=77,right=940,top=12,bottom=229;
  for(let i=0;i<=4;i++){const y=bottom-(bottom-top)*i/4;add('line',{x1:left,x2:right,y1:y,y2:y,stroke:'#2a3b3f'});add('text',{x:65,y:y+5,fill:'#94a9ad','font-size':14,'text-anchor':'end'},money(max*i/4));}
  for(const [index,r] of results.entries())add('path',{d:r.values.map((v,i)=>`${i?'L':'M'}${left+i/(rows.length-1)*(right-left)},${bottom-v/max*(bottom-top)}`).join(' '),fill:'none',stroke:colors[index],'stroke-width':index===3?3.5:2,'stroke-dasharray':index===2?'6 4':'none'});
  add('text',{x:left,y:257,fill:'#94a9ad','font-size':14},imported?rows[0].date:'起点');
  add('text',{x:right,y:257,fill:'#94a9ad','font-size':14,'text-anchor':'end'},imported?rows.at(-1).date:`第 ${rows.length-1} 个月`);
 }
 function recalc(){
  try{
   const c=config(),rows=imported||scenarioPrices(c),results=compare(c,rows),hold=results[0],blend=results[3],delta=blend.final-hold.final;
   latest=makeSnapshot(c,imported?`用户导入：${importName}（未经独立核验）`:`人为情景：${SCENARIOS[c.scenario].label}`,rows,results);
   $('lab-delta').textContent=(delta>=0?'+':'−')+money(Math.abs(delta));$('lab-delta').className=delta>=0?'positive':'negative';
   $('lab-final').textContent=money(blend.final);$('lab-dd').textContent=blend.drawdown.toFixed(1)+'%';
   $('lab-verdict').textContent=Math.abs(delta)<0.01?'在本组参数下，组合与一直持有的期末净值相同。':delta<0?'这次实验中，组合跑输了。较少交易或等得更久，都不保证赚得更多。':'这次实验中，组合领先了。优势只属于这条价格路径，不能当作未来胜率。';
   if(results.some(r=>r.insolvent))$('lab-verdict').textContent+=' 部分账户已耗尽，无法继续支付模拟年费。';
   $('scenario-note').textContent=imported?`导入 ${rows.length} 个价格点 · 起点 ${rows[0].date} · 终点 ${rows.at(-1).date}。第一个价格点视为规则的第 1 月；结果对起点敏感。`:SCENARIOS[c.scenario].note;
   $('data-badge').textContent=imported?'用户数据 · 未核验':'人为情景 · 非预测';
   $('cost-note').textContent=`年费本身相当于初始本金的 ${(c.annualCost/c.capital*100).toFixed(2)}% / 年；${rows.length-1} 个月名义合计 ${money(c.annualCost*(rows.length-1)/12)}。实际扣款见表；未含资金机会成本。`;
   $('lab-results').replaceChildren(...results.map(r=>{const tr=document.createElement('tr');for(const value of [r.kind==='blend'?`${100-c.satellite}% 持有 + ${c.satellite}% 择时`:names[r.kind],money(r.final),r.returnPct.toFixed(1)+'%',r.drawdown.toFixed(1)+'%',money(r.costs)+' / '+money(r.subscription)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}return tr;}));
   chart(rows,results);$('lab-error').textContent='';$('export-experiment').disabled=$('save-snapshot').disabled=$('save-journal').disabled=false;
  }catch(e){latest=null;$('lab-error').textContent=e.message;$('lab-verdict').textContent='参数无效，上一组结果已隐藏。';$('lab-delta').textContent=$('lab-final').textContent=$('lab-dd').textContent='—';$('lab-results').replaceChildren();$('comparison-chart').querySelectorAll('g').forEach(g=>g.remove());$('export-experiment').disabled=$('save-snapshot').disabled=$('save-journal').disabled=true;}
 }
 function renderJournal(){
  if(!journal.length){$('journal-list').textContent='还没有记录。先比较，再写下你的决定。';return;}
  $('journal-list').replaceChildren(...journal.slice().reverse().map(entry=>{const el=document.createElement('article');el.className='journal-entry';const time=document.createElement('time');time.textContent=new Date(entry.createdAt).toLocaleString('zh-CN');const title=document.createElement('p');title.textContent=String(entry.source||'实验快照');el.append(time,title);for(const [label,value] of [['理由',entry.reason],['复查条件',entry.stop],['复查日期',entry.reviewDate]])if(value){const p=document.createElement('p');p.textContent=label+'：'+String(value);el.append(p);}const desc=document.createElement('p');desc.textContent='参数和数据已随快照保存；导出后可留档。';el.append(desc);return el;}));
 }
 function save(withReason){
  if(!latest)return;
  if(journal.length>=30){toast('本机已保存 30 条记录；请导出全部记录。当前实验仍可单独导出。');return;}
  const reason=$('journal-reason').value.trim(),stop=$('journal-stop').value.trim(),reviewDate=$('journal-date').value;
  if(withReason&&(!reason||!stop||!reviewDate)){toast('请补全理由、复查条件和日期。');return;}
  if(withReason&&reviewDate<new Date().toISOString().slice(0,10)){toast('复查日期不能早于今天。');return;}
  const entry={...structuredClone(latest),createdAt:new Date().toISOString(),reason:withReason?reason:'仅保存实验快照',stop:withReason?stop:'',reviewDate:withReason?reviewDate:''};
  try{const next=[...journal,entry];localStorage.setItem(KEY,JSON.stringify(next));journal=next;renderJournal();toast('已保存本机快照；可导出留档。');}catch{toast('本机存储不可用或空间不足，请直接导出本次实验。');}
 }
 for(const key of Object.keys(DEFAULTS))$('lab-'+key).addEventListener('input',recalc);
 $('price-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw new Error('价格文件不能超过 100 KB。');const parsed=parsePriceCSV(await file.text());imported=parsed;importName=file.name.slice(0,120);$('lab-scenario').disabled=$('lab-months').disabled=$('lab-shift').disabled=true;$('clear-prices').hidden=false;$('csv-status').textContent=`已加载 ${file.name}，仅用于本次会话；保存快照会把价格一起保存在本机。`;recalc();}catch(err){toast('未导入：'+err.message);}finally{e.target.value='';}};
 $('clear-prices').onclick=()=>{imported=null;importName='';$('lab-scenario').disabled=$('lab-months').disabled=$('lab-shift').disabled=false;$('clear-prices').hidden=true;$('csv-status').textContent='已返回人为构造的情景。';recalc();};
 $('export-experiment').onclick=()=>{if(latest)download('clock-experiment.json',JSON.stringify(latest,null,2),'application/json').catch(e=>toast(e.message));};
 $('save-snapshot').onclick=()=>save(false);$('save-journal').onclick=()=>save(true);
 $('export-journal').onclick=()=>{if(!journal.length){toast('请先保存一条记录。');return;}download('clock-journal.json',JSON.stringify({schema:1,exportedAt:new Date().toISOString(),entries:journal},null,2),'application/json').catch(e=>toast(e.message));};
 $('journal-date').value=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
 recalc();renderJournal();
}
