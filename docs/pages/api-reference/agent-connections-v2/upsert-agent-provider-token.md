<!-- langchain-docs: Upsert Agent Provider Token | https://docs.langchain.com/api-reference/agent-connections-v2/upsert-agent-provider-token -->

# Upsert Agent Provider Token

https://api.host.langchain.com/openapi.json post /v2/auth/agents/{agent_id}/providers/{provider_id}/tokens
Import an OAuth token and bind it to the agent for the given provider.

Replaces any prior connection for the same agent+provider. The previously
linked token is deleted only when it is agent-owned (no user owner) and no
other agent connections still reference it — user vault credentials and
shared tokens are left intact. Tokens are stored without a LangSmith user
owner so synthetic MDA actor agent_ids resolve via the agent-connection path.