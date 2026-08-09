<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/update-a-gateway-policy -->

# 更新网关策略

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/gateway-policies/{id}
部分更新网关策略。仅存在于中的字段
应用请求主体；留下缺失的字段
不变。 `policy_type` 是不可变的——改变一个
策略的类型，删除它并创建一个新的。

**配置**（如果提供）必须与策略的类型匹配：
- 支出上限：`{"window": ..., "limit_usd": ...}`
- 守卫：`{"version": 1, "detect": {...}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
- 速率限制：`{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
不匹配的形状将被拒绝并返回 400。

**默认级联：**编辑`default_spend_cap`或
`default_rate_limit` 更新配置/操作/启用/优先级
在每个附加的子策略上，以便模板保留源
各个版本的真相。