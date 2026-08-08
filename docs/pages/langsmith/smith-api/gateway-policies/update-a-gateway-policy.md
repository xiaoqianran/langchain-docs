<!-- langchain-docs: Update a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/update-a-gateway-policy -->

# Update a gateway policy

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/gateway-policies/{id}
Partially updates a gateway policy. Only fields present in
the request body are applied; absent fields are left
unchanged. `policy_type` is immutable — to change a
policy's type, delete it and create a new one.

**config** if supplied must match the policy's type:
- spend-cap:  `{"window": ..., "limit_usd": ...}`
- guard:      `{"version": 1, "detect": {...}, "timeout_seconds": <number>, "timeout_action": "allow"|"block"}`
- rate-limit: `{"version": 1, "limits": [{"metric": "requests"|"tokens", "window": "minute"|"hour", "value": <integer>}]}`
Mismatched shapes are rejected with 400.

**default cascade:** editing a `default_spend_cap` or
`default_rate_limit` updates the config/action/enabled/priority
on every attached child policy so the template stays the source
of truth across rollouts.