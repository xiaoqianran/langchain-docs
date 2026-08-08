<!-- langchain-docs: List Token Events For User | https://docs.langchain.com/api-reference/auth-service-v2/list-token-events-for-user -->

# List Token Events For User

https://api.host.langchain.com/openapi.json get /v2/auth/token-events
List the calling user's OAuth connection audit events, newest first.

Backs the frontend "your connection dropped, reconnect" surface. Scoped to
the authenticated user + org; both come from the auth context, never from
request input.