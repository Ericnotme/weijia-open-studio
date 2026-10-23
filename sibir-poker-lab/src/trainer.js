(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.Poker);if(typeof module==='object'&&module.exports)module.exports=api;else root.PokerTrainer=api;})(typeof self!=='undefined'?self:this,function(P){
'use strict';
function cards(text,n){const parts=text.trim().split(/\s+/);if(parts.length!==n||parts.some(t=>!/^[2-9TJQKA][shcd]$/.test(t)))throw Error('请使用 '+n+' 张牌，例如 As Kd；T 表示 10。');return parts.map(P.code);}
function solve(s){
 const hole=cards(s.hole,2),board=cards(s.board,5),known=new Set([...hole,...board]);if(known.size!==7)throw Error('手牌与公共牌不能重复。');
 const pot=Number(s.pot),bet=Number(s.bet);if(!Number.isFinite(pot)||!Number.isFinite(bet)||pot<=0||bet<=0||pot>1000000||bet>1000000)throw Error('底池与全下额须大于 0，且不超过 1,000,000。');
 const pairs=new Map(),rank='23456789TJQKA';let tokens=s.range.trim().split(/[\s,，]+/);if(!tokens[0])throw Error('请输入对手范围。');
 for(const token of tokens){const exact=token.match(/^([2-9TJQKA][shcd])([2-9TJQKA][shcd])(?::(\d+(?:\.\d+)?))?$/);if(exact){const x=P.code(exact[1]),y=P.code(exact[2]),w=exact[3]===undefined?1:Number(exact[3])/100;if(x===y||w>1)throw Error('具体组合不可重复牌，权重不能超过 100。');if(w){const key=[x,y].sort((a,b)=>a-b).join('-');pairs.set(key,{a:x,b:y,w:Math.max(w,pairs.get(key)?.w||0)});}continue;}const m=token.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)(?::(\d+(?:\.\d+)?))?$/);if(!m)throw Error('无法识别 '+token+'。支持 AA、AKs、AQo、AKs:50，不支持 + 或区间。');const a=rank.indexOf(m[1]),b=rank.indexOf(m[2]),kind=m[3],w=m[4]===undefined?1:Number(m[4])/100;if(w<0||w>1||(a===b&&kind))throw Error('范围权重须为 0–100；对子无需 s/o。');if(!w)continue;
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){if(a===b&&i>=j||kind==='s'&&i!==j||kind==='o'&&i===j)continue;const x=i*13+a,y=j*13+b,key=[x,y].sort((u,v)=>u-v).join('-');pairs.set(key,{a:x,b:y,w:Math.max(w,pairs.get(key)?.w||0)});}}
 const hero=P.evaluate([...hole,...board]);let total=0,win=0,tie=0;const combos=[];
 for(const p of pairs.values()){if(known.has(p.a)||known.has(p.b))continue;const opp=P.evaluate([p.a,p.b,...board]),outcome=hero>opp?'win':hero===opp?'tie':'lose';total+=p.w;if(outcome==='win')win+=p.w;if(outcome==='tie')tie+=p.w;combos.push({...p,outcome});}
 if(!total)throw Error('排除已知牌后，范围没有合法组合。');const equity=(win+tie/2)/total,ev=equity*(pot+2*bet)-bet;return{hole,board,equity,ev,odds:bet/(pot+2*bet),best:ev>=0?'call':'fold',total,combos,blocked:pairs.size-combos.length,win:win/total,tie:tie/total,lose:(total-win-tie)/total};
}
const raw=[
 ['bluff1','抓诈唬','顶对，面对极化范围','As Qd','Ah 9c 6d 3s 2h',100,100,'AA,99,66,33,54s,KJs,KTs,QJs','价值牌与落空听牌都要按合法组合计数，不能只数牌型名称。'],
 ['bluff2','抓诈唬','同一顶对，更少诈唬','As Qd','Ah 9c 6d 3s 2h',100,100,'AA,99,66,33,54s,KJs:20,KTs:20,QJs:20','牌面没有变化，对手诈唬频率降低就可能改变正确行动。'],
 ['price1','底池赔率','超对，便宜的跟注','Qs Qd','Jh 8c 6d 3s 2h',200,40,'JJ,88,66,AJ,KJ,QJ,T9s','跟注门槛来自价格，不是“至少有一半胜率”。'],
 ['price2','底池赔率','超对，巨大压力','Qs Qd','Jh 8c 6d 3s 2h',100,300,'JJ,88,66,AJ:10,KJ:10,QJ:10,T9s:10','下注越大，需要赢得底池的频率越高。'],
 ['block1','阻断牌','持有落空同花的 A','As Qd','Qh 9s 6s 3d 2c',100,50,'QQ,99,66,33,AsKs,AsJs,AsTs,KsJs,KsTs,JsTs','你持有的 A 会移除一部分对手可能用来诈唬的组合。'],
 ['block2','阻断牌','换一张 A，范围会变吗','Ah Qd','Qh 9s 6s 3d 2c',100,50,'QQ,99,66,33,AsKs,AsJs,AsTs,KsJs,KsTs,JsTs','换成红桃 A 后，黑桃 A 的落空听牌组合重新进入范围，抓诈唬的价值随之改变。'],
 ['split1','平分底池','公共牌皇家同花顺','2h 3d','As Ks Qs Js Ts',100,100,'AA,KK,QQ,JJ,TT,98s','平局也有价值：跟注后拿回一半总底池，不能把平局当输牌。'],
 ['split2','平分底池','公共顺子，对手偶有更大顺子','As Ad','5h 6d 7s 8c 9h',100,100,'AA,KK,QQ,JT,T9,98','大部分组合可能平分，但带 T 的组合会击败公共顺子。'],
 ['price3','底池赔率','顶对，面对半池全下','Kh Qd','Ks 8c 6d 3s 2h',100,50,'AA,KK,88,66,AK,KJ,KT,QJs','先比较范围胜率和价格，再决定是否抓诈唬。'],
 ['bluff3','抓诈唬','三条，面对强价值范围','9h 9d','As Ks 9c 7s 2s',100,150,'AQs,AJs,ATs,KQs,KJs,QJs,AA,KK','自己的绝对牌型强，不代表对对手的下注范围足够强。'],
 ['block3','阻断牌','最大的同花','As Qd','Ks 9s 6s 3s 2c',100,100,'AA,KK,99,66,KQ,QJ,JT','河牌牌力确定后，移除已知牌并比较每一个对手组合。'],
 ['split3','平分底池','公共四条，踢脚决定胜负','Kh Qd','7s 7h 7c 7d 2h',100,100,'AA,AK,AQ,AJ,KQ,QJ','公共四条不一定平分；第五张踢脚仍然决定结果。']
];
const cases=raw.map(([id,tag,title,hole,board,pot,bet,range,note])=>({id,tag,title,hole,board,pot,bet,range,note}));
function grade(result,action){if(!['call','fold'].includes(action))throw Error('未知行动');const loss=Math.max(0,result.ev)-(action==='call'?result.ev:0);return{correct:loss<1e-8,loss};}
function stats(attempts){const first=new Map(),latest=new Map();for(const a of attempts){if(!first.has(a.id))first.set(a.id,a);latest.set(a.id,a);}return{count:attempts.length,firstCount:first.size,accuracy:first.size?[...first.values()].filter(a=>a.correct).length/first.size:null,meanLoss:attempts.length?attempts.reduce((s,a)=>s+a.loss,0)/attempts.length:0,wrong:[...latest.values()].filter(a=>!a.correct).map(a=>a.id)};}
return{solve,cases,grade,stats};
});
