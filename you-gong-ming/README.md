# you-gong-ming — clean source export

Fictional-adult dating-product prototype. No real member pool, private profiles, messages or invitations. Original generated photograph replaced by geometric SVG.

See [EXPORT.md](EXPORT.md) for exact source snapshot, run instructions, omissions and verification. The root MIT license covers original code only; see [LICENSE-SCOPE.md](LICENSE-SCOPE.md).

## Original project documentation

# 有共鸣 · Resonance

**心动有理由，相处有画面。**

有共鸣把复杂的自我介绍，转译成可理解的生活画像、具体的相处提案和第一次见面计划。这是一个可在桌面与手机浏览器使用的交友产品原型：有完整交互，全部使用虚构人物，没有真实用户池。

## X 因素

> 它终于把我讲明白了，而且让我看见，我们在一起可能怎样生活。

产品用可修改的事实与具体问题解释共鸣。不提供吸引力排名、关系成功率或“完美伴侣”承诺。共同兴趣不能覆盖城市、婚育等重要分歧。

## 当前能用的功能

- 输入介绍，识别兴趣提示，手动确认兴趣、生活城市、作息、沟通与婚育想法。
- 即时看到生活画像，并复制一份自然语言自我介绍。
- 切换两位虚构人物，查看共同兴趣、见面条件与需先讨论的分歧。
- 自选活动、日期、时间、城市、预算与时长，生成分段见面计划。
- 复制提案、下载文案、导出带 UTC 时间的个人日历草稿；不向任何人发邀请。
- 体验见面后的自我反思；刷新页面即可清除输入。
- 可选 WebMCP 工具：读状态、确认画像、切换人物、创建本地草稿；不支持的浏览器自动跳过。

## 启动

无第三方运行依赖，无 API key，无构建步骤。

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 `http://127.0.0.1:4173/`。ES modules 需要 HTTP 服务，不要直接双击 HTML。

```sh
npm test
npm run check
```

`dist/` 是有意跟踪的源文件目录，并非自动生成产物。整个站点可静态部署；Sites 配置位于 `.openai/hosting.json`。

## 文件

- `dist/index.html`：官方概念主页、品牌文案、常见问题。
- `dist/styles.css`：桌面和手机适配的视觉系统。
- `dist/app.js`：三步体验、状态管理、导出、WebMCP。
- `dist/engine.mjs`：可独立验证的画像、比较、日期与日历逻辑。
- `tests/engine.test.mjs`：重要分歧、输入、日期、导出与隐私边界测试。
- `docs/PRODUCT.md`：定位、核心流程与验证方案。
- `docs/STORE-COPY.md`：与现有功能一致的商店文案草稿及上架前差距。
- `docs/PRIVACY.md`：原型的数据边界。
- `docs/ASSETS.md`：专用主视觉的来源与生成提示。

## 真实边界

当前使用本地规则与经过确认的选项，没有调用 AI 模型。自由文字的识别只提供有限的关键词提示，复杂否定或语境可能识别不准，用户必须可修改。画像不试图从原文推断人格、健康、资产或遗传特征。

没有账户、服务器数据库、真实人物推荐、聊天、支付、推送或真实预约。该版本不是已发布的 App Store 应用。未来接入模型必须保留用户核对、来源解释和数据授权；密钥只能保存在服务端。

页面自身不保存或上传介绍和反馈，不加载第三方统计、字体或图片链接。托管平台可能有登录与访问日志。源代码及示例不包含创作者的聊天档案、联系方式、财务、健康或家庭明细。

本项目是独立产品概念，与“良配”品牌没有从属或合作关系。
