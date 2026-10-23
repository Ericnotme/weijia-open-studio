import {addDays, daysBetween} from './cyclewatch.ts';
import {nextBottomReference} from './cyclewatch-reference.ts';

// New information experiment, not a redefinition of the source's cycle-bottom claim.
export const factorProtocol = {
  id:'SYNTHETIC-EXPORT-01', version:1, prepared_at:'2026-10-05T04:01:41Z',
  effective_from:'2026-10-06', last_observation:'2027-10-01', horizon_days:30, stride_days:30,
  target:'观察日 UTC 收盘至 30 个自然日后 UTC 收盘的 BTC/USD 价格变化。非策略收益。',
  clock_reference:{id:nextBottomReference.record_id,version:nextBottomReference.version,start:nextBottomReference.window_start,end:nextBottomReference.window_end},
  trend_days:200, flow_reports:5, flow_max_age_days:7, funding_max_age_hours:48, funding_ceiling_percent:10,
  rules:{
    A:'日历组：观察日在原窗口内时标记；窗外不作正向标记。新增的收益观察假设，不是原作者的低点确认规则。',
    B:'趋势组：当日收盘价严格高于包含当日在内的连续 200 日收盘均价时标记。',
    C:'增强组：B 成立，且最近 5 份已公布、同篮子 ETF 日净流入合计 > 0，且最新已公布年化永续资金费率 ≤ 10%。',
    missing:'缺数据不作零处理。ETF 最近报告距观察日不得超过 7 天；资金费率记录距截点不得超过 48 小时。',
    availability:'每项数据 known_at 必须不晚于观察日结束截点；结果只用数据包 as_of 之前已知的价格。',
    comparison:'固定每 30 天一个观察日；仅在三组输入与 30 日结果都齐全的相同日期比较。未到期和缺数据日期逐条保留。',
    evaluation:'报告标记覆盖数、标记后正/非正变化次数与平均价格变化；不宣布胜者、不换算未来概率。一次窗口无法校准周期成功率。',
  },
  limitations:['本模块中的参数和日期是导出示例，并非预注册证据，未经过最优性验证。','固定条件仅供个人数据重建；来源、数据完整性及发布时间由导入者声明，本站未独立审计。','不计算交易收益，未计费用、滑点、资金占用或可成交性。','版本记录不是独立时间戳存证；后续改规则必须新增版本。'],
} as const;

export type PriceRow={date:string;close:number;known_at:string};
export type FlowRow={date:string;net_usd:number;known_at:string};
export type FundingRow={at:string;annualized_percent:number;known_at:string};
export type FactorData={
 schema_version:1; as_of:string;
 metadata:{pair:'BTC/USD';timezone:'UTC';price_basis:'daily_close';price_source:string;flow_source:string;flow_basket:string;funding_source:string;funding_method:string;rights_note:string;publication_times_verified:boolean};
 prices:PriceRow[];flows:FlowRow[];funding:FundingRow[];
};
export const factorTemplate:FactorData={schema_version:1,as_of:'',metadata:{pair:'BTC/USD',timezone:'UTC',price_basis:'daily_close',price_source:'',flow_source:'',flow_basket:'',funding_source:'',funding_method:'',rights_note:'',publication_times_verified:false},prices:[],flows:[],funding:[]};
function timestamp(s:unknown){if(typeof s!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)||!Number.isFinite(Date.parse(s)))throw Error('时间戳须为有效 UTC ISO 时间，例如 YYYY-MM-DDTHH:mm:ssZ');addDays(s.slice(0,10),0);if(+s.slice(11,13)>23||+s.slice(14,16)>59||+s.slice(17,19)>59)throw Error('时间戳超出有效时分秒');return Date.parse(s)}
function finite(n:unknown){return typeof n==='number'&&Number.isFinite(n)}
export function closeCutoff(date:string){return addDays(date,1)+'T00:00:00Z'}
export function validateFactorData(value:unknown,now=new Date().toISOString()):FactorData{
 const d=value as FactorData;
 if(!d||d.schema_version!==1||!d.metadata||!Array.isArray(d.prices)||!Array.isArray(d.flows)||!Array.isArray(d.funding))throw Error('数据结构不完整，请先下载空白模板。');
 const asof=timestamp(d.as_of);if(asof>timestamp(now))throw Error('数据截止时间不能在未来。');
 const m=d.metadata;if(m.pair!=='BTC/USD'||m.timezone!=='UTC'||m.price_basis!=='daily_close')throw Error('主分析仅接受 BTC/USD、UTC 日收盘；不能混用 USDT 或日内极值。');
 for(const name of ['price_source','flow_source','flow_basket','funding_source','funding_method','rights_note'] as const)if(typeof m[name]!=='string')throw Error('来源元数据必须为文本。');
 if(!m.price_source.trim()||!m.rights_note.trim())throw Error('请注明价格来源与数据使用权限。');
 if(m.publication_times_verified!==true)throw Error('请先核对每项数据实际可知时间，并将 publication_times_verified 设为 true；不能把修订后的数据冒充当时已知。');
 if(d.prices.length+d.flows.length+d.funding.length>20000)throw Error('此工具最多接受 20,000 条记录。');
 for(const [rows,key] of [[d.prices,'date'],[d.flows,'date'],[d.funding,'at']] as const){
  let prev=-Infinity;for(const r of rows){const s=key==='at'?(r as FundingRow).at:(r as PriceRow).date;
   const occurred=key==='at'?timestamp(s):timestamp(addDays(s,0)+'T00:00:00Z');const known=timestamp(r.known_at);
   if(occurred<=prev)throw Error('每类数据必须按时间升序，且不能重复。');prev=occurred;
   if(known<occurred||known>asof)throw Error('数据可知时间不能早于发生时间，也不能晚于数据截止时间。');
  }
 }
 for(const p of d.prices)if(!finite(p.close)||p.close<=0||timestamp(p.known_at)<timestamp(closeCutoff(p.date)))throw Error('收盘价须大于零，且日收盘只能在该 UTC 日结束后得知。');
 for(const f of d.flows)if(!finite(f.net_usd))throw Error('净流入须为有限数值；未知请省略该报告，不要填零。');
 for(const f of d.funding)if(!finite(f.annualized_percent))throw Error('资金费率须为年化百分数；例如 10 表示 10%，不是 0.10。');
 if(d.flows.length&&(!m.flow_source.trim()||!m.flow_basket.trim()))throw Error('需要注明 ETF 来源与固定基金篮子。');
 if(d.funding.length&&(!m.funding_source.trim()||!m.funding_method.trim()))throw Error('需要注明资金费率合约、来源及年化方法。');
 return d;
}
export type Signal={on:boolean|null;reason:string};
export function observeFactors(d:FactorData,date:string){
 const cutoff=closeCutoff(date),cut=timestamp(cutoff),asof=timestamp(d.as_of);
 const A:Signal={on:date>=factorProtocol.clock_reference.start&&date<=factorProtocol.clock_reference.end,reason:'仅按保留的原文窗口标记，不确认低点。'};
 let B:Signal={on:null,reason:'需要当时已经公布的连续 200 个 UTC 日收盘。'},C:Signal={on:null,reason:'趋势、ETF 或资金费率数据不足。'};
 let sma:number|null=null,flowSum:number|null=null,fundingRate:number|null=null;
 if(cut>asof)return {date,cutoff,A:{on:null,reason:'观察日尚未结束或超出数据截止时间。'} as Signal,B,C,sma,flowSum,fundingRate,forward_return:null,outcome:'尚未到观察截点'};
 const prices=new Map(d.prices.filter(p=>timestamp(p.known_at)<=cut).map(p=>[p.date,p]));
 const lookback=Array.from({length:factorProtocol.trend_days},(_,i)=>prices.get(addDays(date,-i)));
 if(lookback.every(Boolean)){sma=lookback.reduce((n,p)=>n+p!.close,0)/lookback.length;B={on:prices.get(date)!.close>sma,reason:'收盘价与包含当日的 200 日均价比较；相等不标记。'};}
 const flows=d.flows.filter(f=>f.date<=date&&timestamp(f.known_at)<=cut).slice(-factorProtocol.flow_reports);
 if(flows.length===factorProtocol.flow_reports&&daysBetween(flows.at(-1)!.date,date)<=factorProtocol.flow_max_age_days)flowSum=flows.reduce((n,f)=>n+f.net_usd,0);
 const f=d.funding.filter(f=>timestamp(f.at)<=cut&&timestamp(f.known_at)<=cut).at(-1);
 if(f&&cut-timestamp(f.at)<=factorProtocol.funding_max_age_hours*3600000)fundingRate=f.annualized_percent;
 if(B.on!==null&&flowSum!==null&&fundingRate!==null)C={on:B.on&&flowSum>0&&fundingRate<=factorProtocol.funding_ceiling_percent,reason:'趋势成立、最近 5 份净流入合计为正、年化资金费率不高于 10%，三项同时成立才标记。'};
 const due=addDays(date,factorProtocol.horizon_days),mature=timestamp(closeCutoff(due))<=asof;
 const end=d.prices.find(p=>p.date===due&&timestamp(p.known_at)<=asof),start=prices.get(date);
 const forward_return=mature&&start&&end?end.close/start.close-1:null;
 return {date,cutoff,A,B,C,sma,flowSum,fundingRate,forward_return,outcome:!mature?'尚未到评价截点':forward_return===null?'已到期，结果数据缺失':'30 日观察完成'};
}
export function compareFactors(d:FactorData){
 const rows=[];for(let date:string=factorProtocol.effective_from;date<=factorProtocol.last_observation&&timestamp(closeCutoff(date))<=timestamp(d.as_of);date=addDays(date,factorProtocol.stride_days))rows.push(observeFactors(d,date));
 const common=rows.filter(r=>r.A.on!==null&&r.B.on!==null&&r.C.on!==null&&r.forward_return!==null);
 const mean=(a:number[])=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
 return {rows,common_count:common.length,unconditional_mean:mean(common.map(r=>r.forward_return!)),groups:(['A','B','C'] as const).map(id=>{const active=common.filter(r=>r[id].on);return {id,flagged:active.length,positive:active.filter(r=>r.forward_return!>0).length,nonpositive:active.filter(r=>r.forward_return!<=0).length,mean:mean(active.map(r=>r.forward_return!))};}),pending:rows.filter(r=>r.outcome==='尚未到评价截点').length,missing:rows.filter(r=>r.outcome!=='尚未到评价截点'&&(r.forward_return===null||r.B.on===null||r.C.on===null)).length};
}
export function factorSnapshot(d:FactorData,date:string,created_at=new Date().toISOString()){
 return {kind:'personal-reconstruction',created_at,clock:'设备时钟；不是独立时间戳',protocol:factorProtocol,data:d,observation:observeFactors(d,date),comparison:compareFactors(d),warning:'用户提供的数据重建，非本站核验结果；不能据此计算本轮低点命中概率。'};
}
