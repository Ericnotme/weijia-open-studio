const assert=require('node:assert/strict');
const P=require('../src/engine'),A=require('../src/ai'),T=require('../src/trainer'),L=require('../src/learning');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function move(s,type,fields={}){return L.transition(s,{type,at:(s.events.at(-1)?.at||s.startedAt)+1,...fields});}
const choose={action:'call',reason:'price',text:'先核对价格，再比较范围份额。'};
// Independent five-card reference: sorted rank groups, not the engine's bitmask evaluator.
function refFive(cards){const ranks=cards.map(c=>c%13+2).sort((a,b)=>b-a),groups=[...new Set(ranks)].map(r=>({r,n:ranks.filter(x=>x===r).length})).sort((a,b)=>b.n-a.n||b.r-a.r),flush=cards.every(c=>(c/13|0)===(cards[0]/13|0));const straight=ranks.every((r,i)=>!i||ranks[i-1]-r===1)?ranks[0]:ranks.join(',')==='14,5,4,3,2'?5:0;let cat=0,values=ranks;if(flush&&straight){cat=8;values=[straight];}else if(groups[0].n===4){cat=7;values=groups.map(g=>g.r);}else if(groups[0].n===3&&groups[1].n===2){cat=6;values=groups.map(g=>g.r);}else if(flush)cat=5;else if(straight){cat=4;values=[straight];}else if(groups[0].n===3){cat=3;values=groups.map(g=>g.r);}else if(groups[0].n===2&&groups[1].n===2){cat=2;values=groups.map(g=>g.r);}else if(groups[0].n===2){cat=1;values=groups.map(g=>g.r);}return [cat,...Array.from({length:5},(_,i)=>values[i]||0)].reduce((a,b)=>a*15+b,0);}
function refSeven(cards){let best=0;for(let i=0;i<6;i++)for(let j=i+1;j<7;j++)best=Math.max(best,refFive(cards.filter((_,k)=>k!==i&&k!==j)));return best;}

function trained(seed=17){let s=L.create(seed,1000);while(s.phase==='train'){s=move(s,'first',choose);s=move(s,'final',choose);s=move(s,'next');}return s;}
function completed(seed=17){let s=trained(seed);while(s.phase==='test')s=move(s,'answer',choose);return s;}
test('AI and coach: all decision streets and both actors are invariant to private card/deck swaps',()=>{
 for(const actor of [0,1]){const g=new P.Game({rng:P.seeded(8)}).start();while(!g.done){if(g.actor===actor){const before=g.view(actor),seed=A.decisionSeed(before),analysis=A.thinkSeeded(before,400);[g.players[1-actor].hole[0],g.deck[0]]=[g.deck[0],g.players[1-actor].hole[0]];assert.deepEqual(A.observation(g.view(actor)),A.observation(before));assert.equal(A.decisionSeed(g.view(actor)),seed);assert.deepEqual(A.thinkSeeded(g.view(actor),400),analysis);for(const k of ['players','opponentHole','deck','futureBoard'])Object.defineProperty(before,k,{get(){throw Error('Private information read');}});assert.deepEqual(A.thinkSeeded(before,400),analysis);}g.act(g.actor,g.legal().check?'check':'call');}}
});
test('range is normalized, blocks known cards, updates from public action, and stays finite with long histories',()=>{
 const g=new P.Game({rng:P.seeded(12)}).start(),v=g.view(0);v.history=[];
 const base=A.range(v,'adaptive'),raised=A.range({...v,history:[{street:0,actor:1,type:'raise',to:100,board:[]}]},'adaptive');
 const mean=r=>r.pairs.reduce((s,p)=>s+A.preflop([p.a,p.b])*p.w/r.total,0);assert(mean(raised)>mean(base));
 const extreme=A.range({...v,history:Array.from({length:120},()=>({street:0,actor:1,type:'raise',to:100,board:[]}))},'adaptive');
 for(const r of [base,raised,extreme]){near(r.pairs.reduce((sum,p)=>sum+p.w/r.total,0),1);assert(Number.isFinite(r.total)&&r.total>0);assert(r.summary.effectiveCombos>=1&&r.summary.effectiveCombos<=r.pairs.length+.0001);assert(r.pairs.every(p=>p.a!==p.b&&!v.hole.includes(p.a)&&!v.hole.includes(p.b)&&p.w>0));}
 assert.equal(raised.summary.observations,1);
});
test('same visible state, budget, style and seed replay analysis exactly; complete seeded hands replay',()=>{
 const v=new P.Game({rng:P.seeded(99)}).start().view(0),a=A.thinkSeeded(v,1600,'adaptive',654);
 assert.deepEqual(a,A.thinkSeeded(v,1600,'adaptive',654));assert.equal(a.samples,1600);assert.equal(a.seed,654);near(Object.values(a.probabilities).reduce((s,x)=>s+x,0),1);assert(a.topRange.reduce((s,x)=>s+x.p,0)<=1);assert.throws(()=>A.thinkSeeded(v,400,'adaptive',-1));
 function replay(mode){const g=new P.Game({rng:P.seeded(120),mode});for(let i=0;i<3;i++){if(g.players.some(p=>!p.stack))break;g.start();while(!g.done){const a=A.thinkSeeded(g.view(g.actor),100);g.act(g.actor,a.type,a.to,a);}}return g.export();}
 for(const mode of ['limit','nl'])assert.deepEqual(replay(mode),replay(mode));
});
test('first action and reason precede hints; first answer stays immutable through revised final answer',()=>{
 let s=L.create(1,1000);assert.deepEqual(L.hints(s),[]);assert.equal(L.trainingFeedback(s),null);assert.throws(()=>move(s,'hint'));assert.throws(()=>move(s,'final',choose));assert.throws(()=>move(s,'first',{action:'call',reason:''}));
 s=move(s,'first',choose);const initial=JSON.stringify(s.training[0].initial);s=move(s,'hint');assert.equal(L.hints(s).length,1);s=move(s,'hint');assert.equal(L.hints(s).length,2);assert.throws(()=>move(s,'hint'));assert.equal(L.trainingFeedback(s),null);assert.match(L.diagnostic(s),/不能确定/);
 s=move(s,'final',{action:'fold',reason:'range'});assert.equal(JSON.stringify(s.training[0].initial),initial);assert.equal(s.training[0].hints,2);assert(L.trainingFeedback(s));assert.throws(()=>move(s,'first',choose));assert.throws(()=>move(s,'final',choose));
});
test('test mode rejects hints, training feedback, changes and premature review; all responses commit before feedback',()=>{
 let s=trained();for(let i=0;i<3;i++){assert.equal(L.review(s),null);assert.equal(L.trainingFeedback(s),null);assert.deepEqual(L.hints(s),[]);assert.throws(()=>move(s,'hint'));assert.throws(()=>move(s,'final',choose));const q=L.publicQuestion(s);assert.deepEqual(Object.keys(q).sort(),['bet','board','hole','id','pot','range']);s=move(s,'answer',choose);if(i<2)assert.equal(L.review(s),null);}
 assert.equal(L.review(s).length,3);assert.throws(()=>move(s,'answer',choose));assert.equal(s.answers.length,3);
});
test('training, independent and delayed pools use distinct boards/hands, also distinct from old trainer',()=>{
 let s=L.create(1,1000),seen=new Set(),hands=new Set();const legacyBoards=new Set(T.cases.map(q=>q.board));
 const add=q=>{assert(!seen.has(q.board));assert(!legacyBoards.has(q.board));assert(!hands.has(q.hole+'|'+q.board));seen.add(q.board);hands.add(q.hole+'|'+q.board);const r=T.solve(q);assert.equal(new Set([...r.hole,...r.board]).size,7);near(r.win+r.tie+r.lose,1);};
 while(s.phase==='train'){add(L.publicQuestion(s));s=move(s,'first',choose);s=move(s,'final',choose);s=move(s,'next');}
 while(s.phase==='test'){add(L.publicQuestion(s));s=move(s,'answer',choose);}
 assert.throws(()=>move(s,'retest'));s=move(s,'retest',{at:s.completedAt+L.DELAY});assert.equal(L.review(s),null);
 while(s.phase==='retest'){add(L.publicQuestion(s));assert.throws(()=>move(s,'hint'));assert.equal(L.review(s,'retest'),null);s=move(s,'answer',choose);}
 assert.equal(seen.size,9);assert.equal(L.review(s,'retest').length,3);
});
test('new exact scenarios match weighted reference fixtures, pot prices, ties and EV',()=>{
 const expectations={'learn-price':10/13,'learn-range':1/21,'learn-tie':13/32,'test-price':3/8,'test-range':3/10,'test-tie':5/14,'later-price':4/5,'later-range':3/10,'later-tie':31/118};
 let s=L.create(4,1000),checked=0;while(s.phase!=='finished'){if(s.phase==='complete'){s=move(s,'retest',{at:s.completedAt+L.DELAY});continue;}const q=L.publicQuestion(s),r=T.solve(q);const hero=refSeven([...r.hole,...r.board]);let refTotal=0,refShare=0;for(const c of r.combos){const opponent=refSeven([c.a,c.b,...r.board]);refTotal+=c.w;refShare+=c.w*(hero>opponent?1:hero===opponent?.5:0);}near(r.equity,refShare/refTotal);near(r.equity,expectations[q.id]);near(r.odds,q.bet/(q.pot+2*q.bet));near(r.ev,expectations[q.id]*(q.pot+2*q.bet)-q.bet);assert(r.combos.every(c=>![...r.hole,...r.board].includes(c.a)&&![...r.hole,...r.board].includes(c.b)));assert(T.grade(r,r.best).correct);checked++;if(s.phase==='train'){s=move(s,'first',choose);s=move(s,'final',choose);s=move(s,'next');}else s=move(s,'answer',choose);}assert.equal(checked,9);
});
test('seeded question order and interrupted progress restore exactly; malformed events fail closed',()=>{
 let s=L.create(23,1000);assert.deepEqual(L.publicQuestion(s),L.publicQuestion(L.create(23,1000)));s=move(s,'first',choose);s=move(s,'hint');assert.deepEqual(L.restore(L.pack(s)),s);s=move(s,'final',choose);s=move(s,'next');assert.deepEqual(L.restore(L.pack(s)),s);const bad=L.pack(s);bad.events[0].type='answer';assert.throws(()=>L.restore(bad));assert.throws(()=>L.restore({version:2,seed:1,startedAt:1,events:[]}));assert.throws(()=>L.create(NaN));
 let t=trained();t=move(t,'answer',choose);assert.deepEqual(L.restore(L.pack(t)),t);assert.equal(L.review(t),null);
});
test('first independent answers remain separate from later repeated attempts and training assistance',()=>{
 const a=completed(1);let b=trained(2);while(b.phase==='test')b=move(b,'answer',{action:'fold',reason:'intuition'});const first=L.firstIndependent([a,b]);assert.equal(Object.keys(first).length,3);for(const row of a.answers)assert.equal(first[row.id].action,row.action);assert(!Object.keys(first).some(id=>id.startsWith('learn-')));
});
test('leaving an exam preserves prior independent answers but excludes later possibly assisted responses',()=>{
 let s=trained();s=move(s,'answer',choose);s=move(s,'interrupt');assert.throws(()=>move(s,'interrupt'));while(s.phase==='test')s=move(s,'answer',choose);assert.deepEqual(s.answers.map(a=>a.independent),[true,false,false]);assert.equal(Object.keys(L.firstIndependent([s])).length,1);assert.deepEqual(L.restore(L.pack(s)),s);
 s=move(s,'retest',{at:s.completedAt+L.DELAY});s=move(s,'interrupt');while(s.phase==='retest')s=move(s,'answer',choose);assert(s.retestAnswers.every(a=>!a.independent));assert.equal(Object.keys(L.firstIndependent([s])).length,1);
});
console.log(`${passed} learning / information-boundary checks passed.`);
