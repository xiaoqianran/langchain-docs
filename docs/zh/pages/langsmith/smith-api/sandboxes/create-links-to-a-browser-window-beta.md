<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create links to a browser window (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-links-to-a-browser-window-beta -->

# 创建浏览器窗口的链接（测试版）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers/{name}/attachments/{attachment_id}/links
Beta：为一个窗口创建一个视图链接和一个操作链接，就像每个附件响应一样，具有选定的生命周期和允许将窗口页面嵌入 iframe 中的来源。如果没有 embed_origins ，任何页面都不能框架它们。当控件更改以及连接或断开连接时，嵌入页面会发送其父窗口消息（请参阅浏览器指南）。任一链接都会向持有该链接的任何人打开窗口，直至其过期；拆除窗户会提前结束它。 Minting 是浏览器的创建者或沙箱的角色：exec。