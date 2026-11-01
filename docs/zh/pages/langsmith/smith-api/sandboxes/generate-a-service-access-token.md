<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generate a service access token | https://docs.langchain.com/langsmith/smith-api/sandboxes/generate-a-service-access-token -->

# 生成服务访问令牌

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/boxes/{name}/service-url
创建一个短期 JWT，用于访问在沙箱内特定端口上运行的 HTTP 服务。返回 browser_url（通过重定向设置 auth cookie）、embed_url（对于 iframe；在 URL 片段中携带令牌，因此服务器或引用者不会看到它）、service_url（与 X-Langsmith-Sandbox-Service-Token 标头一起使用）、原始令牌及其过期时间。设置 access=restricted|workspace 以启用持久 LangSmith 登录（无令牌；用户使用正常的 LangSmith 会话进行身份验证），或设置 access=off 以禁用它。 embed_origins 命名可能在 iframe 中显示 URL 的页面。在代币模式下，它们被绑定到铸造的代币中；通过 LangSmith 登录，它们存储在授权中，并且查看者通过 LangSmith 弹出窗口从框架内部登录。 LangSmith 登录和令牌访问对于每个服务 URL 是互斥的。