export function convert({baseline,effect,type,low,high}){
 if(!['HR','RR','RATE'].includes(type))throw Error('请选择有效的效应量类型。');
 if(![baseline,effect,low,high].every(Number.isFinite))throw Error('请填写完整、有效的数字。');
 if(baseline<0 || (type!=='RATE'&&baseline>=100))throw Error('基线概率应为 0 至小于 100%；死亡率应不小于 0。');
 if(effect<=0||low<=0||high<=0||low>effect||effect>high)throw Error('效应量须大于 0，且满足：下界 ≤ 点估计 ≤ 上界。');
 const f=e=>type==='HR' ? -Math.expm1(e*Math.log1p(-baseline/100))*100 : baseline*e;
 if(type==='RR'&&f(high)>100)throw Error('该 RR 与基线会得到超过 100% 的概率，请检查输入和研究条件。');
 const result=f(effect),lower=f(low),upper=f(high),difference=baseline-result;
 return {result,lower,upper,difference,per1000:type==='RATE'?difference:difference*10};
}
export const presets={
 example:{label:'教学示例：HR 0.80（假设）',type:'HR',baseline:5,effect:.8,low:.7,high:.9,years:10,ref:null,note:'5% 是人为设定的示例基线，不是中国同龄人的实际风险。这里仅演示数学换算。'},
 steps:{label:'步数：7,000 vs 2,000 / 天',type:'HR',baseline:5,effect:.53,low:.46,high:.60,years:10,ref:'steps',note:'观察性荟萃分析，随访长度各异。5% / 10 年为假设情景，不是研究给出的统一基线，也不保证效应适用于该时间窗。'},
 variety:{label:'运动多样性：最高 vs 最低组',type:'HR',baseline:5,effect:.81,low:.78,high:.85,years:10,ref:'variety',note:'观察性队列。5% / 10 年为假设情景；调整后的关联仍可能有混杂。不能与步数或有氧效应叠乘。'},
 select:{label:'SELECT：司美格鲁肽 vs 安慰剂',type:'HR',baseline:5.2,effect:.81,low:.71,high:.93,years:3.3,ref:'select',note:'特定高风险人群：≥45 岁、BMI≥27、已有心血管病、无糖尿病。基线 5.2% 来自试验观察比例；换算值是近似，原试验治疗组观察比例 4.3%。全因死亡未通过层级链进行确认性检验。'},
 salt:{label:'SSaSS：低钠盐 vs 普通盐',type:'RATE',baseline:44.61,effect:.88,low:.82,high:.95,years:4.74,ref:'salt',note:'中国卒中史或较年长高血压人群。基线单位为每 1,000 人年死亡数；结果保持同一单位，不转成累计死亡概率。'},
 custom:{label:'自己输入论文数据',type:'HR',baseline:5,effect:.8,low:.7,high:.9,years:10,ref:null,note:'请使用同一终点、可比人群与时间范围的数据。OR、SMD、血糖变化和表观遗传年龄不能直接放入这里。'}
};
export const dietScenarios={female:{label:'女性（论文设定 1.65 m / 60 kg）',feasible:[1.7,.3,3.1],optimized:[6.2,5,7.5]},male:{label:'男性（论文设定 1.75 m / 70 kg）',feasible:[1.7,.4,3.2],optimized:[6.3,5.3,7.9]}};
