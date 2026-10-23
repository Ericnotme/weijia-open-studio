# meningioma-visit-prep — clean source export

Static visit preparation and synthetic-only research engineering scaffold. Not a diagnosis or validated model.

See [EXPORT.md](EXPORT.md) for exact source snapshot, run instructions, omissions and verification. The root MIT license covers original code only; see [LICENSE-SCOPE.md](LICENSE-SCOPE.md).

## Original project documentation

# 脑膜瘤 · 就诊准备

独立中文静态网站。只含通用资料和合成研究示例，无患者资料。原有健康站未修改。没有新建 GitHub 仓库。

- `dist/index.html`：手动记录日期、原文、部位、尺寸与未知项；规则式生成医生问题，下载文字/打印 PDF。
- `dist/research.html`：未训练/未临床验证状态、候选路线与可下载脚手架。
- `dist/privacy.html`：内存输入、托管平台访问日志与本地副本边界。
- `research/`：Python 标准库研究脚手架，拒绝真实数据，17 项工程测试。
- `tests/qa.cjs`：独立 headless 浏览器验收；不接管现有 Chrome。

无需构建或第三方前端依赖。以静态服务器服务 `dist/`。不使用后端、上传、分析埋点、localStorage、sessionStorage 或 IndexedDB。CSP `connect-src 'none'` 和 `form-action 'none'` 阻止应用的数据提交；站点托管平台仍可能保留静态资源访问日志。

可选 WebMCP 只暴露清除输入动作，不提供患者内容读取。无远程 MCP/模型服务。

本项目没有下载或分发医学模型权重，没有运行训练、患者推理或临床验证。研究包生成的任何数值都是合成工程测试值。

内容核查 2026-10-09。通用医学说明链接 EANO / NHS 原始来源；研究说明链接 BraTS 官方资料和原始论文。
