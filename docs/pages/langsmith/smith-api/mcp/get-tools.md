<!-- langchain-docs: Get tools | https://docs.langchain.com/langsmith/smith-api/mcp/get-tools -->

# Get tools

/langsmith/langsmith-platform-openapi.json get /api/v1/mcp/tools
Return MCP tools — from cache if fresh, otherwise by fetching from remote.

On cache miss, tries manifest fetch first (fast), then falls back to full
MCP handshake. Caches the result before returning.

Pass force_refresh=true to bypass the cache and always fetch from the
remote server (the result is still cached via upsert for future requests).

``agent_id`` lets deployment/service-key callers name an agent OAuth
subject. ``ls_user_id`` overrides are limited to service identities.