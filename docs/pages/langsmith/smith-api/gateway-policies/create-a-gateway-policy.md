<!-- langchain-docs: Create a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/create-a-gateway-policy -->

# Create a gateway policy

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/gateway-policies
Creates a gateway policy for the calling organization.

**policy_type** is one of `spend_cap`, `default_spend_cap`,
`guard`, `route_config`, `rate_limit`, or `default_rate_limit`.
The shape of `config` depends on policy_type:
- `spend_cap` / `default_spend_cap`:
`{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}`
- `guard`:
`{"version": 1, "detect": {"pii": <bool>, "secrets": <bool>}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
`timeout_seconds` (optional, 0.1–30) caps guard pipeline execution time; defaults to 2s. `timeout_action` defaults to `allow`.
- `route_config`:
`{"strategy": "priority_fallback", "triggers": {"status_codes": [<int>]}, "fallbacks": [{"model_configs": [{"model_config_id": "<playground-settings-uuid>"}]}]}`
`triggers` is required, with no default: `status_codes` must be a non-empty list (include 502 and 504 for upstream transport failures). `fallbacks` contains an entry whose `model_configs` are tried in priority order (1–5). `subject_matchers` must be a single `workspace_id` entry.
- `rate_limit` / `default_rate_limit`:
`{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
`limits` must be non-empty; each `metric`/`window` pair may appear at most once. `value` is 1..1000000000000000.

**subject_matchers** is a list of `{key, value}` pairs.
`key` is one of `organization_id`, `workspace_id`, `user_id`,
`api_key_id`, or `run_rule_id`. Multiple matchers AND together. A
`default_spend_cap` or `default_rate_limit` uses `{key, value: ""}`
so the runtime materializes a per-subject child for every distinct
subject of that kind it sees in request metadata.

**action** is currently always `block`. Spend caps reject the
request with 402 when the limit is hit; rate limits reject with
429 (with a `Retry-After` hint) when a limit is exceeded; guard
policies redact matched content in-place before forwarding upstream.

**Upsert by matchers:** for `spend_cap`, `default_spend_cap`,
`rate_limit`, `default_rate_limit`, and `guard`, if a policy with
the same `subject_matchers` already exists in this organization,
the existing policy is updated in place instead of a duplicate
being created. `id` is preserved. `route_config` does not upsert
by matchers — name must be unique per organization (409 on
conflict). Returns 201 either way.