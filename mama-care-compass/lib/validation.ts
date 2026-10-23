import {z} from 'zod';
const text=z.string().max(4000);const short=z.string().max(100);
const num=(min:number,max:number)=>z.string().max(20).refine(v=>v===''||(/^\d+(\.\d+)?$/.test(v)&&Number(v)>=min&&Number(v)<=max),'数值超出范围');
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v);return !isNaN(+d)&&d.toISOString().slice(0,10)===v},'日期无效');
const optionalDate=z.union([z.literal(''),date]);
const location=z.enum(['unknown','convexity','falx','sphenoid','olfactory','sellar','posterior','ventricle','other']);
export const profileSchema=z.object({age:num(18,110),grade:z.enum(['unknown','1','2','3']),treatment:z.enum(['unknown','observe','surgery','radiation','other']),medicines:text,conditions:text,symptoms:text,nextVisit:optionalDate,notes:text});
export const reportSchema=z.object({date,location,side:z.enum(['unknown','left','right','midline','both']),diameter:num(.1,200),width:num(.1,200),height:num(.1,200),edema:z.enum(['unknown','yes','no']),text:z.string().max(30000),notes:text,confirmed:z.literal(true)}).refine(v=>!v.date||v.date<=new Date().toISOString().slice(0,10),'检查日期不能在未来').refine(v=>!v.diameter||[v.width,v.height].every(x=>!x||Number(x)<=Number(v.diameter)),'最大径必须不小于另外两个径线');
export const pressureSchema=z.object({date:z.string().max(40).refine(v=>!isNaN(Date.parse(v)),'日期无效'),lyingSys:num(40,300),lyingDia:num(20,200),lyingPulse:num(20,250),oneSys:num(40,300),oneDia:num(20,200),onePulse:num(20,250),threeSys:num(40,300),threeDia:num(20,200),threePulse:num(20,250),symptom:z.enum(['none','dizzy','near','faint']),context:short,notes:text}).superRefine((v,ctx)=>{
 const groups=[['lyingSys','lyingDia'],['oneSys','oneDia'],['threeSys','threeDia']] as const;
 for(const [s,d]of groups){if((!!v[s]!==!!v[d])||(v[s]&&Number(v[s])<=Number(v[d])))ctx.addIssue({code:'custom',message:'每组血压需填写完整，且收缩压应高于舒张压。'});}
 if(!v.lyingSys||!v.lyingDia||(!v.oneSys&&!v.threeSys))ctx.addIssue({code:'custom',message:'需要卧位和至少一组站立血压。'});
 if(Date.parse(v.date)>Date.now()+60000)ctx.addIssue({code:'custom',message:'测量时间不能在未来。'});
});
export const dailySchema=z.object({date,checks:z.array(z.boolean()).length(3)});
export const scenarioSchema=z.object({baseline:num(.1,200),rates:z.array(z.number().finite().min(0).max(10)).length(3),years:z.number().int().min(1).max(30),baseDate:date,ack:z.boolean()});
export const schemas={profile:profileSchema,report:reportSchema,pressure:pressureSchema,daily:dailySchema,scenario:scenarioSchema};
