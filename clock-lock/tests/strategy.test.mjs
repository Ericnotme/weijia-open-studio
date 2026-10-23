import test from 'node:test';import assert from 'node:assert/strict';
import {validatePlan,newAccount,executePaper,dateMs,DAY,addYears,cycleIndex,nextEvent,demoCycle,calendar,restorePaperBackup} from '../src/strategy.mjs';
const plan={id:'test-plan',buyDate:'2026-10-05',sellDate:'2029-10-05',allocationBps:10000,feeBps:10,repeat:true};
const quote=at=>({priceCents:5000000,at,source:'manual'});
const initial=()=>({...newAccount(),enabled:true});
test('backup restoration remains paused, strips unknown properties and rejects mismatched records',()=>{
 const at=dateMs(plan.buyDate),account=executePaper(plan,initial(),quote(at),at).state;
 const input={schema:1,mode:'paper',plan:{...plan,unknown:'ignore'},account:{...account,secret:'ignore'}};
 const restored=restorePaperBackup(input);assert.equal(restored.state.enabled,false);assert.equal(restored.plan.unknown,undefined);assert.equal(restored.state.secret,undefined);assert.deepEqual(restored.state.trades,account.trades);
 assert.throws(()=>restorePaperBackup({...input,mode:'live'}));
 assert.throws(()=>restorePaperBackup({...input,account:{...account,trades:[{...account.trades[0],executedAt:0}]}}));
 assert.throws(()=>restorePaperBackup({...input,account:{...account,trades:[{...account.trades[0],id:'other-plan'}]}}));
});
test('no trade before due, and exactly one buy and sell per cycle',()=>{
 const buy=dateMs(plan.buyDate),sell=dateMs(plan.sellDate);
 assert.equal(executePaper(plan,initial(),quote(buy-1),buy-1).trade,null);
 const bought=executePaper(plan,initial(),quote(buy),buy).state;
 assert.equal(bought.trades.length,1);assert.ok(bought.btcSats>0);assert.ok(bought.cashCents>=0);
 assert.deepEqual(executePaper(plan,bought,quote(buy),buy).state,bought);
 const sold=executePaper(plan,bought,quote(sell),sell).state;assert.equal(sold.btcSats,0);assert.equal(sold.trades.length,2);
 assert.ok(sold.cashCents<1000000);assert.deepEqual(executePaper(plan,sold,quote(sell),sell).state,sold);
 const next=dateMs('2030-10-05');assert.equal(executePaper(plan,sold,quote(next),next).state.trades.length,3);
});
test('no backfilled low/high, no stale/future quote, no naked short',()=>{
 const buy=dateMs(plan.buyDate);assert.equal(executePaper(plan,initial(),quote(buy+DAY),buy+DAY).trade,null);
 assert.equal(executePaper(plan,initial(),quote(buy-300001),buy).status,'stale');
 assert.equal(executePaper(plan,initial(),quote(buy+30001),buy).status,'stale');
 const sell=dateMs(plan.sellDate);assert.equal(executePaper(plan,initial(),quote(sell),sell).status,'blocked');
 assert.equal(executePaper(plan,newAccount(),quote(buy),buy).status,'paused');
});
test('four-year anniversary handles leap days and late-year cycles',()=>{
 assert.equal(addYears('2096-02-29',4),'2100-02-28');
 const extended={...plan,sellDate:'2030-05-01'};
 assert.equal(cycleIndex(extended,dateMs('2030-04-01')),0);
 const bought=executePaper(extended,initial(),quote(dateMs(plan.buyDate)),dateMs(plan.buyDate)).state;
 assert.equal(nextEvent(extended,bought,dateMs('2030-04-01')).date,'2030-05-01');
 assert.equal(executePaper(extended,bought,quote(dateMs('2030-05-01')),dateMs('2030-05-01')).status,'filled');
});
test('one-off plans do not repeat and invalid parameters are rejected',()=>{
 assert.equal(executePaper({...plan,repeat:false},initial(),quote(dateMs('2030-10-05')),dateMs('2030-10-05')).trade,null);
 for(const invalid of [{sellDate:plan.buyDate},{buyDate:'2026-02-30'},{sellDate:'2030-10-05'},{feeBps:-1},{allocationBps:0}])assert.throws(()=>validatePlan({...plan,...invalid}));
});
test('isolated scenario uses both prices and includes fees and loss scenarios',()=>{
 assert.equal(demoCycle(0,50000,80000).state.trades.length,0);
 assert.equal(demoCycle(30,50000,80000).state.trades.length,1);
 const profit=demoCycle(1461,50000,80000);assert.equal(profit.state.trades.length,2);assert.ok(profit.equity>15000&&profit.equity<16000);
 assert.ok(demoCycle(1461,50000,30000).equity<6000);
 assert.match(calendar(plan),/DTSTART;VALUE=DATE:20261005/);
});
