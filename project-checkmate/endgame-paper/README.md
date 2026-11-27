# 黑王能吃这只兵吗？
鲜唯佳 Weijia Xian（暂定署名），Independent Researcher。研究草稿 v1.2，2026-11-27，未经同行评审。AI 协作披露见论文。此目录不参与挑战计分。

[打开可操作棋盘](https://weijia-lab.weijiaxian.chatgpt.site/research/solving-chess/endgame-paper/index.html) · [中文论文 PDF](paper-zh.pdf) · [中文网页版](paper-zh.html) · [English paper](paper-en.pdf) · [English supplement](supplement-en.pdf)

下载本目录后，用浏览器直接打开 index.html 也可离线操作。三个例子都从真实局面开始。点黑王相邻格试走，切换“隐去白象”观察缺失的信息；违法的目标格会给出攻击者。合法着显示零半回合钟 Syzygy 胜和负，每个黑方选择后可以查看一着白方最优应对。每题保留三个回合的交互树，已终局时提前停止。

完整枚举包含 1,224,059 个局部棋盘及行棋方组合。在 371,081 个通过棋库状态检查的表库和棋中，V3、V4、V5 的覆盖率分别为 94.61%、53.51%、64.34%。V5 对应 7,933 个抽象证书。完整 FIDE 历史形式化及真实人类审阅留待后续。

英文主文与附录保留 v1.2 冻结版原文，包括编写时的内部草稿标记。本目录为该版本的公开分发版。
