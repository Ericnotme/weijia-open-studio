import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_EXIT,UNIT,canonicalExit,compileExit,proceeds,unitsForNet,appendFill,restoreExit,simulateExit,ordersCSV} from '../src/exit-engine.mjs';
const p=(x={})=>({...structuredClone(DEFAULT_EXIT),...x});
const fill=(x={})=>({id:'test-1',stage:0,quantityUnits:5000000,priceCents:10000000,feeCents:500,at:'2026-09-22T00:00:00Z',...x});
test('goal compiler recovers net cash without consuming the reserved position',()=>{
 const config=p(),r=compileExit(config);assert.equal(r.feasible,true);assert.ok(r.leftUnits>=r.reserveUnits);
 assert.equal(r.rows.reduce((s,x)=>s+x.targetCents,0),2000000);
 for(const row of r.rows){assert.ok(row.netCents>=row.targetCents);assert.ok(proceeds(row.quantityUnits-1,row.priceCents,config).netCents<row.targetCents);}
});
test('exact cent and asset-unit rounding incorporates both variable and fixed costs',()=>{
 const config=p({feeBps:100,slippageBps:100,fixedFeeCents:25});
 assert.deepEqual(proceeds(UNIT,10000,config),{grossCents:9900,feeCents:124,netCents:9776});
 const q=unitsForNet(10000,10000,config);assert.ok(proceeds(q,10000,config).netCents>=10000);assert.ok(proceeds(q-1,10000,config).netCents<10000);
});
test('infeasible targets and 100 percent reserve do not produce exportable orders',()=>{
 for(const config of [p({targetCents:100000000}),p({reserveBps:10000})]){const r=compileExit(config);assert.equal(r.feasible,false);assert.throws(()=>ordersCSV(config,r));}
 const done=compileExit(p({recoveredCents:2000000,reserveBps:10000}));assert.equal(done.completed,true);assert.equal(done.requiredUnits,0);
});
test('partial fills update only outstanding cash and retain the original reserve floor',()=>{
 const config=p(),ledger=appendFill(config,[],fill()),r=compileExit(config,ledger);
 assert.equal(r.recoveredCents,499500);assert.equal(r.remainingCents,1500500);assert.equal(r.reserveUnits,15000000);
 assert.equal(r.rows[0].targetCents,500500);assert.equal(r.currentUnits,45000000);
});
test('overfills credit other targets; reaching the goal cancels every remaining quantity',()=>{
 const config=p(),ledger=[fill({quantityUnits:15000000,feeCents:0})],r=compileExit(config,ledger);
 assert.equal(r.rows[0].targetCents,0);assert.equal(r.rows.reduce((s,x)=>s+x.targetCents,0),500000);
 const done=compileExit(config,[fill({quantityUnits:20000000,feeCents:0})]);assert.equal(done.completed,true);assert.equal(done.requiredUnits,0);
});
test('actual reserve breaches are recorded as facts and block further generated sells',()=>{
 const config=p(),ledger=appendFill(config,[],fill({quantityUnits:40000000}));const r=compileExit(config,ledger);
 assert.equal(r.breach,true);assert.equal(r.feasible,false);assert.throws(()=>ordersCSV(config,r));
});
test('simulated gap triggers at observed price, does not oversell and does not mutate actual records',()=>{
 const config=p(),ledger=[],sim=simulateExit(config,ledger,[9000000,18000000,15000000]);
 assert.equal(sim.actions.length,3);assert.equal(sim.actions[0].priceCents,18000000);assert.equal(sim.result.completed,true);assert.ok(sim.result.currentUnits>=sim.result.reserveUnits);assert.equal(ledger.length,0);
 assert.ok(sim.result.requiredUnits===0);assert.equal(sim.result.recoveredCents,config.targetCents);
});
test('unreached prices execute nothing, so a cash goal is not a capital guarantee',()=>{
 const sim=simulateExit(p(),[],[9500000,8000000,6000000,4000000]);assert.equal(sim.actions.length,0);assert.equal(sim.result.completed,false);assert.equal(sim.result.recoveredCents,0);
});
test('backup validation rejects oversells, duplicates, invalid proportions, excessive fees and live instructions',()=>{
 const config=p(),input={schema:1,type:'exit-pilot-backup',plan:{...config,secret:'ignored'},ledger:[fill()],savedAt:'2026-09-22T00:00:00Z',live:true};
 const clean=restoreExit(input);assert.equal(clean.live,undefined);assert.equal(clean.plan.secret,undefined);
 assert.throws(()=>restoreExit({...input,type:'live-wallet'}));
 assert.throws(()=>appendFill(config,[fill()],fill()));
 assert.throws(()=>appendFill(config,[],fill({quantityUnits:60000000})));
 assert.throws(()=>appendFill(config,[],fill({feeCents:1000000})));
 assert.throws(()=>canonicalExit({...config,levels:[{priceCents:1,weight:33},{priceCents:2,weight:33},{priceCents:3,weight:33}]}));
});
