<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Oauth Callback Get | https://docs.langchain.com/api-reference/auth-service-v2/oauth-callback-get -->

# Oauth回调获取

https://api.host.langchain.com/openapi.json 获取/v2/auth/callback/{provider_id}
处理来自 OAuth 提供商的 OAuth 回调重定向。

当 LANGSMITH_URL 为时，始终委托给前端主机 oauth-callback
集——包括主体-主体会话——所以最终确定会经历
经过身份验证的 POST 回调（组织范围）。未经身份验证的 GET 永远不会铸币
或为代理主体绑定令牌。