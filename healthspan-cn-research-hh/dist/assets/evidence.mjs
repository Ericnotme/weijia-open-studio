export const sources = {
 heni:['Stylianou 等 · Nature Food · 2021','https://doi.org/10.1038/s43016-021-00343-4'],
 moore:['Moore 等 · PLOS Medicine · 2012','https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1001335'],
 ding:['Ding 等 · Lancet Public Health · 2025','https://pubmed.ncbi.nlm.nih.gov/40713949/'],
 zhang:['Zhang 等 · BJSM · 2026','https://doi.org/10.1136/bjsports-2025-110503'],
 metformin:['Monami 等 · NMCD · 2021','https://pubmed.ncbi.nlm.nih.gov/33549430/'],
 creatine:['Kreider 等 · ISSN 立场综述 · 2017','https://pubmed.ncbi.nlm.nih.gov/28615996/'],
 who:['WHO · HALE 方法说明','https://www.who.int/data/gho/indicator-metadata-registry/imr-details/7752']
};
// Every numeric effect retains its original measure; never combined or passed to a survival model.
export const drugs = [
 {id:'statin',name:'他汀',population:'纳入他汀试验的患者；不是健康个体的寿命预测',type:'RR',value:.90,ci:[.87,.93],endpoint:'全因死亡',note:'CTT 汇总：LDL-C 每降低 1 mmol/L 的研究比较。不能自行设定治疗目标；绝对获益依赖基线风险。',refs:[['CTT · Lancet · 2010','https://pubmed.ncbi.nlm.nih.gov/21067804/']]},
 {id:'bp',name:'降压治疗',population:'降压随机试验人群',type:'RR',value:.87,ci:[.84,.91],endpoint:'全因死亡',note:'汇总中对应收缩压降低 10 mmHg 的比较。不能由此建议正常血压者自行服药。',refs:[['Ettehad 等 · Lancet · 2016','https://pubmed.ncbi.nlm.nih.gov/26724178/']]},
 {id:'sglt2',name:'SGLT2 抑制剂',population:'射血分数降低的心衰患者',type:'HR',value:.87,ci:[.77,.98],endpoint:'全因死亡',note:'DAPA-HF 与 EMPEROR-Reduced 的汇总。该比较不代表整个药物类别在所有人群中的效应。',refs:[['Zannad 等 · Lancet · 2020','https://pubmed.ncbi.nlm.nih.gov/32877652/']]},
 {id:'glp1',name:'司美格鲁肽（SELECT）',population:'超重或肥胖且已确诊心血管病、无糖尿病的试验参与者',type:'HR',value:.81,ci:[.71,.93],endpoint:'全因死亡（次要终点）',note:'不能外推到无心血管病或正常体重者。需结合试验统计层级、不良反应和治疗适用性解读。',refs:[['SELECT · NEJM · 2023','https://pubmed.ncbi.nlm.nih.gov/37952131/'],['死亡分析 · 2024','https://pubmed.ncbi.nlm.nih.gov/39217559/']]},
 {id:'metformin_dm',name:'二甲双胍（2 型糖尿病）',population:'2 型糖尿病随机试验人群',type:'MH-OR',value:.80,ci:[.60,1.07],endpoint:'全因死亡',note:'13 项 RCT 汇总，区间跨 1，未达统计显著性。这里是优势比，不是 HR；不换算成延寿年数。',refs:[sources.metformin]},
 {id:'metformin_nondm',name:'二甲双胍用于健康人“抗衰”',population:'健康人的延寿用途',type:null,value:null,ci:null,endpoint:'可靠的全因死亡获益尚未确立',note:'糖尿病患者研究不能替代健康人的证据。未知不是无效，也不能用 1.00 填补。',refs:[sources.metformin]},
 {id:'aspirin',name:'阿司匹林（ASPREE）',population:'主要为 ≥70 岁、无已知心血管病的老年试验人群',type:'HR',value:1.14,ci:[1.01,1.29],endpoint:'全因死亡',note:'该试验出现死亡增加信号并有出血风险；不能外推成所有年龄或二级预防都应停药。',refs:[['ASPREE · NEJM · 2018','https://pubmed.ncbi.nlm.nih.gov/30221595/']]},
 {id:'rapamycin',name:'雷帕霉素 / mTOR 抑制剂',population:'健康人的延寿用途',type:null,value:null,ci:null,endpoint:'人类寿命获益尚未确立',note:'动物寿命和人体替代终点不能充当人类全因死亡证据。',refs:[['PEARL · 2025','https://pubmed.ncbi.nlm.nih.gov/40188830/']]}
];
export const supplements = [
 {id:'creatine',name:'肌酸',population:'功能与训练相关研究人群',type:null,value:null,endpoint:'死亡效应未知',note:'功能或训练表现的研究不能换成死亡风险。2017 ISSN 文件是立场综述，不是死亡试验，也不是对使用者的个体安全保证；本站不提供剂量处方。',refs:[sources.creatine]},
 {id:'vitd',name:'维生素 D',population:'纳入补充维生素 D 试验的成人',type:'RR',value:.98,ci:[.95,1.02],endpoint:'全因死亡',note:'52 项 RCT 汇总未显示明确的全因死亡减少；治疗缺乏是另一个临床问题。',refs:[['BMJ · 2019 汇总','https://pubmed.ncbi.nlm.nih.gov/31405892/']]},
 {id:'omega3',name:'鱼油 / Omega-3',population:'纳入长链 Omega-3 试验的成人',type:'RR',value:.97,ci:[.93,1.01],endpoint:'全因死亡',note:'区间跨 1；不能据点估计宣称延寿，也不能与处方制剂的特定适应症混为一谈。',refs:[['Cochrane · 2020','https://pubmed.ncbi.nlm.nih.gov/32114706/']]},
 {id:'multivit',name:'复合维生素',population:'COSMOS 老年试验人群',type:'HR',value:.93,ci:[.81,1.08],endpoint:'全因死亡',note:'该区间包含无效应；认知等其他终点不等于死亡获益。',refs:[['COSMOS · 2022','https://pubmed.ncbi.nlm.nih.gov/35294969/']]},
 {id:'antiox',name:'抗氧化补剂（混合试验）',population:'不同补剂、剂量与健康状态的试验人群',type:null,value:null,endpoint:'不汇成一个个人效应',note:'部分试验提示危害，不能把不同制剂当成相同暴露。请查看原综述的分组与偏倚分析。',refs:[['Cochrane · 2012','https://pubmed.ncbi.nlm.nih.gov/22419320/']]},
 {id:'bcarotene',name:'高剂量 β-胡萝卜素',population:'吸烟者或石棉暴露等高危试验人群',type:null,value:null,endpoint:'肺癌与死亡危害信号',note:'特定高危人群出现危害，不能推广为普通食物中类胡萝卜素有害。',refs:[['ATBC · 1994','https://pubmed.ncbi.nlm.nih.gov/8127329/'],['CARET · 1996','https://pubmed.ncbi.nlm.nih.gov/8602180/']]},
 {id:'vite',name:'高剂量维生素 E',population:'SELECT 男性试验人群',type:null,value:null,endpoint:'前列腺癌，不是全因死亡',note:'不同终点不能统一为全因死亡 HR；不展示“延寿分钟”。',refs:[['SELECT · 2011','https://pubmed.ncbi.nlm.nih.gov/21990298/']]},
 {id:'calcium',name:'钙补剂',population:'原站所列补剂研究',type:null,value:null,endpoint:'全因死亡效应不可由心梗替代',note:'骨健康用途、缺乏状态和心血管结局需要分别评估，不能据单一替代终点排序。',refs:[['USPSTF 证据报告 · 2022','https://pubmed.ncbi.nlm.nih.gov/35727272/']]},
 {id:'nmn',name:'NMN / NR / 白藜芦醇',population:'健康人延寿用途',type:null,value:null,endpoint:'可靠的人类延寿效应未确立',note:'机制、动物和短期生物标志物研究不能换算成健康人的寿命。',refs:[]}
];
export const activities = [['跑步',8.3],['羽毛球',5.5],['快走',4.3],['骑行',6],['游泳',7],['瑜伽 / 普拉提',2.5],['力量训练',5],['功能性训练',5],['HIIT / 跳绳',8],['有氧舞蹈',7.3],['网球',7.3],['篮球',6.5],['徒步',6],['划船机',7],['爬楼梯',8.8]];
export const eras = [
 ['💉','疫苗 · 公共卫生','1796 → 1980','预防疾病与群体负担',['牛痘 / 天花疫苗','脊灰 / 麻疹 / DTP 疫苗'],'天花根除是公共卫生史的里程碑。疾病特异死亡与群体健康负担不能当作个人延寿数。','https://www.who.int/health-topics/smallpox'],
 ['🧫','抗生素时代','1930s → 1940s','治疗细菌感染',['磺胺','青霉素','链霉素'],'抗感染治疗改变了多种感染的预后；长期死亡率变化也受到卫生、营养与医疗条件影响。','https://www.nobelprize.org/prizes/medicine/1945/summary/'],
 ['🫀','心血管时代','1960s → 1990s','以试验人群和终点为单位',['β 受体阻滞剂','ACEI','他汀','溶栓治疗'],'心衰、心梗与卒中属于不同情境，治疗时机和适应症决定获益与风险。','https://pubmed.ncbi.nlm.nih.gov/21067804/'],
 ['💊','溃疡 / 质子泵抑制剂','1970s → 1980s','症状、愈合与并发症',['H2 受体拮抗剂','质子泵抑制剂'],'市场规模不等于全因死亡获益；症状改善和并发症预防也有独立价值。','https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers/treatment'],
 ['🎯','生物药 · 精准时代','1980s → 2000s','疾病特异证据',['重组人胰岛素','利妥昔单抗 / 曲妥珠单抗','伊马替尼'],'疾病患者的生存改善需要放回疾病阶段与治疗对照中理解，不能跨病种排列“延寿效力”。','https://www.cancer.gov/about-cancer/treatment/types/targeted-therapies'],
 ['🧬','HIV 联合治疗','1990s → 现在','长期控制特定感染',['联合抗逆转录病毒治疗'],'规范治疗显著改变 HIV 的预后；这一结局不能作为健康人的抗衰药效应。','https://www.who.int/news-room/fact-sheets/detail/hiv-aids'],
 ['🫘','心肾代谢时代','2010s → 现在','患者获益与适用边界',['沙库巴曲 / 缬沙坦','SGLT2 抑制剂','GLP-1 受体激动剂','PCSK9 抑制剂'],'同一药物类别的不同试验也可能有不同结果。SELECT 无糖尿病人群仍已有心血管病。','https://pubmed.ncbi.nlm.nih.gov/37952131/'],
 ['🧪','前沿 · 未证实','2020s','新技术与证据缺口',['mRNA 疫苗','CRISPR 疗法','抗淀粉样蛋白药物','二甲双胍抗衰 / 雷帕霉素'],'疾病疗效、认知评分、生物标志物和健康人延寿是不同问题；缺少死亡证据记为未知。','https://pubmed.ncbi.nlm.nih.gov/40188830/']
];
