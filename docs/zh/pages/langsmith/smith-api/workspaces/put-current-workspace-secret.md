<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Put current workspace secret | https://docs.langchain.com/langsmith/smith-api/workspaces/put-current-workspace-secret -->

# Put current workspace secret

/langsmith/langsmith-platform-openapi.json put /api/v1/workspaces/current/secrets/{key}
Create or update a workspace secret and the hosts it may be sent to.

Omit `value` to keep the current one; it is required to create a secret.
`configs` replaces the secret's hosts; omitted or empty restores the
built-in defaults for known provider keys. The value is never returned.