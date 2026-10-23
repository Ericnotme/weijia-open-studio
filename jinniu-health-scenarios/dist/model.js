export const CAUSES = [
 {id:'cardio',name:'心脑血管疾病',color:'#65e0b8',base:55,k:.094,female:.68},
 {id:'cancer',name:'恶性肿瘤',color:'#719df2',base:65,k:.073,female:.76},
 {id:'resp',name:'慢性呼吸系统疾病',color:'#c89fea',base:9,k:.108,female:.62},
 {id:'diabetes',name:'糖尿病',color:'#edbd73',base:6,k:.09,female:.90},
 {id:'injury',name:'伤害与外因',color:'#ed8d98',base:24,k:.025,female:.48},
 {id:'other',name:'其他死因',color:'#8eabb7',base:28,k:.078,female:.85},
];
export const SCENARIOS = {
 baseline:{name:'基准延续',en:'BASELINE',color:'#65e0b8',icon:'→',description:'保持当前年龄别危险率，观察年龄增长带来的变化。',targets:[1,1,1,1,1,1]},
 improve:{name:'健康改善',en:'HEALTHIER FUTURE',color:'#719df2',icon:'↘',description:'假设预防与诊疗持续改善，各类危险率逐步下降。',targets:[.70,.80,.75,.75,.90,.90]},
 pressure:{name:'环境承压',en:'ENVIRONMENTAL PRESSURE',color:'#edbd73',icon:'↗',description:'假设环境与健康条件承压，各类危险率逐步上升。',targets:[1.20,1.08,1.30,1.15,1.05,1.10]},
};
export function environmentFactors(env={}) {
 const r=env.road==='near'?1:env.road==='medium'?.5:0;
 const h=env.heat==='high'?1:env.heat==='medium'?.5:0;
 const c=env.care==='far'?1:env.care==='medium'?.5:0;
 return [(1+.08*r)*(1+.08*h)*(1+.05*c),(1+.03*r)*(1+.02*c),(1+.15*r)*(1+.06*h)*(1+.02*c),(1+.04*h)*(1+.02*c),1+.05*c,1+.02*c];
}
export function simulate({age=40,sex='male',scenario='baseline',env={},scale=1}={}) {
 const ef=environmentFactors(env);let survival=1;const cumulative=CAUSES.map(()=>0);
 const rates=(t)=>CAUSES.map((c,i)=>c.base/100000*Math.exp(c.k*(age+t+.5-40))*(sex==='female'?c.female:1)*ef[i]*(1+(SCENARIOS[scenario].targets[i]-1)*(t/29))*scale);
 const annual=(l)=>{const sum=l.reduce((a,b)=>a+b,0);return l.map(v=>(1-Math.exp(-sum))*v/sum);};
 const rows=[{year:2026,age,cumulative:[...cumulative],annual:annual(rates(0)),survival:1,total:0}];
 for(let t=0;t<30;t++) {const l=rates(t),h=l.reduce((a,b)=>a+b,0),q=annual(l);q.forEach((v,i)=>cumulative[i]+=survival*v);survival*=Math.exp(-h);rows.push({year:2027+t,age:age+t+1,cumulative:[...cumulative],annual:q,survival,total:1-survival});}
 return rows;
}
