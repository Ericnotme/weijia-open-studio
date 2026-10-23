'use strict';
(() => {
 const $=id=>document.getElementById(id), form=$('prep-form');
 let prepared=null, currentBlob=null;
 const questionsMap={diagnosis:'报告中的影像印象表示什么？还有哪些需要医生核实的不确定性？',comparison:'是否有可以比较的既往影像？检查方法和测量位置是否可比，变化应如何确认？',symptoms:'我记录的症状是否需要进一步评估？哪些变化需要及时联系医生？',followup:'接下来需要哪些检查或就诊安排？由哪位医生确定时间，什么情况下需要提前就医？',images:'本次原始影像及序列是否齐全、质量是否足够？是否还需调取其他资料？',pathology:'目前有哪些病理资料，是否需要核实？影像描述与病理结果应如何区分？'};
 const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 $('report-date').max=localToday();
 function invalidate(){prepared=null;$('summary-content').hidden=true;$('empty').hidden=false;$('empty').textContent='内容已变更，请重新整理就诊摘要。';$('facts').replaceChildren();$('quote').textContent='';$('questions').replaceChildren();$('custom').textContent='';$('download').disabled=true;$('print').disabled=true;$('export-status').textContent='';if(currentBlob){URL.revokeObjectURL(currentBlob);currentBlob=null;}}
 function synchronize(){for(const prefix of ['location','size']){const checked=$(prefix+'-unknown').checked;$(prefix).disabled=checked;if(checked)$(prefix).value='';if(prefix==='size'){$('unit').disabled=checked;if(checked)$('unit').value='';}}}
 function clear(){form.reset();synchronize();invalidate();$('errors').textContent='';form.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));$('empty').innerHTML='<strong>还没有整理内容</strong>可以先不填报告，直接生成一份<br>需要向医生确认的问题清单。';$('form-status').textContent='所有输入和本页摘要已清除。已下载或打印的副本需自行删除。';}
 form.addEventListener('input',()=>{synchronize();invalidate();$('form-status').textContent='修改完成后，请重新整理。';});
 form.addEventListener('change',()=>{synchronize();invalidate();});
 function read(){return {date:$('report-date').value,text:$('report-text').value.trim(),location:$('location').value.trim(),locationUnknown:$('location-unknown').checked,size:$('size').value.trim(),unit:$('unit').value,sizeUnknown:$('size-unknown').checked,unknown:[...form.querySelectorAll('[name=unknown]:checked')].map(x=>x.value),custom:$('personal-questions').value.trim()};}
 function validate(v){const errors=[];const bad=(id,message)=>errors.push({id,message});if(v.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||Number(v.date.slice(0,4))<1900||v.date>localToday()||new Date(v.date+'T00:00:00Z').toISOString().slice(0,10)!==v.date))bad('report-date','请填写有效的报告日期（1900 年至今天），或留空。');if(v.size&&!v.sizeUnknown){const parts=v.size.split(/[xX×*]/).map(x=>x.trim());if(parts.length>3||parts.some(x=>!/^\d+(?:\.\d+)?$/.test(x)||!Number.isFinite(Number(x))||Number(x)<=0))bad('size','尺寸请填写 1–3 个大于 0 的数字，例如 12 × 8 × 6；不确定时请选择未知。');if(!v.unit)bad('unit','已填写尺寸，请核实并选择报告原文的单位，或将尺寸标为未知。');}else if(v.unit&&!v.sizeUnknown)bad('size','已选择单位，请填写尺寸，或将尺寸标为未知。');return errors;}
 function generate(){const v=read();const errors=validate(v);form.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));$('errors').replaceChildren();if(errors.length){invalidate();for(const e of errors){const p=document.createElement('p');p.textContent=e.message;$('errors').append(p);$(e.id).setAttribute('aria-invalid','true');}$(errors[0].id).focus();$('form-status').textContent='请先核对提示的输入。';return false;}
 const q=['报告的主要结论是什么？哪些内容已经确定，哪些仍属影像提示或需要进一步确认？'];
 if(!v.date)q.push('这份报告的日期是哪一天？目前尚未记录，请核实。');
 if(!v.text)q.push('报告原文尚未填写；请核对医院原始报告，不依据这份摘要作判断。');
 if(!v.location||v.locationUnknown)q.push('报告描述的具体部位和左右侧是什么？目前未明确记录。');else q.push('我摘录的部位是否准确？与邻近结构的关系，需要医生如何解释？');
 if(!v.size||v.sizeUnknown)q.push('报告是否给出尺寸及单位？测量的是哪个部位、哪个方向？目前未明确记录。');else q.push('我摘录的尺寸和单位是否正确？测量位置、方向及与既往检查的可比性如何？');
 for(const k of v.unknown)q.push(questionsMap[k]);
 if(!v.unknown.includes('followup'))q.push(questionsMap.followup);
 prepared={...v,questions:q};const facts=[['报告日期',v.date||'未知／未填写'],['部位原文',v.locationUnknown?'未知／未写明':v.location||'未知／未填写'],['尺寸原文',v.sizeUnknown?'未知／未写明':v.size?`${v.size} ${v.unit}`:'未知／未填写']];
 $('facts').replaceChildren();for(const [k,val] of facts){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=val;$('facts').append(dt,dd);}
 $('quote').textContent=v.text||'尚未填写原文；请携带医院原始报告。';$('questions').replaceChildren();for(const s of q){const li=document.createElement('li');li.textContent=s;$('questions').append(li);}$('custom').textContent=v.custom;$('custom-wrap').hidden=!v.custom;$('empty').hidden=true;$('summary-content').hidden=false;$('download').disabled=false;$('print').disabled=false;$('form-status').textContent='已整理。请核对右侧或下方摘要，再下载或打印。';$('summary-title').focus();return true;}
 function output(){if(!prepared)return '';const p=prepared;return ['就诊准备摘要','手动记录 · 未经医生核实 · 不构成诊断','',`报告日期：${p.date||'未知／未填写'}`,`部位原文：${p.locationUnknown?'未知／未写明':p.location||'未知／未填写'}`,`尺寸原文：${p.sizeUnknown?'未知／未写明':p.size?`${p.size} ${p.unit}`:'未知／未填写'}`,'','报告原文（手动摘录）：',p.text||'尚未填写，请核对医院原始报告。','','待医生核实的问题：',...p.questions.map((q,i)=>`${i+1}. ${q}`),'','本人补充的问题或记录：',p.custom||'未填写','','请携带医院原始报告和影像。本摘要不推断诊断、分级、病程或治疗；尺寸不用于计算风险。','本文件在浏览器本地生成。请妥善保管；清除网页不会删除已下载或打印的副本。'].join('\n');}
 form.addEventListener('submit',e=>{e.preventDefault();generate();});$('clear').addEventListener('click',()=>{clear();$('report-date').focus();});
 $('download').addEventListener('click',()=>{if(!prepared)return;if(currentBlob)URL.revokeObjectURL(currentBlob);currentBlob=URL.createObjectURL(new Blob(['\ufeff'+output()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=currentBlob;a.download='就诊准备摘要.txt';a.click();$('export-status').textContent='文字摘要已交给浏览器下载。请妥善保管下载副本。';setTimeout(()=>{if(currentBlob){URL.revokeObjectURL(currentBlob);currentBlob=null;}},1000);});
 $('print').addEventListener('click',()=>{if(prepared){$('export-status').textContent='已打开浏览器打印；可选择保存为 PDF。';window.print();}});
 // No persistence; reset restored forms and discard page content before back-forward cache.
 clear();$('form-status').textContent='';window.addEventListener('pageshow',e=>{if(e.persisted)clear();});window.addEventListener('pagehide',clear);
 // This optional browser tool only clears state; it never returns patient input.
 const lifecycle=new AbortController();if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'clear_visit_preparation',title:'清除就诊准备',description:'清除当前网页中的全部手动输入与摘要，不删除已下载文件。不会返回患者内容。',inputSchema:{type:'object',properties:{confirm:{type:'boolean',const:true}},required:['confirm'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||input.confirm!==true||Object.keys(input).some(k=>k!=='confirm'))throw new Error('需要 confirm: true');clear();return {cleared:true};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
})();
