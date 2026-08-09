<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Import Oauth Token | https://docs.langchain.com/api-reference/auth-service-v2/import-oauth-token -->

# 导入 Oauth 令牌

https://api.host.langchain.com/openapi.json 发布 /v2/auth/tokens/import
保留直接获取的 OAuth 令牌（无授权代码交换）。

Slack 托管安装流程从内嵌接收机器人令牌
``apps.managedInstall`` 而不是通过浏览器 OAuth 重定向。这个
存储它（静态时 Fernet 加密，通过 ``create_oauth_token``）
调用者的组织/用户针对现有提供商。要求提供者
已存在于调用者的组织范围内写入并阻止跨组织
代币创建。令牌值永远不会被记录或返回。