<!-- langchain-docs: Stop sharing a sandbox service URL | https://docs.langchain.com/langsmith/smith-api/sandboxes/stop-sharing-a-sandbox-service-url -->

# Stop sharing a sandbox service URL

/langsmith/langsmith-platform-openapi.json delete /api/v2/sandboxes/boxes/{name}/service-urls
Removes the sharing grant for one port, or for every port when port is omitted. A LangSmith login URL stops working immediately. A previously minted service token is not revoked and stays valid until it expires, but no new one can be issued from the removed grant.