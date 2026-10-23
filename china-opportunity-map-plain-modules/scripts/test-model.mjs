import assert from 'node:assert/strict';
import {modelDistrict,neighborhoodQuality,exposureShare,exposedIncome} from '../src/lib/atlas/model.ts';
const d={cityId:'synthetic-city',school:50,collegeHc:50,povertyInv:50,incomeMix:50,highSkill:50,inclusion:50,transit:50,income:50000};
assert.equal(neighborhoodQuality(d),.5);
const m=modelDistrict(d,50,'all');assert.equal(m.childRank,50);assert.ok(Math.abs(m.hhIncome-Math.exp(10))<.001);
for(const p of [1,25,50,75,99]){const a=modelDistrict(d,p,'all');assert.ok(Object.values(a).every(Number.isFinite));assert.ok(a.college>=.05&&a.college<=.95);}
assert.equal(exposureShare(0),1);assert.equal(exposureShare(18),0);assert.equal(exposedIncome(m,{...m,hhIncome:m.hhIncome+100},9),m.hhIncome+50);
console.log('PASS synthetic model: finite values, midpoint, bounds, exposure');
