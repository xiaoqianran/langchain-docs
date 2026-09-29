<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Share a thread | https://docs.langchain.com/langsmith/smith-api/threads/share-a-thread -->

# Share a thread

/langsmith/langsmith-platform-openapi.json post /api/v2/threads/{thread_id}/share
Mints a public share token for a thread. Idempotent: sharing an
already-shared thread returns the existing token.