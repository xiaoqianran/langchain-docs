<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generate a service access token | https://docs.langchain.com/langsmith/smith-api/sandboxes/generate-a-service-access-token -->

# 生成服务访问令牌

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/boxes/{name}/service-url
创建一个短期 JWT，用于访问在沙箱内特定端口上运行的 HTTP 服务。返回 browser_url（通过重定向设置 auth cookie）、service_url（与 X-Langsmith-Sandbox-Service-Token 标头一起使用）、原始令牌及其过期时间。设置 access=restricted|workspace 以启用持久 LangSmith 登录（无令牌；用户使用正常的 LangSmith 会话进行身份验证），或设置 access=off 以禁用它。 LangSmith 登录和令牌访问对于每个服务 URL 是互斥的。