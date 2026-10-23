'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={topic:'事业',drawing:false,card:null,birth:null},topics=['事业','关系','选择','自己'];
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function navigate(tab){if(!['ritual','birth','origins'].includes(tab))throw Error('未知页面');$$('.view').forEach(v=>v.hidden=v.id!==tab);$$('[data-tab]').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));$('.brand').addEventListener('click',e=>{e.preventDefault();navigate('ritual');});
function setTopic(topic){if(!topics.includes(topic))throw Error('请选择有效主题');state.topic=topic;$$('[data-topic]').forEach(b=>{const chosen=b.dataset.topic===topic;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});}
$$('[data-topic]').forEach(b=>b.addEventListener('click',()=>setTopic(b.dataset.topic)));
$('#today-label').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());$('#birth-date').max=localDate();
const cards=[
{name:'一苇渡江',word:'渡',line:'不必看清整条河，\n先找到落脚的地方。',idea:'把难题缩小到可以亲手试一试的尺度。答案有时出现在行动之后。',ask:'如果只迈一步，哪一步的代价最小？',action:['拿出十分钟，做出一个粗糙但能展示的样稿。','用一句具体的话表达需要，不替对方猜答案。','为更想尝试的选项，设计一个可以撤回的小实验。','把最难开始的事缩成两分钟，现在做一下。']},
{name:'山间留白',word:'静',line:'山不催你赶路，\n风自有它的方向。',idea:'暂停也可以是一种选择。区分真正紧急的事，和只是让你感到急的事。',ask:'如果晚一天回答，会失去什么？又能看清什么？',action:['从今天的待办中，划掉一件并非必要的事。','回复之前，先把感受写下来，留十分钟再看。','分别写下“必须今天决定”和“还能等”的部分。','给自己十分钟不刷屏的空白，注意身体现在的感受。']},
{name:'风过竹林',word:'听',line:'有时不必更用力，\n只需听见另一种声音。',idea:'新的视角往往来自一个更好的问题。让好奇心先于结论。',ask:'你还没有认真听见谁的想法，包括自己的？',action:['找一个可靠的人，只问“你最担心这件事的哪一点？”','问对方“你希望我理解的是什么？”，先听完。','为你较少考虑的选项，写下一个最有力的理由。','写一句“我其实想要……”，先不解释为什么。']},
{name:'灯下见心',word:'明',line:'先照亮脚边的一寸，\n再谈远处的星辰。',idea:'想象会放大未知。把事实、推测和愿望分开写，事情可能更清晰。',ask:'你正在相信的判断，哪些有事实支撑？',action:['写下一个已知事实，以及一个需要验证的假设。','把“对方总是……”改成一次具体发生的事。','列出最重要的三个标准，再比较每个选项。','把最担心的事分为“已发生”和“我在想象”。']},
{name:'雨后新芽',word:'生',line:'有些生长很轻，\n也值得被看见。',idea:'变化不一定轰轰烈烈。注意那些细小、可重复、已经发生的进步。',ask:'最近有什么小事，证明你正在向前？',action:['记下本周完成的一件小事，明确它带来的价值。','向一个人说出一件你具体感谢他的事。','选择一个能积累经验的小步骤，而非等待完美条件。','记下今天比昨天容易一点的事，哪怕只是起床。']},
{name:'松有其界',word:'定',line:'枝叶可以向远方，\n根仍留在自己的土里。',idea:'为重要的事留出空间，需要先辨认自己的边界。拒绝不等于否定别人。',ask:'你答应的事里，哪一件并非真的愿意？',action:['为一项新请求给出你能承受的时间或范围。','用“我现在能做到的是……”说清一个边界。','写下一个不能妥协的条件，重新看待选项。','安排一段属于自己的时间，并减少一个打扰。']}
];
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function lockDrawing(locked){state.drawing=locked;$('#draw-button').disabled=locked;$$('[data-topic]').forEach(b=>b.disabled=locked);$('#question').disabled=locked;}
async function draw(topic=state.topic,question=$('#question').value){
if(!topics.includes(topic)||typeof question!=='string'||question.length>240)throw Error('主题或心事格式不正确');if(state.drawing)throw Error('正在静心，请稍候');
lockDrawing(true);setTopic(topic);$('#question').value=question;navigate('ritual');$('#reflection').hidden=true;
try{const center=$('#oracle-center');center.replaceChildren();const orbit=node('div','orbit breathing');orbit.setAttribute('aria-hidden','true');orbit.append(node('span','','息'));center.append(orbit,node('p','oracle-caption','慢慢吸气……'));$('#draw-status').textContent='给自己一次呼吸的时间。';$('#card-label').textContent='宜 · 静心';
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){await pause(1800);$('.oracle-caption').textContent='轻轻呼出……';await pause(1800);}
const random=new Uint32Array(1);crypto.getRandomValues(random);let index=random[0]%cards.length;if(state.card?.index===index)index=(index+1)%cards.length;const card=cards[index],actionText=card.action[topics.indexOf(topic)];state.card={index,name:card.name,topic,question,action:actionText};
center.replaceChildren(node('p','card-eyebrow',`为「${topic}」抽得一签`),node('div','card-word',card.word),node('h2','card-name',card.name),node('p','card-poem',card.line));$('#card-label').textContent=`宜 · ${card.word}`;
const reflection=$('#reflection');reflection.replaceChildren();const copy=node('div','reflection-copy');copy.append(node('p','eyebrow','签外的话'));if(question.trim())copy.append(node('blockquote','your-question',question.trim()));copy.append(node('h2','',card.idea),node('p','reflection-ask',card.ask));
const action=node('div','action-card');action.append(node('p','eyebrow','今天，只做一件小事'),node('p','action-text',actionText));const done=node('button','secondary','我愿意试试');done.type='button';done.addEventListener('click',()=>{done.textContent='留给今天的自己 ✓';done.disabled=true;$('#draw-status').textContent='这个行动，交给你自己。';});action.append(done);reflection.append(copy,action);reflection.hidden=false;
$('#draw-status').textContent=`已抽得「${card.name}」。签是随机意象，不是对心事的预测。`;$('#draw-button').replaceChildren(document.createTextNode('换一个角度，再抽一签'),node('span','','↗'));return {name:card.name,topic,action:actionText};
}finally{lockDrawing(false);}}
$('#ritual-form').addEventListener('submit',e=>{e.preventDefault();draw().catch(err=>$('#draw-status').textContent=err.message);});
const archetypes={
甲:['向上生长的树','借“树”的意象，观察自己对方向和长期积累的重视。成长需要空间，也需要允许枝条转弯。','坚持中，有哪些是自己的愿望，哪些只是习惯？'],
乙:['顺势舒展的藤','借“藤”的意象，看看你如何适应环境、连接他人。柔软不妨碍你拥有清楚的方向。','适应别人的时候，你有没有忘记自己的需要？'],
丙:['照向远处的阳光','借“阳光”的意象，想想你愿意分享什么、照亮什么。热情也需要有节奏地休息。','你把精力给了谁，又想给什么多留一点？'],
丁:['安静照人的灯','借“灯”的意象，注意那些细微的感受和持续的关心。一盏小灯也能照亮一段路。','哪些关心让你充实，哪些让你感到耗尽？'],
戊:['沉稳的山','借“山”的意象，看看你的稳定感从何而来。可靠不意味着必须承担所有重量。','最近有什么重量，其实可以与人分担？'],
己:['孕育生长的田','借“田”的意象，观察你如何照顾人与事。土地需要耕耘，也需要休养。','在照顾别人之外，你需要怎样被照顾？'],
庚:['经过锻造的金','借“金”的意象，看看你对明确、原则和行动的需求。清晰的边界，也容得下温柔。','有什么判断可以更坚定，有什么判断值得再听一听？'],
辛:['微光中的玉','借“玉”的意象，留意你对品质和细节的感受。珍视美好，也可以容许不完美。','哪件事做到足够好，就可以交给世界了？'],
壬:['流向远方的河','借“河”的意象，观察好奇心如何带着你探索。流动不必意味着每条支流都要走。','众多方向中，你最愿意持续走向哪一个？'],
癸:['无声润物的雨','借“雨”的意象，留意你的感受力和想象力。细腻的觉察，需要可依靠的边界。','你感受到的情绪里，哪些来自自己，哪些来自周围？']};
const elements={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
function calculateBirth({date,time,unknown=false,name=''}){
if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'1900-01-01'||date>localDate())throw Error('请选择 1900 年至今天之间的有效日期。');if(typeof unknown!=='boolean'||typeof name!=='string'||name.length>24)throw Error('请检查姓名和时间选项。');if(!unknown&&(typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))throw Error('请填写有效时间，或选择时间不确定。');
const [y,m,d]=date.split('-').map(Number),check=new Date(y,m-1,d);if(check.getFullYear()!==y||check.getMonth()!==m-1||check.getDate()!==d)throw Error('出生日期不存在。');if(typeof Solar==='undefined')throw Error('历法组件未能载入，请刷新页面重试。');
const [h,min]=(unknown?'12:00':time).split(':').map(Number),lunar=Solar.fromYmdHms(y,m,d,h,min,0).getLunar(),ec=lunar.getEightChar();ec.setSect(2);const pillars=[ec.getYear(),ec.getMonth(),ec.getDay(),unknown?null:ec.getTime()],gan=ec.getDayGan(),count={木:0,火:0,土:0,金:0,水:0};pillars.filter(Boolean).join('').split('').forEach(c=>count[elements[c]]++);return {date,time:unknown?null:time,name:name.trim(),unknown,pillars,gan,count,lunar:lunar.getYearInChinese()+'年 '+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()};}
function showBirth(input){const result=calculateBirth(input);state.birth=result;const area=$('#birth-result');area.replaceChildren();area.classList.add('has-result');area.append(node('p','eyebrow',`${result.name?result.name+' · ':''}生辰意象`),node('h2','birth-title',archetypes[result.gan][0]),node('p','birth-date-note',`${result.date} ${result.time||'时间未知'} · 农历${result.lunar}`));
const pillars=node('div','pillars');result.pillars.forEach((p,i)=>{const col=node('div','pillar');col.append(node('span','',['年柱','月柱','日柱','时柱'][i]),node('strong','',p||'—'),node('small','',p?[...p].map(c=>elements[c]).join(' · '):'未排'));pillars.append(col);});area.append(pillars,node('p','birth-meaning',archetypes[result.gan][1]),node('p','birth-question',archetypes[result.gan][2]));
const row=node('div','element-row');for(const [key,value] of Object.entries(result.count)){const col=node('div','element'),bar=node('div','element-track'),fill=node('i',`element-${key}`);fill.style.height=`${Math.max(value/8*100,3)}%`;bar.append(fill);col.append(node('span','',String(value)),bar,node('span','',key));row.append(col);}area.append(row,node('p','privacy','显式干支的五行数量，不代表五行强弱或命运好坏。'));if(result.unknown)area.append(node('p','birth-caveat','时间未知：前三柱暂按中午推算；节气交接日的年柱或月柱需核对准确时刻。'));
const next=node('button','secondary','带着这个问题，抽今日一签');next.type='button';next.addEventListener('click',()=>{$('#question').value=archetypes[result.gan][2];setTopic('自己');navigate('ritual');$('#question').focus();});area.append(next);$('#birth-error').textContent='';return result;}
$('#time-unknown').addEventListener('change',()=>{$('#birth-time').disabled=$('#time-unknown').checked;$('#birth-time').required=!$('#time-unknown').checked;});$('#birth-form').addEventListener('submit',e=>{e.preventDefault();try{showBirth({date:$('#birth-date').value,time:$('#birth-time').value,unknown:$('#time-unknown').checked,name:$('#birth-name').value});}catch(err){$('#birth-error').textContent=err.message;}});
$('#birth-example').addEventListener('click',()=>{$('#birth-name').value='小微（虚构示例）';$('#birth-date').value='2005-12-23';$('#birth-time').value='08:37';$('#time-unknown').checked=false;$('#birth-time').disabled=false;$('#birth-time').required=true;showBirth({date:'2005-12-23',time:'08:37',name:'小微（虚构示例）'});});
if(document.modelContext?.registerTool){const lifecycle=new AbortController();addEventListener('pagehide',()=>lifecycle.abort(),{once:true});const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
register({name:'draw_reflection_card',title:'抽一张自我探索签',description:'选择主题并完成呼吸、揭签，在页面显示随机意象与小行动；不预测事件。',inputSchema:{type:'object',properties:{topic:{type:'string',enum:topics},question:{type:'string',maxLength:240}},required:['topic'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['topic','question'].includes(k)))throw Error('输入无效');return draw(input.topic,input.question??'');}});
register({name:'calculate_birth_reflection',title:'生成生辰意象',description:'按 UTC+8 出生日期时间排四柱并更新生辰解读页面，内容只保留在当前页面。',inputSchema:{type:'object',properties:{date:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},time:{type:'string'},unknown:{type:'boolean'},name:{type:'string',maxLength:24}},required:['date'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['date','time','unknown','name'].includes(k)))throw Error('输入无效');const r=showBirth(input);$('#birth-date').value=r.date;$('#birth-time').value=r.time||'12:00';$('#birth-name').value=r.name;$('#time-unknown').checked=r.unknown;$('#birth-time').disabled=r.unknown;$('#birth-time').required=!r.unknown;navigate('birth');return {pillars:r.pillars,archetype:archetypes[r.gan][0],timeUnknown:r.unknown};}});}
