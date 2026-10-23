# healthspan-cn-research-hh — clean source export

Healthspan China research-scenario interface. Static, no patient records; food values remain unverified-source labels rather than personalized predictions.

See [EXPORT.md](EXPORT.md) for exact source snapshot, run instructions, omissions and verification. The root MIT license covers original code only; see [LICENSE-SCOPE.md](LICENSE-SCOPE.md).

## Original project documentation

# 健康寿命 · 中国版研究情景

独立 Sites 迁移版；用户已授权公开此脱敏版本。保留六页签与原站深色视觉；代码与公共资料经白名单重建，原健康记录不随源码或静态资源分发。

- 食物：39项原站食物条目；未能与独立 Data S1 逐项核对，效应数值与区间全部移除，仅保留份数交互，不生成总风险或个人寿命。
- 运动：Moore 2012 原研究分组与区间、MET 单位换算；步数与抗阻研究分别阅读。
- 药物/补剂：保留原统计量类型、适用研究人群、区间和未知状态。
- 神药史：保留时代线索，不跨疾病排列效力。
- 我的：空态；全部交互状态仅存在页面内存，刷新重置。导出只含研究情景。
- 方法：公开模型边界和来源。没有 HALE/个人生存引擎、用户数据库、健康上传接口、分析追踪或离线缓存。

公共资料核查日期：2026-10-07。HENI39条由旧站转录，尚未逐项重新核对原始附件；不是经中国人群验证的食谱模型。

静态站点，无依赖安装或构建步骤。检查：`node tests/model.test.mjs`；浏览器验证脚本在任务验收目录，不随发布产物分发。

Sites 身份在 `.openai/hosting.json`。访问策略由 Sites 管理，不在客户端硬编码。已获用户授权公开，并由作品集维护任务负责添加链接。
