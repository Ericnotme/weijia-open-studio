const assert=require('node:assert/strict'),T=require('../src/trainer');
const split=T.solve(T.cases.find(c=>c.id==='split1'));assert.equal(split.equity,.5);assert.equal(split.ev,50);assert.equal(T.grade(split,'call').loss,0);assert.equal(T.grade(split,'fold').loss,50);
const base={hole:'As Ad',board:'Ks Qh 9d 5c 2s',pot:100,bet:100};assert.equal(T.solve({...base,range:'KK'}).equity,0);assert.equal(T.solve({...base,range:'QQ,KK'}).combos.length,6);assert.equal(T.solve({...base,range:'KK,KK:50'}).combos.length,3);
const weighted=T.solve({...base,range:'KK,JJ:50'});assert.equal(weighted.equity,.5);
assert.throws(()=>T.solve({...base,range:'AsAd'}));assert.throws(()=>T.solve({...base,range:'XX'}));assert.throws(()=>T.solve({...base,range:'KK:101'}));assert.throws(()=>T.solve({...base,hole:'As As',range:'KK'}));assert.throws(()=>T.solve({...base,bet:-1,range:'KK'}));
const blocked=T.solve(T.cases.find(c=>c.id==='block1')),unblocked=T.solve(T.cases.find(c=>c.id==='block2'));assert(blocked.equity<unblocked.equity);assert.equal(blocked.best,'fold');assert.equal(unblocked.best,'call');
const st=T.stats([{id:'a',correct:false,loss:10},{id:'a',correct:true,loss:0}]);assert.equal(st.accuracy,0);assert.deepEqual(st.wrong,[]);assert.equal(st.meanLoss,5);
for(const c of T.cases){const r=T.solve(c);assert(Math.abs(r.win+r.tie+r.lose-1)<1e-10);assert.equal(T.grade(r,r.best).correct,true);}
console.log('Trainer: range weights, blockers, ties, EV, validation and repeat statistics passed');
