<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/create-a-gateway-policy -->

# 创建网关策略

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/gateway-policies
为调用组织创建网关策略。

**policy_type** 是 `spend_cap`、`default_spend_cap` 之一，
`guard`、`route_config`、`rate_limit` 或 `default_rate_limit`。
`config`的形状取决于policy_type：
- `spend_cap` / `default_spend_cap`：
`{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}`
- `guard`：
`{"version": 1, "detect": {"pii": <bool>, "secrets": <bool>}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
`timeout_seconds`（可选，0.1–30）限制保护管道执行时间；默认为 2 秒。 `timeout_action` 默认为 `allow`。
- `route_config`：
`{"strategy": "priority_fallback", "triggers": {"status_codes": [<int>]}, "fallbacks": [{"model_configs": [{"model_config_id": "<playground-settings-uuid>"}]}]}`
`triggers` 是必需的，无默认值：`status_codes` 必须是非空列表（包括上游传输失败的 502 和 504）。 `fallbacks` 包含一个条目，其 `model_configs` 按优先级顺序 (1–5) 进行尝试。 `subject_matchers` 必须是单个 `workspace_id` 条目。
- `rate_limit` / `default_rate_limit`：
`{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
`limits` 必须非空；每个 `metric`/`window` 对最多只能出现一次。 `value` 是 1..1000000000000000。

**subject_matchers** 是 `{key, value}` 对的列表。
`key` 是 `organization_id`、`workspace_id`、`user_id` 之一，
`api_key_id`，或`run_rule_id`。多个匹配器 AND 在一起。一个
`default_spend_cap` 或 `default_rate_limit` 使用 `{key, value: ""}`
因此运行时为每个不同的对象具体化了一个每个主题的子对象
它在请求元数据中看到的那种主题。**动作**目前始终为`block`。支出上限拒绝
达到限制时使用 402 请求；速率限制拒绝
429（带有`Retry-After`提示）超出限制时；守卫
策略在转发到上游之前就地编辑匹配的内容。

**由匹配器更新插入：** 对于 `spend_cap`、`default_spend_cap`，
`rate_limit`、`default_rate_limit` 和 `guard`，如果保单包含
该组织中已经存在相同的`subject_matchers`，
现有政策已就地更新，而不是重复
正在被创建。 `id` 被保留。 `route_config` 不更新插入
by matchers — 每个组织的名称必须是唯一的（409
冲突）。无论哪种方式都返回 201。