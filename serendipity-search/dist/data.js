export const notes = [
  {
    id:'slime-city',number:'01',topics:['生物','城市'],type:'实验研究',year:'2010',date:'2010-01-22',
    title:'一团黏菌，和东京铁路想到了一起。',
    deck:'没有大脑，也能在成本、效率与容错之间，找到一个漂亮的折中。',
    keywords:['城市','交通','铁路','地铁','网络','生物','黏菌','粘菌','智能','东京','日本','设计','复杂系统','slime','city','tokyo','network'],
    paragraphs:[
      '研究者按东京周边城市的位置放置食物，让多头绒泡菌自由生长。它形成的运输网络，在成本、运输效率与容错能力的权衡上，与当地铁路网络有相似表现。',
      '这个连接有趣之处在于：一边是工程师做规划，一边是生物体通过局部生长与收缩调整连接。两者面对相近的约束，就可能走向相近的结构。',
      '可以借走的问题是：设计一个系统时，除了画好总图，能否设定局部规则，让有用的连接自己留下来？'
    ],
    boundary:'实验比较的是若干网络指标，不是说黏菌懂城市规划，也不是它复刻了完整的东京铁路。把这个机制用于组织设计，仍然属于类比。',
    question:'如果秩序能从局部规则长出来，设计师该设计什么？',
    sources:[{title:'Rules for Biologically Inspired Adaptive Network Design',by:'Tero 等 · Science · 2010',url:'https://pubmed.ncbi.nlm.nih.gov/20093467/'}],related:['braess-roads','pagerank','evolution-tinkering']
  },
  {
    id:'bitcoin-clock',number:'02',topics:['比特币','控制论'],type:'协议设计',year:'2008',date:'2008-10-31',
    title:'比特币的时钟，会自己调速。',
    deck:'出块快了，就调高难度。维持节奏的秘诀，是允许不断修正。',
    keywords:['比特币','bitcoin','btc','区块链','加密','货币','投资','周期','时钟','时间','反馈','控制论','难度','算力'],
    paragraphs:[
      '比特币白皮书提出：当硬件速度和参与算力变化时，通过调整工作量证明的难度，追踪一个目标平均出块速度。算力增长并不意味着区块可以永远同比加速。',
      '从控制论（control theory）的视角看，这很像负反馈：系统偏离目标，就朝反方向调整。这是理解协议的类比，不是对白皮书原话的引用。',
      '值得借鉴的设计问题是：真正需要固定的，究竟是每一步的动作，还是经过不断校正后维持的整体节奏？'
    ],
    boundary:'平均出块节奏不等于每个区块准点产生。协议中的时间结构，也不能证明价格存在稳定周期，更不能据此确定买卖时点。',
    question:'一个可靠的节奏，需要多少不可靠的单步？',
    sources:[{title:'Bitcoin: A Peer-to-Peer Electronic Cash System',by:'Satoshi Nakamoto · 白皮书第 4 节 · 2008',url:'https://bitcoin.org/bitcoin.pdf'}],related:['braess-roads','overfit','shannon-music']
  },
  {
    id:'solomon-distance',number:'03',topics:['大脑','视角'],type:'行为实验',year:'2014',date:'2014-06-10',
    title:'给朋友出主意时，你更接近智者。',
    deck:'有些清醒，来自心理距离，而不只是再多想一会儿。',
    keywords:['大脑','心理','智慧','朋友','关系','情绪','视角','旁观者','决策','思考','认知','solomon','brain','wisdom'],
    paragraphs:[
      'Grossmann 与 Kross 的三项实验发现，在特定人际冲突情境中，参与者讨论别人的问题时，比讨论自己的问题更容易表现出研究所定义的智慧推理。',
      '这里的智慧推理，指承认知识的边界、考虑不同观点、理解变化和妥协。让参与者用旁观者视角思考自己的问题，可以缩小这种差距。',
      '一个可尝试的小练习：把困境写成第三人称，再问“如果这是朋友的事，我会先确认哪一个事实？”这是从实验延伸的练习，不是保证有效的万能解法。'
    ],
    boundary:'研究针对特定任务中的推理表现，不能推断换个人称就会提高智商，或解决所有现实冲突。',
    question:'你需要一个更聪明的答案，还是离问题稍远一点的位置？',
    sources:[{title:'Exploring Solomon’s Paradox',by:'Grossmann & Kross · Psychological Science · 2014',url:'https://journals.sagepub.com/doi/10.1177/0956797614535400'}],related:['retrieval','attention','overfit']
  },
  {
    id:'braess-roads',number:'04',topics:['城市','博弈论'],type:'数学模型',year:'2012',date:'2012-07-13',
    title:'多修一条路，所有人反而更慢。',
    deck:'当每个人都选最快的路，最后可能没有人走得快。',
    keywords:['城市','交通','路','道路','堵车','博弈','博弈论','优化','选择','数学','网络','系统','效率','braess','traffic'],
    paragraphs:[
      '布雷斯悖论（Braess’s paradox）指出：在某些拥堵网络中，增加一条道路，会改变每个人的最优路线选择，最终让均衡状态下的通行时间更长。',
      '关键在于，每个人都在优化自己的时间，却同时改变了别人面对的路况。个人最优叠加起来，不一定产生整体最优。2012 年的论文把经典模型拓展到了更一般的路网条件。',
      '把这个问题带回产品设计：增加一个选项，会不会改变所有人的行为，抵消它看起来提供的便利？这是设计启发，需要另做验证。'
    ],
    boundary:'这是在特定路网、交通需求与路线选择条件下成立的结果。它不是“修路必然加重拥堵”，也不同于单纯的诱导需求。',
    question:'你是在增加资源，还是在改变每个人的选择？',
    sources:[{title:'Braess’ Paradox in a Generalised Traffic Network',by:'Zverovich & Avineri · 研究论文 · 2012',url:'https://arxiv.org/abs/1207.3251'}],related:['slime-city','bitcoin-clock','pagerank']
  },
  {
    id:'retrieval',number:'05',topics:['大脑','学习'],type:'行为实验',year:'2008',date:'2008-02-15',
    title:'合上书的那一刻，学习才可能加速。',
    deck:'“看起来很熟”与“自己想得起来”，是两种不同的能力。',
    keywords:['大脑','学习','记忆','读书','知识','复习','考试','成长','认知','教育','memory','learning','brain','阅读'],
    paragraphs:[
      '在一项外语词汇学习实验中，学生第一次答对后，继续重复测试显著改善了延迟回忆；继续重复阅读，却没有带来同样的收益。',
      '提取练习（retrieval practice）就是主动从记忆里找答案。测试不仅能测出你学会了多少，也可能成为学习过程本身。',
      '读完一条偶然线索，可以关掉页面，用自己的话讲出它的核心，再打开核对。这个小动作，能让“我好像懂了”面对一次温和的审计。'
    ],
    boundary:'这项实验使用特定词汇任务，不代表阅读无用。复杂知识还需要理解、练习和反馈；无法回忆时，应回看材料并纠正。',
    question:'如果现在关掉页面，你能留下哪一句话？',
    sources:[{title:'The Critical Importance of Retrieval for Learning',by:'Karpicke & Roediger · Science · 2008',url:'https://pubmed.ncbi.nlm.nih.gov/18276894/'}],related:['solomon-distance','alphazero','overfit']
  },
  {
    id:'pagerank',number:'06',topics:['互联网','学术'],type:'算法论文',year:'1998',date:'1998',
    title:'搜索引擎，借过学术圈的眼睛。',
    deck:'判断一页内容的重要性，可以先看看：谁在指向它？',
    keywords:['搜索','google','谷歌','互联网','网站','模仿','原创','论文','学术','引用','网络','数学','pagerank','search','设计'],
    paragraphs:[
      '1998 年，Brin 与 Page 描述了 Google 原型。它不只看网页里的词，还利用超链接的结构，估计网页的重要性。',
      'PageRank 与学术引用的思路相通：被引用有意义，而引用者的分量也有意义。重要性沿着连接传递，使页面不必仅靠自我描述争取排名。',
      '一个值得迁移的设计原则：判断事物时，除了看它说了什么，也看看它处在怎样的关系里。这个原则有用，但关系本身也可能被操纵。'
    ],
    boundary:'链接权重不是事实真假的证明。这是 Google 早期研究中的机制，不能把它当成今天搜索排名系统的完整说明。',
    question:'你的下一个好点子，会藏在哪两件事的连接处？',
    sources:[{title:'The Anatomy of a Large-Scale Hypertextual Web Search Engine',by:'Brin & Page · Computer Networks · 1998',url:'https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/'}],related:['slime-city','attention','shannon-music']
  }
  ,{
    id:'shannon-music',number:'07',topics:['音乐','信息论'],type:'理论与类比',year:'1948',date:'1948',
    title:'一首歌里的意外，可以被数学描述。',
    deck:'越难预料的信息，带来的“惊讶”越多。但惊讶还不等于美。',
    keywords:['音乐','艺术','旋律','信息','信息论','熵','随机','惊喜','数学','语言','压缩','概率','music','entropy','shannon'],
    paragraphs:[
      '香农的信息论（information theory）把信息量与事件的概率联系起来：在给定概率模型里，一个越不容易发生的事件，发生时带来的信息量越大。',
      '把它作为听音乐的思考工具：重复让你建立预期，变化让预期偏离。完全重复很容易预测，完全随机又难以形成稳定结构。这里讨论的是一种类比。',
      '这个视角也可以带去写作和设计：先让读者知道正在发生什么，再在恰当的地方改变方向。偶然也在做同样的练习。'
    ],
    boundary:'香农明确区分技术意义上的信息与语义。信息量不能直接衡量音乐的美、文章的价值或一个思想的深刻程度。',
    question:'好的惊喜，是完全陌生，还是熟悉之中突然转弯？',
    sources:[{title:'A Mathematical Theory of Communication',by:'Claude Shannon · Bell System Technical Journal · 1948',url:'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf'}],related:['attention','pagerank','overfit']
  },
  {
    id:'alphazero',number:'08',topics:['AI','国际象棋'],type:'算法实验',year:'2017',date:'2017-12-05',
    title:'没有人类棋谱，也能学出超人棋力。',
    deck:'AlphaZero 的老师，是不断变化的自己。',
    keywords:['AI','人工智能','国际象棋','围棋','棋','学习','自我对弈','创造力','反馈','deepmind','alphazero','chess','go'],
    paragraphs:[
      'AlphaZero 从随机下棋开始，通过自我对弈和强化学习（reinforcement learning，利用结果反馈改进策略），在论文报告的条件下达到超人水平。训练不依靠人类棋谱。',
      '对手随自己一起变强，训练数据也不断更新。研究者提供规则、学习与搜索机制，系统在大量计算中逐步改进。',
      '由此可以提出一个关于学习环境的问题：除了寻找更好的教材，能否设计一个每次尝试都有反馈、难度会随能力变化的练习场？'
    ],
    boundary:'“没有人类棋谱”不等于没有人类设计，也不等于零成本。棋类规则明确、反馈清晰，现实生活常常缺少这些条件。',
    question:'如果你的练习场也会成长，你的进步会有什么不同？',
    sources:[{title:'Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm',by:'Silver 等 · DeepMind 研究论文 · 2017',url:'https://arxiv.org/abs/1712.01815'}],related:['retrieval','attention','overfit']
  },
  {
    id:'attention',number:'09',topics:['AI','语言'],type:'算法论文',year:'2017',date:'2017-06-12',
    title:'读懂一句话，可以先学会谁与谁有关。',
    deck:'Transformer 的关键动作之一，是给上下文中的关系分配权重。',
    keywords:['AI','人工智能','语言','注意力','大模型','神经网络','上下文','关系','阅读','transformer','attention','llm','gpt'],
    paragraphs:[
      '2017 年的 Transformer 论文提出一种以注意力机制（attention mechanism）为核心的架构，在报告的翻译任务上取得较强效果，并支持更高的训练并行度。',
      '注意力通过计算关联权重，组合不同位置的信息。理解一个位置时，可以利用其他位置的线索，而不只依赖一步步传递的状态。',
      '把它当作阅读隐喻：有时真正重要的单位，不是某一个词，而是词与词之间的关系。这个隐喻帮助理解机制，但不会把算法变成人脑。'
    ],
    boundary:'机器学习中的“注意力”是数学运算的名称，不等同于人的意识或专注。标题也不意味着现代 AI 只包含注意力运算。',
    question:'你漏掉的，是一个信息，还是两个信息之间的关系？',
    sources:[{title:'Attention Is All You Need',by:'Vaswani 等 · NeurIPS · 2017',url:'https://arxiv.org/abs/1706.03762'}],related:['pagerank','shannon-music','alphafold']
  },
  {
    id:'alphafold',number:'10',topics:['AI','生命'],type:'算法与实验验证',year:'2021',date:'2021-07-15',
    title:'生命的折纸，给了 AI 一个大问题。',
    deck:'从氨基酸序列到三维结构，是从一串字母走向一个空间。',
    keywords:['AI','人工智能','生命','生物','蛋白质','基因','DNA','进化','折叠','结构','alphafold','protein','deepmind'],
    paragraphs:[
      '蛋白质的三维结构与它的功能密切相关。AlphaFold 2021 年的研究展示了在 CASP14 评估中高精度预测蛋白质结构的能力。',
      '系统把序列、进化相关信息与几何推理结合起来。来自不同物种的相关序列，可以为结构中的约束关系提供线索。',
      '“读懂生命的折纸”是一种比喻。更值得带走的想法是：一个领域积累了很久的数据，可能在另一种表示方法出现后，突然变得更有用。'
    ],
    boundary:'结构预测不等于完整模拟折叠过程，也不等于理解所有功能、相互作用或疾病。不同区域与蛋白质的预测置信度存在差异。',
    question:'什么答案，已经以你暂时读不懂的形式藏在数据里？',
    sources:[{title:'Highly Accurate Protein Structure Prediction with AlphaFold',by:'Jumper 等 · Nature · 2021',url:'https://www.nature.com/articles/s41586-021-03819-2'}],related:['evolution-tinkering','attention','slime-city']
  },
  {
    id:'evolution-tinkering',number:'11',topics:['进化','设计'],type:'理论与类比',year:'1977',date:'1977-06-10',
    title:'进化，更像一个舍不得丢零件的修补匠。',
    deck:'生命并非每次都从白纸开始。新功能，常常从旧材料里长出来。',
    keywords:['进化','生命','生物','设计','创造力','原创','模仿','软件','历史','约束','技术债','evolution','design','creativity'],
    paragraphs:[
      'François Jacob 在《Evolution and Tinkering》中，用修补匠的比喻讨论进化：它在历史留下的材料与结构上改动，不像工程师那样按一张预先完成的蓝图施工。',
      '这与软件维护有一种有趣的相似：旧的约束不会因为新目标出现，就自动消失。改动必须从当前可以使用的部件出发。软件类比是这里的延伸解释。',
      '做原创时，不妨先问：手里已经有什么？哪些旧东西换一个搭配，会承担全新的工作？这个问题不需要等待一张空白的桌子。'
    ],
    boundary:'自然选择没有人的意图或远见。“修补匠”和“技术债”都是帮助思考的类比，不能把进化过程直接等同于软件工程。',
    question:'你的原创，会不会已经藏在现成的零件之间？',
    sources:[{title:'Evolution and Tinkering',by:'François Jacob · Science · 1977',url:'https://pubmed.ncbi.nlm.nih.gov/860134/'}],related:['alphafold','pagerank','slime-city']
  },
  {
    id:'overfit',number:'12',topics:['AI','统计'],type:'算法实验',year:'2017',date:'2017',
    title:'连随机答案都能背会，才更值得警惕。',
    deck:'训练题全对，只说明你答对了训练题。',
    keywords:['AI','人工智能','统计','数学','随机','过拟合','规律','预测','投资','周期','数据','科学','学习','overfitting','prediction','random'],
    paragraphs:[
      'Zhang 等人的实验表明，足够大的神经网络可以拟合被随机打乱的图像标签，甚至可以拟合无结构的随机噪声。这迫使研究者重新思考为什么有些大模型能够泛化。',
      '泛化（generalization）指在没见过的数据上仍然有效。训练表现好，不足以区分模型学到了可迁移规律，还是记住了有限样本。',
      '把这个问题带去观察任何漂亮的历史规律：它有没有在未参与构建的新数据上接受检验？这是统计思维的应用，不是该论文对某个投资策略的测试。'
    ],
    boundary:'研究并未证明神经网络只会记忆。它恰恰说明，单靠模型容量或训练误差，难以完整解释泛化表现。',
    question:'这个规律，愿意接受一次没有提前见过的考试吗？',
    sources:[{title:'Understanding Deep Learning Requires Rethinking Generalization',by:'Zhang 等 · ICLR · 2017',url:'https://arxiv.org/abs/1611.03530'}],related:['bitcoin-clock','retrieval','shannon-music']
  }
];
