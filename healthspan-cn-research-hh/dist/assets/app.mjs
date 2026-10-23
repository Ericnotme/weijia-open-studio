import {servingEffect,exerciseCategory,categories,metMinutes} from './model.mjs';
import {sources,drugs,supplements,activities,eras} from './evidence.mjs';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?n.toLocaleString('zh-CN',{maximumFractionDigits:2}):'未知';
const signed=n=>n===null?'未知':(n>0?'+':'')+number(n);
const ref=([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
let foods=[],foodState=Object.create(null),exercise=600;
function navigate(panel){
 if(!['food','move','drug','wonder','me','method'].includes(panel))throw new Error('未知页签');
 document.querySelectorAll('.panel').forEach(el=>el.classList.toggle('on',el.id==='p-'+panel));
 document.querySelectorAll('#tabs button').forEach(el=>{const on=el.dataset.p===panel;el.classList.toggle('on',on);if(on)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
 window.scrollTo({top:0,behavior:'instant'});
}
$('tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(b)navigate(b.dataset.p);});
function renderFood(){
 const selected=foods.filter(f=>foodState[f.id]>0),count=selected.reduce((sum,f)=>sum+foodState[f.id],0);
 $('foodNum').textContent=number(count);
 $('foodEq').textContent=selected.length?`已选 ${selected.length} 种食物 · 下列结果分别阅读，不计算总风险`:'还没选择食物';
 $('foodList').innerHTML=foods.map(f=>{
 const n=foodState[f.id]||0,r=servingEffect(f,n),color=r.value>0?'pos':r.value<0?'neg':'neu';
 return `<div class="food" data-food="${esc(f.id)}"><span class="em" aria-hidden="true">${esc(f.em)}</span><div class="info"><div class="nm">${esc(f.name)}</div><div class="sv">${esc(f.serving)}</div></div><div class="val ${color}" data-result="${esc(f.id)}">${n?'待来源核对':'—'}</div><div class="stepper"><button data-f="${esc(f.id)}" data-d="-0.5" aria-label="减少${esc(f.name)}份数" ${n===0?'disabled':''}>−</button><span class="n">${n}</span><button data-f="${esc(f.id)}" data-d="0.5" aria-label="增加${esc(f.name)}份数" ${n===2?'disabled':''}>＋</button></div><details><summary>研究值与来源</summary><div class="body"><b>效应值：待来源核对。</b><br>原站转录值尚未与作者独立 Data S1 表逐项核对，因此当前不展示数字或区间，也不做份数效应计算。<br>${esc(f.note||'美国食物条目与中国配方可能不同。')}<br>待核查的出处线索：${ref([f.src,f.reference])}<br>当前仅记录 ${n} 份研究情景；不是饮食剂量建议。</div></details></div>`;
 }).join('');
 $('exportStatus').textContent='';
}
function setFood(id,count){
 const f=foods.find(f=>f.id===id);if(!f)throw new Error('未知食物');
 const result=servingEffect(f,count);foodState[id]=count;renderFood();return {id,count,modelMinutes:result.value,verification:f.verification,unit:'HENI DALY model minutes',individualPrediction:false};
}
$('foodList').addEventListener('click',e=>{const b=e.target.closest('button[data-f]');if(!b)return;const id=b.dataset.f;setFood(id,Math.max(0,Math.min(2,(foodState[id]||0)+Number(b.dataset.d))));const focus=$('foodList').querySelector(`[data-f="${id}"][data-d="${b.dataset.d}"]`);if(focus&&!focus.disabled)focus.focus({preventScroll:true});});
function resetFood(){foodState=Object.create(null);renderFood();}
$('resetFood').addEventListener('click',resetFood);
function setExercise(value){
 const category=exerciseCategory(value);exercise=value;$('exSlider').value=String(value);$('exNum').textContent=number(value);
 $('exEq').textContent=category?`${category.label} · ${number(value/60)} MET-h / 周`:'低于研究首个非零类别，不估计 HR';
 $('exHR').textContent=category?category.hr.toFixed(2):'未知';
 $('exCI').textContent=category?.ci?category.ci.map(n=>n.toFixed(2)).join('–'):'参照 / 不适用';
 return {metMinutesPerWeek:value,category:category?.label??null,type:'HR',value:category?.hr??null,ci:category?.ci??null,individualPrediction:false};
}
$('exSlider').addEventListener('input',()=>setExercise(Number($('exSlider').value)));
$('exGuide').innerHTML=`<p class="hint">${ref(sources.moore)} · 654,827 人，6 个队列。观察关联不等于个体干预效果。</p><div class="table-scroll"><table class="tbl"><thead><tr><th>休闲活动 MET-h / 周</th><th>HR（95% CI）</th></tr></thead><tbody>${categories.map(c=>`<tr><td>${c.label}</td><td>${c.hr.toFixed(2)}${c.ci?'（'+c.ci.join('–')+'）':'（参照）'}</td></tr>`).join('')}</tbody></table></div><div class="warnbox">原研究的生存差异针对 40 岁后调整中位生存，不是 HALE。本站不把其 HR 换成年数，不从活动量倒推个人“最优剂量”。</div>`;
$('exTable').innerHTML='<thead><tr><th>活动</th><th>MET</th><th>500 MET-min 所需分钟</th></tr></thead><tbody>'+activities.map(([n,m])=>`<tr><td>${n}</td><td>${m}</td><td>${number(metMinutes(m))}</td></tr>`).join('')+'</tbody>';
$('exNews').innerHTML=`<div class="item"><h3>步数与死亡的关联</h3><p>Ding 2025 成人队列汇总：7,000 步与 2,000 步 / 天比较，全因死亡 HR 0.53（95% CI 0.46–0.60）。这不是“每个人达到某个步数就降低同样风险”的保证。</p><p class="src">${ref(sources.ding)}</p></div><div class="item"><h3>有氧与抗阻的原研究联合比较</h3><p>Zhang 2026：美国三个职业队列、147,374 人、约 30 年随访。研究提供有氧和抗阻的联合类别；请按同一研究的参照组阅读，不将单项 HR 相乘。</p><p class="src">${ref(sources.zhang)}</p></div><div class="infobox">步数可能已包含在有氧活动中；不同研究暴露也有重叠。本页分别展示，不叠加步数、有氧和抗阻为“总获益”。</div>`;
function evidenceRow(x){
 const effect=x.value===null?'未知 / 不换算':`${x.type} ${x.value.toFixed(2)}`;
 return `<article class="item" data-evidence="${x.id}"><div class="top"><h3 class="t">${esc(x.name)}</h3><span class="badge ${x.value===null?'g-D':'g-B'}">${esc(effect)}</span></div><p class="d"><b>人群：</b>${esc(x.population)}<br><b>终点：</b>${esc(x.endpoint)}${x.ci?`<br><b>95% CI：</b>${x.ci.map(n=>n.toFixed(2)).join('–')}`:''}</p><p>${esc(x.note)}</p><p class="src">${x.refs?.length?x.refs.map(ref).join(' · '):'资料范围提示：此条不提供数值性延寿结论。'}</p></article>`;
}
$('drugList').innerHTML=drugs.map(evidenceRow).join('');$('suppList').innerHTML=supplements.map(evidenceRow).join('');
$('thermo').innerHTML='<p><b>人体死亡结局</b>：仍需核对试验人群、效应类型、区间及研究设计。</p><p><b>功能或替代终点</b>：可能有相应价值，但不能转成延寿。</p><p><b>证据不足</b>：显示“未知”，不赋值 HR=1.00，也不视为已经证明无效。</p>';
$('boundary').innerHTML='<p>已确诊心衰、慢性肾病、糖尿病或心血管病的患者研究，与健康人的预防用途不同。SELECT 的无糖尿病参与者仍已有心血管病。</p><p>本站不根据外貌、体重、血压或可穿戴指标判断你属于哪类患者，也不推荐药物。用药适用性需要完整病史和专业评估。</p>';
$('wonderList').innerHTML=eras.map(([emoji,title,years,scope,names,note,url])=>`<article class="wonder-era"><div class="we-head"><span class="we-emoji" aria-hidden="true">${emoji}</span><h3 class="we-title">${title} <span class="we-years">${years}</span></h3></div><div class="we-thesis">${scope}</div><p class="we-note">${note}</p>${names.map(n=>`<div class="wonderdrug"><span class="wd-name">${n}</span></div>`).join('')}<p class="src">${ref(['相关原始研究 / 官方资料',url])}</p></article>`).join('');
$('mathBox').innerHTML='<p><b>① 食物单位演示</b><br>已核实每份值才可做一次份数单位缩放；目前39项效应值待来源核对，暂停数值计算。不累计到余生。</p><p><b>② 运动单位与类别</b><br>MET-min ÷ 60 = MET-h；对应原研究类别。MET-min ÷ 活动 MET = 活动分钟。</p><p><b>③ 药物效应</b><br>按原文区分 HR / RR / OR，保留研究人群、终点和区间。未知保持未知。</p>';
$('sourceList').innerHTML=Object.values(sources).map(s=>`<div class="source-entry">${ref(s)}</div>`).join('');
function resetAll(){resetFood();setExercise(600);$('resetStatus').textContent='已清空食物并重置运动情景；无持久保存的数据。';return {foodCount:0,exerciseMetMinutes:600};}
$('resetAll').addEventListener('click',resetAll);
function scenario(){return {format:'healthspan-research-scenario-v2',individualPrediction:false,foodSelections:foods.filter(f=>foodState[f.id]>0).map(f=>({id:f.id,name:f.name,verification:f.verification,count:foodState[f.id],...servingEffect(f,foodState[f.id])})),exercise:setExercise(exercise)};}
$('exportScenario').addEventListener('click',()=>{try{const blob=new Blob([JSON.stringify(scenario(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='healthspan-research-scenario.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('exportStatus').textContent='已生成研究情景文件；没有上传数据。';}catch{$('exportStatus').textContent='此浏览器无法导出，页面中的情景仍可查看。';}});
setExercise(600);
function registerTools(){
 const context=document.modelContext;if(!context?.registerTool)return;
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const add=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 const base={annotations:{readOnlyHint:false,untrustedContentHint:false}};
 add({...base,name:'set_food_research_servings',description:'设置一个食物的研究情景份数并更新可见页面；不预测个人风险。',inputSchema:{type:'object',properties:{id:{type:'string',enum:foods.map(f=>f.id)},count:{type:'number',enum:[0,.5,1,1.5,2]}},required:['id','count'],additionalProperties:false},execute(input){if(!input||Object.keys(input).some(k=>!['id','count'].includes(k)))throw new Error('无效输入');const r=setFood(input.id,input.count);navigate('food');return r;}});
 add({...base,name:'set_exercise_research_amount',description:'设置研究查表的活动量并显示原研究 HR 类别；不估计寿命。',inputSchema:{type:'object',properties:{metMinutes:{type:'number',minimum:0,maximum:3000}},required:['metMinutes'],additionalProperties:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='metMinutes'))throw new Error('无效输入');const r=setExercise(input.metMinutes);navigate('move');return r;}});
 add({...base,name:'reset_research_scenario',description:'清空当前页内食物选择并重置运动情景，不涉及个人健康数据。',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(!input||Object.keys(input).length)throw new Error('无效输入');return resetAll();}});
}
try{
 const response=await fetch('assets/foods.json',{cache:'no-store'});if(!response.ok)throw new Error('资料读取失败');foods=await response.json();renderFood();registerTools();$('appStatus').textContent='只使用页内状态 · 刷新即重置';
}catch{
 $('foodList').textContent='食物资料暂时无法加载。请联网后刷新重试；其他研究页仍可查看。';$('resetFood').disabled=true;$('exportScenario').disabled=true;$('appStatus').textContent='食物资料加载失败';
}
