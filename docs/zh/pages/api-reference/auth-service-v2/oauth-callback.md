<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Oauth Callback | https://docs.langchain.com/api-reference/auth-service-v2/oauth-callback -->

# Oauth 回调

https://api.host.langchain.com/openapi.json post /v2/auth/callback/{provider_id}
完成 OAuth 流程。

声明身份验证请求、验证调用者、交换代码并保存令牌。
由前端桥和无头流使用（其中客户拥有的服务
转发代码/状态，可以选择通过 smith-go 代理）。

用户主体会话要求经过身份验证的调用者与发起者相匹配。
代理-主题会话 (MDA Connect) 跳过该匹配 — 开始由
``deployments:create`` / 服务密钥，FE 桥可能会呈现不同的
同一组织工作区会话以完成同意 - 然后通过绑定
``host_oauth_agent_connections``。