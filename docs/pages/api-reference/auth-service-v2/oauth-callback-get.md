<!-- langchain-docs: Oauth Callback Get | https://docs.langchain.com/api-reference/auth-service-v2/oauth-callback-get -->

# Oauth Callback Get

https://api.host.langchain.com/openapi.json get /v2/auth/callback/{provider_id}
Handle OAuth callback redirect from OAuth providers.

Always delegates to the frontend host-oauth-callback when LANGSMITH_URL is
set — including agent-subject sessions — so finalize goes through the
authenticated POST callback (org-scoped). Unauthenticated GET never mints
or binds tokens for agent subjects.