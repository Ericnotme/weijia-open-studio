# 脑膜瘤研究工程脚手架 v0.1

**尚未训练 / 未临床验证 / 未启用患者影像推理。** 本包没有模型权重、训练结果或临床准确率。

Python 3.10+，仅标准库，无依赖安装、网络调用、GPU、账户或医学数据协议。命令均在此目录执行：

```sh
python3 -m unittest discover -s tests -v
python3 scaffold.py validate manifest.example.json
python3 scaffold.py split manifest.example.json --out output
python3 scaffold.py demo --out output
python3 scaffold.py evaluate manifest.example.json output/split.json output/synthetic-cases.json --out output
```

## 已实现与边界

- manifest 校验的是**声明的元数据**，不能代替实际 NIfTI 读取、图像几何质控、去标识审核。
- 本版本只接受 synthetic=true 与 synthetic:// 输入，真实数据在入口阻止。不要修改标记来绕过门禁。
- manifest 的 task 是独立研究任务；men_four_sequence 必需 T1n、T1c、T2w、FLAIR；men_rt_t1c 必需 T1c。尺寸/体素间距/方向/grid_id 不一致会失败。通道順序以未来核实后的模型配置为准。
- 以匿名患者 ID 整组划分，不以切片、病灶、序列或就诊次数随机拆分。跨中心的同一患者需预先一致化 ID。默认约 60/20/20 是工程演示，不是样本量或研究设计建议。
- 可用 --external-center SYN-C2 演示中心留出；该中心涉及的患者全部进入测试集，避免跨中心重复患者泄漏。合成中心留出不是已完成外部验证。
- 哈希排序与固定种子使划分可复现；保存 manifest SHA256。冻结后变更 manifest 或重复/遗漏 study 会被拒绝。冻结测试集仅作最终评估，不作调参或阈值选择。
- evaluate 只允许完整冻结测试集，防止挑选报告；二值标签逐研究 Dice，先在患者内平均，再对有定义的患者平均，避免多次检查者权重更高。
- 双空掩膜 Dice 为 null，单独计数，不按 1 填充抬高平均。负标签有阳性预测为 Dice=0，同时报告负例假阳性例数。明确有效分母；输出是工程测试值。
- 合成数组只测试工程契约；没有模拟 MRI 分布、医生标签或临床分割难度。绝不把结果称为临床准确率。

## 尚未实现（真实研究前必须完成）

NIfTI/DICOM 输入、数据去标识、完整预处理/配准与逆变换、模型架构/训练器/推理器、许可证与权重校验、真实队列质控、病灶级敏感度及假阳性、HD95（含空掩膜规则）、体积偏差、患者级 bootstrap 置信区间、中心/尺寸/术前术后/设备分层、独立外部验证和临床失败审核。

未来训练要预注册研究方案与纳排标准；受试者级分组，任何标准化/参数选择只在训练/验证集合完成；记录源码与环境锁、数据与权重校验和、随机种子、超参数、早停、最终测试的唯一版本。须由专业团队审查小病灶、钙化/少强化、术后改变、颅底与颅外组织丢失等失败。平均 Dice 不等于个人可信度；不设“Dice 0.9 就安全”的门槛。

## 候选路线与许可核查

- 官方接口：https://brats.readthedocs.io/en/stable/guides/segmentation/ 。MeningiomaSegmenter 的 BraTS23_1/BraTS23_2 为四序列候选基线，未安装未运行。
- MEN-RT：https://pmc.ncbi.nlm.nih.gov/articles/PMC12948943/ 。T1c 放疗 GTV，可能包含术后腔；不是诊断模型，不能因缺少其他序列便切换任务。该论文说明数据为 CC-BY-NC，获取前仍须检查具体入口条件。
- 2023 数据入口：https://www.synapse.org/Synapse:syn51514106 。未接受协议、未下载。论文许可不等于数据或衍生权重许可。
- 候选权重：https://github.com/ecalabr/nnUNet_models 。权重许可与 Task90x 通道配置尚未核实，未下载、未部署。
- 失败模式：https://arxiv.org/html/2405.09787v2 ；预处理：https://arxiv.org/html/2305.07642v1 。

优先核实合规 checkpoint 的基线，再考虑医生标注且已授权队列的微调。仅在数据/权重权利、知情授权、私密处理地点、完整输入、空间变换、独立患者评价与临床审核就绪后，才设计真实训练或推理。没有这些条件，不能宣称从零训练已完成。单个病例不能证明可靠。

公开站点只包含代码、合成示例和通用资料。此代码许可不授予任何第三方医学数据或权重权利。
