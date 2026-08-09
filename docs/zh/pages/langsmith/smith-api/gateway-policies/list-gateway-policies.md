<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List gateway policies | https://docs.langchain.com/langsmith/smith-api/gateway-policies/list-gateway-policies -->

# 列出网关策略

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/gateway-policies
返回当前组织中的每个网关策略。
响应包括管理员创建的策略和
`default_spend_cap` 的运行时物化子代和
`default_rate_limit` 保单（儿童携带`parent_policy_id`）。

**支出跟踪：** 每项支出上限政策均包含
`current_spend_usd` — 保单中累计的支出
活动窗口。

**过滤器**（全部可选）：
- `policy_type` — `spend_cap`、`default_spend_cap`、`guard`、`route_config`、`rate_limit` 或 `default_rate_limit`
- `subject_matcher_key` + `subject_matcher_value` — 缩小到
subject_matchers 包含 `{key, value}` 的策略

用于按一组主题值（例如许多
一次运行_rule_ids），使用 POST
`/v1/platform/gateway-policies/search`；它接受
JSON 正文中的值并避免 URL 长度上限
重复的查询参数会大规模发生。