import {owner,database,bucket,response,failure,HttpError,checkOrigin,safeRecord} from '@/lib/server';
import {schemas} from '@/lib/validation';
export const dynamic='force-dynamic';
export async function GET(){try{const who=await owner();const rows=await database().prepare('SELECT * FROM care_records WHERE owner = ? ORDER BY occurred_at DESC, updated_at DESC').bind(who).all();return response({records:rows.results.map(safeRecord)})}catch(e){return failure(e)}}
export async function POST(req:Request){let newKey:string|undefined;try{
 checkOrigin(req);const who=await owner();if(Number(req.headers.get('content-length')||0)>11*1024*1024)throw new HttpError('每份文件最大支持 10 MB。',413);
 const form=await req.formData();const kind=String(form.get('kind')||'') as keyof typeof schemas;
 if(!Object.hasOwn(schemas,kind))throw new HttpError('记录类型无效。');
 const id=String(form.get('id')||crypto.randomUUID());if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id))throw new HttpError('记录编号无效。');
 let incoming;try{const str=String(form.get('data')||'');if(str.length>60000)throw new Error();incoming=JSON.parse(str)}catch{throw new HttpError('记录内容无效或过长。')}
 const parsed=schemas[kind].safeParse(incoming);if(!parsed.success)throw new HttpError(parsed.error.issues[0]?.message||'请检查输入内容。');
 const data=parsed.data as Record<string,any>;
 const db=database();const existing=await db.prepare('SELECT * FROM care_records WHERE owner = ? AND id = ?').bind(who,id).first<any>();
 if(existing&&existing.kind!==kind)throw new HttpError('记录类型不匹配。');
 let old:any=existing?JSON.parse(existing.payload):{};
 if(kind==='profile'&&id!=='profile')throw new HttpError('档案编号无效。');
 if(kind==='scenario'&&id!=='scenario')throw new HttpError('情景编号无效。');
 if(kind==='daily'&&id!==`daily-${data.date}`)throw new HttpError('日期不匹配。');
 const file=form.get('file');
 if(file instanceof File&&file.size){
  if(kind!=='report')throw new HttpError('只有核磁记录支持附件。');
  if(file.size>10*1024*1024)throw new HttpError('每份文件最大支持 10 MB。',413);
  const bytes=await file.arrayBuffer();const h=new Uint8Array(bytes).slice(0,12);let type='';
  if(h[0]===37&&h[1]===80&&h[2]===68&&h[3]===70)type='application/pdf';
  else if(h[0]===255&&h[1]===216&&h[2]===255)type='image/jpeg';
  else if(h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71)type='image/png';
  else if(String.fromCharCode(...h.slice(0,4))==='RIFF'&&String.fromCharCode(...h.slice(8,12))==='WEBP')type='image/webp';
  else if(file.name.toLowerCase().endsWith('.txt')&&file.size<=100000&&!new Uint8Array(bytes).includes(0))type='text/plain';
  if(!type)throw new HttpError('请选择 PDF、JPG、PNG、WebP 或 UTF-8 TXT 报告。');
  newKey=`reports/${encodeURIComponent(who)}/${crypto.randomUUID()}`;
  await bucket().put(newKey,bytes,{httpMetadata:{contentType:type}});
  Object.assign(data,{fileKey:newKey,fileName:file.name.replace(/[\r\n\\/]/g,'_').slice(0,180),fileType:type,fileSize:file.size});
 }else if(old.fileKey){Object.assign(data,{fileKey:old.fileKey,fileName:old.fileName,fileType:old.fileType,fileSize:old.fileSize})}
 const updated=new Date().toISOString();const date=String(data.date||updated);
 await db.prepare('INSERT INTO care_records (owner,id,kind,occurred_at,payload,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(owner,id) DO UPDATE SET occurred_at=excluded.occurred_at,payload=excluded.payload,updated_at=excluded.updated_at').bind(who,id,kind,date,JSON.stringify(data),updated).run();
 if(newKey&&old.fileKey&&old.fileKey!==newKey)await bucket().delete(old.fileKey).catch(()=>console.error('old attachment cleanup failed'));
 newKey=undefined;return response({record:safeRecord({id,kind,occurred_at:date,payload:JSON.stringify(data),updated_at:updated})},existing?200:201);
 }catch(e){if(newKey)await bucket().delete(newKey).catch(()=>{});return failure(e)}}
export async function DELETE(req:Request){try{checkOrigin(req);const who=await owner();const id=new URL(req.url).searchParams.get('id');if(!id)throw new HttpError('缺少记录编号。');const db=database();const row=await db.prepare('SELECT * FROM care_records WHERE owner = ? AND id = ?').bind(who,id).first<any>();if(!row)throw new HttpError('记录不存在。',404);if(!['report','pressure'].includes(row.kind))throw new HttpError('该记录不能在此删除。');await db.prepare('DELETE FROM care_records WHERE owner = ? AND id = ?').bind(who,id).run();const d=JSON.parse(row.payload);if(d.fileKey)await bucket().delete(d.fileKey).catch(()=>console.error('deleted attachment cleanup failed'));return response({deleted:true})}catch(e){return failure(e)}}
