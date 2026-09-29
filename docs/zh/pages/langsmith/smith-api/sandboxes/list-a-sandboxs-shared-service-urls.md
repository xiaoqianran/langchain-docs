<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: List a sandbox's shared service urls | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-a-sandboxs-shared-service-urls -->

# List a sandbox's shared service urls

/langsmith/langsmith-platform-openapi.json get /api/v2/sandboxes/boxes/{name}/service-urls
Returns one entry per port the sandbox is currently reachable on, so a caller can see what is shared before turning it off. Expired token grants are omitted.
Cursors are opaque and only valid on this endpoint; do not parse or construct one.