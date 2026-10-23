export const locations = [
 {id:'unknown',name:'尚未确认',region:'等待报告',effects:['先核对报告中的具体部位、左右侧与邻近结构。'],ask:'请医生指出肿瘤与神经、血管及脑组织的关系。'},
 {id:'convexity',name:'大脑凸面',region:'脑表面',effects:['可能出现头痛、癫痫或局部神经功能变化。','具体表现取决于邻近运动、感觉或语言等区域。'],ask:'邻近哪一功能区？是否存在周围水肿或脑组织受压？'},
 {id:'falx',name:'大脑镰 / 矢状窦旁',region:'两侧大脑之间',effects:['涉及运动区域时，可能出现腿部无力或感觉改变。','需要结合位置判断与静脉窦及回流的关系。'],ask:'有无静脉窦受累？是否靠近运动区？'},
 {id:'sphenoid',name:'蝶骨嵴 / 蝶骨翼',region:'眼眶后方颅底',effects:['可能影响视力，或出现面部感觉变化。','具体表现与视神经、海绵窦等邻近结构有关。'],ask:'是否需要视力、视野检查？有无视神经或海绵窦受累？'},
 {id:'olfactory',name:'嗅沟 / 前颅底',region:'鼻腔上方',effects:['可能影响嗅觉；较大时也可能影响视力。'],ask:'有无嗅觉改变或视路受压？日常变化应如何记录？'},
 {id:'sellar',name:'鞍结节 / 鞍上',region:'视交叉与垂体附近',effects:['可能影响视力、视野，部分可影响垂体功能。'],ask:'是否需要眼科视野检查及内分泌评估？'},
 {id:'posterior',name:'后颅窝 / 岩骨 / 桥小脑角',region:'脑的后下方',effects:['可能影响听力、面部感觉或平衡。','邻近脑神经受压时，表现因具体神经而异。'],ask:'有无脑干或脑神经受压？步态和听力应如何随访？'},
 {id:'ventricle',name:'脑室内',region:'脑脊液通路',effects:['可能阻碍脑脊液流动，引起脑积水相关症状。'],ask:'有无脑积水或脑脊液循环受阻？'},
 {id:'other',name:'其他 / 多发 / 部位不明确',region:'需要专科定位',effects:['单一位置规则不足以解读，请保留报告原文并由专科核对。'],ask:'每个病灶分别位于哪里？应重点随访哪一处？'},
] as const;
export const locationOptions=locations.map(x=>[x.id,x.name] as [string,string]);
export const sides=[['unknown','未说明'],['left','左侧'],['right','右侧'],['midline','中线'],['both','双侧 / 多发']];
export const grades=[['unknown','未知 / 未做病理'],['1','WHO 1 级（病理确认）'],['2','WHO 2 级（病理确认）'],['3','WHO 3 级（病理确认）']];
export const treatments=[['unknown','尚未填写'],['observe','随访观察'],['surgery','已手术 / 术后随访'],['radiation','放疗 / 放射外科后'],['other','其他治疗']];
export const sources=[
 {title:'EANO 脑膜瘤诊疗指南（2021）',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8563316/',note:'观察与治疗原则；复查计划需要结合病理及临床情况。'},
 {title:'Johns Hopkins · 脑膜瘤',url:'https://www.hopkinsmedicine.org/health/conditions-and-diseases/meningioma',note:'部位与可能受影响的功能。'},
 {title:'AANS · 脑膜瘤',url:'https://www.aans.org/patients/conditions-treatments/meningiomas/',note:'脑膜瘤常见解剖位置。'},
 {title:'NCI · 脑膜瘤诊断与治疗',url:'https://www.cancer.gov/rare-brain-spine-tumor/tumors/meningioma',note:'病理分级与个体预后的影响因素。'},
 {title:'CDC STEADI · 体位血压测量',url:'https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-MeasuringBP-508.pdf',note:'平卧 5 分钟，站立后 1、3 分钟测量，以及常用筛查界值。'},
 {title:'Mayo Clinic · 体位性低血压照护',url:'https://www.mayoclinic.org/diseases-conditions/orthostatic-hypotension/diagnosis-treatment/drc-20352553',note:'缓慢起身、诱因管理，饮水与增盐需个体化。'},
 {title:'Mayo Clinic · 脑膜瘤症状',url:'https://www.mayoclinic.org/diseases-conditions/meningioma/symptoms-causes/syc-20355643',note:'需要紧急就医的新发症状。'},
];
export type Profile={age:string;grade:string;treatment:string;medicines:string;conditions:string;symptoms:string;nextVisit:string;notes:string};
export const emptyProfile:Profile={age:'',grade:'unknown',treatment:'unknown',medicines:'',conditions:'',symptoms:'',nextVisit:'',notes:''};
export type Report={date:string;location:string;side:string;diameter:string;width:string;height:string;edema:string;text:string;notes:string;confirmed:boolean;fileName?:string;fileType?:string;fileSize?:number};
export type Pressure={date:string;lyingSys:string;lyingDia:string;lyingPulse:string;oneSys:string;oneDia:string;onePulse:string;threeSys:string;threeDia:string;threePulse:string;symptom:string;context:string;notes:string};
export type RecordItem<T=any>={id:string;kind:string;date:string;data:T;updatedAt:string};
export function locationName(id:string){return locations.find(x=>x.id===id)?.name??'尚未确认'}
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function blankReport():Report{return {date:localDate(),location:'unknown',side:'unknown',diameter:'',width:'',height:'',edema:'unknown',text:'',notes:'',confirmed:false}}
export function blankPressure():Pressure{return {date:`${localDate()}T${new Date().toTimeString().slice(0,5)}`,lyingSys:'',lyingDia:'',lyingPulse:'',oneSys:'',oneDia:'',onePulse:'',threeSys:'',threeDia:'',threePulse:'',symptom:'none',context:'日常记录',notes:''}}
export function screenPressure(p:Pressure){
 const lying=[Number(p.lyingSys),Number(p.lyingDia)];
 const valid=(s:string,d:string)=>s!==''&&d!==''&&Number(s)>Number(d)&&Number(d)>0;
 if(!valid(p.lyingSys,p.lyingDia))return null;
 const samples=[['1 分钟',p.oneSys,p.oneDia],['3 分钟',p.threeSys,p.threeDia]].filter(([,s,d])=>valid(s,d)).map(([time,s,d])=>({time,sys:lying[0]-Number(s),dia:lying[1]-Number(d)}));
 if(!samples.length)return null;
 const maxSys=Math.max(...samples.map(x=>x.sys));const maxDia=Math.max(...samples.map(x=>x.dia));
 return {samples,maxSys,maxDia,threshold:samples.some(x=>x.sys>=20||x.dia>=10),symptomatic:p.symptom!=='none',incomplete:samples.length<2,urgent:p.symptom==='faint'};
}
export function projectDiameter(baseline:number,rate:number,years:number){if(!Number.isFinite(baseline)||baseline<=0||baseline>200||!Number.isFinite(rate)||rate<0||rate>10||!Number.isInteger(years)||years<0||years>30)throw new Error('请核对直径、年变化量和时间范围。');return Math.round((baseline+rate*years)*10)/10}
export function reportCandidates(text:string){
 const matches=[...text.matchAll(/(\d+(?:\.\d+)?)\s*[×xX*＊]\s*(\d+(?:\.\d+)?)(?:\s*[×xX*＊]\s*(\d+(?:\.\d+)?))?\s*(mm|cm|毫米|厘米)/g)];
 return matches.slice(0,8).map(m=>({raw:m[0],values:m.slice(1,4).filter(Boolean).map(x=>Number(x)*(/cm|厘米/.test(m[4])?10:1))}));
}
