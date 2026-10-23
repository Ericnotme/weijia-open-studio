import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,commit,advance,draw,random,invariant,allowedStakes,maxStake,pnlFor,feedback,INITIAL,RISK_BUDGET} from '../dist/engine.js';
import {SCENES} from '../dist/scenes.js';
const decision=(stake=0,overrides={})=>({stake,reasons:['boundary','uncertain'],confidence:50,note:'等待订单成为可核实的事实。',investigated:true,update:'reduce',...overrides});
test('five complete teaching models: probabilities total 100; expenses match reserve',()=>{
 assert.equal(SCENES.length,5);assert.equal(SCENES.reduce((n,s)=>n+s.expense,0),1000000);
 for(const s of SCENES){assert.equal(s.outcomes.reduce((n,o)=>n+o.prob,0),100);assert.ok(s.outcomes.some(o=>o.bps<0));assert.ok(s.outcomes.some(o=>o.bps>0));assert.ok(s.outcomes.every(o=>o.prob>0&&o.bps>=-10000));}
});
test('FNV/mixed seed reference vector and exact reproducibility',()=>{
 assert.equal(random('FIRST-LIGHT:0:0'),0.9725137776695192);
 const run=seed=>{let s=newGame(seed);for(let i=0;i<5;i++)s=advance(commit(s,decision(100000)));return s;};
 assert.deepEqual(run('FIXED-101'),run('FIXED-101'));
 assert.notDeepEqual(run('FIXED-101').history.map(r=>r.outcome),run('OTHER-202').history.map(r=>r.outcome));
});
test('money, reserve, cumulative loss budget invariants over 5,000 varied full runs',()=>{
 for(let seed=0;seed<5000;seed++){let s=newGame('TEST-'+seed);
  for(let round=0;round<5;round++){
   const options=allowedStakes(s),stake=options[Math.floor(random(`${seed}-choice-${round}`)*options.length)];
   const prev=structuredClone(s);s=commit(s,decision(stake));
   assert.ok(invariant(s));assert.equal(s.cash,prev.cash+s.history.at(-1).pnl-SCENES[round].expense);
   assert.equal(s.history.at(-1).paths[0].pnl,s.history.at(-1).pnl);
   assert.ok(s.cash>=s.reserve);assert.ok(s.lossUsed<=RISK_BUDGET);s=advance(s);
  }
  assert.equal(s.phase,'summary');assert.equal(s.reserve,0);assert.equal(s.spent,1000000);
 }
});
test('all-wait path pays every expense and gets process feedback without trade rewards',()=>{
 let s=newGame();for(let i=0;i<5;i++){s=commit(s,decision());assert.equal(s.history.at(-1).pnl,0);assert.ok(s.history.at(-1).paths.every(p=>p.pnl===0));assert.ok(s.history.at(-1).feedback.some(f=>f.title==='等待也是一个决定'));s=advance(s);}
 assert.equal(s.cash,1000000);assert.equal(s.lossUsed,0);assert.equal(s.spent,1000000);
});
test('invalid money choices blocked and hard expense reserve cannot be spent',()=>{
 const s=newGame();for(const value of [-1,1,NaN,Infinity,400000,INITIAL])assert.throws(()=>commit(s,decision(value)));
 const constrained={...s,cash:1050000};assert.deepEqual(allowedStakes(constrained),[0]);assert.equal(maxStake(constrained),50000);assert.throws(()=>commit(constrained,decision(100000)));
 const riskConstrained={...s,lossUsed:550000};assert.deepEqual(allowedStakes(riskConstrained),[0]);assert.throws(()=>commit(riskConstrained,decision(100000)));
});
test('gains never replenish a previously used risk budget',()=>{
 let s={...newGame(),lossUsed:200000};let seed=0;while(draw('WIN-'+seed,0).bps<=0)seed++;s.seed='WIN-'+seed;
 const next=commit(s,decision(100000));assert.equal(next.lossUsed,200000);assert.ok(next.cash>s.cash);
});
test('commit requires reasons and confidence; rejects malformed fields and double reveal',()=>{
 const s=newGame();for(const overrides of [{reasons:[]},{reasons:['made-up']},{confidence:100},{confidence:null},{note:'x'.repeat(281)},{update:'bad'},{investigated:'yes'}])assert.throws(()=>commit(s,decision(0,overrides)));
 assert.throws(()=>advance(s));const next=commit(s,decision());assert.throws(()=>commit(next,decision()));assert.equal(s.history.length,0);assert.equal(s.cash,INITIAL);
});
test('decisions locked before reveal; sampled outcome cannot change process feedback',()=>{
 const input=decision(100000,{reasons:['social'],investigated:false,confidence:90});const a=newGame('A'),b=newGame('B');
 assert.deepEqual(feedback(a,input),feedback(b,input));const result=commit(a,input);input.reasons.push('evidence');assert.deepEqual(result.history[0].decision.reasons,['social']);
 assert.ok(result.history[0].feedback.some(f=>f.title==='还有一份材料没看'));assert.ok(result.history[0].feedback.some(f=>f.title==='把握与资料是否匹配'));
});
test('full reset returns clean money, notes and history; seed validation',()=>{
 let s=advance(commit(newGame(),decision()));s=newGame();assert.equal(s.round,0);assert.equal(s.phase,'decision');assert.deepEqual(s.history,[]);assert.equal(s.cash,INITIAL);assert.equal(s.lossUsed,0);
 for(const seed of ['',null,'真实姓名','a'.repeat(33),'<script>'])assert.throws(()=>newGame(seed));
});
test('integer rounding is deterministic for all allowed stakes and branches',()=>{
 for(const stake of [0,100000,200000,300000])for(const s of SCENES)for(const o of s.outcomes){assert.ok(Number.isSafeInteger(pnlFor(stake,o.bps)));assert.equal(pnlFor(stake,o.bps),stake===0?0:stake*o.bps/10000);}
});
