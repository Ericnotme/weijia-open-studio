// Fail closed. No mock output, embedded key, localhost call, or paid fallback.
export async function POST() {
  return Response.json({error:'云端模型尚未连接，未生成回复。'},{status:503,headers:{'Cache-Control':'no-store'}});
}
