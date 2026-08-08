<!-- langchain-docs: List gateway policies | https://docs.langchain.com/langsmith/smith-api/gateway-policies/list-gateway-policies -->

# List gateway policies

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/gateway-policies
Returns every gateway policy in the current organization.
The response includes both admin-created policies and
runtime-materialized children of `default_spend_cap` and
`default_rate_limit` policies (children carry `parent_policy_id`).

**Spend tracking:** each spend-cap policy carries
`current_spend_usd` — the spend accumulated in the policy's
active window.

**Filters** (all optional):
- `policy_type` — `spend_cap`, `default_spend_cap`, `guard`, `route_config`, `rate_limit`, or `default_rate_limit`
- `subject_matcher_key` + `subject_matcher_value` — narrow to
policies whose subject_matchers contain `{key, value}`

For batch lookups by a set of subject values (e.g. many
run_rule_ids at once), use POST
`/v1/platform/gateway-policies/search`; it accepts the
values in a JSON body and avoids the URL-length ceiling
that a repeated query param would hit at scale.