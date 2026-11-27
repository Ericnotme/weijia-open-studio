'use strict';
const el = id => document.getElementById(id);
const files='abcdefgh', names={K:'白王',B:'白象',P:'白兵',Q:'白后',R:'白车',N:'白马',k:'黑王'};
const glyph={K:'♚',B:'♝',P:'♟',Q:'♛',R:'♜',N:'♞',k:'♚'};
const verdict=v=>({ '-2':'黑负','-1':'规则相关和棋','0':'和棋','1':'规则相关胜势','2':'黑胜' }[v]);
let lesson=0, node, pending, history=[], marks=[], msg='';
function pieces(fen){
  const map={};
  fen.split(' ')[0].split('/').forEach((row,i)=>{let x=0;for(const c of row){if(/[1-8]/.test(c))x+=Number(c);else map[files[x++]+(8-i)]=c;}});
  return map;
}
function ray(a,b){
 const x=files.indexOf(a[0]), y=Number(a[1]), dx=files.indexOf(b[0])-x,dy=Number(b[1])-y;
 if(Math.abs(dx)!==Math.abs(dy))return [a,b];
 return Array.from({length:Math.abs(dx)+1},(_,i)=>files[x+i*Math.sign(dx)]+(y+i*Math.sign(dy)));
}
function choose(square){
 if(node.end||pending)return;
 const move=node.moves[square];
 if(move){
   history.push(node); pending=move;marks=[square];msg='你走了 '+move.san+'。'+(move.end?move.end+'。':'此着之后，双方最佳应对的结果为'+verdict(move.result)+'。');render();return;
 }
 const guard=node.blocked[square],current=pieces(node.fen);
 if(guard){marks=[square];for(const src of guard)marks.push(...ray(src,square));msg='黑王不能走到 '+square+'。'+guard.map(s=>s+' 的'+names[current[s]]+'控制该格').join('，')+'。';}
 else{marks=[];msg='黑王每次只走一格。请点黑王相邻的目标格。';}
 render();
}
function render(){
 const ex=examples[lesson],fen=pending?pending.fen:node.fen,map=pieces(fen),hide=el('hide').checked;
 el('board').replaceChildren();
 for(let r=8;r>0;r--)for(let f=0;f<8;f++){
  const sq=files[f]+r,p=map[sq],shown=hide&&p==='B'?null:p,b=document.createElement('button');
  b.type='button';b.dataset.square=sq;b.className='sq'+((f+r)%2===1?' dark':'')+(shown==='k'?' blackking':shown?' whitepiece':'')+(marks.includes(sq)?' path':'')+(marks[0]===sq?' hit':'')+(!pending&&el('legal').checked&&node.moves[sq]?' legal':'');
  b.textContent=shown?glyph[shown]+'\uFE0E':'';b.setAttribute('aria-label',sq+' '+(shown?names[shown]:'空格'));b.onclick=()=>choose(sq);el('board').appendChild(b);
 }
 el('step').textContent='第 '+(lesson+1)+' 题 ／ 共 3 题　·　'+(pending?(pending.end?'棋局结束':'白方应着'):node.end?'本例结束':'黑方走');
 el('title').textContent=ex.title;el('prompt').textContent=ex.question;el('why').textContent='本题起始局面：'+ex.why;
 el('independent').href='https://lichess.org/analysis/standard/'+fen.replaceAll(' ','_');
 el('response').textContent=msg||node.end||'黑王已选中。点一个目标格试走。';
 el('projection').textContent=hide?'现在只遮住白象。它仍在真实棋盘上，仍会攻击目标格。':'';
 el('value').textContent='当前摆法的表库结果为'+verdict(pending?pending.result:node.result)+'。'+(!pending&&node.rank!=null?'V5 抽象证书秩为 '+node.rank+'。':'');
 el('allmoves').textContent=pending||node.end?'':'合法选择　'+Object.values(node.moves).map(m=>m.san+'（'+verdict(m.result)+'）').join('、');
 el('reply').hidden=!pending||!!pending.end;el('undo').disabled=!history.length;
 [...el('tabs').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===lesson)));
}
function start(i){lesson=i;node=examples[i].root;pending=null;history=[];marks=[];msg='';el('hide').checked=false;el('legal').checked=false;el('explain').open=false;render();}
examples.forEach((ex,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'　'+ex.title;b.onclick=()=>start(i);el('tabs').appendChild(b);});
el('files').innerHTML=[...files].map(x=>'<span>'+x+'</span>').join('');
el('ranks').innerHTML=[...'87654321'].map(x=>'<span>'+x+'</span>').join('');
el('undo').onclick=()=>{if(history.length){node=history.pop();pending=null;marks=[];msg='已撤回到上一个黑方选择。';render();}};
el('reply').onclick=()=>{if(pending?.next){const reply=pending.reply;node=pending.next;pending=null;marks=[];msg='白方走了 '+reply+'。'+(node.end||'现在轮到你。');render();}};
el('reset').onclick=()=>start(lesson);el('hide').onchange=render;el('legal').onchange=render;start(0);
