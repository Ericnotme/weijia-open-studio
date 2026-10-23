import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS,SCENARIOS,compare,scenarioPrices,parsePriceCSV,makeSnapshot} from '../src/lab.mjs';
const cfg=(x={})=>({...DEFAULTS,feeBps:0,slippageBps:0,...x});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} differs from ${b}`);
test('same capital is conserved on a flat path without costs',()=>{
 for(const r of compare(cfg({scenario:'flat'}))){near(r.final,10000);near(r.drawdown,0);near(r.returnPct,0);}
});
test('zero and full satellite weights reproduce their respective benchmarks',()=>{
 for(const scenario of Object.keys(SCENARIOS)){
  const zero=compare(cfg({scenario,satellite:0})),full=compare(cfg({scenario,satellite:100}));
  near(zero[0].final,zero[3].final);near(full[2].final,full[3].final);
  for(let i=0;i<zero[0].values.length;i++)near(zero[0].values[i],zero[3].values[i]);
 }
});
test('buy-and-hold pays the same liquidation costs as the other strategies',()=>{
 const c=cfg({scenario:'flat',feeBps:10,slippageBps:20});const r=compare(c)[0];
 near(r.final,10000/(1.002*1.001)*0.998*0.999);near(r.costs,10000-r.final);
});
test('selling into a persistent rally loses against holding; subscription only hurts charged strategies',()=>{
 const free=compare(cfg({scenario:'trend'})),paid=compare(cfg({scenario:'trend',annualCost:120}));
 assert.ok(free[0].final>free[2].final);assert.ok(free[0].final>free[3].final);
 near(free[0].final,paid[0].final);near(free[1].final,paid[1].final);
 assert.ok(paid[3].final<free[3].final);near(paid[3].subscription,960);
});
test('long decline measures 90 percent peak-to-trough loss; fees can exhaust an account without debt',()=>{
 near(compare(cfg({scenario:'crash'}))[0].drawdown,90);
 const r=compare(cfg({scenario:'flat',annualCost:1000000}))[3];
 near(r.final,0);assert.equal(r.insolvent,true);near(r.subscription,10000);assert.ok(r.values.every(v=>v>=-1e-7));
});
test('CSV rejects duplicate/missing/reversed months, impossible dates and nonpositive prices',()=>{
 const csv='date,price\n'+Array.from({length:13},(_,i)=>`${2024+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}-01,50000`).join('\n');
 assert.equal(parsePriceCSV(csv).length,13);
 for(const bad of [csv.replace('2024-02-01','2024-01-01'),csv.replace('2024-02-01','2024-02-30'),csv.replace('2024-02-01','2024-04-01'),csv.replace(',50000',',-1'),csv.replace('date,price','when,usd')])assert.throws(()=>parsePriceCSV(bad));
});
test('report keeps an independent copy and does not present local timestamps as immutable proof',()=>{
 const c=cfg(),rows=scenarioPrices(c),r=compare(c,rows),snapshot=makeSnapshot(c,'人为情景',rows,r,new Date('2026-09-22T00:00:00Z'));
 c.buy=22;rows[0].price=999;assert.equal(snapshot.config.buy,3);assert.equal(snapshot.prices[0].price,50000);assert.match(snapshot.limitations[0],/not independent proof/);
});
