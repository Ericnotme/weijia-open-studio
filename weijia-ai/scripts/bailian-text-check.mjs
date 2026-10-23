// User-run, single-request check. This is not invoked by build/test/deployment.
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {BailianError,createBailianAdapter} from '../lib/bailian-chat.mjs';

if(!stdin.isTTY || !stdout.isTTY) {
  console.error('请本人在独立终端运行；不接受文件、管道或录音输入。'); process.exitCode=1;
} else {
  const terminal=createInterface({input:stdin,output:stdout});
  const abort=new AbortController();
  const stop=()=>abort.abort(); process.once('SIGINT',stop);
  try {
    console.log('仅发送你接下来输入的测试文字和已清理的角色设定到百炼北京。不要输入私人资料。');
    const text=await terminal.question('测试文字（回车提交一次，空白退出）： ',{signal:abort.signal});
    if(text.trim()) {
      const result=await createBailianAdapter(process.env).generate([{role:'user',content:text}],abort.signal);
      console.log(result.source==='model'?'百炼实际返回：':'本地边界提示（未调用百炼）：');
      console.log(result.text);
      if(result.truncated)console.log('回复达到本次输出限制，已截断。');
    }
  } catch(error) {
    console.error(error instanceof BailianError ? error.message : '测试未完成，未自动重试。'); process.exitCode=1;
  } finally { terminal.close(); process.removeListener('SIGINT',stop); }
}
