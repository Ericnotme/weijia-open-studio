(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.Poker);if(typeof module==='object'&&module.exports)module.exports=api;else root.PokerAI=api;})(typeof self!=='undefined'?self:this,function(P){
'use strict';
const sigmoid=x=>1/(1+Math.exp(-x));
function preflop(h){const a=h[0]%13+2,b=h[1]%13+2,hi=Math.max(a,b),lo=Math.min(a,b),suited=(h[0]/13|0)===(h[1]/13|0);if(a===b)return .52+(a-2)*.04;return P.clamp(.09+(hi-2)*.036+(lo-2)*.016+(suited?.065:0)+(hi-lo===1?.04:hi-lo===2?.015:0)-(hi-lo>5?.045:0),.06,.88);}
function texture(h,board){
 if(board.length<3)return preflop(h);
 const all=[...h,...board],cat=P.category(P.evaluate(all)),base=[.12,.44,.7,.82,.87,.92,.96,.985,1][cat];
 let high=Math.max(h[0]%13+2,h[1]%13+2)/14*.07;
 if(cat===1){const pairRanks=[];for(let r=2;r<=14;r++)if(all.filter(c=>c%13+2===r).length>=2)pairRanks.push(r);high=(Math.max(...pairRanks,2)-2)/12*.18;}
 const suits=[0,0,0,0];all.forEach(c=>suits[c/13|0]++);const draw=board.length<5&&Math.max(...suits)===4?.065:0;
 return P.clamp(base+high+draw,0,1);
}
function model(view,style='adaptive'){
 const st=view.opponentStats||{},n=st.hands||0;
 return{vpip:(st.vpip+12||12)/(n+20),pfr:(st.pfr+5||5)/(n+20),fold:(st.folds+5||5)/((st.faced||0)+12),aggression:(st.raises+4||4)/((st.actions||0)+12),adapt:style==='adaptive'?Math.min(.65,n/60):0,hands:n};
}
// A likelihood model over legal combinations, never over the actual hidden hand.
// Normalize in log space, with a bounded likelihood for each public action.
function range(view,style){
 const excluded=new Set([...view.hole,...view.board]),deck=Array.from({length:52},(_,i)=>i).filter(c=>!excluded.has(c)),m=model(view,style),obs=view.history.filter(e=>e.actor!==view.actor&&e.type!=='blind'),pairs=[];
 for(let a=0;a<deck.length-1;a++)for(let b=a+1;b<deck.length;b++){
  const h=[deck[a],deck[b]],pf=preflop(h);let logWeight=0;
  for(const e of obs){let likelihood=1;
   if(e.street===0){if(e.type==='raise'){const threshold=.53+(e.to>30?.10:0)-m.adapt*(m.pfr-.25);likelihood=.04+.96*sigmoid((pf-threshold)*9);}else if(e.type==='call')likelihood=.22+.78*sigmoid((pf-(.36-m.adapt*(m.vpip-.5)))*8);}
   else{const t=texture(h,e.board);if(e.type==='raise')likelihood=.075+.85*sigmoid((t-(.51+Math.min(.2,e.sizeRatio*.09)))*9);else if(e.type==='call')likelihood=.14+.86*sigmoid((t-.36)*8);else if(e.type==='check')likelihood=1-.20*t;}
   logWeight+=Math.log(P.clamp(likelihood,.04,1));
  }
  pairs.push({a:h[0],b:h[1],logWeight});
 }
 const max=Math.max(...pairs.map(x=>x.logWeight));let total=0;
 for(const p of pairs){p.w=Math.exp(p.logWeight-max);total+=p.w;p.cdf=total;delete p.logWeight;}
 const effectiveCombos=1/pairs.reduce((sum,p)=>sum+(p.w/total)**2,0);
 return{pairs,total,deck,model:m,summary:{combos:pairs.length,effectiveCombos,observations:obs.length,prior:'uniform-legal-combinations',update:'bounded-public-action-likelihood'}};
}
function sampleRange(r,rng){const x=rng()*r.total;let lo=0,hi=r.pairs.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(r.pairs[mid].cdf<x)lo=mid+1;else hi=mid;}return r.pairs[lo];}
function equity(view,samples=1600,rng=P.random,style='adaptive',enumerateRiver=false){
 const r=range(view,style),budget=P.clamp(Math.floor(samples),100,10000),exact=enumerateRiver&&view.board.length===5&&r.pairs.length<=budget;
 let wins=0,ties=0;const cats=Array(9).fill(0),denominator=exact?r.total:budget;
 if(exact){
  const hero=P.evaluate([...view.hole,...view.board]);
  for(const opp of r.pairs){const other=P.evaluate([opp.a,opp.b,...view.board]);if(hero>other)wins+=opp.w;else if(hero===other)ties+=opp.w;}
  cats[P.category(hero)]=r.total;samples=r.pairs.length;
 }else{
  samples=budget;
  for(let n=0;n<samples;n++){
   const opp=sampleRange(r,rng),board=[...view.board],used=new Set([opp.a,opp.b]);
   while(board.length<5){const c=r.deck[Math.floor(rng()*r.deck.length)];if(!used.has(c)){used.add(c);board.push(c);}}
   const v=P.evaluate([...view.hole,...board]),o=P.evaluate([opp.a,opp.b,...board]);if(v>o)wins++;else if(v===o)ties++;cats[P.category(v)]++;
  }
 }
 const q=(wins+ties/2)/denominator,err=exact?0:1.96*Math.sqrt(Math.max(.0001,q*(1-q))/samples),groups={};
 r.pairs.forEach(x=>{const a=x.a%13+2,b=x.b%13+2,s=(x.a/13|0)===(x.b/13|0),hi=Math.max(a,b),lo=Math.min(a,b),key='23456789TJQKA'[hi-2]+'23456789TJQKA'[lo-2]+(hi===lo?'':s?'s':'o');groups[key]=(groups[key]||0)+x.w;});
 const topRange=Object.entries(groups).map(([hand,w])=>({hand,p:w/r.total})).sort((a,b)=>b.p-a.p).slice(0,5);
 return{equity:q,win:wins/denominator,tie:ties/denominator,samples,error:err,exact,budget,categories:cats.map(n=>n/denominator),model:r.model,topRange,rangeSummary:r.summary};
}
function policy(view,eq,style='adaptive',rng=P.random){
 const l=view.legal,q=eq.equity,call=l.call,pot=view.pot,m=eq.model||model(view,style),odds=call/(pot+call||1),future=view.street===3?0:view.street===0?.10:.055;
 const realization=q-(view.actor!==view.button?future:future*.6),aggr=style==='pressure'?1.3:style==='steady'?.8:1,foldEstimate=P.clamp(.3+m.adapt*(m.fold-.4),.15,.65);
 let fold=0,pass=1,raise=0,reason='通过过牌控制底池，保留后续选择。';
 if(call){
  pass=sigmoid((realization-odds-.015)*18);fold=1-pass;reason=realization>odds?'估算胜率高于跟注门槛，以继续参与为主。':'跟注成本偏高，以弃牌为主。';
  if(q>.65&&l.canRaise){raise=P.clamp((q-.59)*2.8*aggr,0,.92);pass*=1-raise;fold*=1-raise;reason='牌力较强，混合跟注与价值加注。';}
  else if(l.canRaise){const blocker=view.hole.some(c=>c%13+2===14)?1.2:1;raise=P.clamp((.055+foldEstimate*.10)*aggr*blocker*(q<.42?1:.6),0,.18);fold*=1-raise;pass*=1-raise;reason=realization>odds?'跟注成本低于折算后的胜率门槛，继续参与。':'跟注成本偏高，以弃牌为主，少量混合诈唬。';}
 }else if(l.canRaise){
  const value=P.clamp((q-.48)*2.15,0,.83),bluff=q<.45?(.09+foldEstimate*.22)*aggr:0;
  raise=P.clamp((value+bluff)*aggr,.035,.92);pass=1-raise;reason=q>.60?'强牌以价值下注为主，穿插过牌隐藏牌力。':q<.45?'弱牌多数过牌，偶尔诈唬以保持策略不可预测。':'中等牌力控制底池，混合小额下注。';
 }
 if(!l.canRaise){raise=0;const sum=fold+pass;fold/=sum;pass/=sum;}
 const total=fold+pass+raise;fold/=total;pass/=total;raise/=total;
 const ratio=q>.75?.8:q<.40?.75:.5;
 let size=l.canRaise?P.clamp(Math.round(view.currentBet+Math.max(10,(pot+call)*ratio)/5)*5,l.min,l.max):0;
 if(view.mode==='limit'&&l.canRaise)size=l.min;
 const u=rng(),type=u<fold?'fold':u<fold+pass?(call?'call':'check'):'raise';
 const probabilities={fold,pass,raise};
 return{type,to:size,reason,probabilities,equity:q,samples:eq.samples,error:eq.error,potOdds:odds,callEV:q*(pot+call)-call,realization,foldEstimate,model:m,topRange:eq.topRange,categories:eq.categories,rangeSummary:eq.rangeSummary,exact:!!eq.exact,budget:eq.budget};
}
function observation(view){
 const pick=(object,keys)=>Object.fromEntries(keys.map(k=>[k,object[k]]));
 return{...pick(view,['handNo','mode','street','button','actor','pot','stack','bet','opponentStack','opponentBet','currentBet']),hole:[...view.hole],board:[...view.board],legal:pick(view.legal,['active','call','check','canRaise','min','max','fullMin','allIn']),opponentStats:pick(view.opponentStats||{},['hands','vpip','pfr','folds','faced','raises','actions']),history:view.history.map(e=>({...pick(e,['street','actor','type','amount','to','sizeRatio']),board:[...e.board]}))};
}
function decisionSeed(view,style='adaptive'){
 const text=JSON.stringify({view:observation(view),style,version:2});let hash=2166136261;
 for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return hash>>>0;
}
// When a call ends all betting, realization discounts and randomized negative-EV
// calls/folds are inappropriate. This is a one-step value comparison under a
// stated range, not a multi-street solver or an equilibrium claim.
function terminalCall(view){const l=view.legal;return l.call>0&&(view.opponentStack===0||view.stack<=l.call||view.street===3&&!l.canRaise);}
function challengePolicy(view,eq,style='adaptive',rng=P.random){
 const a=policy(view,eq,style,rng),l=view.legal;
 const terminal=terminalCall(view);
 if(terminal){
  const call=a.callEV>=-1e-9;
  return{...a,type:call?'call':'fold',to:0,realization:eq.equity,probabilities:{fold:call?0:1,pass:call?1:0,raise:0},terminalComparison:true,reason:(call?'跟注':'弃牌')+'在当前假设范围下的价值较高。跟注后不再有下注选择，因此不扣除后续实现率，也不混入价值更低的行动。'};
 }
 return{...a,terminalComparison:false};
}
function think(view,samples=1600,style='adaptive',rng=P.random,difficulty='challenge'){
 const visible=observation(view),classic=difficulty==='classic',eq=equity(visible,samples,rng,style,!classic&&terminalCall(visible));
 return{...(classic?policy:challengePolicy)(visible,eq,style,rng),difficulty:classic?'classic':'challenge'};
}
function thinkSeeded(view,samples=1600,style='adaptive',seed=decisionSeed(view,style),difficulty='challenge'){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('Invalid analysis seed');
 const a=think(view,samples,style,P.seeded(seed),difficulty);
 return{...a,seed,algorithmVersion:difficulty==='classic'?'public-range-v2':'terminal-value-v3',method:a.exact?'exact-weighted-river':'range-weighted-monte-carlo'};
}
return{preflop,texture,model,range,equity,policy,terminalCall,challengePolicy,think,observation,decisionSeed,thinkSeeded};
});
