(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.Poker,typeof module==='object'&&module.exports?require('./trainer.js'):root.PokerTrainer);if(typeof module==='object'&&module.exports)module.exports=api;else root.PokerLearning=api;})(typeof self!=='undefined'?self:this,function(P,T){
'use strict';
const VERSION=1,DELAY=24*60*60*1000;
// Separate authored pools. No item from the legacy trainer or five-question challenge.
const pools={
 train:[
  {id:'learn-price',concept:'底池赔率',hole:'Ks Kc',board:'Qh 8d 5c 3h 2d',pot:180,bet:30,range:'QQ,88,55,AQ,KQ,QJ',note:'先用全下额除以跟注后的总底池，再与范围份额比较。不是必须超过 50%。'},
  {id:'learn-range',concept:'范围与阻断牌',hole:'Ah Jc',board:'Jh 8h 5h 3d 2s',pot:120,bet:80,range:'JJ,88,55,AhKh,AhQh,KhQh,KhTh,QhTh,AsKs:50',note:'红桃 A 已在你手里。含它的对手组合必须移除；未列出的手牌也不能凭空加入题设范围。'},
  {id:'learn-tie',concept:'平局的份额',hole:'2c 4d',board:'9s Ts Js Qs Ks',pot:90,bet:60,range:'AA,88,76s',note:'公共同花顺会与部分手牌平分；持黑桃 A 的组合更大。平局贡献一半底池份额。'}
 ],
 test:[
  {id:'test-price',concept:'底池赔率',hole:'Js Jd',board:'Th 7c 4d 3s 2h',pot:60,bet:150,range:'TT,77,44,AT:20,KT:20,QTs:20',note:'高价格提高跟注门槛。只比较给定范围的精确份额与当前价格。'},
  {id:'test-range',concept:'范围与阻断牌',hole:'Ac Td',board:'Th 9c 6c 4d 2s',pot:100,bet:70,range:'TT,99,66,AcKc,AcQc,AcJc,KcQc,KcJc,QcJc',note:'草花 A 阻断了部分同花组合。要逐个排除已知牌，不把范围名称当成等概率的一项。'},
  {id:'test-tie',concept:'平局的份额',hole:'Qh 3d',board:'8s 8h 8c 8d 5s',pot:140,bet:80,range:'AA,KK,QQ,JJ',note:'公共四条仍需要第五张踢脚：Q 可以赢 J、平 Q，却会输给 A 或 K。'}
 ],
 retest:[
  {id:'later-price',concept:'底池赔率',hole:'Ts Td',board:'9h 6c 4h 3d 2c',pot:210,bet:25,range:'99,66,44,A9,K9,Q9',note:'先算跟注成本占最终底池的比例，再看给定范围中的胜、平、负。'},
  {id:'later-range',concept:'范围与阻断牌',hole:'Ad Kh',board:'Kc 9d 7d 4s 2h',pot:80,bet:100,range:'KK,99,77,AdQd,AdJd,AdTd,QdJd,QdTd,JdTd',note:'方块 A 移除含它的组合；它不是自动支持跟注的理由。'},
  {id:'later-tie',concept:'平局的份额',hole:'Ah 2d',board:'4c 5h 6s 7d 8c',pot:160,bet:90,range:'AA,KK,QQ,JT,T9,98',note:'公共顺子不保证平分。对手含 9 时可能形成更高顺子。'}
 ]};
const reasons={price:'跟注价格与范围份额',range:'合法组合与阻断牌',tie:'胜、平、负和最佳五张',intuition:'目前主要凭直觉'};
const copy=x=>JSON.parse(JSON.stringify(x));
function order(seed,phase){const list=[...pools[phase]],rng=P.seeded((seed^{train:101,test:202,retest:303}[phase])>>>0);for(let i=list.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function create(seed,at=Date.now()){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295||!Number.isFinite(at)||at<0)throw Error('学习种子或时间无效。');
 return{version:VERSION,seed,startedAt:at,phase:'train',index:0,training:[],answers:[],retestAnswers:[],completedAt:null,testInterrupted:false,retestInterrupted:false,events:[]};
}
function question(s){if(!['train','test','retest'].includes(s.phase))return null;return order(s.seed,s.phase)[s.index];}
function publicQuestion(s){const q=question(s);if(!q)return null;return{id:q.id,hole:q.hole,board:q.board,pot:q.pot,bet:q.bet,range:q.range};}
function answer(e){if(!['call','fold'].includes(e.action)||!Object.hasOwn(reasons,e.reason))throw Error('请先选择行动和判断理由。');const text=typeof e.text==='string'?e.text.trim().slice(0,400):'';return{action:e.action,reason:e.reason,text,at:e.at};}
function transition(state,event){
 const s=copy(state),e=copy(event);if(!Number.isFinite(e.at)||e.at<s.startedAt||e.at<(s.events.at(-1)?.at||0))throw Error('记录时间无效。');
 const q=question(s),current=s.training.at(-1),active=current?.id===q?.id?current:null;
 if(e.type==='first'&&s.phase==='train'&&!active){s.training.push({id:q.id,initial:answer(e),hints:0,final:null});}
 else if(e.type==='hint'&&s.phase==='train'&&active&&!active.final&&active.hints<2){active.hints++;}
 else if(e.type==='final'&&s.phase==='train'&&active&&!active.final){active.final=answer(e);}
 else if(e.type==='next'&&s.phase==='train'&&active?.final){s.index++;if(s.index===3){s.phase='test';s.index=0;}}
 else if(e.type==='answer'&&['test','retest'].includes(s.phase)){
  const target=s.phase==='test'?s.answers:s.retestAnswers;target.push({id:q.id,...answer(e),independent:!(s.phase==='test'?s.testInterrupted:s.retestInterrupted)});s.index++;
  if(s.index===3){if(s.phase==='test'){s.phase='complete';s.completedAt=e.at;}else s.phase='finished';}
 }else if(e.type==='interrupt'&&['test','retest'].includes(s.phase)&&!(s.phase==='test'?s.testInterrupted:s.retestInterrupted)){s[s.phase==='test'?'testInterrupted':'retestInterrupted']=true;
 }else if(e.type==='retest'&&s.phase==='complete'&&e.at>=s.completedAt+DELAY){s.phase='retest';s.index=0;}
 else throw Error('当前步骤不可执行这个操作。');
 s.events.push(e);return s;
}
function pack(s){return{version:VERSION,seed:s.seed,startedAt:s.startedAt,events:s.events};}
function restore(data){if(!data||data.version!==VERSION||!Array.isArray(data.events)||data.events.length>40)throw Error('学习记录格式无效。');return data.events.reduce(transition,create(data.seed,data.startedAt));}
function trainingFeedback(s){const q=question(s),a=s.training.at(-1);if(s.phase!=='train'||!a||a.id!==q.id||!a.final)return null;return{question:copy(q),result:T.solve(q),attempt:copy(a),initial:T.grade(T.solve(q),a.initial.action),final:T.grade(T.solve(q),a.final.action)};}
function hints(s){const q=question(s),a=s.training.at(-1);if(s.phase!=='train'||!a||a.id!==q.id||a.final)return[];const prompts={
 '底池赔率':['原底池、对手全下、你补上的跟注各是多少？跟注后的总底池是多少？','跟注门槛 = 全下额 ÷（原底池 + 2 × 全下额）。再比较按合法组合加权的份额；不要先看答案。'],
 '范围与阻断牌':['哪些牌已在手里或公共牌上？对手范围里有没有含这些牌的组合？','先排除重复已知牌，再计算每个剩余组合的权重。范围中的 :50 表示该组合权重是完整频率的一半。'],
 '平局的份额':['双方各自最佳五张是什么？公共牌足够强时，手里的牌一定会用到吗？','份额 = 赢牌概率 + 平局概率 ÷ 2。检查踢脚和更高顺子，再与跟注价格比较。']};return prompts[q.concept].slice(0,a.hints);}
function diagnostic(s){const a=s.training.at(-1);if(s.phase!=='train'||a?.id!==question(s)?.id)return'';return'复查线索：你选了“'+reasons[a.initial.reason]+'”。这只是根据所选理由给出的检查方向，不能确定你是否理解；请用组合和计算验证。';}
function review(s,phase='test'){
 if(!['test','retest'].includes(phase))throw Error('未知测验。');
 if(phase==='test'&&!['complete','finished'].includes(s.phase)||phase==='retest'&&s.phase!=='finished')return null;
 const answers=phase==='test'?s.answers:s.retestAnswers;if(answers.length!==3)return null;
 return order(s.seed,phase).map(q=>{const a=answers.find(x=>x.id===q.id),r=T.solve(q);return{question:copy(q),answer:copy(a),result:r,grade:T.grade(r,a.action)};});
}
function firstIndependent(sessions){const result={};for(const s of sessions)for(const a of [...s.answers,...s.retestAnswers])if(a.independent&&!result[a.id])result[a.id]={...copy(a),seed:s.seed};return result;}
return{VERSION,DELAY,reasons,create,transition,restore,pack,publicQuestion,trainingFeedback,hints,diagnostic,review,firstIndependent};
});
