# weijia-ai — clean source export

AI chat-workbench source. Four public interests only; no private chat corpus. Hosted API remains disabled. Optional local inference requires a separately installed local model.

See [EXPORT.md](EXPORT.md) for exact source snapshot, run instructions, omissions and verification. The root MIT license covers original code only; see [LICENSE-SCOPE.md](LICENSE-SCOPE.md).

## Original project documentation

# 鲜唯佳 · AI 聊天工作台

这是明确标注 AI 身份的个人分身聊天站。**本机真实模型可用；当前托管版本没有模型凭据，API 返回 503，不生成演示答案。** 未完成个性化训练，不能代表本人，不能保证模型不幻觉。

## 运行

Node >=22.13；使用锁文件 `npm ci`。先启动已安装的 Ollama 并确保本地存在 `llama3.2:latest`（不会自动拉取），然后 `npm run dev`，打开终端打印的 `http://127.0.0.1:5173`。

同源开发中间件固定调用 `127.0.0.1:11434/api/chat`。只允许 127.0.0.1 Host 和同源 Origin；不读取代理、密钥或用户磁盘资料，不创建隧道。不在任何情况下把云端用户请求路由到这台 Mac。

`npm test` 验证协议、取消、重复发送、输入限制和边界提示；`npx tsc --noEmit` 检查类型；`npm run build` 构建 Sites Worker。

## 数据与约束

- 仅四项任务批准的公开兴趣：爵士、国际象棋/棋间、机会地图、理解 AI 答案。无检索索引、私人聊天语料或训练权重。
- 会话只在当前页面内存中；刷新或新对话清空。服务器不写消息日志、无分析脚本、无数据库。框架/服务商可能保留请求元数据，不能承诺全链路零留存。
- 输入每条1000字符、历史合计12000字符；每轮12次回复/10分钟（客户端），服务端独立限制每进程1并发、每分钟12次、滚动日100次、20秒超时、320输出token。当前限制用于本机验证，不是分布式公网配额。
- 取消会向模型请求传播 AbortSignal，已取消请求的迟到结果不会进入会话；不声称能撤销所有已经消耗的计算。
- 边界规则有明确标记，不冒充模型生成。规则/系统提示不是完备的隐私或事实分类器；模型可能忽略提示，公开上线前须扩大对抗验收。
- 不请求麦克风，不录音、不转写、不克隆声音、不外呼、不替本人承诺。

## 托管部署阻碍

已增加百炼北京 `qwen3.7-plus` 服务端适配器和本人手动运行的单次文字测试脚本。控制台该模型的“免费额度用完即停”已开启；适配器仅以mock测试，未发起真实百炼请求。未创建/读取/复制模型API key；Sites的本人安全凭据注入路径尚未确认，网页路由保持503、`/api/status`明确未连接。详细边界和本人安全输入步骤见 [百炼配置说明](docs/BAILIAN.md)。

真实云端适配后，还必须加集中配额/并发限制、供应商支出硬上限、用量观测（不含对话正文）、滥用限制、供应商数据处理说明，再通过私有验收。未经验证不能公开宣称“会聊天”。本机模型不能作为云端后备。

## 统一接入

`/?embed=1` 显示紧凑布局。同源API `GET /api/status` 与 `POST /api/chat` 统一；body 为 `{messages:[{role:'user',content:'你好'}]}`。成功返回 `{text,source:'model'|'boundary',model}`。非200必须显示错误而非编造答案。

目前只交付嵌入代码/接口契约，未改其他网站。待托管模型真实可用且访问策略确定，父任务可在棋盘下方的静态布局槽中使用 iframe；不要用遮住棋盘的浮层。示例见 `docs/EMBED.md`。不能发送页面私密数据、棋局或聊天历史给 iframe，除非用户主动选择。

## 官方依据

Ollama Chat API: https://docs.ollama.com/api/chat （2026-10-08查阅）。Sites构建/私有发布按当前官方插件技能执行。

## 素材状态

安全派生包、3段本人录音和生成头像均经 Library 官方 prepare_materialize 路由尝试，但下载HTTP403（安全包已重新签发立即重试）。未取回内容；不声称已训练或完成音频质检。没有换用原始私聊或原始照片。当前头像是品牌文字标记。
