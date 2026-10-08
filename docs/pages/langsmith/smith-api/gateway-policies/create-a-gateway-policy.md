<!-- langchain-docs: Create a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/create-a-gateway-policy -->

# Create a gateway policy

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/gateway-policies
Creates a gateway policy for the calling organization.

**policy_type** is one of `spend_cap`, `default_spend_cap`,
`guard`, `route_config`, `model_fallback`, `rate_limit`, or `default_rate_limit`.
The shape of `config` depends on policy_type:
- `spend_cap` / `default_spend_cap`, one limit:
`{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}`
- `spend_cap` / `default_spend_cap`, a limit per window:
`{"version": 2, "limits": [{"window": "hourly"|"daily"|"weekly"|"monthly", "limit_usd": <number>}]}`
- `guard`:
`{"version": 1, "detect": {"pii": <bool>, "secrets": <bool>, "custom": [{"pattern": "<regex>"}]}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
`timeout_seconds` (optional, 0.1–30) caps guard pipeline execution time; defaults to 2s. `timeout_action` defaults to `allow`.
`detect.custom` (optional) holds at most one Go regexp (RE2 syntax) of up to 512 bytes; matching text is redacted. Avoid capture groups: if present, only the first group is redacted, wherever that text appears.
- `route_config`:
`{"strategy": "priority_fallback", "triggers": {"status_codes": [<int>]}, "fallbacks": [{"model_configs": [{"model_config_id": "<playground-settings-uuid>"}]}]}`
`triggers` is required, with no default: `status_codes` must be a non-empty list (include 502 and 504 for upstream transport failures). `fallbacks` contains an entry whose `model_configs` are tried in priority order (1–5). `subject_matchers` must be a single `workspace_id` entry.
- `model_fallback`:
`{"strategy": "priority_fallback", "triggers": {"status_codes": [429, 502, 503, 504]}, "chain": {"selector": {"type": "provider_model", "provider": "openai", "model": "gpt-4o"}, "candidates": [{"type": "provider_model", "provider": "openai", "model": "gpt-4o-mini"}, {"type": "model_config", "model_config_id": "<playground-settings-uuid>"}]}}`
`chain.candidates` is an ordered list of 1–5 direct provider models or saved workspace model configurations. A non-empty `workspace_id` matcher is required. `provider_model` selectors are workspace-only; `alias` selectors may be narrowed by `user_id` or `api_key_id`. Provider/model selectors are unique within a workspace, while alias names are reserved across the organization and may intentionally shadow a model name.
- `rate_limit` / `default_rate_limit`:
`{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
`limits` must be non-empty; each `metric`/`window` pair may appear at most once. `value` is 1..1000000000000000.

**subject_matchers** is a list of `{key, value}` pairs. Built-in
keys are `organization_id`, `workspace_id`, `user_id`, `api_key_id`,
and `run_rule_id`. Values under the same key are ORed; distinct keys
are ANDed. A default policy uses an empty built-in matcher value so
the runtime materializes a child for each subject it sees. A
`default_spend_cap` and `default_rate_limit` may add one empty custom
metadata key to bucket each subject by the corresponding
`X-Gateway-*` request header; the materialized child stores both values.

**action** is currently always `block`. Spend caps reject the
request with 402 when the limit is hit; rate limits reject with
429 (with a `Retry-After` hint) when a limit is exceeded; guard
policies redact matched content in-place before forwarding upstream.

**Upsert by matchers:** for `spend_cap`, `default_spend_cap`,
`rate_limit`, `default_rate_limit`, and `guard`, if a policy with
the same `subject_matchers` already exists in this organization,
the existing policy is updated in place instead of a duplicate
being created. `id` is preserved. `route_config` and `model_fallback` do not upsert
by matchers — name must be unique per organization (409 on
conflict). Returns 201 either way.