(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Poker=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
const SUITS=['♠','♥','♣','♦'], RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const STREETS=['翻牌前','翻牌','转牌','河牌'], TYPES=['高牌','一对','两对','三条','顺子','同花','葫芦','四条','同花顺'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function random(){if(typeof crypto!=='undefined'&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296;}return Math.random();}
function seeded(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffled(rng=random){const d=Array.from({length:52},(_,i)=>i);for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function card(c){return{rank:RANKS[c%13],suit:SUITS[Math.floor(c/13)],red:Math.floor(c/13)%2===1,text:RANKS[c%13]+SUITS[Math.floor(c/13)]};}
function code(s){const m=/^(10|[2-9TJQKA])([shcd])$/i.exec(s);if(!m)throw Error('Invalid card');return 'shcd'.indexOf(m[2].toLowerCase())*13+RANKS.indexOf(m[1].toUpperCase()==='T'?'10':m[1].toUpperCase());}
function straight(mask){if(mask&(1<<14))mask|=1<<1;for(let h=14;h>=5;h--)if((mask&(31<<(h-4)))===(31<<(h-4)))return h;return 0;}
function score(cat,rs){let v=cat;for(let i=0;i<5;i++)v=v*15+(rs[i]||0);return v;}
function evaluate(cards){
 const count=new Uint8Array(15),sc=new Uint8Array(4),sm=new Uint16Array(4);let mask=0;
 for(const c of cards){const r=c%13+2,s=(c/13)|0;count[r]++;sc[s]++;sm[s]|=1<<r;mask|=1<<r;}
 let flush=-1;for(let s=0;s<4;s++)if(sc[s]>=5)flush=s;
 if(flush>=0){const st=straight(sm[flush]);if(st)return score(8,[st]);}
 const quads=[],trips=[],pairs=[],all=[];for(let r=14;r>=2;r--){if(count[r])all.push(r);if(count[r]===4)quads.push(r);else if(count[r]===3)trips.push(r);else if(count[r]===2)pairs.push(r);}
 if(quads.length)return score(7,[quads[0],...all.filter(r=>r!==quads[0]).slice(0,1)]);
 if(trips.length&&(pairs.length||trips.length>1))return score(6,[trips[0],Math.max(pairs[0]||0,trips[1]||0)]);
 if(flush>=0){const rs=[];for(let r=14;r>=2;r--)if(sm[flush]&(1<<r))rs.push(r);return score(5,rs.slice(0,5));}
 const st=straight(mask);if(st)return score(4,[st]);
 if(trips.length)return score(3,[trips[0],...all.filter(r=>r!==trips[0]).slice(0,2)]);
 if(pairs.length>=2)return score(2,[pairs[0],pairs[1],...all.filter(r=>r!==pairs[0]&&r!==pairs[1]).slice(0,1)]);
 if(pairs.length)return score(1,[pairs[0],...all.filter(r=>r!==pairs[0]).slice(0,3)]);
 return score(0,all.slice(0,5));
}
const category=v=>Math.floor(v/759375);
const label=cards=>cards.length>=5?TYPES[category(evaluate(cards))]:'等待公共牌';
function bestFive(cards){let best=-1,chosen=[];for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){const cs=[cards[a],cards[b],cards[c],cards[d],cards[e]],v=evaluate(cs);if(v>best){best=v;chosen=cs;}}return chosen;}
const freshStats=()=>({hands:0,vpip:0,pfr:0,actions:0,raises:0,faced:0,folds:0});
class Game{
 constructor(options={}){this.mode=options.mode==='limit'?'limit':'nl';this.rng=options.rng||random;this.bb=10;this.sb=5;this.handNo=0;this.button=1;this.players=[{name:'你',stack:1000},{name:'SIBIR',stack:1000}];this.history=[];this.stats=[freshStats(),freshStats()];this.done=true;this.result=null;this.log=[];this.board=[];this.pot=0;this.actor=-1;this.street=0;}
 start(){
  if(!this.done)throw Error('当前牌局尚未结束');if(this.players.some(p=>p.stack<=0))throw Error('本场已结束，请开始新场');
  this.handNo++;this.button=1-this.button;this.deck=shuffled(this.rng);this.board=[];this.log=[];this.street=0;this.pot=0;this.done=false;this.result=null;this.raised=[false,false];this.voluntary=[false,false];
  for(const p of this.players){p.startStack=p.stack;p.hole=[];p.bet=0;p.committed=0;p.folded=false;p.last='等待行动';}
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)this.players[(this.button+1+j)%2].hole.push(this.deck.pop());
  this.post(this.button,this.sb,'小盲');this.post(1-this.button,this.bb,'大盲');this.currentBet=Math.max(...this.players.map(p=>p.bet));this.lastRaise=this.bb;this.betCount=1;this.rights=[true,true];this.pending=[0,1];this.actor=this.button;this.advance();return this;
 }
 post(i,n,kind){const p=this.players[i],paid=Math.min(n,p.stack);p.stack-=paid;p.bet+=paid;p.committed+=paid;this.pot+=paid;p.last=kind+' '+paid;this.log.push({street:0,actor:i,type:'blind',amount:paid,text:p.last,board:[],pot:this.pot});}
 legal(i=this.actor){
  if(this.done||i!==this.actor||i<0)return{active:false,call:0,canRaise:false};
  const p=this.players[i],o=this.players[1-i],call=Math.min(p.stack,Math.max(0,this.currentBet-p.bet));
  const unit=this.mode==='limit'?(this.street>=2?20:10):this.lastRaise;
  const fullMin=this.currentBet+unit,effective=Math.min(p.bet+p.stack,o.bet+o.stack),max=this.mode==='limit'?Math.min(fullMin,effective):effective;
  const canRaise=o.stack>0&&max>this.currentBet&&this.rights[i]&&(this.mode!=='limit'||this.betCount<4);
  return{active:true,call,check:call===0,canRaise,min:Math.min(fullMin,max),max,fullMin,allIn:canRaise&&max===p.bet+p.stack};
 }
 act(i,type,to,analysis=null){
  const legal=this.legal(i);if(!legal.active)throw Error('尚未轮到该玩家');const p=this.players[i],old=this.currentBet;
  if(!['fold','check','call','raise'].includes(type))throw Error('未知动作');
  if(type==='check'&&!legal.check)throw Error('有待跟注金额');if(type==='call'&&legal.check)type='check';
  if(type==='raise'&&(!legal.canRaise||!Number.isInteger(to)||to<legal.min||to>legal.max))throw Error('无效加注额');
  const entry={index:this.log.length,street:this.street,actor:i,type,board:[...this.board],potBefore:this.pot,toCall:legal.call,amount:0,to:0,analysis:analysis?JSON.parse(JSON.stringify(analysis)):null};
  const st=this.stats[i];st.actions++;if(legal.call>0){st.faced++;if(type==='fold')st.folds++;}
  if(type==='fold'){p.folded=true;p.last='弃牌';entry.text='弃牌';this.log.push(entry);this.finish(1-i,'fold');return this;}
  if(type==='raise'){
   entry.amount=to-p.bet;entry.to=to;const delta=to-old;this.currentBet=to;if(delta>=this.lastRaise||this.mode==='limit'){this.lastRaise=delta;this.rights[1-i]=true;}this.rights[i]=false;this.pending=[1-i];this.betCount++;st.raises++;
   p.last=(old===0?'下注 ':'加注至 ')+to;if(this.street===0)this.raised[i]=true;
  }else{entry.amount=legal.call;this.pending=this.pending.filter(v=>v!==i);this.rights[i]=false;p.last=legal.call?'跟注 '+legal.call:'过牌';}
  if(entry.amount){p.stack-=entry.amount;p.bet+=entry.amount;p.committed+=entry.amount;this.pot+=entry.amount;if(this.street===0)this.voluntary[i]=true;}
  if(p.stack===0)p.last+=' · 全下';entry.text=p.last;entry.pot=this.pot;entry.sizeRatio=entry.amount/Math.max(1,entry.potBefore);this.log.push(entry);this.actor=1-i;this.advance();return this;
 }
 advance(){
  if(this.done)return;
  this.pending=this.pending.filter(i=>this.players[i].stack>0&&!this.players[i].folded);
  if(this.players.some(p=>p.stack===0)){
   const live=this.players.findIndex(p=>p.stack>0);if(live>=0&&this.players[live].bet<this.currentBet){this.actor=live;this.pending=[live];return;}
   this.refund();while(this.board.length<5){this.deck.pop();const n=this.board.length===0?3:1;for(let i=0;i<n;i++)this.board.push(this.deck.pop());}this.street=3;this.showdown();return;
  }
  if(this.pending.length){if(!this.pending.includes(this.actor))this.actor=this.pending[0];return;}
  this.refund();if(this.street===3){this.showdown();return;}
  this.street++;this.deck.pop();const n=this.street===1?3:1;for(let i=0;i<n;i++)this.board.push(this.deck.pop());
  for(const p of this.players){p.bet=0;p.last='等待行动';}this.currentBet=0;this.lastRaise=this.mode==='limit'&&this.street>=2?20:10;this.betCount=0;this.pending=[0,1];this.rights=[true,true];this.actor=1-this.button;
 }
 refund(){const a=this.players[0],b=this.players[1],diff=a.bet-b.bet;if(diff){const p=diff>0?a:b,n=Math.abs(diff);p.bet-=n;p.committed-=n;p.stack+=n;this.pot-=n;}}
 showdown(){const v=this.players.map(p=>evaluate([...p.hole,...this.board]));this.finish(v[0]===v[1]?-1:v[0]>v[1]?0:1,'showdown');}
 finish(winner,reason){
  this.done=true;this.actor=-1;const total=this.pot;if(winner<0){const half=Math.floor(total/2);this.players[0].stack+=half;this.players[1].stack+=half;this.players[1-this.button].stack+=total%2;}else this.players[winner].stack+=total;
  this.result={winner,reason,pot:total,net:this.players.map(p=>p.stack-p.startStack),labels:this.players.map(p=>label([...p.hole,...this.board]))};this.pot=0;
  for(let i=0;i<2;i++){this.stats[i].hands++;if(this.voluntary[i])this.stats[i].vpip++;if(this.raised[i])this.stats[i].pfr++;}
  this.history.push({handNo:this.handNo,mode:this.mode,button:this.button,holes:this.players.map(p=>[...p.hole]),board:[...this.board],start:this.players.map(p=>p.startStack),end:this.players.map(p=>p.stack),log:JSON.parse(JSON.stringify(this.log)),result:{...this.result}});if(this.history.length>80)this.history.shift();
 }
 view(i){const p=this.players[i],o=this.players[1-i];return{handNo:this.handNo,mode:this.mode,street:this.street,button:this.button,actor:i,hole:[...p.hole],board:[...this.board],pot:this.pot,stack:p.stack,bet:p.bet,opponentStack:o.stack,opponentBet:o.bet,currentBet:this.currentBet,legal:this.legal(i),opponentStats:{...this.stats[1-i]},history:this.log.map(e=>({street:e.street,actor:e.actor,type:e.type,amount:e.amount,to:e.to||0,sizeRatio:e.sizeRatio||0,board:[...e.board]}))};}
 export(){return JSON.parse(JSON.stringify({...this,rng:undefined}));}
 static restore(data){
  if(!data||!['nl','limit'].includes(data.mode)||!Array.isArray(data.players)||data.players.length!==2||!Array.isArray(data.stats)||data.stats.length!==2||!Array.isArray(data.history)||data.history.length>80)throw Error('无法读取存档');
  const nums=[data.handNo,data.pot,...data.players.map(p=>p.stack)];if(nums.some(n=>!Number.isSafeInteger(n)||n<0)||data.players.reduce((n,p)=>n+p.stack,0)+data.pot!==2000)throw Error('筹码数据无效');
  if(data.handNo>0){const cards=[...data.players.flatMap(p=>p.hole),...data.board,...data.deck];if(cards.some(c=>!Number.isInteger(c)||c<0||c>51)||new Set(cards).size!==cards.length||data.players.some(p=>p.hole.length!==2))throw Error('牌组无效');}
  const g=new Game({mode:data.mode});for(const k of ['handNo','button','players','history','stats','done','result','log','board','pot','actor','street','deck','raised','voluntary','currentBet','lastRaise','betCount','rights','pending'])if(k in data)g[k]=data[k];return g;
 }
}
return{Game,SUITS,RANKS,STREETS,TYPES,clamp,random,seeded,shuffled,card,code,evaluate,category,label,bestFive};
});
