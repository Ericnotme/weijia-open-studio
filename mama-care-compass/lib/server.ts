import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function owner(){const u=await getChatGPTUser();if(!u)throw new HttpError('请先登录，再读取或保存健康记录。',401);return u.userId}
export class HttpError extends Error{constructor(message:string,public status=400){super(message)}}
export function database(){if(!env.DB)throw new HttpError('健康档案暂时无法连接，请稍后重试。',503);return env.DB}
export function bucket(){if(!env.BUCKET)throw new HttpError('报告存储暂时无法连接，请稍后重试。',503);return env.BUCKET}
export function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
export function failure(e:unknown){if(e instanceof HttpError)return response({error:e.message},e.status);console.error('care storage operation failed',e instanceof Error?e.name:'unknown');return response({error:'暂时未能完成操作。请保留输入，稍后重试。'},503)}
export function checkOrigin(req:Request){const origin=req.headers.get('Origin');if((origin&&origin!==new URL(req.url).origin)||req.headers.get('Sec-Fetch-Site')==='cross-site')throw new HttpError('请求来源不受支持。',403)}
export function safeRecord(row:any){const data=JSON.parse(row.payload);delete data.fileKey;return {id:row.id,kind:row.kind,date:row.occurred_at,data,updatedAt:row.updated_at}}
