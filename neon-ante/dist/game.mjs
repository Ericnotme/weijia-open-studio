export const SUITS=[{id:'S',symbol:'♠',name:'黑桃'},{id:'H',symbol:'♥',name:'红桃'},{id:'C',symbol:'♣',name:'梅花'},{id:'D',symbol:'♦',name:'方块'}];
export const HANDS=[
 {id:'high',name:'高牌',chips:5,mult:1,upChips:10,upMult:1,planet:'流星',example:'A · J · 9 · 6 · 2'},
 {id:'pair',name:'一对',chips:10,mult:2,upChips:15,upMult:1,planet:'双子',example:'8 · 8'},
 {id:'two',name:'两对',chips:20,mult:2,upChips:20,upMult:1,planet:'天秤',example:'K · K · 4 · 4'},
 {id:'three',name:'三条',chips:30,mult:3,upChips:20,upMult:2,planet:'星团',example:'7 · 7 · 7'},
 {id:'straight',name:'顺子',chips:30,mult:4,upChips:30,upMult:3,planet:'彗星',example:'5 · 6 · 7 · 8 · 9'},
 {id:'flush',name:'同花',chips:35,mult:4,upChips:15,upMult:2,planet:'星云',example:'五张相同花色'},
 {id:'full',name:'葫芦',chips:40,mult:4,upChips:25,upMult:2,planet:'月环',example:'Q · Q · Q · 2 · 2'},
 {id:'four',name:'四条',chips:60,mult:7,upChips:30,upMult:3,planet:'超新星',example:'9 · 9 · 9 · 9'},
 {id:'sf',name:'同花顺',chips:100,mult:8,upChips:40,upMult:4,planet:'银河',example:'同一花色的五连张'}
];
export const JOKERS=[
 {id:'neon',name:'霓虹招牌',symbol:'+4',color:'#c76d94',cost:4,rarity:'普通',description:'每次出牌，+4 倍率。'},
 {id:'mint',name:'筹码工厂',symbol:'+50',color:'#479aab',cost:5,rarity:'普通',description:'每次出牌，+50 筹码。'},
 {id:'duet',name:'双生灯牌',symbol:'Ⅱ',color:'#9974bc',cost:4,rarity:'普通',description:'出牌包含对子时，+8 倍率。'},
 {id:'twins',name:'双重回声',symbol:'2²',color:'#a483b9',cost:5,rarity:'普通',description:'出牌包含两对时，+12 倍率。'},
 {id:'trio',name:'三重奏',symbol:'Ⅲ',color:'#8c8ec2',cost:5,rarity:'普通',description:'出牌包含三条时，+12 倍率。'},
 {id:'route',name:'连锁公路',symbol:'↗',color:'#588d89',cost:5,rarity:'普通',description:'打出顺子或同花顺时，+15 倍率。'},
 {id:'prism',name:'单色光谱',symbol:'◈',color:'#847ab9',cost:5,rarity:'普通',description:'打出同花或同花顺时，+12 倍率。'},
 {id:'heart',name:'红心脉冲',symbol:'♥',color:'#cb646e',cost:5,rarity:'普通',description:'每张参与计分的红桃牌，+3 倍率。万能牌也生效。'},
 {id:'spade',name:'黑桃电台',symbol:'♠',color:'#5e7bb1',cost:5,rarity:'普通',description:'每张参与计分的黑桃牌，+3 倍率。万能牌也生效。'},
 {id:'club',name:'三叶信号',symbol:'♣',color:'#659968',cost:5,rarity:'普通',description:'每张参与计分的梅花牌，+3 倍率。万能牌也生效。'},
 {id:'diamond',name:'钻石频率',symbol:'♦',color:'#c59455',cost:5,rarity:'普通',description:'每张参与计分的方块牌，+3 倍率。万能牌也生效。'},
 {id:'portrait',name:'人像展览',symbol:'K',color:'#bd8c50',cost:5,rarity:'普通',description:'每张参与计分的 J、Q、K，+30 筹码。'},
 {id:'even',name:'偶数节拍',symbol:'2·4',color:'#729aaa',cost:5,rarity:'普通',description:'每张参与计分的 2、4、6、8、10，+4 倍率。'},
 {id:'odd',name:'奇数电流',symbol:'1·3',color:'#cd8c52',cost:5,rarity:'普通',description:'每张参与计分的 A、3、5、7、9，+31 筹码。'},
 {id:'ace',name:'头号玩家',symbol:'A',color:'#9472b5',cost:6,rarity:'罕见',description:'每张参与计分的 A，+20 筹码、+4 倍率。'},
 {id:'solo',name:'独奏时刻',symbol:'×1.5',color:'#ae6ca4',cost:7,rarity:'罕见',description:'本次出牌不超过 3 张时，倍率 ×1.5。'},
 {id:'finale',name:'最后一幕',symbol:'×2',color:'#ac5e60',cost:7,rarity:'罕见',description:'本关最后一次出牌，倍率 ×2。'},
 {id:'echo',name:'余音',symbol:'↻',color:'#728cb6',cost:7,rarity:'罕见',description:'与上一手牌型相同时，倍率 ×2。跨关保留上一手。'},
 {id:'bank',name:'复利剧场',symbol:'$',color:'#b59b4a',cost:6,rarity:'罕见',description:'每持有 $5 资金，+2 倍率。'},
 {id:'rocket',name:'升空计划',symbol:'×↑',color:'#a178bb',cost:8,rarity:'稀有',description:'倍率 ×1。每击败一个首领，永久增加 ×0.25。'},
 {id:'sculptor',name:'筹码雕刻师',symbol:'+↑',color:'#56a3a4',cost:6,rarity:'罕见',description:'初始 +0 筹码。每次出牌后，永久增加 +8 筹码。'},
 {id:'popcorn',name:'爆米花',symbol:'+20',color:'#cca558',cost:5,rarity:'普通',description:'初始 +20 倍率，每过一关减少 4。降到 0 时消失。'},
 {id:'tip',name:'返场小费',symbol:'$+2',color:'#8b9e60',cost:4,rarity:'普通',description:'每次通过盲注，额外获得 $2。'},
 {id:'reserve',name:'保留节目',symbol:'+15',color:'#b07388',cost:6,rarity:'罕见',description:'弃牌次数用尽时，每次出牌 +15 倍率。'}
];
export const TAROTS=[
 {id:'bonus',name:'镀金',symbol:'✧',description:'最多选择 2 张手牌，变为奖励牌：参与计分时 +30 筹码。',cost:3},
 {id:'mult',name:'热浪',symbol:'☀',description:'最多选择 2 张手牌，变为倍率牌：参与计分时 +4 倍率。',cost:3},
 {id:'steel',name:'冷铸',symbol:'⬡',description:'选择 1 张手牌，变为钢铁牌：留在手中时，最终牌面倍率 ×1.5。',cost:4},
 {id:'wild',name:'万花筒',symbol:'✺',description:'选择 1 张手牌，变为万能牌：可视为任意花色。',cost:3},
 {id:'hearts',name:'心火',symbol:'♥',description:'最多选择 2 张手牌，将花色永久改为红桃。',cost:3},
 {id:'spades',name:'夜幕',symbol:'♠',description:'最多选择 2 张手牌，将花色永久改为黑桃。',cost:3}
];
export const VOUCHERS=[
 {id:'hands',name:'加演券',symbol:'H+',description:'每关出牌次数永久 +1。',cost:10},
 {id:'discards',name:'重来券',symbol:'D+',description:'每关弃牌次数永久 +1。',cost:10},
 {id:'hand',name:'宽桌券',symbol:'9',description:'手牌上限永久 +1。',cost:10},
 {id:'slots',name:'贵宾券',symbol:'J+',description:'小丑牌栏位永久 +1。',cost:10},
 {id:'discount',name:'折扣券',symbol:'−25%',description:'商店商品与补充包永久 75 折（向上取整，凭证除外）。',cost:10},
 {id:'interest',name:'储蓄券',symbol:'$$',description:'过关利息的上限从 $5 提升至 $10。',cost:10}
];
export const BOSSES=[
 {id:'heart',name:'红潮',symbol:'♥',description:'红桃牌被削弱：仍可组成牌型，但不提供点数或卡牌效果。'},
 {id:'water',name:'静水',symbol:'≈',description:'本关没有弃牌机会。'},
 {id:'plant',name:'无面舞会',symbol:'K',description:'J、Q、K 被削弱，不提供点数或卡牌效果。'},
 {id:'wall',name:'高墙',symbol:'▥',description:'目标分数为基础盲注的 4 倍。'},
 {id:'flint',name:'燧石',symbol:'½',description:'牌型的基础筹码和基础倍率减半（向下取整）。'},
 {id:'needle',name:'一线生机',symbol:'Ⅰ',description:'本关只有 1 次出牌机会。'},
 {id:'diamond',name:'碎晶',symbol:'♦',description:'方块牌被削弱：仍可组成牌型，但不提供点数或卡牌效果。'},
 {id:'violet',name:'紫色终幕',symbol:'Ⅷ',description:'最终考验：目标分数为基础盲注的 6 倍。'}
];
export const ENHANCEMENTS={bonus:'奖励 +30',mult:'倍率 +4',steel:'钢铁 ×1.5',wild:'万能花色'};
export const PHASES=['select','play','payout','shop','pack','lost','won'];
export const jokerDef=id=>JOKERS.find(j=>j.id===id);
export const handDef=id=>HANDS.find(h=>h.id===id);
export const rankLabel=rank=>({11:'J',12:'Q',13:'K',14:'A'}[rank]||String(rank));
export const suitDef=id=>SUITS.find(s=>s.id===id);
const cardValue=c=>c.rank===14?11:Math.min(10,c.rank);
const check=(condition,message)=>{if(!condition)throw new Error(message);};
export function random(s){let x=s.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;}
function shuffle(s,arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const choose=(s,a)=>a[Math.floor(random(s)*a.length)];
export function newRun(seed=Date.now()>>>0){
 const s={version:1,seed:(seed>>>0)||1234567,rng:(seed>>>0)||1234567,phase:'select',ante:1,blind:0,cash:4,jokers:[],consumables:[],vouchers:[],cards:[],hand:[],pile:[],used:[],handsLeft:4,discardsLeft:3,roundScore:0,target:300,levels:Object.fromEntries(HANDS.map(h=>[h.id,1])),lastType:null,lastScore:null,reward:null,shop:null,pack:null,nextId:1,stats:{hands:0,discards:0,cleared:0,best:0,total:0},endless:false};
 for(const suit of SUITS)for(let rank=2;rank<=14;rank++)s.cards.push({id:suit.id+rank,rank,suit:suit.id,enhancement:null});
 return s;
}
export const jokerLimit=s=>5+(s.vouchers.includes('slots')?1:0);
export const handSize=s=>8+(s.vouchers.includes('hand')?1:0);
export const bossFor=s=>BOSSES[(s.ante-1)%BOSSES.length];
export const activeBoss=s=>s.blind===2?bossFor(s):null;
export function blindTarget(s,blind=s.blind){
 const bases=[300,800,2000,5000,11000,20000,35000,50000];
 const base=bases[s.ante-1]??Math.floor(50000*1.8**(s.ante-8));
 const boss=bossFor(s);const factor=blind===0?1:blind===1?1.5:boss.id==='wall'?4:boss.id==='violet'?6:2;
 return Math.min(9e15,Math.floor(base*factor));
}
export function blindName(s,blind=s.blind){return blind===0?'小盲注':blind===1?'大盲注':bossFor(s).name;}
export const getCard=(s,id)=>s.cards.find(c=>c.id===id);
export function debuffed(s,c){const boss=activeBoss(s);return !!boss&&(boss.id==='heart'&&(c.suit==='H'||c.enhancement==='wild')||boss.id==='diamond'&&(c.suit==='D'||c.enhancement==='wild')||boss.id==='plant'&&c.rank>=11&&c.rank<=13);}
export function handInfo(s,id){const base=handDef(id),level=s.levels[id];return {...base,level,chips:base.chips+(level-1)*base.upChips,mult:base.mult+(level-1)*base.upMult};}
export function evaluate(cards){
 check(cards.length>=1&&cards.length<=5,'请选择 1–5 张牌。');
 const counts=new Map();for(const c of cards)counts.set(c.rank,(counts.get(c.rank)||0)+1);
 const groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
 const ranks=[...counts.keys()].sort((a,b)=>a-b);
 const straight=cards.length===5&&ranks.length===5&&(ranks[4]-ranks[0]===4||ranks.join(',')==='2,3,4,5,14');
 const normal=cards.filter(c=>c.enhancement!=='wild');
 const flush=cards.length===5&&new Set(normal.map(c=>c.suit)).size<=1;
 let id='high',scoring=[];
 if(straight&&flush){id='sf';scoring=cards;}
 else if(groups[0][1]===4){id='four';scoring=cards.filter(c=>c.rank===groups[0][0]);}
 else if(groups[0][1]===3&&groups[1]?.[1]===2){id='full';scoring=cards;}
 else if(flush){id='flush';scoring=cards;}
 else if(straight){id='straight';scoring=cards;}
 else if(groups[0][1]===3){id='three';scoring=cards.filter(c=>c.rank===groups[0][0]);}
 else if(groups[0][1]===2&&groups[1]?.[1]===2){id='two';scoring=cards.filter(c=>c.rank===groups[0][0]||c.rank===groups[1][0]);}
 else if(groups[0][1]===2){id='pair';scoring=cards.filter(c=>c.rank===groups[0][0]);}
 else scoring=[cards.reduce((a,b)=>a.rank>=b.rank?a:b)];
 return {id,scoringIds:scoring.map(c=>c.id),hasPair:groups.some(g=>g[1]>=2),hasTwo:groups.filter(g=>g[1]>=2).length>=2,hasThree:groups.some(g=>g[1]>=3)};
}
function selectedCards(s,ids){
 check(Array.isArray(ids)&&ids.length>0&&ids.length<=5&&new Set(ids).size===ids.length,'请选择 1–5 张不同的手牌。');
 check(ids.every(id=>s.hand.includes(id)),'所选卡牌不在手牌中。');return ids.map(id=>getCard(s,id));
}
export function scoreHand(s,ids){
 const cards=selectedCards(s,ids),type=evaluate(cards),info=handInfo(s,type.id),boss=activeBoss(s);
 let chips=info.chips,mult=info.mult;const trace=[];
 if(boss?.id==='flint'){chips=Math.max(1,Math.floor(chips/2));mult=Math.max(1,Math.floor(mult/2));}
 const baseChips=chips,baseMult=mult;
 trace.push({label:info.name+' Lv.'+info.level,detail:`${chips} 筹码 × ${mult} 倍率`});
 for(const id of type.scoringIds){
  const c=getCard(s,id);if(debuffed(s,c)){trace.push({label:rankLabel(c.rank)+suitDef(c.suit).symbol,detail:'被首领削弱'});continue;}
  let cchips=cardValue(c)+(c.enhancement==='bonus'?30:0),cmult=c.enhancement==='mult'?4:0;
  for(const j of s.jokers){
   const suit={heart:'H',spade:'S',club:'C',diamond:'D'}[j.id];if(suit&&(c.suit===suit||c.enhancement==='wild'))cmult+=3;
   if(j.id==='portrait'&&c.rank>=11&&c.rank<=13)cchips+=30;
   if(j.id==='even'&&[2,4,6,8,10].includes(c.rank))cmult+=4;
   if(j.id==='odd'&&[14,3,5,7,9].includes(c.rank))cchips+=31;
   if(j.id==='ace'&&c.rank===14){cchips+=20;cmult+=4;}
  }
  chips+=cchips;mult+=cmult;trace.push({label:rankLabel(c.rank)+suitDef(c.suit).symbol,detail:`+${cchips} 筹码`+(cmult?`，+${cmult} 倍率`:'')});
 }
 for(const id of s.hand.filter(id=>!ids.includes(id))){const c=getCard(s,id);if(c.enhancement==='steel'&&!debuffed(s,c)){mult*=1.5;trace.push({label:'手中钢铁牌 '+rankLabel(c.rank)+suitDef(c.suit).symbol,detail:'倍率 ×1.5'});}}
 for(const j of s.jokers){
  let add=0,extra=0,times=1;
  switch(j.id){
   case 'neon':add=4;break;case 'mint':extra=50;break;case 'duet':if(type.hasPair)add=8;break;case 'twins':if(type.hasTwo)add=12;break;case 'trio':if(type.hasThree)add=12;break;
   case 'route':if(['straight','sf'].includes(type.id))add=15;break;case 'prism':if(['flush','sf'].includes(type.id))add=12;break;
   case 'solo':if(ids.length<=3)times=1.5;break;case 'finale':if(s.handsLeft===1)times=2;break;case 'echo':if(s.lastType===type.id)times=2;break;
   case 'bank':add=Math.floor(s.cash/5)*2;break;case 'rocket':times=j.value;break;case 'sculptor':extra=j.value;break;case 'popcorn':add=j.value;break;case 'reserve':if(s.discardsLeft===0)add=15;break;
  }
  chips+=extra;mult=(mult+add)*times;
  if(extra||add||times!==1)trace.push({label:jokerDef(j.id).name,detail:extra?`+${extra} 筹码`:add?`+${add} 倍率`:`倍率 ×${times}`});
 }
 const score=Math.min(9e15,Math.floor(chips*mult));
 return {type:type.id,name:info.name,level:info.level,baseChips,baseMult,chips,mult,score,trace,scoringIds:type.scoringIds,played:cards.map(c=>({...c})),target:s.target};
}
function draw(s){while(s.hand.length<handSize(s)&&s.pile.length)s.hand.push(s.pile.pop());}
export function startBlind(s){
 check(s.phase==='select','现在不能开始盲注。');
 s.target=blindTarget(s);s.roundScore=0;s.lastScore=null;s.pile=shuffle(s,s.cards.map(c=>c.id));s.hand=[];s.used=[];
 const boss=activeBoss(s);s.handsLeft=boss?.id==='needle'?1:4+(s.vouchers.includes('hands')?1:0);s.discardsLeft=boss?.id==='water'?0:3+(s.vouchers.includes('discards')?1:0);
 s.phase='play';draw(s);return s;
}
export function skipBlind(s){
 check(s.phase==='select'&&s.blind<2,'首领关卡不能跳过。');let text;
 if(s.blind===0){s.cash+=5;text='跳过小盲注，获得 $5。';}else{const h=choose(s,HANDS);s.levels[h.id]++;text='跳过大盲注，'+h.name+'升到 Lv.'+s.levels[h.id]+'。';}
 s.blind++;s.target=blindTarget(s);s.roundScore=0;return text;
}
function finishBlind(s){
 const blindCash=[3,4,5][s.blind];const interest=Math.min(s.vouchers.includes('interest')?10:5,Math.floor(s.cash/5));const tip=s.jokers.filter(j=>j.id==='tip').length*2;
 s.reward={blindCash,hands:s.handsLeft,interest,tip,total:blindCash+s.handsLeft+interest+tip};s.cash+=s.reward.total;s.stats.cleared++;
 for(const j of s.jokers){if(j.id==='rocket'&&s.blind===2)j.value+=.25;if(j.id==='popcorn')j.value-=4;}
 s.jokers=s.jokers.filter(j=>j.id!=='popcorn'||j.value>0);
 s.phase=s.ante===8&&s.blind===2&&!s.endless?'won':'payout';
}
export function playHand(s,ids){
 check(s.phase==='play'&&s.handsLeft>0,'现在不能出牌。');const score=scoreHand(s,ids);
 s.handsLeft--;s.hand=s.hand.filter(id=>!ids.includes(id));s.used.push(...ids);s.roundScore=Math.min(9e15,s.roundScore+score.score);s.lastType=score.type;s.lastScore=score;
 s.stats.hands++;s.stats.total=Math.min(9e15,s.stats.total+score.score);s.stats.best=Math.max(s.stats.best,score.score);
 for(const j of s.jokers)if(j.id==='sculptor')j.value+=8;
 if(s.roundScore>=s.target)finishBlind(s);else if(s.handsLeft===0||!s.hand.length&&!s.pile.length)s.phase='lost';else draw(s);
 return score;
}
export function discard(s,ids){
 check(s.phase==='play'&&s.discardsLeft>0,'没有剩余弃牌次数。');selectedCards(s,ids);
 s.discardsLeft--;s.hand=s.hand.filter(id=>!ids.includes(id));s.used.push(...ids);s.stats.discards++;draw(s);
 if(!s.hand.length)s.phase='lost';return s;
}
export const price=(s,base)=>Math.ceil(base*(s.vouchers.includes('discount')?.75:1));
function makeJoker(s,id){return {uid:'j'+s.nextId++,id,value:id==='rocket'?1:id==='popcorn'?20:0};}
function makeConsumable(s,kind,id){return {uid:'c'+s.nextId++,kind,id};}
export function generateShop(s){
 const pool=shuffle(s,JOKERS.filter(j=>!s.jokers.some(x=>x.id===j.id)));
 const offers=pool.slice(0,2).map(j=>({kind:'joker',id:j.id,cost:j.cost,bought:false}));
 const h=choose(s,HANDS),t=choose(s,TAROTS);offers.push({kind:'planet',id:h.id,cost:3,bought:false},{kind:'tarot',id:t.id,cost:t.cost,bought:false});
 const available=VOUCHERS.filter(v=>!s.vouchers.includes(v.id));
 s.shop={offers,reroll:5,voucher:available.length?choose(s,available).id:null,voucherBought:false,packs:[{kind:'joker',cost:4,bought:false},{kind:'planet',cost:3,bought:false}]};
 return s.shop;
}
export function enterShop(s){check(s.phase==='payout'||s.phase==='won','现在不能进入商店。');if(s.phase==='won')s.endless=true;s.phase='shop';generateShop(s);}
export function leaveShop(s){
 check(s.phase==='shop','现在不在商店中。');s.blind++;if(s.blind===3){s.blind=0;s.ante++;}s.phase='select';s.target=blindTarget(s);s.roundScore=0;s.hand=[];s.pile=[];s.used=[];s.lastScore=null;s.shop=null;s.reward=null;
}
function canAcquire(s,item){if(item.kind==='joker'){check(s.jokers.length<jokerLimit(s),'小丑牌栏位已满，请先出售一张。');check(!s.jokers.some(j=>j.id===item.id),'已经持有这张小丑牌。');}else check(s.consumables.length<2,'消耗牌栏位已满，请先使用或出售。');}
function acquire(s,item){if(item.kind==='joker')s.jokers.push(makeJoker(s,item.id));else s.consumables.push(makeConsumable(s,item.kind,item.id));}
export function buyOffer(s,index){
 check(s.phase==='shop','现在不在商店中。');const item=s.shop.offers[index];check(item&&!item.bought,'这件商品已售出。');const cost=price(s,item.cost);check(s.cash>=cost,'资金不足。');canAcquire(s,item);s.cash-=cost;acquire(s,item);item.bought=true;
}
export function reroll(s){check(s.phase==='shop','现在不在商店中。');const cost=s.shop.reroll;check(s.cash>=cost,'资金不足。');s.cash-=cost;const old=s.shop;generateShop(s);s.shop.reroll=cost+1;s.shop.packs=old.packs;s.shop.voucher=old.voucher;s.shop.voucherBought=old.voucherBought;}
export function buyVoucher(s){
 check(s.phase==='shop'&&s.shop.voucher&&!s.shop.voucherBought,'没有可购买的凭证。');const v=VOUCHERS.find(v=>v.id===s.shop.voucher);check(s.cash>=v.cost,'资金不足。');check(!s.vouchers.includes(v.id),'已经持有此凭证。');s.cash-=v.cost;s.vouchers.push(v.id);s.shop.voucherBought=true;
}
export function buyPack(s,index){
 check(s.phase==='shop','现在不在商店中。');const pack=s.shop.packs[index];check(pack&&!pack.bought,'补充包已售出。');const cost=price(s,pack.cost);check(s.cash>=cost,'资金不足。');
 if(pack.kind==='joker')check(s.jokers.length<jokerLimit(s),'请先空出一个小丑牌栏位。');
 const items=pack.kind==='joker'?shuffle(s,JOKERS.filter(j=>!s.jokers.some(x=>x.id===j.id))).slice(0,3).map(j=>({kind:'joker',id:j.id})):shuffle(s,HANDS).slice(0,3).map(h=>({kind:'planet',id:h.id}));
 check(items.length>0,'没有可选的卡牌。');s.cash-=cost;pack.bought=true;s.pack={kind:pack.kind,items};s.phase='pack';
}
export function choosePack(s,index){
 check(s.phase==='pack'&&s.pack,'现在没有打开的补充包。');const item=s.pack.items[index];check(item,'请选择补充包中的卡牌。');
 if(item.kind==='planet')s.levels[item.id]++;else{canAcquire(s,item);acquire(s,item);}s.pack=null;s.phase='shop';
}
export function skipPack(s){check(s.phase==='pack','现在没有打开的补充包。');s.pack=null;s.phase='shop';}
export function sellJoker(s,uid){check(['select','play','shop','pack'].includes(s.phase),'现在不能出售。');const index=s.jokers.findIndex(j=>j.uid===uid);check(index>=0,'没有找到这张小丑牌。');const j=s.jokers[index];const amount=Math.max(1,Math.floor(jokerDef(j.id).cost/2));s.jokers.splice(index,1);s.cash+=amount;return amount;}
export function reorderJoker(s,uid,delta){check(['select','play','shop','pack'].includes(s.phase),'现在不能移动小丑牌。');check(delta===-1||delta===1,'无效的移动方向。');const i=s.jokers.findIndex(j=>j.uid===uid),j=i+delta;check(i>=0&&j>=0&&j<s.jokers.length,'已经位于边缘。');[s.jokers[i],s.jokers[j]]=[s.jokers[j],s.jokers[i]];}
export function sellConsumable(s,uid){check(['select','play','shop','pack'].includes(s.phase),'现在不能出售。');const i=s.consumables.findIndex(c=>c.uid===uid);check(i>=0,'没有找到这张消耗牌。');s.consumables.splice(i,1);s.cash++;}
export function useConsumable(s,uid,ids=[]){
 check(['select','play','shop','pack'].includes(s.phase),'现在不能使用消耗牌。');const index=s.consumables.findIndex(c=>c.uid===uid);check(index>=0,'没有找到这张消耗牌。');const item=s.consumables[index];let message;
 if(item.kind==='planet'){s.levels[item.id]++;message=handDef(item.id).name+'升到 Lv.'+s.levels[item.id]+'。';}
 else{
  check(s.phase==='play','请进入盲注后，选择手牌再使用秘术。');const max=['steel','wild'].includes(item.id)?1:2;check(ids.length>=1&&ids.length<=max,'请先选择 '+(max===1?'1':'1–2')+' 张手牌。');const cards=selectedCards(s,ids);
  for(const c of cards){if(item.id==='hearts')c.suit='H';else if(item.id==='spades')c.suit='S';else c.enhancement=item.id;}
  message='已永久强化 '+cards.length+' 张牌。';
 }
 s.consumables.splice(index,1);return message;
}
export function validSave(s){
 if(!s||s.version!==1||!PHASES.includes(s.phase)||!Number.isInteger(s.ante)||s.ante<1||!Number.isInteger(s.blind)||s.blind<0||s.blind>2||!Number.isFinite(s.cash)||s.cash<0||!Array.isArray(s.cards)||s.cards.length!==52)return false;
 if(!Array.isArray(s.jokers)||s.jokers.length>6||s.jokers.some(j=>!jokerDef(j.id)||!Number.isFinite(j.value))||!Array.isArray(s.consumables)||s.consumables.length>2)return false;
 if(s.consumables.some(c=>!(c.kind==='planet'?handDef(c.id):c.kind==='tarot'&&TAROTS.find(t=>t.id===c.id))))return false;
 if(!Array.isArray(s.vouchers)||s.vouchers.some(id=>!VOUCHERS.some(v=>v.id===id))||HANDS.some(h=>!Number.isInteger(s.levels?.[h.id])||s.levels[h.id]<1))return false;
 if(!s.cards.every(c=>typeof c.id==='string'&&Number.isInteger(c.rank)&&c.rank>=2&&c.rank<=14&&SUITS.some(x=>x.id===c.suit)&&(!c.enhancement||ENHANCEMENTS[c.enhancement])))return false;
 const ids=new Set(s.cards.map(c=>c.id));if(ids.size!==52||![s.hand,s.pile,s.used].every(a=>Array.isArray(a)&&a.every(id=>ids.has(id))))return false;
 const all=[...s.hand,...s.pile,...s.used];if(new Set(all).size!==all.length)return false;
 if(!Number.isInteger(s.rng)||!Number.isInteger(s.nextId)||!s.stats||!Number.isFinite(s.roundScore)||!Number.isFinite(s.target)||!Number.isInteger(s.handsLeft)||!Number.isInteger(s.discardsLeft))return false;
 if(['shop','pack'].includes(s.phase)&&(!s.shop||!Array.isArray(s.shop.offers)||!Array.isArray(s.shop.packs)))return false;
 if(s.phase==='pack'&&(!s.pack||!Array.isArray(s.pack.items)))return false;
 return true;
}
