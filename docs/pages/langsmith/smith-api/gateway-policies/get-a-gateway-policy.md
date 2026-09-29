<!-- langchain-docs: Get a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/get-a-gateway-policy -->

# Get a gateway policy

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/gateway-policies/{id}
Returns a single gateway policy by id. Cross-org access is
rejected with 404

**Spend tracking:** spend-cap policies include
`current_spend_usd` for the active window so callers can
read per-policy cost without hitting a separate endpoint.
Guard policies leave it null.