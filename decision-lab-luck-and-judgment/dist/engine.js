import { SCENES, REASONS } from './scenes.js';
export const INITIAL = 2000000, RESERVED = 1000000, RISK_BUDGET = 600000;
export const STAKES = [0,100000,200000,300000];
export const CONFIDENCES = [25,50,75,90];
export function newGame(seed='FIRST-LIGHT') {
  if(typeof seed !== 'string' || !/^[A-Za-z0-9-]{1,32}$/.test(seed)) throw Error('种子请用 1–32 个字母、数字或短横线。');
  return {seed,round:0,phase:'decision',cash:INITIAL,reserve:RESERVED,spent:0,lossUsed:0,history:[]};
}
// FNV-1a plus integer mixing: fixed inputs produce the same draw on every JS host.
export function random(seed) {
  let x=2166136261;
  for(const c of seed) x=Math.imul(x^c.charCodeAt(0),16777619);
  x^=x>>>16; x=Math.imul(x,0x7feb352d); x^=x>>>15; x=Math.imul(x,0x846ca68b); x^=x>>>16;
  return (x>>>0)/4294967296;
}
export function draw(seed,round,path=0){
  const r=random(`${seed}:${round}:${path}`)*100;
  let cum=0; return SCENES[round].outcomes.find(o=>(cum+=o.prob)>r) ?? SCENES[round].outcomes.at(-1);
}
export const pnlFor=(stake,bps)=>Math.round(stake*bps/10000)||0;
export const riskLeft=s=>RISK_BUDGET-s.lossUsed;
export const maxStake=s=>Math.max(0,Math.min(300000,s.cash-s.reserve,riskLeft(s)));
export const allowedStakes=s=>STAKES.filter(n=>n<=maxStake(s));
export function feedback(state,decision){
  const tags=new Set(decision.reasons), scene=SCENES[state.round];
  const items=[{kind:'good',title:'生活边界守住了',text:`本轮投入 ${decision.stake/100} 元，在可用现金和剩余风险预算内。未来开支仍完整保留。这一点与之后赚亏无关。`}];
  if(decision.stake===0) items.push({kind:'good',title:'等待也是一个决定',text:tags.has('uncertain')||tags.has('condition')?'你记录了等待的依据。可以把触发下一次行动的证据再写具体些。':'本轮没有承担价格风险，也放弃了潜在收益。建议补上等待到何时、等什么证据。'});
  if(decision.investigated) items.push({kind:'good',title:'材料已经展开',text:`你查看了“${scene.evidenceKey}”。查看不等于理解；复盘时可对照你写下的理由。`});
  else items.push({kind:'notice',title:'还有一份材料没看',text:`你没有展开调查材料，其中涉及“${scene.evidenceKey}”。这是一处信息缺口；不能用本轮盈利把它补齐。`});
  if(tags.has('social')||tags.has('certainty')) items.push({kind:'notice',title:'这个依据还需要核实',text:'“别人赚了”或“语气确定”不能单独验证眼前的前提。记录它很有价值，也可以给它一个待核查标记。'});
  if(decision.investigated) items.push({kind:decision.update==='unchecked'?'notice':'neutral',title:'观点如何更新',text:({keep:'你选择保留原判断。保留并不自动错误；请说明新材料为何没有推翻前提。',reduce:'你选择降低把握或规模。请核对调整是否回应了新材料，而不只是情绪。',increase:'你选择提高把握或规模。请核对支撑增加的证据，以及仍然存在的不确定性。',unchecked:'你看了新材料，但暂未说明它怎样影响判断。这是下次可补充的一步。'})[decision.update]});
  if(decision.confidence>=75&&!decision.investigated) items.push({kind:'notice',title:'把握与资料是否匹配',text:'你对过程的把握较高，但一份相关材料尚未查看。这里提醒核对两者，不判断你的普遍能力。'});
  return items;
}
export function commit(state,input){
  if(state.phase!=='decision'||state.round>=SCENES.length) throw Error('当前不能重复提交决定。');
  if(!allowedStakes(state).includes(input.stake)) throw Error('投入超出可用资金或风险预算。');
  if(!Array.isArray(input.reasons)||!input.reasons.length||input.reasons.some(r=>!REASONS.some(x=>x.id===r))) throw Error('请至少记录一个决策理由。');
  if(!CONFIDENCES.includes(input.confidence)) throw Error('请记录你对决策过程的把握。');
  if(typeof input.investigated!=='boolean') throw Error('调查状态无效。');
  if(!['keep','reduce','increase','unchecked'].includes(input.update)) throw Error('请选择观点更新方式。');
  if(typeof input.note!=='string'||input.note.length>280) throw Error('笔记最多 280 字。');
  const decision={...input,reasons:[...new Set(input.reasons)],note:input.note.trim()};
  const scene=SCENES[state.round], outcome=draw(state.seed,state.round), pnl=pnlFor(decision.stake,outcome.bps);
  const afterCash=state.cash+pnl-scene.expense;
  const record={round:state.round,decision,outcome,pnl,beforeCash:state.cash,afterCash,expense:scene.expense,feedback:feedback(state,decision),paths:Array.from({length:5},(_,path)=>{const o=draw(state.seed,state.round,path);return {path,outcome:o,pnl:pnlFor(decision.stake,o.bps)};})};
  return {...state,phase:'result',cash:afterCash,reserve:state.reserve-scene.expense,spent:state.spent+scene.expense,lossUsed:state.lossUsed+Math.max(0,-pnl),history:[...state.history,record]};
}
export function advance(state){
  if(state.phase!=='result') throw Error('请先提交并查看本轮结果。');
  const round=state.round+1;return {...state,round,phase:round===SCENES.length?'summary':'decision'};
}
export function invariant(state){
  return state.cash+state.spent===INITIAL+state.history.reduce((a,r)=>a+r.pnl,0) && state.cash>=state.reserve && state.reserve>=0 && state.lossUsed<=RISK_BUDGET && state.lossUsed===state.history.reduce((a,r)=>a+Math.max(0,-r.pnl),0);
}
