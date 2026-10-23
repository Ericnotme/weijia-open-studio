import assert from 'node:assert/strict';
import fs from 'node:fs';
import {servingEffect,exerciseCategory,metMinutes} from '../dist/assets/model.mjs';
import {drugs,supplements} from '../dist/assets/evidence.mjs';
const foods=JSON.parse(fs.readFileSync(new URL('../dist/assets/foods.json',import.meta.url)));
const hotdog={id:'synthetic_unit_fixture',heni:-36.3,heniLo:-45.4,heniHi:-21.91,verification:'verified_source'}; // synthetic arithmetic fixture, not a published food claim
for(const n of [0,.5,1,2]){const r=servingEffect(hotdog,n);assert.equal(r.value,hotdog.heni*n);assert.equal(r.low,hotdog.heniLo*n);assert.equal(r.high,hotdog.heniHi*n);}
for(const n of [-1,3,.25,NaN,Infinity,'1',null])assert.throws(()=>servingEffect(hotdog,n));
assert.equal(servingEffect({},1).value,null);
for(const [n,hr]of [[0,1],[6,.81],[224,.81],[225,.76],[449,.76],[450,.68],[899,.68],[900,.61],[1349,.61],[1350,.59],[3000,.59]])assert.equal(exerciseCategory(n).hr,hr);
assert.equal(exerciseCategory(.5),null);
for(const n of [-1,3001,NaN,Infinity,'600',null])assert.throws(()=>exerciseCategory(n));
assert.equal(metMinutes(5),100);assert.throws(()=>metMinutes(0));
const metformin=drugs.find(d=>d.id==='metformin_dm');assert.equal(metformin.type,'MH-OR');assert.deepEqual(metformin.ci,[.6,1.07]);assert.equal(metformin.value,.8);
for(const id of ['creatine','nmn']){const x=supplements.find(d=>d.id===id);assert.equal(x.value,null);assert.equal(x.type,null);}
assert(foods.every(f=>f.verification==='pending_source_check'&&!('heni'in f)&&!('heniLo'in f)&&!('heniHi'in f)));for(const food of foods)for(const count of [0,.5,1,2])assert.equal(servingEffect(food,count).value,null);
assert.equal(foods.length,39);assert.equal(new Set(foods.map(f=>f.id)).size,39);assert(foods.every(f=>!('rr'in f)));
console.log('PASS: serving 0/0.5/1/2 once only, invalid inputs, movement category boundaries, measure types, unknown states, 39 public foods.');
