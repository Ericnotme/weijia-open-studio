import {localStatus,generateLocal} from '../lib/local-chat.mjs';
// Dev-only middleware. This module is never imported by the production Worker.
export function localChatPlugin() {
  let active=0,used=0,day=Date.now(),minute=[];
  return {name:'weijia-local-chat',apply:'serve',configureServer(server){
    server.middlewares.use(async(req,res,next)=>{
      const path=req.url?.split('?')[0];
      if(path!=='/api/status'&&path!=='/api/chat')return next();
      const host=req.headers.host||'';
      const origin=req.headers.origin;
      const reply=(status,data)=>{if(res.destroyed)return;res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
      if(!/^127\.0\.0\.1:\d+$/.test(host)|| (origin&&origin!==`http://${host}`))return reply(403,{error:'仅允许本机同源访问'});
      if(path==='/api/status'&&req.method==='GET')return reply(200,await localStatus());
      if(req.method!=='POST')return reply(405,{error:'请求方法不支持'});
      if(req.headers['content-type']!=='application/json')return reply(415,{error:'需要 JSON 请求'});
      const now=Date.now(); if(now-day>86400000){used=0;day=now;}minute=minute.filter(t=>now-t<60000);
      if(active>=1||minute.length>=12||used>=100)return reply(429,{error:'已达到本机测试用量限制，请稍后再试'});
      let raw='',over=false;
      for await (const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>60000){over=true;break;}}
      if(over)return reply(413,{error:'请求过长'});
      let body;try{body=JSON.parse(raw);}catch{return reply(400,{error:'请求格式不正确'});}
      active++;used++;minute.push(now);
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),20000);
      res.on('close',()=>controller.abort());
      try{return reply(200,await generateLocal(body.messages,controller.signal));}
      catch(error){return reply(controller.signal.aborted?504:503,{error:controller.signal.aborted?'生成已停止或超时':'本机模型暂时不可用，未生成回复'});}
      finally{clearTimeout(timer);active--;}
    });
  }};
}
