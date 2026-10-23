import {CAUSES,SCENARIOS,simulate} from './model.js';
const $=id=>document.getElementById(id);
const state={age:40,sex:'male',scenario:'baseline',mode:'cumulative',year:30,env:{road:'unknown',heat:'unknown',care:'unknown'},selected:new Set(CAUSES.map(c=>c.id)),point:null};
const pct=x=>x>.9995&&x<1?'>99.9':(x*100).toFixed(1);
const detailedPct=x=>x>0&&x<.001?'<0.1':pct(x);
let rows=[],allScenarios={},chartLayout=null,geo=null,projection=null;
let mapFeaturePolygons=[];
const dialog=$('method-dialog');
for(const id of ['method-open','notice-method','method-bottom'])$(id).addEventListener('click',()=>dialog.showModal());
$('method-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('cause-controls').innerHTML=CAUSES.map(c=>`<label class="cause-check" style="--cause:${c.color}"><input type="checkbox" value="${c.id}" checked><span>${c.name}</span><i class="cause-dot"></i></label>`).join('');
$('parameter-table').innerHTML=CAUSES.map(c=>`<tr><td>${c.name}</td><td>${c.base}</td><td>${c.k}</td><td>${c.female.toFixed(2)}</td></tr>`).join('');
$('cause-controls').addEventListener('change',e=>{if(e.target.checked)state.selected.add(e.target.value);else state.selected.delete(e.target.value);drawChart();renderLegend();renderReading();});
document.querySelectorAll('[name=sex]').forEach(el=>el.addEventListener('change',()=>{state.sex=el.value;update();}));
document.querySelectorAll('[name=mode]').forEach(el=>el.addEventListener('change',()=>{state.mode=el.value;if(state.mode==='annual'&&state.year===0)state.year=1;$('year').min=state.mode==='annual'?'1':'0';$('year').value=state.year;drawChart();renderLegend();renderReading();}));
$('age').addEventListener('input',e=>{state.age=Number(e.target.value);update();});
$('year').addEventListener('input',e=>{state.year=Number(e.target.value);drawChart();renderLegend();renderReading();});
function resetEnvironment(){state.env={road:'unknown',heat:'unknown',care:'unknown'};for(const key of ['road','heat','care'])$(key).value='unknown';}
$('district').addEventListener('change',()=>{state.point=null;$('longitude').value='';$('latitude').value='';resetEnvironment();drawMap();update();});
for(const key of ['road','heat','care'])$(key).addEventListener('change',e=>{state.env[key]=e.target.value;update();});
$('reset').addEventListener('click',()=>{state.age=40;state.sex='male';state.scenario='baseline';state.mode='cumulative';state.year=30;state.point=null;state.selected=new Set(CAUSES.map(c=>c.id));resetEnvironment();$('age').value=40;$('district').value='';$('year').min=0;$('year').value=30;$('longitude').value='';$('latitude').value='';document.querySelector('[name=sex][value=male]').checked=true;document.querySelector('[name=mode][value=cumulative]').checked=true;document.querySelectorAll('#cause-controls input').forEach(el=>el.checked=true);drawMap();update();$('coordinate-message').textContent=MAP_DATA_URL?'坐标仅作示意，不会上传。':'源代码导出不含区界数据；居住条件比较仍可使用。';});
function update(){
 for(const scenario of Object.keys(SCENARIOS))allScenarios[scenario]=simulate({...state,scenario});
 rows=allScenarios[state.scenario];const end=rows[30],neutral=simulate({...state,env:{}})[30];
 const lower=simulate({...state,scale:.8})[30].total,upper=simulate({...state,scale:1.2})[30].total;
 const lead=end.cumulative.indexOf(Math.max(...end.cumulative));
 $('age-output').innerHTML=`${state.age} <small>岁</small>`;$('future-age').textContent=`${state.age+30} 岁`;
 $('total-risk').innerHTML=`${pct(end.total)}<small>%</small>`;
 $('risk-range').textContent=`假设敏感范围 ${pct(lower)}%–${pct(upper)}%`;
 $('leading-cause').textContent=CAUSES[lead].name;$('leading-risk').textContent=`30 年累计 ${detailedPct(end.cumulative[lead])}% · 模拟`;
 const known=Object.values(state.env).filter(v=>v!=='unknown').length,diff=(end.total-neutral.total)*100;
 $('environment-impact').textContent=known?(diff<.05?'约 0.0':`+${diff.toFixed(1)}`)+' 个百分点':'未评估';
 $('environment-caption').textContent=known?`相对中性参照 · 已填 ${known}/3 项`:'在下方填写居住条件';
 $('selected-place').textContent=($('district').value||'尚未选择街道')+(state.point?' · 已标注位置':'');
 $('env-insight').textContent=known?`按所填条件，30 年全死因累计概率相对中性参照增加约 ${diff.toFixed(1)} 个百分点。这是自设环境系数的计算结果，不能视为该住址的真实增量风险。${known<3?'未填写的条件暂按中性处理。':''}`:'补充上方条件后，可比较相对中性环境的模拟变化。仅凭街道或坐标，无法判断个人的疾病风险。';
 $('chart-context').textContent=`${state.sex==='male'?'男性':'女性'} · ${state.age} → ${state.age+30} 岁 · ${SCENARIOS[state.scenario].name}${state.age>65?' · 含高龄外推':''}`;
 renderScenarios();drawChart();renderLegend();renderReading();
}
function renderScenarios(){
 const base=allScenarios.baseline[30].total;
 $('scenario-cards').innerHTML=Object.entries(SCENARIOS).map(([id,s])=>{const result=allScenarios[id][30].total;const delta=(result-base)*100;return `<button class="scenario-card ${id===state.scenario?'selected':''}" data-scenario="${id}" aria-pressed="${id===state.scenario}" style="--scenario:${s.color}"><div class="scenario-top"><span class="scenario-icon">${s.icon}</span><span class="scenario-name">${s.name}</span><span class="scenario-radio" aria-hidden="true"></span></div><div class="overline">${s.en}</div><p>${s.description}</p><div class="scenario-result"><strong>${pct(result)}<small>%</small></strong><span>30 年全死因 · 模拟<br>${id==='baseline'?'对照剧本':`较基准 ${delta>=0?'+':''}${delta.toFixed(1)} 个百分点`}</span></div></button>`;}).join('');
 $('scenario-title').textContent=SCENARIOS[state.scenario].name;
 $('timeline-steps').innerHTML=[10,20,30].map(t=>{const row=rows[t];return `<div class="timeline-step"><div class="step-year">${row.year}</div><div class="step-age">${row.age} 岁 · 第 ${t} 年</div><strong>${pct(row.total)}%</strong><small>全死因累计 · 模拟</small></div>`;}).join('');
}
$('scenario-cards').addEventListener('click',e=>{const b=e.target.closest('[data-scenario]');if(!b)return;state.scenario=b.dataset.scenario;update();const next=document.querySelector(`[data-scenario="${state.scenario}"]`);next.focus({preventScroll:true});});
function renderLegend(){
 const data=rows[state.year][state.mode];
 $('chart-legend').innerHTML=CAUSES.filter(c=>state.selected.has(c.id)).map(c=>{const i=CAUSES.indexOf(c);return `<span class="legend-item" style="--cause:${c.color}"><i class="legend-line"></i>${c.name} <span>${detailedPct(data[i])}%</span></span>`;}).join('');
 $('chart-selected-year').textContent=`查看：${2026+state.year} · ${state.age+state.year} 岁`;
 $('chart-description').textContent=state.mode==='cumulative'?'累计概率：从现在到目标年份，因某一原因死亡的模拟概率。':'年度概率：该年初仍存活者在随后一年内死亡的概率；年份为期末。';
}
function renderReading(){
 const t=state.year,row=rows[t];
 if(state.selected.size===0){$('reading-text').textContent='勾选至少一种死因，即可查看曲线。上方全死因汇总仍包含全部类别。';return;}
 if(t===0&&state.mode==='cumulative'){$('reading-text').textContent='2026 年为模拟起点，累计概率从 0 开始。拖动年份滑块，查看未来每一年的变化。';return;}
 const selected=CAUSES.map((c,i)=>({c,i})).filter(x=>state.selected.has(x.c.id));const leading=selected.reduce((a,b)=>row[state.mode][a.i]>row[state.mode][b.i]?a:b);
 $('reading-text').innerHTML=state.mode==='cumulative'?`到 <strong>${row.year} 年</strong>，所选死因中 <strong>${leading.c.name}</strong> 的模拟累计概率最高（${detailedPct(row.cumulative[leading.i])}%）。各曲线已考虑其他死因的竞争风险。`:`截至 <strong>${row.year} 年</strong> 的一年内，${leading.c.name}的条件死亡概率为 <strong>${detailedPct(row.annual[leading.i])}%</strong>。年度概率不能直接相加为多年概率。`;
}
function niceTop(value){const v=Math.max(.01,value*100*1.18);const power=10**Math.floor(Math.log10(v));return Math.ceil(v/power/0.5)*power*.5/100;}
function drawChart(){
 if(!rows.length)return;
 const svg=$('risk-chart');const width=Math.max(280,svg.getBoundingClientRect().width);const small=width<500,height=small?260:316;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=`${height}px`;
 const p={l:small?42:48,r:18,t:22,b:37},w=width-p.l-p.r,h=height-p.t-p.b;
 const visible=CAUSES.map((c,i)=>({c,i})).filter(({c})=>state.selected.has(c.id));
 const max=niceTop(Math.max(...rows.slice(state.mode==='annual'?1:0).flatMap(r=>visible.map(({i})=>r[state.mode][i])),.0001));
 const x=t=>p.l+t/30*w,y=v=>p.t+h-v/max*h;
 chartLayout={width,height,p,w,h,x,y,max};let html=`<title>未来30年${state.mode==='cumulative'?'累计':'年度'}死亡概率，演示模拟</title><desc>所有概率未经金牛区数据校准。用下方年份滑块和图例读取数值。</desc>`;
 for(let k=0;k<=4;k++){const value=max*k/4;html+=`<line x1="${p.l}" y1="${y(value)}" x2="${width-p.r}" y2="${y(value)}" stroke="#263641" stroke-dasharray="3 5"/><text x="${p.l-10}" y="${y(value)+4}" fill="#7995a5" font-size="12" text-anchor="end">${value===0?'0':value*100<1?(value*100).toFixed(2):(value*100).toFixed(1)}%</text>`;}
 for(let t=0;t<=30;t+=small?10:5)html+=`<text x="${x(t)}" y="${height-10}" fill="#8199a8" font-size="12" text-anchor="middle">${2026+t}</text>`;
 html+=`<line x1="${x(state.year)}" y1="${p.t}" x2="${x(state.year)}" y2="${p.t+h}" stroke="#6b897e" stroke-dasharray="3 5"/>`;
 for(const {c,i} of visible){const chartRows=rows.map((r,t)=>({r,t})).filter(({t})=>state.mode==='cumulative'||t>0);const d=chartRows.map(({r,t},index)=>`${index?'L':'M'}${x(t).toFixed(2)},${y(r[state.mode][i]).toFixed(2)}`).join(' ');html+=`<path d="${d}" fill="none" stroke="${c.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(state.year)}" cy="${y(rows[state.year][state.mode][i])}" r="3.5" fill="${c.color}" stroke="#111a22" stroke-width="1.5"/>`;}
 if(!visible.length)html+=`<text x="${width/2}" y="${height/2}" fill="#9bb2c0" text-anchor="middle" font-size="14">选择至少一项死因查看曲线</text>`;
 svg.innerHTML=html;$('chart-tooltip').hidden=true;
}
function svgPosition(svg,event){const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(svg.getScreenCTM().inverse());}
function yearFromEvent(e){const point=svgPosition($('risk-chart'),e);return Math.max(state.mode==='annual'?1:0,Math.min(30,Math.round((point.x-chartLayout.p.l)/chartLayout.w*30)));}
$('risk-chart').addEventListener('pointermove',e=>{if(!chartLayout||!state.selected.size)return;const t=yearFromEvent(e);const data=rows[t];$('chart-tooltip').innerHTML=`<strong>${2026+t} · ${state.age+t} 岁 · ${state.mode==='cumulative'?'累计':'年度'}</strong>`+CAUSES.map((c,i)=>state.selected.has(c.id)?`<div class="tooltip-line"><span><i style="background:${c.color}"></i>${c.name}</span><span>${detailedPct(data[state.mode][i])}%</span></div>`:'').join('');$('chart-tooltip').hidden=false;});
$('risk-chart').addEventListener('pointerleave',()=>$('chart-tooltip').hidden=true);
$('risk-chart').addEventListener('click',e=>{state.year=yearFromEvent(e);$('year').value=state.year;drawChart();renderLegend();renderReading();});
new ResizeObserver(()=>drawChart()).observe($('risk-chart').parentElement);
function insideRing(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>point[1])!==(yj>point[1]))&&(point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
function insideDistrict(point){return mapFeaturePolygons.some(poly=>insideRing(point,poly[0])&&!poly.slice(1).some(ring=>insideRing(point,ring)));}
const MAP_DATA_URL = null; // Supply a locally licensed GeoJSON file to enable map interaction.
async function loadMap(){if(!MAP_DATA_URL){$('coordinate-message').textContent='源代码导出不含未核实再分发许可的区界。街道与居住条件比较仍可使用。';$('set-coordinate').disabled=true;$('map-status').textContent='区界数据未包含';$('district-map').innerHTML='<text x="300" y="180" text-anchor="middle" fill="#95acb8" font-size="16">此源码版本未包含区界数据</text>';return;}try{const response=await fetch(MAP_DATA_URL);if(!response.ok)throw new Error('Map unavailable');geo=await response.json();mapFeaturePolygons=geo.features.flatMap(f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]);const points=mapFeaturePolygons.flat(2);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const correction=Math.cos((minY+maxY)/2*Math.PI/180),scale=Math.min(475/((maxX-minX)*correction),320/(maxY-minY));const cx=(minX+maxX)/2,cy=(minY+maxY)/2;projection={forward:([lng,lat])=>[300+(lng-cx)*scale*correction,184-(lat-cy)*scale],inverse:([x,y])=>[cx+(x-300)/scale/correction,cy-(y-184)/scale]};drawMap();$('coordinate-message').textContent='区界来源：DataV。坐标为示意用途；选点不会上传，也不会自动生成风险。';}catch{ $('coordinate-message').textContent='区界暂时无法加载。你仍可选择街道、填写居住条件进行比较。';$('set-coordinate').disabled=true;$('district-map').innerHTML='<text x="300" y="180" text-anchor="middle" fill="#95acb8" font-size="16">地图暂时不可用</text>';}}
function drawMap(){if(!projection)return;const path=mapFeaturePolygons.map(poly=>poly.map(ring=>ring.map((p,i)=>`${i?'L':'M'}${projection.forward(p).map(n=>n.toFixed(2)).join(',')}`).join(' ')+'Z').join(' ')).join(' ');let html=`<defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#233943" stroke-width=".55"/></pattern><linearGradient id="mapFill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#24574b" stop-opacity=".65"/><stop offset="1" stop-color="#16423d" stop-opacity=".4"/></linearGradient></defs><rect width="600" height="390" fill="url(#grid)"/><path d="${path}" fill="none" stroke="#27564d" stroke-width="12" opacity=".12"/><path d="${path}" fill="url(#mapFill)" fill-rule="evenodd" stroke="#5ca08b" stroke-width="1.4"/>`;
 const center=projection.forward(geo.features[0].properties.centroid);html+=`<text x="${center[0]}" y="${center[1]}" fill="#a4cdbb" font-size="22" font-weight="500" letter-spacing="5" text-anchor="middle">金牛区</text><text x="${center[0]}" y="${center[1]+24}" fill="#68988b" font-size="12" letter-spacing="3" text-anchor="middle">JINNIU DISTRICT</text>`;
 if(state.point){const [x,y]=projection.forward(state.point);html+=`<circle cx="${x}" cy="${y}" r="15" fill="#8cf1c8" opacity=".12"/><circle cx="${x}" cy="${y}" r="7" fill="#0e2521" stroke="#9af7d2" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="#9af7d2"/>`;}
 $('district-map').innerHTML=html;$('clear-pin').hidden=!state.point;$('map-status').textContent=state.point?`已标注 · ${state.point[0].toFixed(4)}° E, ${state.point[1].toFixed(4)}° N`:'点击区界内，标注大致位置';
}
function setPoint(point){if(!projection)return;if(!insideDistrict(point)){$('coordinate-message').textContent='该位置不在当前金牛区示意边界内，请重新点选或修改坐标。';return;}state.point=point;$('longitude').value=point[0].toFixed(4);$('latitude').value=point[1].toFixed(4);resetEnvironment();drawMap();update();$('coordinate-message').textContent='位置已更新。请填写这个位置的居住条件；系统不根据坐标猜测污染或疾病风险。';}
$('district-map').addEventListener('click',e=>{if(!projection)return;const p=svgPosition($('district-map'),e);setPoint(projection.inverse([p.x,p.y]));});
$('set-coordinate').addEventListener('click',()=>{const lon=$('longitude'),lat=$('latitude');if(!lon.value||!lat.value||!Number.isFinite(Number(lon.value))||!Number.isFinite(Number(lat.value))){$('coordinate-message').textContent='请填写有效的经度和纬度。';return;}setPoint([Number(lon.value),Number(lat.value)]);});
$('clear-pin').addEventListener('click',()=>{state.point=null;$('longitude').value='';$('latitude').value='';resetEnvironment();drawMap();update();$('coordinate-message').textContent='已清除位置和对应的居住条件。';});
const sections=[...document.querySelectorAll('main>section[id]')];
const navigation=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(el=>navigation.observe(el));
update();loadMap();
