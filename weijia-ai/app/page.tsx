"use client";
import {useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {registerDraftTool} from '@/lib/webmcp.mjs';
import {ArrowUp,Square,Plus,MessageCircle,Music2,Compass,ShieldCheck,ArrowUpRight,Check,RotateCw,Type} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {ChatController} from '@/lib/chat-controller.mjs';
type Message={role:'user'|'assistant',content:string,source?:string};
type Status={ready:boolean,mode:string,model?:string,reason:string};
const starters=[{icon:'♫',title:'聊聊爵士',text:'用一个生活中的比喻解释爵士乐里的即兴。',note:'节奏之外，还有什么？'}, {icon:'♞',title:'棋盘边的想法',text:'下棋总担心走错一步，怎么练习做决定？',note:'从一局棋聊到选择'}, {icon:'↗',title:'打开机会地图',text:'设计一张机会地图，应该先看哪些维度？',note:'把大问题拆成可走的路'}, {icon:'✳',title:'把 AI 讲明白',text:'AI 给了答案，怎样判断自己真的理解了？',note:'别只记答案，试着问为什么'}];
export default function Home(){
 const [status,setStatus]=useState<Status>({ready:false,mode:'checking',reason:'正在检查连接…'});
 const [messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[large,setLarge]=useState(false),[embed,setEmbed]=useState(false);
 const controller=useRef(new ChatController()),end=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),started=useRef(0),history=useRef<Message[]>([]);
 async function check(){try{const r=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error();setStatus(await r.json());}catch{setStatus({ready:false,mode:'offline',reason:'连接暂时不可用。请稍后重新检查。'});}}
 useEffect(()=>registerDraftTool((document as Document & {modelContext?:unknown}).modelContext,(text:string)=>flushSync(()=>setDraft(text))),[]);
 useEffect(()=>{void check();setEmbed(new URLSearchParams(location.search).get('embed')==='1');return()=>controller.current.cancel();},[]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'end'});},[messages,busy]);
 function stop(){controller.current.cancel();setBusy(false);setNotice('已停止。本轮未完成的内容不会进入后续上下文。');}
 function reset(){controller.current.cancel();setBusy(false);setMessages([]);history.current=[];started.current=0;setDraft('');setNotice('已清空本页会话。');input.current?.focus();}
 async function send(){
   const text=draft.trim();if(!text||!status.ready)return;
   const ticket=controller.current.begin();if(!ticket)return;
   if(history.current.length>=24 || (started.current&&Date.now()-started.current>600000)){controller.current.finish(ticket);setNotice('本轮已达到 12 次回复或 10 分钟上限，请开始新对话。');return;}
   if(!started.current)started.current=Date.now();
   const proposed=[...history.current,{role:'user' as const,content:text}];
   setMessages(proposed);setDraft('');setNotice('');setBusy(true);
   const timer=setTimeout(()=>{if(controller.current.current(ticket)){stop();setNotice('等待超过 25 秒，已停止。可以重新发送。');}},25000);
   try{const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:proposed}),signal:ticket.abort.signal});const result=await r.json() as {text?:string,error?:string,source?:string};if(!r.ok)throw new Error(result.error||'暂时无法回复');if(!controller.current.current(ticket))return;
      if(typeof result.text!=='string'||!result.text.trim())throw new Error('没有收到回复');
      const next=[...proposed,{role:'assistant' as const,content:result.text,source:result.source}];history.current=next;setMessages(next);
   }catch(error){if(controller.current.current(ticket)){setNotice(error instanceof Error?error.message:'发送失败');setDraft(text);}}
   finally{clearTimeout(timer);if(controller.current.current(ticket)){controller.current.finish(ticket);setBusy(false);}}
 }
 return <main className={`workbench ${large?'large-type':''} ${embed?'embedded':''}`}>
  <aside className="sidebar">
   <a className="brand" href="/"><span className="brand-mark">w·</span><span>鲜唯佳<small>PERSONA LAB / 01</small></span></a>
   <Button className="new-chat" variant="outline" onClick={reset}><Plus size={18}/>开始新对话</Button>
   <div className="nav-label">这一刻，聊点什么</div>
   <div className="active-nav"><MessageCircle size={18}/>自由聊天<span className="small-dot"/></div>
   <nav className="side-links" aria-label="话题">{[Music2,MessageCircle,Compass].map((Icon,i)=><button key={i} onClick={()=>{setDraft(starters[i].text);input.current?.focus();}}><Icon size={18}/>{starters[i].title}</button>)}</nav>
   <div className="side-footer"><ShieldCheck size={20}/><strong>聊得自在，边界清楚。</strong><p>这是 AI 分身。没有私人聊天访问权限，也不能代替本人作出承诺。</p><span>短期会话 · 无默认录音</span></div>
  </aside>
  <section className="conversation" aria-label="聊天工作台">
   <header className="topbar"><div><span className="mobile-mark">w.</span><strong>鲜唯佳 <span className="ai-tag">AI 分身</span></strong><span className="top-caption">一起把想法聊清楚</span></div><div className="top-actions"><Button variant="ghost" className="size-toggle" aria-pressed={large} onClick={()=>setLarge(!large)} aria-label="切换 200% 大字"><Type size={18}/><span>{large?'100%':'200%'}</span></Button><Button variant="ghost" className="mobile-new" onClick={reset} aria-label="新对话"><Plus size={20}/></Button></div></header>
   <div className={`connection ${status.ready?'connected':''}`} role="status"><span className="status-light"/><span>{status.ready?'本机真实模型已连接 · 仅此电脑可用':status.reason}</span><Button variant="ghost" onClick={check} aria-label="重新检查连接"><RotateCw size={15}/></Button></div>
   <div className="chat-scroll">
    {!messages.length?<div className="welcome">
     <div className="portrait" aria-label="分身标记"><span>w.</span><b>AI</b></div>
     <div className="eyebrow">你好，欢迎来坐坐。</div><h1>从一个想法开始，<br/><em>聊到更明白一点。</em></h1>
     <p className="intro">我是鲜唯佳的 AI 分身。可以一起聊爵士、下棋、机会地图，<br className="desktop-break"/>也可以把一个没想通的问题，慢慢拆开。</p>
     <div className="starter-grid">{starters.map(s=><button key={s.title} onClick={()=>{setDraft(s.text);input.current?.focus();}} className="starter"><span className="starter-icon">{s.icon}</span><strong>{s.title}</strong><ArrowUpRight size={17}/><small>{s.note}</small></button>)}</div>
     <div className="honesty"><Check size={15}/>不知道本人的事，我会明确说不知道。</div>
    </div>:<div className="messages" role="log" aria-label="本页对话">{messages.map((m,i)=><article key={i} className={`message ${m.role}`}><span className="message-label">{m.role==='user'?'你':m.source==='boundary'?'AI 分身 · 边界提示':'AI 分身 · 模型生成'}</span><div>{m.content}</div></article>)}{busy&&<div className="thinking" role="status">正在想这句话…</div>}</div>}
    <div ref={end}/>
   </div>
   <div className="composer-area">
    {notice&&<p className="notice" role="alert">{notice}</p>}
    <form className="composer" onSubmit={e=>{e.preventDefault();void send();}}>
     <label htmlFor="chat-input" className="sr-only">给 AI 分身的消息</label><Textarea id="chat-input" ref={input} value={draft} maxLength={1000} placeholder={status.ready?'想聊什么？一句话也可以。':'可以先写下想法；模型连接后再发送。'} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/>
     <div className="composer-bottom"><span>文字聊天<span className="count">{draft.length}/1000</span></span>{busy?<Button type="button" className="send stop" onClick={e=>{if(e.detail<=1)stop();}}><Square size={14}/>停止</Button>:<Button type="submit" className="send" disabled={!status.ready||!draft.trim()} aria-label="发送消息"><ArrowUp size={20}/><span>发送</span></Button>}</div>
    </form><div className="privacy">本页不默认保存对话；刷新会清空。模型可能出错。<details><summary>使用边界</summary><div>云端版本未连接模型。连接后消息会交给标明的模型服务处理，服务商可能保留运行元数据。没有麦克风、录音、声音克隆、私人资料检索或现实行动权限。本机验证仅使用已安装模型。每轮最多 12 次回复、10 分钟。</div></details></div>
   </div>
  </section>
 </main>;
}
