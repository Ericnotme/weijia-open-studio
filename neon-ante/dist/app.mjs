import * as G from './game.mjs';
const $=id=>document.getElementById(id),STORE='neon-ante-run-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const short=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':fmt(n);
const freshSeed=()=>globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Date.now()>>>0;
let s=G.newRun(freshSeed()),selected=new Set(),sort='rank',busy=false,animation=null,toastTimer,audio=null,sound=true,saved=false,restoreFailed=false;
try{const raw=localStorage.getItem(STORE);if(raw){const data=JSON.parse(raw);if(G.validSave(data)){s=data;saved=true;}else restoreFailed=true;}sound=localStorage.getItem('neon-ante-sound')!=='off';}catch{restoreFailed=true;}
function persist(){try{localStorage.setItem(STORE,JSON.stringify(s));$('save-status').textContent='已保存到本机';}catch{$('save-status').textContent='本机存档不可用';}}
function announce(message){$('announcement').textContent=message;$('announcement').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('announcement').hidden=true,3600);$('sr-status').textContent=message;}
function beep(kind='select'){
 if(!sound)return;try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio||=new AC();if(audio.state==='suspended')audio.resume();
  const notes=kind==='win'?[440,554,659,880]:kind==='score'?[294,440,587]:kind==='buy'?[523,784]:kind==='discard'?[260,190]:[370];
  notes.forEach((freq,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.08;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.16);});
 }catch{}
}
function guard(fn,message,sfx='select'){
 if(busy){announce('正在结算，请稍候。');return false;}
 try{fn();selected=new Set([...selected].filter(id=>s.hand.includes(id)));persist();render();if(message)announce(message);beep(sfx);return true;}catch(e){announce(e.message);return false;}
}
const disabled=condition=>condition?' disabled':'';
function cardHTML(c,{selectable=false,index=0,total=1,played=false}={}){
 const red=['H','D'].includes(c.suit),isSelected=selected.has(c.id)&&selectable,deb=G.debuffed(s,c);
 const label=G.rankLabel(c.rank),suit=G.suitDef(c.suit).symbol,enh=c.enhancement?G.ENHANCEMENTS[c.enhancement]:'';
 return `<${selectable?'button':'div'} class="playing-card ${red?'red':''} ${esc(c.enhancement||'')} ${isSelected?'selected':''} ${deb?'debuffed':''}" ${selectable?`type="button" data-card="${esc(c.id)}" aria-pressed="${isSelected}" aria-label="${esc(G.suitDef(c.suit).name+label+(enh?' · '+enh:'')+(deb?' · 已削弱':''))}"${disabled(busy)}`:''} style="--index:${index};--angle:${selectable?(index-(total-1)/2)*1.15:0};--curve:${selectable?Math.abs(index-(total-1)/2)*1.4:0}"><span class="card-corner">${label}<small>${suit}</small></span><span class="card-pip" aria-hidden="true">${suit}</span><span class="card-corner bottom" aria-hidden="true">${label}<small>${suit}</small></span>${enh?`<span class="enhancement-dot" title="${esc(enh)}">${{bonus:'✧',mult:'+',steel:'×',wild:'✺'}[c.enhancement]}</span>`:''}${isSelected?'<span class="card-check">✓</span>':''}</${selectable?'button':'div'}>`;
}
function jokerHTML(j,index=0,interactive=true){
 const def=G.jokerDef(j.id);const symbol=j.id==='rocket'?'×'+fmt(j.value??1):j.id==='sculptor'?'+'+fmt(j.value??0):j.id==='popcorn'?'+'+(j.value??20):def.symbol;
 return `<${interactive?'button':'div'} class="joker-card" style="--card-color:${def.color}" ${interactive?`data-joker="${esc(j.uid)}" aria-label="${esc(def.name+'：'+def.description)}"${disabled(busy)}`:''}><span class="card-tag">JOKER</span><span class="card-index">${index+1}</span><span class="card-symbol">${esc(symbol)}</span><span class="card-name">${def.name}</span></${interactive?'button':'div'}>`;
}
function consumableHTML(c,interactive=true){
 const planet=c.kind==='planet',def=planet?G.handDef(c.id):G.TAROTS.find(t=>t.id===c.id),name=planet?def.planet:def.name;
 return `<${interactive?'button':'div'} class="consumable-card ${planet?'planet':'tarot'}" ${interactive?`data-consumable="${esc(c.uid)}" aria-label="${esc(name+(planet?'：'+def.name+'等级加一':'：'+def.description))}"${disabled(busy)}`:''}><span class="card-symbol">${planet?'✦':def.symbol}</span><span class="card-name">${name}</span></${interactive?'button':'div'}>`;
}
function renderInventory(){
 const limit=G.jokerLimit(s);$('joker-count').textContent=`${s.jokers.length} / ${limit}`;$('consumable-count').textContent=`${s.consumables.length} / 2`;
 $('jokers').innerHTML=s.jokers.map((j,i)=>jokerHTML(j,i)).join('')+Array.from({length:limit-s.jokers.length},()=>'<div class="empty-slot" aria-hidden="true">✧</div>').join('');
 $('consumables').innerHTML=s.consumables.map(c=>consumableHTML(c)).join('')+Array.from({length:2-s.consumables.length},()=>'<div class="empty-slot" aria-hidden="true">✦</div>').join('');
}
function getPreview(){if(s.phase==='play'&&selected.size){try{return G.scoreHand(s,[...selected]);}catch{}}return null;}
function renderDashboard(){
 $('ante-number').innerHTML=String(s.ante).padStart(2,'0')+'<span>/ '+(s.endless?'∞':'08')+'</span>';
 $('round-name').textContent=G.blindName(s);$('target-score').textContent=short(s.target);$('round-score').textContent=short(s.roundScore);$('progress-fill').style.width=Math.min(100,s.roundScore/s.target*100)+'%';
 const preview=animation||getPreview();
 $('hand-type').textContent=preview?preview.name:s.phase==='play'?'选择你的牌':s.phase==='shop'||s.phase==='pack'?'升级你的组合':'下一手，会更强';
 $('hand-level').textContent=preview?'牌型等级 '+preview.level:s.phase==='play'?'最多选择 5 张':'筹码 × 倍率';
 $('chip-value').textContent=preview?short(preview.chips):'0';$('mult-value').textContent=preview?short(preview.mult):'0';
 $('score-preview').textContent=preview?(animation?'本手得分 ':'预计得分 ')+short(preview.score):'组合牌型，点亮分数';
 $('hands-left').textContent=s.handsLeft;$('discards-left').textContent=s.discardsLeft;$('cash').textContent='$'+fmt(s.cash);$('deck-count').textContent=s.phase==='play'?s.pile.length:s.cards.length;
 $('run-id').textContent='牌局 '+s.seed.toString(36).toUpperCase();$('sound').textContent=sound?'♪ 音效开':'♪ 音效关';
 const boss=G.activeBoss(s);$('boss-banner').hidden=!(boss&&s.phase==='play');$('boss-banner').textContent=boss?'首领 · '+boss.name+' / '+boss.description:'';
}
function sortedHand(){return s.hand.map(id=>G.getCard(s,id)).sort((a,b)=>sort==='rank'?b.rank-a.rank||a.suit.localeCompare(b.suit):G.SUITS.findIndex(x=>x.id===a.suit)-G.SUITS.findIndex(x=>x.id===b.suit)||b.rank-a.rank);}
function renderHand(){
 const show=s.phase==='play'||!!animation;$('hand-section').hidden=!show;if(!show)return;
 const focusedCard=document.activeElement?.dataset?.card;
 const cards=sortedHand();$('hand').style.setProperty('--hand-count',cards.length||8);$('hand').innerHTML=cards.map((c,i)=>cardHTML(c,{selectable:true,index:i,total:cards.length})).join('');
 if(focusedCard)$('hand').querySelector(`[data-card="${CSS.escape(focusedCard)}"]`)?.focus({preventScroll:true});
 $('selection-label').textContent=`你的手牌 · ${selected.size} / 5 已选`;
 $('sort-rank').classList.toggle('active',sort==='rank');$('sort-suit').classList.toggle('active',sort==='suit');
 $('play').disabled=busy||s.phase!=='play'||!selected.size;$('discard').disabled=busy||s.phase!=='play'||!selected.size||s.discardsLeft<=0;$('clear-selection').disabled=busy||!selected.size;
 const p=getPreview();$('play-hint').textContent=p?`${p.name} · ${p.scoringIds.length} 张牌参与计分；剩余牌仅消耗，不计点数。`:'选中 1–5 张牌组成牌型，点击「出牌」。';
}
function renderSelect(){
 return `<div class="stage-content"><div class="stage-heading"><div><div class="eyebrow gold-text">CHOOSE YOUR BLIND</div><h2>选择你的下一场挑战</h2><p>达到目标分数，即可进入商店强化。</p></div></div><div class="blind-grid">${[0,1,2].map(b=>{
 const current=b===s.blind,past=b<s.blind,boss=G.bossFor(s);return `<article class="blind-card ${current?'current':'locked'}"><div class="blind-chip ${b===1?'big':b===2?'boss':''}">${b===0?'Ⅰ':b===1?'Ⅱ':boss.symbol}</div><h3>${G.blindName(s,b)}</h3><div class="blind-target">${short(G.blindTarget(s,b))}</div><p class="blind-desc">${b===2?boss.description:'奖励 $'+[3,4][b]+' + 剩余出牌与利息'}</p>${current?`<button class="action play-action" data-action="start">选择盲注</button>${b<2?`<button class="skip-button" data-action="skip">跳过 · ${b===0?'领取 $5':'随机牌型升级'}</button>`:''}`:`<div class="locked-label">${past?'✓ 已结束':'尚未解锁'}</div>`}</article>`;
 }).join('')}</div></div>`;
}
function renderBattle(scoring=false){
 const last=scoring?animation:s.lastScore;
 if(!last)return `<div class="battle-center"><div class="battle-label">ROUND ${s.stats.cleared+1} / ${esc(G.blindName(s))}</div><h2 class="battle-title">把手中的牌，变成可能。</h2><p class="battle-desc">累计获得 <b class="gold-text">${fmt(s.target)}</b> 分即可过关。<br>先寻找对子、顺子或同花；不合适的牌可以弃掉重抽。</p><div class="played-cards"><div class="empty-slot">♠</div><div class="empty-slot">♥</div><div class="empty-slot">♣</div></div></div>`;
 return `<div class="battle-center ${scoring?'scoring':''}"><div class="battle-label">${scoring?'SCORING / 计分中':'LAST HAND / 上一手'}</div><div class="played-cards">${last.played.map((c,i)=>cardHTML(c,{index:i,played:true})).join('')}</div><div class="last-hand-summary ${scoring?'score-pop':''}">+${short(last.score)}<small>${last.name} · ${short(last.chips)} 筹码 × ${short(last.mult)} 倍率</small></div><button class="quiet score-breakdown" data-action="breakdown">查看逐项计分 ↗</button></div>`;
}
function receiptHTML(){const r=s.reward;if(!r)return '';return `<div class="receipt"><div><span>盲注奖励</span><strong>$${r.blindCash}</strong></div><div><span>剩余出牌 ${r.hands} 次</span><strong>$${r.hands}</strong></div><div><span>资金利息</span><strong>$${r.interest}</strong></div>${r.tip?`<div><span>返场小费</span><strong>$${r.tip}</strong></div>`:''}<div class="receipt-total"><span>本关收入 · 已到账</span><strong>+$${r.total}</strong></div></div>`;}
function renderPayout(){return `<div class="payout"><div class="stamp">✦</div><div class="eyebrow">BLIND CLEARED</div><h2>${G.blindName(s)}，拿下。</h2><div class="final-score">${short(s.roundScore)} <span class="muted">/ ${short(s.target)}</span></div>${receiptHTML()}<button class="action play-action" data-action="shop">进入商店 ↗</button></div>`;}
function itemInfo(item){
 if(item.kind==='joker'){const d=G.jokerDef(item.id);return {name:d.name,desc:d.description,art:jokerHTML({id:d.id,value:d.id==='rocket'?1:d.id==='popcorn'?20:0},0,false)};}
 if(item.kind==='planet'){const d=G.handDef(item.id),i=G.handInfo(s,item.id);return {name:d.planet,desc:`${d.name} Lv.${i.level} → Lv.${i.level+1}；+${d.upChips} 筹码、+${d.upMult} 倍率。`,art:consumableHTML(item,false)};}
 const d=G.TAROTS.find(t=>t.id===item.id);return {name:d.name,desc:d.description,art:consumableHTML(item,false)};
}
function renderShop(){
 const shop=s.shop;
 return `<div class="stage-content"><div class="stage-heading"><div><div class="eyebrow gold-text">THE NIGHT MARKET</div><h2>夜市商店</h2><p>先买加成，再买可能性。</p></div><span class="muted">消耗牌购买后点击使用</span></div><div class="shop-grid">${shop.offers.map((item,i)=>{
  if(item.bought)return '<article class="shop-item sold-out">✓ 已售出</article>';
  const d=itemInfo(item),cost=G.price(s,item.cost),full=item.kind==='joker'?s.jokers.length>=G.jokerLimit(s):s.consumables.length>=2;
  return `<article class="shop-item">${d.art}<h3>${d.name}</h3><p>${d.desc}</p><button class="buy-button" data-action="buy" data-index="${i}"${disabled(s.cash<cost||full)}>${full?'栏位已满':'购买 $'+cost}</button></article>`;
 }).join('')}</div><div class="shop-bottom">${shop.packs.map((pack,i)=>`<div class="shop-extra"><span>${pack.kind==='joker'?'✧':'✦'}</span><div><h3>${pack.kind==='joker'?'小丑补充包':'星球补充包'}</h3><p>三选一${pack.kind==='planet'?' · 立即升级':''}</p></div><button data-action="pack" data-index="${i}"${disabled(pack.bought||s.cash<G.price(s,pack.cost)||pack.kind==='joker'&&s.jokers.length>=G.jokerLimit(s))}>${pack.bought?'售罄':'$'+G.price(s,pack.cost)}</button></div>`).join('')}${shop.voucher?(()=>{const v=G.VOUCHERS.find(v=>v.id===shop.voucher);return `<div class="shop-extra"><span>${v.symbol}</span><div><h3>${v.name}</h3><p>${v.description}</p></div><button data-action="voucher"${disabled(shop.voucherBought||s.cash<v.cost)}>${shop.voucherBought?'已购':'$'+v.cost}</button></div>`;})():''}</div><div class="shop-toolbar"><button class="subtle" data-action="reroll"${disabled(s.cash<shop.reroll)}>↻ 刷新商品 $${shop.reroll}</button><button class="action play-action" data-action="next">下一场盲注 →</button></div></div>`;
}
function renderPack(){return `<div class="stage-content"><div class="stage-heading"><div><div class="eyebrow gold-text">MAKE YOUR CHOICE</div><h2>${s.pack.kind==='joker'?'小丑':'星球'}补充包</h2><p>选取一张${s.pack.kind==='planet'?'，立即提升牌型等级':''}。</p></div></div><div class="pack-grid">${s.pack.items.map((item,i)=>{const d=itemInfo(item);return `<article class="shop-item">${d.art}<h3>${d.name}</h3><p>${d.desc}</p><button class="buy-button" data-action="pick" data-index="${i}"${disabled(item.kind==='joker'&&s.jokers.length>=G.jokerLimit(s))}>选择这张</button></article>`;}).join('')}</div><div class="shop-toolbar"><span class="muted">本包已付款</span><button class="subtle" data-action="skip-pack">放弃本包</button></div></div>`;}
function renderEnd(won){return `<div class="payout"><div class="stamp">${won?'♛':'♠'}</div><div class="eyebrow">${won?'EIGHT ANTES. ONE WINNER.':'ONE MORE HAND?'}</div><h2>${won?'八底注，全部通关。':'这手牌，还差一点。'}</h2><p class="battle-desc">${won?'你让每一张小丑牌，都成为了主角。':'抵达第 '+s.ante+' 底注 · '+G.blindName(s)}</p><div class="receipt"><div><span>本关得分 / 目标</span><strong>${short(s.roundScore)} / ${short(s.target)}</strong></div><div><span>单手最高分</span><strong>${short(s.stats.best)}</strong></div><div><span>成功通过盲注</span><strong>${s.stats.cleared}</strong></div><div><span>累计出牌</span><strong>${s.stats.hands} 次</strong></div></div>${won?'<button class="action play-action" data-action="endless">继续无尽挑战 →</button>':'<button class="action play-action" data-action="again">再开一局 ↻</button>'}<div style="margin-top:13px"><button class="quiet" data-action="breakdown">查看最后一手计分</button></div></div>`;}
function renderStage(){
 const phase=animation?'scoring':s.phase;
 $('stage').innerHTML=phase==='select'?renderSelect():phase==='play'||phase==='scoring'?renderBattle(phase==='scoring'):phase==='payout'?renderPayout():phase==='shop'?renderShop():phase==='pack'?renderPack():renderEnd(phase==='won');
 $('phase-label').textContent=phase==='shop'?'每 $5 留存资金，过关可得 $1 利息。':phase==='pack'?'一张新牌，一种新可能。':phase==='play'?'Enter 出牌 · D 弃牌 · Esc 清除选择':phase==='select'?'小盲注、大盲注可以跳过；首领必须击败。':phase==='scoring'?'筹码与倍率正在结算。':'好运，从下一手开始。';
}
function render(){renderInventory();renderDashboard();renderStage();renderHand();$('restart').disabled=busy;}
function toggleCard(id){if(s.phase!=='play'||busy)return;if(selected.has(id))selected.delete(id);else if(selected.size<5)selected.add(id);else{announce('每次最多选择 5 张牌。');return;}beep();renderDashboard();renderHand();}
async function play(){
 if(busy||!selected.size||s.phase!=='play')return;
 try{
  animation=G.playHand(s,[...selected]);selected.clear();busy=true;persist();render();beep('score');
  $('sr-status').textContent=animation.name+'，获得 '+animation.score+' 分。';
  await new Promise(resolve=>setTimeout(resolve,window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?180:900));
  animation=null;busy=false;render();if(['payout','won'].includes(s.phase))beep('win');
 }catch(e){busy=false;animation=null;announce(e.message);render();}
}
function discardSelected(){guard(()=>{G.discard(s,[...selected]);selected.clear();},null,'discard');}
function openDetail(html){$('detail-content').innerHTML=html;if(!$('detail-dialog').open)$('detail-dialog').showModal();}
function openJoker(uid){
 const j=s.jokers.find(j=>j.uid===uid);if(!j)return;const d=G.jokerDef(j.id),i=s.jokers.indexOf(j),movable=['select','play','shop','pack'].includes(s.phase)&&!busy;
 const dynamic=j.id==='rocket'?`当前倍率 ×${fmt(j.value)}`:j.id==='sculptor'?`当前筹码 +${j.value}`:j.id==='popcorn'?`当前倍率 +${j.value}`:'';
 openDetail(`<div class="eyebrow gold-text">${d.rarity} · JOKER</div><div class="detail-card">${jokerHTML(j,i,false)}</div><h2 class="detail-title">${d.name}</h2><p class="detail-description">${d.description}</p>${dynamic?`<p class="gold-text">${dynamic}</p>`:''}<p class="small-note">牌面与手牌效果先结算；小丑牌随后按从左到右的顺序触发。</p><div class="detail-actions"><button class="subtle" data-detail="left" data-uid="${esc(uid)}"${disabled(!movable||i===0)}>← 左移</button><button class="subtle" data-detail="right" data-uid="${esc(uid)}"${disabled(!movable||i===s.jokers.length-1)}>右移 →</button><button class="action discard-action" data-detail="sell-joker" data-uid="${esc(uid)}"${disabled(!movable)}>出售 $${Math.max(1,Math.floor(d.cost/2))}</button></div>`);
}
function openConsumable(uid){
 const c=s.consumables.find(c=>c.uid===uid);if(!c)return;const d=itemInfo(c),usable=['select','play','shop','pack'].includes(s.phase)&&!busy;
 const tip=c.kind==='tarot'?'先在牌桌选好手牌，再点「使用」。再次强化会替换原有强化；花色转换会保留强化。':'立即提升对应牌型等级，本局永久有效。';
 openDetail(`<div class="eyebrow gold-text">${c.kind==='planet'?'PLANET / 星球牌':'ARCANA / 秘术牌'}</div><div class="detail-card">${consumableHTML(c,false)}</div><h2 class="detail-title">${d.name}</h2><p class="detail-description">${d.desc}</p><p class="small-note">${tip}</p>${c.kind==='tarot'?`<p class="gold-text">当前已选择 ${selected.size} 张手牌</p>`:''}<div class="detail-actions"><button class="subtle" data-detail="sell-consumable" data-uid="${esc(uid)}"${disabled(!usable)}>出售 $1</button><button class="action play-action" data-detail="use" data-uid="${esc(uid)}"${disabled(!usable)}>使用</button></div>`);
}
function showHands(){const current=getPreview()?.type;openDetail(`<div class="eyebrow gold-text">POKER HANDS</div><h2>牌型与等级</h2><p>牌型基础分之外，参与计分的牌还会贡献点数。A = 11，J / Q / K = 10，其余按牌面点数。</p><table class="hand-table"><thead><tr><th>牌型</th><th>等级</th><th>筹码 × 倍率</th><th>组合示例</th></tr></thead><tbody>${[...G.HANDS].reverse().map(h=>{const i=G.handInfo(s,h.id);return `<tr class="${h.id===current?'current':''}"><td>${h.name}</td><td class="mono">${i.level}</td><td class="mono"><span class="blue-text">${i.chips}</span> × <span class="red-text">${i.mult}</span></td><td class="muted">${h.example}</td></tr>`;}).join('')}</tbody></table><p class="small-note" style="margin-top:14px">顺子可以是 A–2–3–4–5 或 10–J–Q–K–A，不能跨越 K–A–2。牌型优先级从上到下。</p>`);}
function showDeck(){
 const inBattle=s.phase==='play';
 openDetail(`<div class="eyebrow gold-text">YOUR DECK</div><h2>本局牌组 · ${s.cards.length} 张</h2><p>${inBattle?'牌堆剩余 '+s.pile.length+' 张，手中 '+s.hand.length+' 张，已打出或弃掉 '+s.used.length+' 张。':'每次进入盲注都会重新洗入所有卡牌。'}</p><div class="deck-grid">${G.SUITS.flatMap(suit=>s.cards.filter(c=>c.suit===suit.id).sort((a,b)=>b.rank-a.rank).map(c=>`<div class="deck-mini ${['H','D'].includes(c.suit)?'red':''} ${inBattle&&!s.pile.includes(c.id)?'used':''} ${c.enhancement?'enhanced':''}" title="${esc(G.suitDef(c.suit).name+G.rankLabel(c.rank)+(c.enhancement?' '+G.ENHANCEMENTS[c.enhancement]:''))}">${G.rankLabel(c.rank)}${suit.symbol}</div>`)).join('')}</div><p class="deck-legend">金边：已强化。${inBattle?'暗色：已抽到手中或使用。':''}</p><p class="small-note" style="margin-top:16px">已获凭证：${s.vouchers.length?s.vouchers.map(id=>G.VOUCHERS.find(v=>v.id===id).name).join('、'):'无'}</p>`);
}
function breakdown(){const score=animation||s.lastScore;if(!score){announce('出牌后可以查看计分明细。');return;}openDetail(`<div class="eyebrow gold-text">SCORE BREAKDOWN</div><h2>${score.name} · +${fmt(score.score)}</h2><div class="receipt">${score.trace.map(t=>`<div><span>${esc(t.label)}</span><strong>${esc(t.detail)}</strong></div>`).join('')}<div class="receipt-total"><span>最终得分</span><strong>${fmt(score.chips)} × ${fmt(score.mult)}<br>= ${fmt(score.score)}</strong></div></div><p class="small-note">最终乘积向下取整。显示数值最多保留两位小数，计分使用完整精度。</p>`);}
function resetRun(){s=G.newRun(freshSeed());selected.clear();busy=false;animation=null;persist();render();announce('新牌局已就绪。');}
$('hand').addEventListener('click',e=>{const id=e.target.closest('[data-card]')?.dataset.card;if(id)toggleCard(id);});
$('jokers').addEventListener('click',e=>{const uid=e.target.closest('[data-joker]')?.dataset.joker;if(uid&&!busy)openJoker(uid);});
$('consumables').addEventListener('click',e=>{const uid=e.target.closest('[data-consumable]')?.dataset.consumable;if(uid&&!busy)openConsumable(uid);});
$('stage').addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const action=b.dataset.action,index=Number(b.dataset.index);if(action==='breakdown'){breakdown();return;}if(busy)return;
 if(action==='start')guard(()=>{G.startBlind(s);selected.clear();});
 if(action==='skip')guard(()=>{const message=G.skipBlind(s);announce(message);});
 if(action==='shop'||action==='endless')guard(()=>G.enterShop(s),null,'buy');
 if(action==='next')guard(()=>{G.leaveShop(s);selected.clear();});
 if(action==='buy')guard(()=>G.buyOffer(s,index),'已加入你的卡牌栏。','buy');
 if(action==='reroll')guard(()=>G.reroll(s),null,'discard');
 if(action==='voucher')guard(()=>G.buyVoucher(s),'凭证已生效，本局永久保留。','buy');
 if(action==='pack')guard(()=>G.buyPack(s,index),null,'buy');
 if(action==='pick')guard(()=>G.choosePack(s,index),'卡牌已领取。','buy');
 if(action==='skip-pack')guard(()=>G.skipPack(s));
 if(action==='again')resetRun();
});
$('detail-content').addEventListener('click',e=>{
 const b=e.target.closest('[data-detail]');if(!b||b.disabled)return;const uid=b.dataset.uid,a=b.dataset.detail;
 if(a==='left'||a==='right'){if(guard(()=>G.reorderJoker(s,uid,a==='left'?-1:1)))openJoker(uid);return;}
 let message='';const ok=guard(()=>{
  if(a==='sell-joker')message='已出售，获得 $'+G.sellJoker(s,uid)+'。';
  if(a==='sell-consumable'){G.sellConsumable(s,uid);message='已出售，获得 $1。';}
  if(a==='use'){message=G.useConsumable(s,uid,[...selected]);}
 },null,'buy');if(ok){$('detail-dialog').close();announce(message);}
});
$('play').onclick=play;$('discard').onclick=discardSelected;$('clear-selection').onclick=()=>{if(busy)return;selected.clear();renderDashboard();renderHand();};
$('sort-rank').onclick=()=>{sort='rank';renderHand();};$('sort-suit').onclick=()=>{sort='suit';renderHand();};
$('hands-info').onclick=showHands;$('deck').onclick=showDeck;$('help').onclick=()=>$('help-dialog').showModal();
$('restart').onclick=()=>{if(!busy)$('restart-dialog').showModal();};$('confirm-restart').onclick=()=>{$('restart-dialog').close();resetRun();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('sound').onclick=()=>{sound=!sound;try{localStorage.setItem('neon-ante-sound',sound?'on':'off');}catch{}$('sound').textContent=sound?'♪ 音效开':'♪ 音效关';if(sound)beep();};
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.closest('[data-portfolio-support],[data-portfolio-music]'))return;
 if(e.key==='Escape'){selected.clear();renderDashboard();renderHand();}
 if(e.key==='Enter'&&s.phase==='play'&&selected.size&&(e.target.tagName!=='BUTTON'||e.target.closest('[data-card]')||e.target.id==='play')){e.preventDefault();play();}
 if(e.key.toLowerCase()==='d'&&s.phase==='play'&&selected.size){e.preventDefault();discardSelected();}
});
render();persist();if(restoreFailed)announce('旧存档无法读取，已开启新牌局。');else if(saved)announce('已恢复上次牌局。');
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const tools=[{
  name:'read_poker_run',title:'读取扑克闯关状态',description:'Read the current run, hand cards, selected cards and available phase. This does not change the game.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},
  execute(){return {phase:s.phase,busy,ante:s.ante,blind:G.blindName(s),target:s.target,score:s.roundScore,cash:s.cash,handsLeft:s.handsLeft,discardsLeft:s.discardsLeft,hand:s.hand.map(id=>G.getCard(s,id)),selected:[...selected],jokers:s.jokers.map(j=>({id:j.id,name:G.jokerDef(j.id).name,value:j.value})),shop:s.phase==='shop'?s.shop:null};}
 },{
  name:'select_poker_cards',title:'选择手牌',description:'Select up to five distinct cards currently in the hand. This stages the selection without playing or discarding it.',inputSchema:{type:'object',properties:{cardIds:{type:'array',items:{type:'string'},maxItems:5,uniqueItems:true}},required:['cardIds'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){if(!input||!Array.isArray(input.cardIds)||input.cardIds.length>5||new Set(input.cardIds).size!==input.cardIds.length||input.cardIds.some(id=>typeof id!=='string'||!s.hand.includes(id)))throw new Error('Invalid hand card IDs');if(busy||s.phase!=='play')throw new Error('The hand is not currently playable');selected=new Set(input.cardIds);renderDashboard();renderHand();return {selected:[...selected],preview:getPreview()};}
 },{
  name:'play_selected_poker_hand',title:'打出已选手牌',description:'Commit the currently selected poker cards, consume one hand, calculate score, and resolve any blind completion.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
  async execute(){if(busy||s.phase!=='play'||!selected.size)throw new Error('Select a playable hand first');await play();return {phase:s.phase,score:s.roundScore,handsLeft:s.handsLeft,lastScore:s.lastScore?.score};}
 }];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
