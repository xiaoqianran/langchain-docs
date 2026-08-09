<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List Token Events For User | https://docs.langchain.com/api-reference/auth-service-v2/list-token-events-for-user -->

# 列出用户的令牌事件

https://api.host.langchain.com/openapi.json 获取/v2/auth/token-events
列出调用用户的 OAuth 连接审核事件，最新的在前。

支持前端“您的连接断开，重新连接”表面。范围为
经过身份验证的用户 + 组织；两者都来自 auth 上下文，而不是来自
请求输入。