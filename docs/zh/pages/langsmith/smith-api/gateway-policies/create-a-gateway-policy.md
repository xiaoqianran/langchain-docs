<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/create-a-gateway-policy -->

# 创建网关策略

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/gateway-policies
为调用组织创建网关策略。

**policy_type** 是 `spend_cap`、`default_spend_cap` 之一，
`guard`、`route_config`、`model_fallback`、`rate_limit` 或 `default_rate_limit`。
`config`的形状取决于policy_type：
- `spend_cap` / `default_spend_cap`，一个限制：
`{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}`
- `spend_cap` / `default_spend_cap`，每个窗口的限制：
`{"version": 2, "limits": [{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}]}`
- `guard`：
`{"version": 1, "detect": {"pii": <bool>, "secrets": <bool>, "custom": [{"pattern": "<regex>"}]}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
`timeout_seconds`（可选，0.1–30）限制保护管道执行时间；默认为 2 秒。 `timeout_action` 默认为 `allow`。
`detect.custom`（可选）最多保存一个 Go 正则表达式（RE2 语法），最多 512 字节；匹配的文本已被编辑。避免捕获组：如果存在，则仅编辑第一组，无论该文本出现在何处。
- `route_config`：
`{"strategy": "priority_fallback", "triggers": {"status_codes": [<int>]}, "fallbacks": [{"model_configs": [{"model_config_id": "<playground-settings-uuid>"}]}]}`
`triggers` 是必需的，无默认值：`status_codes` 必须是非空列表（包括上游传输失败的 502 和 504）。 `fallbacks` 包含一个条目，其 `model_configs` 按优先级顺序 (1–5) 进行尝试。 `subject_matchers` 必须是单个 `workspace_id` 条目。
- `model_fallback`：
`{"strategy": "priority_fallback", "triggers": {"status_codes": [429, 502, 503, 504]}, "chain": {"selector": {"type": "provider_model", "provider": "openai", "model": "gpt-4o"}, "candidates": [{"type": "provider_model", "provider": "openai", "model": "gpt-4o-mini"}, {"type": "model_config", "model_config_id": "<playground-settings-uuid>"}]}}``chain.candidates` 是 1-5 个直接提供者模型或保存的工作区模型配置的有序列表。需要一个非空 `workspace_id` 匹配器。 `provider_model` 选择器仅适用于工作区； `alias` 选择器可能会被 `user_id` 或 `api_key_id` 缩小。提供者/模型选择器在工作区中是唯一的，而别名在整个组织中保留，并且可能故意隐藏模型名称。
- `rate_limit` / `default_rate_limit`：
`{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
`limits` 必须非空；每个 `metric`/`window` 对最多只能出现一次。 `value` 是 1..1000000000000000。

**subject_matchers** 是 `{key, value}` 对的列表。内置
键为 `organization_id`、`workspace_id`、`user_id`、`api_key_id`、
和`run_rule_id`。同一键下的值进行 OR 运算；不同的键
是 AND 运算。默认策略使用空的内置匹配器值，因此
运行时为其看到的每个主题具体化一个子对象。一个
`default_spend_cap`和`default_rate_limit`可添加一个空自定义
元数据键将每个主题按相应的
`X-Gateway-*`请求头；物化的孩子存储这两个值。

**动作**目前始终为`block`。支出上限拒绝
达到限制时使用 402 请求；速率限制拒绝
429（带有`Retry-After`提示）超出限制时；守卫
策略在转发到上游之前就地编辑匹配的内容。**由匹配器更新插入：** 对于 `spend_cap`、`default_spend_cap`，
`rate_limit`、`default_rate_limit` 和 `guard`，如果保单包含
该组织中已经存在相同的`subject_matchers`，
现有政策已就地更新，而不是重复
正在被创建。 `id` 被保留。 `route_config` 和 `model_fallback` 不更新插入
by matchers — 每个组织的名称必须是唯一的（409
冲突）。无论哪种方式都返回 201。