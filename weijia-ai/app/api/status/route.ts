export async function GET() {
  return Response.json({ready:false,mode:'hosted',model:null,reason:'云端模型尚未连接。北京接口适配已备好，等待本人安全配置凭据和真实测试。'},{headers:{'Cache-Control':'no-store'}});
}
