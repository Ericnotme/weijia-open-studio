export const INTERESTS = ['阅读','散步','电影','音乐','运动','旅行','展览','做饭','下棋','跳舞'];
const WORDS = {阅读:/读书|阅读|书店|小说/,散步:/散步|走走|徒步|公园/,电影:/电影|影院/,音乐:/音乐|演唱会|弹琴|吉他/,运动:/运动|健身|羽毛球|乒乓球|跑步|游泳/,旅行:/旅行|旅游|出游/,展览:/展览|看展|美术馆|博物馆/,做饭:/做饭|烹饪|下厨/,下棋:/下棋|象棋|围棋/,跳舞:/跳舞|舞蹈|zumba/i};
export const DEFAULT_PROFILE = {name:'阿远',city:'成都',rhythm:'偏早睡',children:'希望养育孩子',communication:'愿意及时沟通',intro:'我是阿远，住在成都。平时喜欢读书、散步，也喜欢看电影。周末喜欢临时发现一家小书店。作息偏早，希望找到一个愿意认真沟通、一起探索日常的人。未来想要孩子，但希望一起商量育儿分工。',interests:['阅读','散步','电影']};
export const PEOPLE = [
{id:'xia',name:'夏宁',city:'成都',rhythm:'偏晚睡',children:'还没想好',communication:'需要一点独处再聊',interests:['阅读','散步','展览'],intro:'喜欢逛独立书店、看小型展览。工作日比较忙，周末会沿河散步。遇到分歧想先自己想一想，再认真聊。对婚姻是认真的，关于孩子还在探索自己的想法。',tone:'orange',x:'喜欢把一座城市，慢慢读成自己的故事。'},
{id:'zhou',name:'周野',city:'上海',rhythm:'偏早睡',children:'不打算养育孩子',communication:'愿意及时沟通',interests:['运动','旅行','电影'],intro:'早起跑步，周末会看电影或者去城市周边走走。现在工作和长期生活都在上海，不打算养育孩子。喜欢把期待直接说清楚，也愿意为两个人的时间提前安排。',tone:'green',x:'把好奇心放进背包，也把生活安排得踏实。'}
];
export function inferInterests(text){
 const clauses=String(text).split(/[。！？；\n]/).filter(x=>!/(不喜欢|不爱|讨厌|不感兴趣|从不|不看|不读|不去|不做|不想)/.test(x));
 return INTERESTS.filter(i=>clauses.some(x=>WORDS[i].test(x)));
}
export function validateProfile(input){
 if(!input||typeof input!=='object')throw new Error('请填写生活画像。');
 const name=String(input.name??'').trim(),intro=String(input.intro??'').trim();
 if(!name||name.length>16)throw new Error('称呼需为 1–16 个字。');
 if(intro.length<12||intro.length>1200)throw new Error('请写 12–1200 个字的介绍。');
 const choices={city:['成都','上海','北京','广州','深圳','杭州','其他 / 未定'],rhythm:['偏早睡','偏晚睡','时间弹性'],children:['希望养育孩子','不打算养育孩子','还没想好'],communication:['愿意及时沟通','需要一点独处再聊','一起商量方式']};
 for(const [key,values]of Object.entries(choices))if(!values.includes(input[key]))throw new Error('请从选项中选择'+key+'。');
 if(!Array.isArray(input.interests)||input.interests.some(x=>!INTERESTS.includes(x)))throw new Error('兴趣选项无效。');
 return {name,intro,...Object.fromEntries(Object.keys(choices).map(k=>[k,input[k]])),interests:[...new Set(input.interests)]};
}
export function portrait(p){
 const h=p.interests;
 let x='愿意把真实的自己，慢慢讲给另一个人。';
 if(h.includes('阅读')&&h.includes('散步'))x='会把平常的周末，过成小小的探索。';
 else if(h.includes('下棋')&&(h.includes('音乐')||h.includes('跳舞')))x='有认真思考的一面，也有被节奏点亮的一面。';
 else if(h.includes('运动')&&h.includes('旅行'))x='在出发与行动中，发现生活的新鲜感。';
 else if(h.includes('做饭'))x='会把日常的烟火气，变成可以分享的心意。';
 else if(h.length)x=`愿意把${h.slice(0,2).join('与')}里的快乐，分享给另一个人。`;
 return {x,activity:h.length?`一起试试${h.slice(0,3).join('、')}，也留一点各自喜欢的空间。`:'先交换各自喜欢的小事，再找到想一起尝试的活动。',relationship:p.communication==='需要一点独处再聊'?'有分歧时留一点缓冲，再约好时间认真聊。':p.communication==='愿意及时沟通'?'遇到分歧，愿意及时表达和听对方说。':'一起找到舒服的表达方式，让分歧有机会被讨论。'};
}
export function introduction(p){const t=portrait(p);return `你好，我是${p.name}，目前${p.city==='其他 / 未定'?'生活城市还未确定':`在${p.city}生活`}。\n\n${t.x}\n${t.activity}\n\n我的作息${p.rhythm.replace('偏','偏向')}。${t.relationship}\n关于孩子：${p.children}，也愿意坦诚了解对方的想法。\n\n希望先从一次轻松的见面开始，看看彼此是否愿意继续了解。`;}
export function compare(p,q){
 const common=p.interests.filter(x=>q.interests.includes(x));
 const issues=[];
 if(p.city==='其他 / 未定')issues.push({kind:'待确认',topic:'生活城市',detail:`对方目前在${q.city}。你的城市尚未确定，需要先聊见面条件和长期打算。`});
 else if(p.city!==q.city)issues.push({kind:'明显分歧',topic:'生活城市',detail:`你在${p.city}，${q.name}在${q.city}。谁能出行、多久见一次，以及是否接受迁居，需要先谈。`});
 if(p.children==='还没想好'||q.children==='还没想好')issues.push({kind:'待确认',topic:'婚育期待',detail:`你：${p.children}；对方：${q.children}。这是开放问题，需要直接交流，不能用爱好替代答案。`});
 else if(p.children!==q.children)issues.push({kind:'明显分歧',topic:'婚育期待',detail:`你：${p.children}；对方：${q.children}。双方意愿冲突，建议先确认是否有共同未来，不预设谁会改变。`});
 if(p.rhythm!==q.rhythm)issues.push({kind:'可商量',topic:'作息节奏',detail:`你${p.rhythm}，对方${q.rhythm}。可以先约一个双方都舒服的见面和聊天时间。`});
 if(p.communication!==q.communication)issues.push({kind:'可商量',topic:'沟通方式',detail:`你${p.communication}，对方${q.communication}。试着约定“需要多久缓冲，什么时候继续聊”。`});
 const shared=common.length?`你们都选择了${common.join('、')}。可以从一次${common.includes('阅读')?'书店闲逛':common.includes('散步')?'河边散步':common.includes('电影')?'电影后的聊天':`${common[0]}体验`}开始，看看话题能否自然展开。`:'已确认的兴趣还没有重合。先交换各自愿意尝试的一件事，再决定有没有兴趣见面。';
 return {common,issues,shared,sameCity:p.city===q.city,hardConflict:issues.some(x=>x.kind==='明显分歧'),statement:issues.some(x=>x.kind==='明显分歧')?'先看重要分歧，再决定要不要靠近。':'有了好奇的起点，也有需要慢慢聊的问题。'};
}
export const DATE_TYPES=['散步与咖啡','书店闲逛','小型展览'];
export function makePlan(profile,person,options){
 const c=compare(profile,person);
 const o={...options};
 if(!DATE_TYPES.includes(o.type))throw new Error('请选择一个见面方式。');
 if(![60,90].includes(Number(o.duration)))throw new Error('时长请选择 60 或 90 分钟。');
 if(![80,150].includes(Number(o.budget)))throw new Error('预算选项无效。');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(o.date)||!/^\d{2}:\d{2}$/.test(o.time))throw new Error('请选择日期和时间。');
 const date=new Date(`${o.date}T${o.time}:00`);
 if(Number.isNaN(date.valueOf())||date.getFullYear()!==Number(o.date.slice(0,4))||date.getMonth()+1!==Number(o.date.slice(5,7))||date.getDate()!==Number(o.date.slice(8)))throw new Error('日期无效。');
 if(date.getTime()<Date.now())throw new Error('请选择未来的见面时间。');
 if(!['双方另行商量','成都','上海','北京','广州','深圳','杭州'].includes(o.city))throw new Error('请确认见面城市。');
 const place=o.type==='书店闲逛'?'有座位的公共书店':o.type==='小型展览'?'交通方便的小型公共展馆':'有树荫的公共步道与附近咖啡店';
 const activity=o.type==='书店闲逛'?'各找一本想介绍给对方的书':o.type==='小型展览'?'各选一件好奇的作品，交换感受':'沿步道慢慢走，分享最近的小发现';
 const question=c.common.length?`最近一次${c.common[0]}，有什么让你记住的小细节？`:'最近一件让你觉得生活挺有意思的小事是什么？';
 const end=new Date(date.getTime()+Number(o.duration)*60000);
 return {type:o.type,duration:Number(o.duration),budget:Number(o.budget),city:o.city,date:o.date,time:o.time,start:date.toISOString(),end:end.toISOString(),place,question,preflight:c.hardConflict?'在确定行程之前，先讨论上一步的城市或婚育分歧。':!c.sameCity?'先商量见面城市和出行安排。':'先确认双方时间与具体地点。',timeline:[{offset:0,title:'留一点轻松的开场',detail:'到公共地点碰面，确认彼此方便的结束时间。'},{offset:10,title:activity,detail:'允许安静，也不用一次讲完自己。'},{offset:Number(o.duration)-20,title:'坐下来聊一会儿',detail:question},{offset:Number(o.duration)-5,title:'给下一次留个真实的答案',detail:'如果还想了解，可以提出下一次；也可以礼貌结束。'}]};
}
export function planText(p,q,plan){return `有共鸣｜${p.name} × ${q.name}的见面提案（虚构人物体验）\n\n${plan.date} ${plan.time} · ${plan.duration} 分钟\n城市：${plan.city}\n方式：${plan.type}\n地点建议：${plan.place}（具体地点由双方确认）\n预算参考：每人不超过 ¥${plan.budget}，实际费用与分摊需协商\n\n${plan.preflight}\n\n${plan.timeline.map(x=>`第 ${x.offset} 分钟｜${x.title}\n${x.detail}`).join('\n\n')}\n\n此为未发送、未预约的草稿；需双方同意后再安排。`;}
function escapeICS(s){return s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function foldICS(s){const lines=[];let line='',bytes=0;for(const char of s){const n=new TextEncoder().encode(char).length;if(bytes+n>73){lines.push(line);line=' ';bytes=1;}line+=char;bytes+=n;}lines.push(line);return lines.join('\r\n');}
export function calendar(plan){const utc=s=>s.replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Resonance//Date Proposal//ZH','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${globalThis.crypto.randomUUID()}@resonance.local`,`DTSTAMP:${utc(new Date().toISOString())}`,`DTSTART:${utc(plan.start)}`,`DTEND:${utc(plan.end)}`,`SUMMARY:${escapeICS(`见面提案草稿 · ${plan.type}`)}`,`LOCATION:${escapeICS(`${plan.city} · ${plan.place}（待确认）`)}`,`DESCRIPTION:${escapeICS(`仅为个人草稿，未发送邀请。${plan.preflight}\n开场问题：${plan.question}`)}`,'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR'];return lines.map(foldICS).join('\r\n')+'\r\n';}
