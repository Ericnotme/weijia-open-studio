import {execFileSync} from 'node:child_process';
import {verify, challenges} from './checker.mjs';
const MAX=65536;
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:4*1024*1024,timeout:20000});
const match=/^project-checkmate\/submissions\/([A-Za-z0-9-]{1,39})\/SC-005\/(kxk-[0-9]{2})\.json$/;
const open=new Set(challenges.filter(c=>!c.reference).map(c=>c.id));
const sha=s=>{if(!/^[a-f0-9]{40}$/.test(s||''))throw Error('bad commit SHA');return s;};
function entries(commit){
  return git('ls-tree','-r','-z',sha(commit),'--','project-checkmate/submissions').split('\0').filter(Boolean).map(row=>{
    const i=row.indexOf('\t'),path=row.slice(i+1),meta=row.slice(0,i).split(' '),m=match.exec(path);
    if(!m)return null;
    if(meta[0]!=='100644'||meta[1]!=='blob')throw Error('certificate must be ordinary non-executable data');
    return {path,login:m[1],id:m[2],blob:sha(meta[2])};
  }).filter(Boolean);
}
function audit(e){
  if(!open.has(e.id))throw Error('reference or unknown challenge cannot score');
  const n=Number(git('cat-file','-s',e.blob));if(!Number.isInteger(n)||n<2||n>MAX)throw Error('certificate size outside limit');
  const data=JSON.parse(git('cat-file','blob',e.blob));
  const result=verify(data);if(result.challenge!==e.id)throw Error('path and challenge mismatch');
  return {login:e.login,id:e.id,blob:e.blob,path:e.path,nodes:result.nodes};
}
function audited(commit){const seen=new Set(),results=[];for(const e of entries(commit)){if(seen.has(e.id))throw Error('duplicate challenge: '+e.id);seen.add(e.id);results.push(audit(e));}return results;}
const mode=process.argv[2];
if(mode==='pr'){
  const base=sha(process.env.BASE_SHA),head=sha(process.env.HEAD_SHA),num=process.env.PR_NUMBER,author=process.env.PR_AUTHOR;
  if(!/^[0-9]+$/.test(num||'')||!/^[A-Za-z0-9-]{1,39}$/.test(author||''))throw Error('invalid PR metadata');
  git('fetch','--no-tags','--depth=1','origin','refs/pull/'+num+'/head');
  if(git('rev-parse','FETCH_HEAD').trim()!==head)throw Error('PR updated during check; retry');
  const changes=git('diff','--no-renames','--name-status','-z',base,head,'--').split('\0').filter(Boolean);
  if(changes.length!==2||changes[0]!=='A')throw Error('proof PR must add exactly one certificate and be up to date with base');
  const m=match.exec(changes[1]);if(!m||m[1].toLowerCase()!==author.toLowerCase())throw Error('certificate path must match PR author');
  const previous=audited(base);if(previous.some(e=>e.id===m[2]))throw Error('challenge already accepted');
  const entry=entries(head).find(e=>e.path===changes[1]);if(!entry)throw Error('missing certificate');
  console.log(JSON.stringify(audit(entry),null,2));
}else if(mode==='audit'){
  const commit=sha(git('rev-parse',process.argv[3]||'HEAD').trim());
  console.log(JSON.stringify({schema:'cm-board-v1',commit,verified:audited(commit)},null,2));
}else throw Error('use pr or audit');
