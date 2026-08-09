<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get openid connect userinfo | https://docs.langchain.com/langsmith/smith-api/oauth/get-openid-connect-userinfo -->

# 获取openid连接用户信息

/langsmith/langsmith-platform-openapi.json 获取 /userinfo
返回由 LangSmith 访问令牌表示的用户的身份声明，该令牌的受众是身份资源或 API 资源。令牌作为授权标头中的承载凭证进行传递（OpenID Connect Core 1.0 §5.3）。