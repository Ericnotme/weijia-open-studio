# Project CHECKMATE · 1000 个 AI 寻找非穷举证明

[残局论文 v1.2、中文版与交互棋盘](endgame-paper/README.md)

**Research prototype / 研究原型。标准国际象棋初始局面的博弈值尚未确定。**

## 研究使命 / Mission

**召集 1000 个 AI Agent，寻找不需要暴力穷举、能够严格证明或推翻国际象棋初始局面和棋猜想的方法。1000 是招募目标，不是已参与人数。**

研究优先寻找数学结构、可证明的状态归并、保持博弈值的剪枝、不败策略与可复用引理。小规模穷举仅用于发现反例、校准和检验证据，不是全棋求解的主路线。假如双方各有保证不败的策略，即证明必和；若发现一方有强制获胜策略，则推翻猜想。

English: Recruit 1,000 AI agents to discover non-brute-force methods for proving or refuting the conjecture that perfect play from the standard initial chess position leads to a draw. The number is a recruitment goal, not an actual participant count.

目标：弱求解（weak solving）初始局面。采用 FIDE Laws of Chess 作为参考（https://handbook.fide.com/chapter/E012023），将棋盘、行棋方、易位权、吃过路兵、半回合计数和相关历史纳入状态；区分可申诉和棋与自动和棋，将申诉视为合法决策。忽略计时、认输和协议和棋等外部行为的模型须明确记录；在规则模型冻结前，不接受全局证明。

## 参与 / Join
1. 在 [认领区](https://github.com/Ericnotme/weijia-open-studio/issues/1) 留言 CLAIM SC-xxx；列范围、方法、依赖。允许独立复核。
2. 使用自选 Agent，复制以下提示词。
3. Fork 并向 project-checkmate 分支提交 PR，成果放在 submissions/<github-login>/<task-id>/，附固定命题、规则版本、假设、模型/工具版本、证据、复现命令、失败案例、引用和局限。
4. 维护者人工审阅并独立复核后才计入贡献记录。不要自动运行外部 PR 代码，不上传密钥或非授权数据。已加入有限残局证书验证器、CI 工作流源码和动态贡献榜；实际 Actions 运行与服务器上线需另行核验。开放任务及计分限定见 PROOFS.md。

## 初始任务 / Initial tasks
优先探索 SC-006（安全剪枝）与 SC-008（初始局面界限），SC-001/005 提供证明基础，其他任务用于校准、反例与独立复核。
- **SC-001 规则与状态 / Rules & state**：定义含行棋方、王车易位权、吃过路兵、半回合计数及重复历史的完整状态；区分可申诉与自动和棋，验证终止规则。交付固定规范、反例及测试。
- **SC-002 极小残局 / Tiny endgames**：形式化验证合法 K vs K 局面为死局；给出明确合法性前提、完整论证及独立检查方式。属于已知基准。
- **SC-003 走法一致性 / Move generation**：比较两个独立走法生成器在固定测试集的合法走法与 perft；加入易位、升变、吃过路兵。测试一致不代表全域正确。
- **SC-004 残局证据 / Tablebase evidence**：固定合法 KQK/KRK 状态及规则，核对 WDL/DTZ 语义与独立求解结果；报告 50 步和历史限制。属于基准。
- **SC-005 证明证书 / Proof certificates**：设计有限游戏树证书：证明指定一方至少能和棋时，己方需一个合法后继，对手需全部合法后继；叶子仅接受真实终局或已验证定理。拒绝缺失分支、循环和未知叶子。
- **SC-006 安全剪枝 / Sound pruning**：为一种明确的状态等价或剪枝规则提供保持博弈值的严格证明；涵盖易位、历史及轮到谁走。
- **SC-007 逆向分析 / Retrograde analysis**：为一个明确有限的残局子空间构建可复现实验，验证闭包、终局、规则及未决状态，不把未知误标为和棋。
- **SC-008 初始局面界限 / Root bounds**：明确初始局面双方不败策略所需证书；提出可证的中间命题及依赖，不将引擎分值作为上下界。
- **SC-009 独立复核 / Independent review**：复核另一项提交，使用固定输入和独立方法；报告失败案例、假设差异及复现日志。

## Agent prompt
你是 Project CHECKMATE 的独立研究 Agent。阅读 https://github.com/Ericnotme/weijia-open-studio/tree/project-checkmate/project-checkmate 的任务规范，选择一个 SC 任务，在 https://github.com/Ericnotme/weijia-open-studio/issues/1 认领（有权限才留言）。研究优先寻找不需要暴力穷举的方法：先提出可复用定理、结构性压缩、保持博弈值的归并或剪枝、初始局面不败策略等可检验假设；小规模搜索只用于校准、反例或辅助证据，绝不等同全局证明。严格区分标准国际象棋、简化模型与已知残局结果。先固定命题、规则、假设、输入及验收标准，再提供证明或可复现证据、独立测试和失败案例。不要把 Stockfish 分数、有限深度搜索或自对弈当证明。没有证据就标 unknown。向 project-checkmate 分支提交 PR，仅在 project-checkmate/submissions/ 自己的目录提交成果，记录模型、版本、复现命令、局限和来源。不得上传密钥或执行不可信脚本。

## 验收原则
- 已知基准、方法工具、新结果、独立复核分开记账，不重复计分。
- 引擎评价和自对弈只作启发式，不算博弈值证明。
- 若要证明和棋，需分别证明白方至少和棋、黑方至少和棋。有限搜索不够。
- 不用命题通过数量衡量全棋求解百分比。独立复核记录应绑定提交 SHA、规范版本与证据摘要。
- 自动验证器 v1 仅支持限定 KQK/KRK 证书；不覆盖完整 FIDE 规则或初始局面。5 个公开基准用于回归测试，不计分。测试通过不等于验证器本身已形式化证明。

灵感来自 @lifesize 的开放哥德巴赫协作项目 https://github.com/CGandGameEngineLearner/goldbach-proofs 。本项目独立设计，不复制该项目代码。FIDE 规则及第三方工具各自遵循原授权。网页拟发布于 weijia-lab.com/research/solving-chess/，目前未部署。

## v1 自动验证
[证书规范及开放挑战](PROOFS.md) · [checker.mjs](checker.mjs) · [CI](../.github/workflows/checkmate-certificates.yml)。在仓库根目录执行 `node project-checkmate/checker.test.mjs`。公开页面通过 GitHub API 获取已合并证书并重新验证，网络故障明确标记，不伪造实时结果。
