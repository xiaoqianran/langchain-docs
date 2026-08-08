<!-- langchain-docs: Oauth Callback | https://docs.langchain.com/api-reference/auth-service-v2/oauth-callback -->

# Oauth Callback

https://api.host.langchain.com/openapi.json post /v2/auth/callback/{provider_id}
Finalize an OAuth flow.

Claims the auth request, verifies the caller, exchanges the code, and saves the token.
Used by both the frontend bridge and the headless flow (where a customer-owned service
forwards the code/state, optionally proxied through smith-go).

User-subject sessions require the authenticated caller to match the initiator.
Agent-subject sessions (MDA Connect) skip that match — start is gated by
``deployments:create`` / service key, and the FE bridge may present a different
same-org workspace session to complete consent — then bind via
``host_oauth_agent_connections``.