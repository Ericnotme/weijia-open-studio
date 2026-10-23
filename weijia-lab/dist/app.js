(()=>{'use strict';
const dialog=document.querySelector('#image-dialog');let opener=null;
document.querySelectorAll('[data-gallery]').forEach(gallery=>{
 const buttons=[...gallery.querySelectorAll('[data-view]')],panels=[...gallery.querySelectorAll('[data-panel]')];
 const select=index=>{buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panels.forEach((p,i)=>p.hidden=i!==index);gallery.dataset.active=String(index)};
 gallery.querySelector('.switches').hidden=false;select(0);
 buttons.forEach((button,index)=>{button.addEventListener('click',()=>select(index));button.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const i=(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;select(i);buttons[i].focus()}})});
 const zoom=gallery.querySelector('[data-zoom]');zoom.hidden=false;zoom.addEventListener('click',()=>{const panel=panels[Number(gallery.dataset.active)],img=panel.querySelector('img');document.querySelector('#dialog-image').src=img.currentSrc||img.src;document.querySelector('#dialog-image').alt=img.alt;document.querySelector('#dialog-caption').textContent=panel.querySelector('figcaption').textContent;document.querySelector('#dialog-original').href=img.currentSrc||img.src;opener=zoom;dialog.showModal();document.body.classList.add('modal-open')});
});
document.querySelector('#dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true})});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('details').forEach(d=>d.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.open){e.preventDefault();e.stopPropagation();d.open=false;d.querySelector('summary').focus()}}));
const choices=[...document.querySelectorAll('[data-mini]')], miniPanels=[...document.querySelectorAll('[data-mini-panel]')], miniStage=document.querySelector('#mini-stage'), miniActions=document.querySelector('.mini-actions');let miniOrigin=null;
document.querySelector('.mini-choices').hidden=false;miniStage.hidden=true;miniPanels.forEach(p=>p.hidden=true);
const closeMini=()=>{miniStage.hidden=true;miniPanels.forEach(p=>{p.hidden=true;p.querySelector('details').open=false});choices.forEach(b=>b.setAttribute('aria-pressed','false'));miniOrigin?.focus({preventScroll:true})};
choices.forEach(button=>button.addEventListener('click',()=>{miniOrigin=button;choices.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));miniPanels.forEach(p=>{p.hidden=p.dataset.miniPanel!==button.dataset.mini;p.querySelector('details').open=false});miniStage.hidden=false;miniActions.hidden=false}));
document.querySelector('[data-mini-reset]').addEventListener('click',()=>{const panel=miniPanels.find(p=>!p.hidden);if(panel){panel.querySelector('details').open=false;panel.querySelector('summary').focus({preventScroll:true})}});
document.querySelector('[data-mini-close]').addEventListener('click',closeMini);miniStage.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeMini()}});
const media=matchMedia('(prefers-reduced-motion: reduce)');const hero=document.querySelector('.hero'),stage=document.querySelector('.hero-stage');let queued=false;
function motion(){if(media.matches){stage.style.transform='';return}const y=scrollY;if(y<hero.offsetHeight){const p=Math.min(y/650,1);stage.style.transform=`translateY(${-p*20}px)`}queued=false}
window.addEventListener('scroll',()=>{if(!queued&&!media.matches){queued=true;requestAnimationFrame(motion)}},{passive:true});media.addEventListener('change',motion);
})();
