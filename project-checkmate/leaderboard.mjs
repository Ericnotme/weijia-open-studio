import {verify,challenges,VERSION} from './checker.mjs';
const API='https://api.github.com/repos/Ericnotme/weijia-open-studio';
const REPO='https://github.com/Ericnotme/weijia-open-studio';
const BRANCH='project-checkmate', MAX=65536;
const pattern=/^project-checkmate\/submissions\/([A-Za-z0-9-]{1,39})\/SC-005\/(kxk-[0-9]{2})\.json$/;
const open=new Set(challenges.filter(c=>!c.reference).map(c=>c.id));
export function summarize(entries){
  const groups=new Map(),issues=[];
  for(const e of entries){const m=pattern.exec(e.path);if(!m)continue;
    const id=m[2];if(!open.has(id)){issues.push('非计分任务: '+id);continue;}
    if(!groups.has(id))groups.set(id,[]);groups.get(id).push({...e,login:m[1],id});}
  const valid=[];
  for(const [id,items] of groups){if(items.length!==1){issues.push('重复任务，等待复核: '+id);continue;}
    const e=items[0];try{if(e.mode!=='100644'||!/^[a-f0-9]{40}$/.test(e.sha)||e.error)throw Error('invalid source');
      const result=verify(e.doc);if(result.challenge!==id)throw Error('challenge mismatch');
      valid.push({login:e.login,id,path:e.path,sha:e.sha,nodes:result.nodes});
    }catch(_){issues.push('无效或无法读取的证书: '+id);}}
  const totals=new Map();
  for(const e of valid){const k=e.login.toLowerCase();if(!totals.has(k))totals.set(k,{login:e.login,score:0,proofs:[]});const r=totals.get(k);r.score++;r.proofs.push(e);}
  return {valid,issues,rows:[...totals.values()].sort((a,b)=>b.score-a.score||a.login.localeCompare(b.login))};
}
async function json(url){const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('GitHub HTTP '+response.status);return response.json();}
async function live(){
  const tree=await json(API+'/git/trees/'+BRANCH+'?recursive=1');
  if(tree.truncated||!Array.isArray(tree.tree)||!/^[a-f0-9]{40}$/.test(tree.sha||''))throw Error('incomplete tree');
  const candidates=tree.tree.filter(e=>pattern.test(e.path));
  if(candidates.length>30)throw Error('too many candidate files; maintainer review required');
  const entries=await Promise.all(candidates.map(async e=>{
    try{if(e.mode!=='100644'||e.type!=='blob'||e.size>MAX||e.size<2||!/^[a-f0-9]{40}$/.test(e.sha))throw Error('invalid blob');
      const blob=await json(API+'/git/blobs/'+e.sha);
      if(blob.sha!==e.sha||blob.encoding!=='base64'||blob.size>MAX||typeof blob.content!=='string'||blob.content.length>MAX*2)throw Error('invalid blob body');
      const data=Uint8Array.from(atob(blob.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
      if(data.length!==e.size)throw Error('size mismatch');
      return {...e,doc:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data))};
    }catch(err){return {...e,error:String(err)}}}));
  if(entries.some(e=>e.error))throw Error('one or more certificates could not be fetched; no partial ranking published');
  return {tree:tree.sha,...summarize(entries)};
}
function render(out){
  const body=document.querySelector('#board-rows');body.replaceChildren();
  for(const row of out.rows){const tr=document.createElement('tr');for(const value of [row.login,String(row.score),row.proofs.map(p=>p.id).join(', ')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}
    const td=document.createElement('td');for(const p of row.proofs){const a=document.createElement('a');a.href=REPO+'/blob/'+BRANCH+'/'+p.path.split('/').map(encodeURIComponent).join('/');a.textContent=p.id+' · '+p.sha.slice(0,8);a.rel='noopener noreferrer';td.append(a,document.createElement('br'));}tr.append(td);body.append(tr);}
  if(!out.rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='当前没有通过验证且已合并的计分证书。';tr.append(td);body.append(tr);}
  document.querySelector('#board-count').textContent=String(out.valid.length);
  document.querySelector('#board-warnings').textContent=out.issues.join('；');
  const list=document.querySelector('#open-challenges');
  for(const el of list.querySelectorAll('[data-task]'))el.querySelector('span').textContent=out.valid.some(e=>e.id===el.dataset.task)?'已验收':'开放';
}
function init(){
 const list=document.querySelector('#open-challenges');
 for(const c of challenges.filter(c=>!c.reference)){const li=document.createElement('li');li.dataset.task=c.id;const label=document.createElement('strong');label.textContent=c.id+' · '+c.description+' · 最多 '+c.max+' 半步';const status=document.createElement('span');status.textContent='待查询';status.className='muted';const code=document.createElement('code');code.textContent=c.fen;li.append(label,document.createElement('br'),code,document.createElement('br'),status);list.append(li);}
 const button=document.querySelector('#refresh-board'),status=document.querySelector('#board-status');let running=false,last='';
 async function refresh(){if(running)return;running=true;button.disabled=true;status.textContent='正在读取 GitHub 已合并证书…';try{const out=await live();render(out);last=new Date().toLocaleString('zh-CN');status.textContent='已核验 '+last+' · 树 '+out.tree.slice(0,12)+' · '+VERSION;}
 catch(err){status.textContent=(last?'刷新失败，保留上次已核验快照 '+last:'榜单暂不可用，未核验数据不显示')+' · '+String(err).slice(0,150);}
 finally{running=false;button.disabled=false;}}
 button.addEventListener('click',refresh);refresh();setInterval(()=>{if(!document.hidden)refresh()},300000);
 const input=document.querySelector('#certificate'),output=document.querySelector('#certificate-result');
 document.querySelector('#verify-certificate').addEventListener('click',()=>{try{if(input.value.length>MAX)throw Error('证书过大');const out=verify(JSON.parse(input.value));output.textContent='通过：'+out.challenge+'，检查 '+out.nodes+' 个节点。仅本地核验，不自动计分。';}catch(e){output.textContent='拒绝：'+String(e).slice(0,200);}});
}
if(typeof document!=='undefined')init();
