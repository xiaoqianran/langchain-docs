<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/delete-a-gateway-policy -->

# 删除网关策略

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/gateway-policies/{id}
删除网关策略。后续读取返回 404。

**默认级联：**删除`default_spend_cap`或
`default_rate_limit` 还删除每个子策略
从中具体化。