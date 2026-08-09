<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Revoke All Slack Tokens For Workspace | https://docs.langchain.com/api-reference/auth-service-v2/revoke-all-slack-tokens-for-workspace -->

# 撤销工作区的所有 Slack 令牌

https://api.host.langchain.com/openapi.json 删除/v2/auth/tokens/workspace/slack
撤销工作区的所有 Slack 令牌。完全断开 Slack 的管理员专用操作。

这是一种破坏性操作：
- 撤销工作区中所有用户的 Slack 端的所有 Slack 令牌
- 从数据库中删除所有 Slack 令牌