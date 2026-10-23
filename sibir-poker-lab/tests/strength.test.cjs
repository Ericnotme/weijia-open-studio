const assert=require('node:assert/strict'),P=require('../src/engine'),A=require('../src/ai');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
const near=(x,y)=>assert(Math.abs(x-y)<1e-9,`${x} != ${y}`),cards=s=>s.split(' ').map(P.code);
function terminal(){const v=new P.Game({rng:P.seeded(5)}).start().view(0);return{...v,street:3,board:cards('As Ks Qs Js Ts'),hole:cards('2h 3d'),history:[],pot:1000,currentBet:900,bet:0,stack:1000,opponentStack:0,opponentBet:900,legal:{active:true,call:900,check:false,canRaise:false}};}
test('reproduced shared royal-flush bug: classic folds 44.9%, challenge always takes the guaranteed +50 call',()=>{
 const v=terminal(),old=A.thinkSeeded(v,1600,'adaptive',12,'classic'),a=A.thinkSeeded(v,1600,'adaptive',12,'challenge');
 near(old.probabilities.fold,.44925426794970713);near(a.callEV,50);assert.equal(a.type,'call');assert.deepEqual(a.probabilities,{fold:0,pass:1,raise:0});assert(a.exact);assert.equal(a.samples,990);assert.equal(a.budget,1600);near(a.error,0);near(a.equity,.5);
});
test('terminal call/fold maximizes one-step model EV and removes irrelevant future-realization discounts',()=>{
 const v={...terminal(),street:0,board:[],pot:1010,stack:990,legal:{active:true,call:990,check:false,canRaise:false}},eq={equity:.52,samples:1600,error:.02};
 const old=A.policy(v,eq,'adaptive',P.seeded(3)),a=A.challengePolicy(v,eq,'adaptive',P.seeded(3));assert(old.realization<eq.equity);assert(old.probabilities.fold>.1);near(a.realization,.52);assert.equal(a.type,'call');near(a.callEV,50);
 for(const q of [.01,.2,.49,.5,.52,.8,1]){const e={...eq,equity:q},r=A.challengePolicy(v,e,'adaptive',P.seeded(8)),ev=q*(v.pot+v.legal.call)-v.legal.call;near(r.probabilities.pass*ev,Math.max(0,ev));}
});
test('equal EV calls remain legal; free checks and limit caps before river are not mistaken for terminal all-ins',()=>{
 let v={...terminal(),pot:100,stack:1000,opponentStack:1000,street:1,board:cards('As Ks Qs'),legal:{active:true,call:20,check:false,canRaise:false}};assert.equal(A.terminalCall(v),false);
 const eq={equity:.4,samples:100,error:.1};assert.deepEqual(A.challengePolicy(v,eq,'steady',P.seeded(7)),{...A.policy(v,eq,'steady',P.seeded(7)),terminalComparison:false});
 v={...v,street:3};assert(A.terminalCall(v));const zero=A.challengePolicy(v,{...eq,equity:20/120},'adaptive',P.seeded(1));assert.equal(zero.type,'call');
 v.legal.call=0;v.legal.check=true;assert.equal(A.terminalCall(v),false);assert.equal(A.challengePolicy(v,eq).probabilities.fold,0);
});
test('full-budget river terminal values equal independent weighted range accumulation; recovery respects its 400-scenario budget',()=>{
 const v={...terminal(),board:cards('Ah 9s 6c 3d 2s'),hole:cards('As Qd'),history:[{street:3,actor:1,type:'raise',amount:900,to:900,sizeRatio:9,board:cards('Ah 9s 6c 3d 2s')}]};
 const r=A.range(v,'adaptive'),hero=P.evaluate([...v.hole,...v.board]);let total=0,share=0;for(const x of r.pairs){const other=P.evaluate([x.a,x.b,...v.board]);total+=x.w;share+=x.w*(hero>other?1:hero===other?.5:0);}
 const full=A.thinkSeeded(v,1600,'adaptive',4),fallback=A.thinkSeeded(v,400,'adaptive',4);near(full.equity,share/total);assert(full.exact);assert(full.samples<=full.budget);assert.equal(fallback.samples,400);assert.equal(fallback.exact,false);assert(fallback.error>0);assert.equal(fallback.terminalComparison,true);
});
test('nonterminal behavior and fixed sizing are preserved in both difficulty paths for all styles',()=>{
 const g=new P.Game({rng:P.seeded(41)}).start();for(const style of ['adaptive','steady','pressure'])for(const seed of [1,9,27]){const v=g.view(g.actor),a=A.thinkSeeded(v,1600,style,seed,'classic'),b=A.thinkSeeded(v,1600,style,seed,'challenge');for(const key of ['type','to','equity','callEV'])assert.equal(a[key],b[key]);assert.deepEqual(a.probabilities,b.probabilities);assert.equal(b.exact,false);}
});
test('terminal analysis is invariant to hidden hand/deck changes and has an identical seeded distribution',()=>{
 const v=terminal(),before=A.thinkSeeded(v,1600,'adaptive',444);for(const key of ['opponentHole','deck','futureBoard','players'])Object.defineProperty(v,key,{get(){throw Error('Private data read');}});assert.deepEqual(A.thinkSeeded(v,1600,'adaptive',444),before);
 for(const seed of [4,7,39]){const a=A.thinkSeeded(v,1600,'adaptive',seed);assert.deepEqual(a.probabilities,before.probabilities);assert.equal(a.equity,before.equity);}
});
test('asymmetric stacks and heads-up unmatched contributions conserve chips in both betting modes',()=>{
 const rng=P.seeded(235);for(const mode of ['nl','limit'])for(const stack of [1,3,5,7,10,15,19,20,35,999,1000,1999])for(let n=0;n<20;n++){
  const g=new P.Game({mode,rng});g.players[0].stack=stack;g.players[1].stack=2000-stack;g.start();let actions=0;while(!g.done){assert(++actions<200);const l=g.legal(),u=rng();g.act(g.actor,u<.12&&l.call?'fold':u<.55&&l.canRaise?'raise':l.check?'check':'call',l.canRaise?l.min:undefined);assert.equal(g.pot+g.players[0].stack+g.players[1].stack,2000);assert(g.players.every(p=>p.stack>=0));}assert.equal(g.result.net[0]+g.result.net[1],0);
 }
});
test('terminal policies remain legal and normalized across 600 seeded all-in deals without affecting the independent deck RNG',()=>{
 for(const mode of ['nl','limit'])for(let seed=1;seed<=300;seed++){const g=new P.Game({mode,rng:P.seeded(seed)}).start(),initial=[...g.deck];let moves=0;while(!g.done){assert(++moves<200);const v=g.view(g.actor),a=A.thinkSeeded(v,400,'adaptive',seed+moves),l=g.legal();near(Object.values(a.probabilities).reduce((s,x)=>s+x,0),1);assert(Object.values(a.probabilities).every(x=>x>=0&&x<=1));if(moves===1){assert.deepEqual(g.deck,initial);if(l.canRaise){g.act(g.actor,'raise',l.max);continue;}}g.act(g.actor,a.type,a.to);}assert.equal(g.result.net.reduce((s,n)=>s+n,0),0);}
});
console.log(`${passed} terminal-value / fair-play checks passed.`);
