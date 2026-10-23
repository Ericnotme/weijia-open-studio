# 百炼北京私有测试适配（2026-10-08）

## 当前可确认的状态

控制台北京地域中，`qwen3.7-plus` 显示剩余1M/总1M免费Token，截止2027-01-07；本次仅为此模型开启“免费额度用完即停”，回读显示“已开启”。这是当时账户状态，不是未来额度保证。控制台说明免费额度耗尽会返回403 `AllocationQuota.FreeTierOnly.`；该设置在服务商侧阻止额外付费。其他模型设置未变。

代码只增加服务端适配器和本人手动运行的单次文字测试入口；尚未配置任何真实模型密钥、没有真实百炼调用。网站仍私有，`/api/status` 为 `ready:false`，`/api/chat` 为503。适配器没有接入公开网页请求，尚无集中配额和已验证的安全云端凭据入口。不要宣称已上线云聊天。

## 已实现

`lib/bailian-chat.mjs` 只支持模型 `qwen3.7-plus`，默认官方北京兼容端点 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`。如本人提供业务空间ID，则构造官方推荐的 `https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions`。不接受自定义域名、其他地域或模型；禁止重定向、自动重试和备用模型。密钥只作为服务端Authorization头使用。

每条1000字符，最多5条历史且合计4000字符；20秒超时，输出请求320 tokens，显示最多800字符并标注截断；同一适配器最多1并发、3次请求（失败也计数）。这是小规模私有测试保护，不是分布式公网限流。服务商侧“免费额度用完即停”才是费用边界。配置中的确认标记不能设置或远程验证该开关。

仅发送当次主动输入的测试文字及已清理的公开角色设定；不读取录音、照片、文件、私人聊天、用户目录或训练语料。不记录消息、密钥、原始异常或供应商错误正文。服务商仍可能保留元数据或按其规则处理请求；取消不撤销已消耗额度。

## 本人安全配置入口

1. 本人打开[官方北京 API Key 页面](https://bailian.console.aliyun.com/cn-beijing/model/settings/api-key)，确认地域“华北2（北京）”。如需创建，创建操作和任何条款由本人完成；权限选择“自定义”，只允许 `qwen3.7-plus`。不要把密钥发进聊天、源码、前端或截图。当前任务没有替本人创建、查看或复制密钥。
2. 运行前本人在[免费额度页面](https://bailian.console.aliyun.com/cn-beijing/costing-balance/free-quota)再次确认该模型有免费额度且“用完即停”保持开启；无法确认就停止。
3. **已支持的本地安全输入路径：**本人在一个不共享给自动化工具的独立macOS终端中运行下面的zsh代码。密钥以隐藏输入进入一次子shell环境，不写命令历史、不写文件、不显示密钥前缀；程序退出后子shell环境结束。这只能验证本人发起的一次云API调用，不是把Mac公开成服务器，也不会给网站部署凭据。

```zsh
(
  set +x
  cd /path/to/weijia-ai || exit
  read -rs 'DASHSCOPE_API_KEY?请本人输入北京 API Key（隐藏）：' || exit
  print
  export DASHSCOPE_API_KEY
  export BAILIAN_ENABLED=private-test
  export BAILIAN_REGION=cn-beijing
  export BAILIAN_FREE_ONLY_CONFIRMED=qwen3.7-plus
  node scripts/bailian-text-check.mjs
)
```

随后本人输入一条不含私密资料的测试问题，回车提交一次；空白退出，Ctrl+C取消。不要在录屏、受监督终端或聊天输入框中粘贴密钥。本次没有执行上述真实调用代码。

## 云端仍需解决

现有Sites原生环境变量工具支持secret存储，但要求调用方提供明文值；未验证有能让本人输入且对助手隐藏的Sites安全注入界面。因此本任务不调用该工具配置密钥，也不假定某个设置页面存在。需先确认实际可用的本人安全注入路径，再接线服务端路由、限制为本人私有测试、完成真实百炼调用和集中配额验收。给本地终端配置密钥不会让已部署站点自动接通。禁止把密钥放到页面输入框或`NEXT_PUBLIC_*`变量。

公开访问、13站嵌入、访客输入向百炼传输均尚未启用；需要独立验收和相应授权范围。声音克隆和真人录音流程不在本次适配中。

## 依据与验证

- [官方 OpenAI 兼容接口](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)：北京端点、兼容请求与响应。
- [官方 API Key 获取与配置](https://help.aliyun.com/zh/model-studio/get-api-key)：地域隔离、服务端凭据和自定义模型权限。
- `tests/bailian.test.mjs` 全部通过mock fetch测试；覆盖缺凭据零请求、地域/域名/模型约束、输入/输出限制、403免费额度停止、无重试、错误脱敏、取消与并发。它们不证明真实电话或真实百炼成功。
