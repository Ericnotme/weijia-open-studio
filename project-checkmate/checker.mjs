// Project CHECKMATE v1: data-only bounded KQK/KRK proof checker, no external libraries.
// Not a formal proof of move generator correctness or full chess rules.
function checkerLibrary(challenges){
  const VERSION="cm-kxk-v1";
  const coords=i=>[i%8,i>>3],sq=i=>"abcdefgh"[i%8]+(8-(i>>3)),inside=(x,y)=>x>=0&&x<8&&y>=0&&y<8;
  const own=(p,t)=>p!=="."&&(p===p.toUpperCase())===t;
  function fail(m){throw Error(m);}
  function rays(p){return p.toLowerCase()==="r"?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];}
  function check(b,t){const k=b.indexOf(t?"K":"k");if(k<0)fail("missing king");for(let i=0;i<64;i++){const p=b[i];if(p==="."||own(p,t))continue;const [x,y]=coords(i);for(const [dx,dy] of rays(p))for(let n=1;n<=7;n++){const xx=x+n*dx,yy=y+n*dy;if(!inside(xx,yy))break;const j=yy*8+xx;if(j===k)return true;if(b[j]!=="."||p.toLowerCase()==="k")break;}}return false;}
  function parse(fen){if(typeof fen!=="string")fail("missing FEN");const f=fen.split(" ");if(f.length!==6||!["w","b"].includes(f[1])||f.slice(2).join(" ")!=="- - 0 1")fail("only synthetic history-free roots");const rows=f[0].split("/");if(rows.length!==8)fail("bad ranks");const b=rows.flatMap(r=>{const a=[];for(const p of r){if(/[1-8]/.test(p))a.push(...Array(+p).fill("."));else if(/[KkQRqr]/.test(p))a.push(p);else fail("bad piece");}if(a.length!==8)fail("bad row");return a;});const t=f[1]==="w",m=b.filter(p=>p!==".");if(m.length!==3||m.filter(p=>p==="K").length!==1||m.filter(p=>p==="k").length!==1||m.filter(p=>/[QRqr]/.test(p)).length!==1)fail("KQK or KRK only");if(!m.some(p=>/[QRqr]/.test(p)&&own(p,t)))fail("attacker must have heavy piece");if(check(b,!t))fail("side not to move in check");return {b,t};}
  function legal(s){const out=new Map(),{b,t}=s;for(let i=0;i<64;i++){const p=b[i];if(!own(p,t))continue;const [x,y]=coords(i);for(const [dx,dy] of rays(p))for(let n=1;n<=7;n++){const xx=x+n*dx,yy=y+n*dy;if(!inside(xx,yy))break;const j=yy*8+xx,q=b[j];if(own(q,t)||q.toLowerCase()==="k")break;const next=b.slice();next[j]=p;next[i]=".";if(!check(next,t))out.set(sq(i)+sq(j),{b:next,t:!t});if(q!=="."||p.toLowerCase()==="k")break;}}return out;}
  function terminal(s,m){if(!m.size)return check(s.b,s.t)?(s.t?"black":"white"):"draw";if(s.b.filter(p=>p!==".").length===2)return "draw";return null;}
  function exact(obj,keys){return obj!==null&&typeof obj==="object"&&!Array.isArray(obj)&&Object.keys(obj).length===keys.length&&keys.every(k=>Object.prototype.hasOwnProperty.call(obj,k));}
  function verify(doc){if(!exact(doc,["schema","challenge","proof"])||doc.schema!==VERSION)fail("invalid certificate schema");const c=challenges.find(x=>x.id===doc.challenge);if(!c)fail("unknown fixed challenge");const root=parse(c.fen),attacker=root.t;let nodes=0;
    function visit(s,node,d){if(++nodes>30000)fail("node budget exceeded");const moves=legal(s),res=terminal(s,moves);if(res){if(res!==(attacker?"white":"black")||!exact(node,["mate"])||node.mate!==true)fail("leaf is not attacker checkmate");return;}if(d===0)fail("depth exhausted before mate");
      if(s.t===attacker){if(!exact(node,["move","next"])||typeof node.move!=="string"||!moves.has(node.move))fail("illegal or missing attacking move");visit(moves.get(node.move),node.next,d-1);}
      else{if(!exact(node,["replies"])||node.replies===null||typeof node.replies!=="object"||Array.isArray(node.replies))fail("missing defence map");const keys=Object.keys(node.replies);if(keys.length!==moves.size||keys.some(k=>!moves.has(k)))fail("defence coverage mismatch");for(const [move,next] of moves)visit(next,node.replies[move],d-1);}
    }visit(root,doc.proof,c.max);return {challenge:c.id,nodes,category:"calibration",max:c.max};}
  return {VERSION,challenges,parse,legal,terminal,verify};
}
const registry=[
  {
    "id": "kxk-01",
    "fen": "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
    "max": 1,
    "description": "White KQK / 白方后王对王"
  },
  {
    "id": "kxk-02",
    "fen": "7k/R7/6K1/8/8/8/8/8 w - - 0 1",
    "max": 1,
    "description": "White KRK / 白方车王对王"
  },
  {
    "id": "kxk-03",
    "fen": "7k/Q3K3/8/8/8/8/8/8 w - - 0 1",
    "max": 3,
    "description": "White KQK / 白方后王对王"
  },
  {
    "id": "kxk-04",
    "fen": "7k/4K3/8/R7/8/8/8/8 w - - 0 1",
    "max": 3,
    "description": "White KRK / 白方车王对王"
  },
  {
    "id": "kxk-05",
    "fen": "1q6/8/8/8/1k6/8/8/K7 b - - 0 1",
    "max": 3,
    "description": "Black KQK / 黑方后王对王"
  }
];
const lib=checkerLibrary(registry);
export const {VERSION,challenges,parse,legal,terminal,verify}=lib;
