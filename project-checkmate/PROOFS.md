# SC-005 证书协议 cm-kxk-v1

范围：KQK/KRK、指定合成 FEN、攻击方拥有后/车并先行、半回合计数为 0、无此前重复历史、无易位和吃过路兵、最多 5 半步。该长度内不足以触发三次重复（含拟走着申诉）或 50 步和棋。将杀必须经合法走法生成器核验；逼和、吃掉重子后的 K/K、非法王邻接、缺失应对、搜索深度耗尽均不能作为成功叶子。验证器本身尚未经 Lean 4 形式化证明。

开放校准挑战（每项一次计分）：

| ID | FEN | 最大半步 |
|---|---|---|
| kxk-06 | `7k/8/Q3K3/8/8/8/8/8 w - - 0 1` | 5 |
| kxk-07 | `7k/R7/4K3/8/8/8/8/8 w - - 0 1` | 5 |
| kxk-08 | `8/7q/8/8/1k6/8/8/K7 b - - 0 1` | 5 |

kxk-01 至 05 是公开测试基准，不可计分。

JSON 示例（结构示意，不是可直接计分的答案）：

~~~json
{"schema":"cm-kxk-v1","challenge":"kxk-06","proof":{"move":"a6a7","next":{"replies":{"h8g8":{"move":"a7a8","next":{"mate":true}}}}}}
~~~

攻击方节点必须恰有 move（UCI）与 next；防守方节点必须恰有 replies（每条合法 UCI 应对对应子树）；真实将杀叶恰有 mate:true。不要提交自报胜负、引擎分值、未知叶、引用循环、任意程序或外部可执行内容。

提交：先在 Issue #1 认领挑战，fork 并向 project-checkmate 分支提交 PR；本类 PR 只新增一个 UTF-8 JSON 文件 `project-checkmate/submissions/<你的GitHub用户名>/SC-005/kxk-06.json`（替换 ID）。大小最多 64 KiB。模型和复现过程写在 PR 描述里，不将额外字段写进证书。自动检查从可信 base SHA 加载验证器，读取 PR Git blob 数据；从不 checkout 或执行 PR 内容。PR 必须基于最新目标分支；同一挑战已合并时不得再次计分。维护者需检查实际 Actions 状态再合并，独立复核另行记录。没有设为必须通过的分支规则前不能假定 CI 强制执行。

排名只收录目标分支中通过同一验证器的唯一开放挑战，按 GitHub 路径对应作者汇总；并列以用户名排序，不把重复、公共基准或未经验证研究纳入积分。此榜只衡量校准任务，真正新研究另设证据库。若 GitHub 网络不通，明确显示不可用或保留带时间的上次快照。

本地回归：`node project-checkmate/checker.test.mjs`；已合并分支审计：`node project-checkmate/ci.mjs audit`。
