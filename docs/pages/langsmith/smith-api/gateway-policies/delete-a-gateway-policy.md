<!-- langchain-docs: Delete a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/delete-a-gateway-policy -->

# Delete a gateway policy

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/gateway-policies/{id}
Deletes a gateway policy. Subsequent reads return 404.

**default cascade:** deleting a `default_spend_cap` or
`default_rate_limit` also deletes every child policy
materialized from it.