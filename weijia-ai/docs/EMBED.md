# 跨站接入契约（尚未启用）

先通过真实托管模型验收，再由对应站点的拥有任务集成。当前不能批量部署未连接聊天入口。

推荐链接到统一站点。需要内嵌时，在棋盘下方或桌面侧栏布局槽中，使用 `/?embed=1`。iframe 有清楚标题；移动端宽100%、最小高度36rem、独立滚动；不 fixed、不覆盖棋盘。

```html
<section aria-label="与鲜唯佳的 AI 分身聊天">
  <p>AI 分身，不是本人。对话不默认保存在本页。</p>
  <iframe title="鲜唯佳 AI 分身聊天" src="https://weijia-ai.weijiaxian.chatgpt.site/?embed=1"
    width="100%" height="680" loading="lazy" referrerpolicy="no-referrer"
    allow="microphone 'none'; camera 'none'" style="border:1px solid #dce2d5;border-radius:16px"></iframe>
</section>
```

这个URL是登记的站点源，不代表当前公开或模型已连接。私有Sites身份网关可能限制第三方嵌入；上线后需实际验证，失败时使用新标签页链接。没有postMessage自动采集或跨源消息。接口不开放CORS，所以其他网站应使用同源iframe或明确的后端鉴权方案，不直接调用API。
