<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Revoke org personal access token | https://docs.langchain.com/langsmith/smith-api/orgs/revoke-org-personal-access-token -->

# Revoke org personal access token

/langsmith/langsmith-platform-openapi.json post /api/v1/orgs/current/personal-access-tokens/{pat_id}/revocation
Revoke a personal access token, so it stops working but its record remains.

The token is marked revoked rather than deleted, and stops authenticating as
soon as its cached auth entry refreshes. Its expiry is left untouched, so the
revocation can be lifted by deleting it. Callers may always revoke their own
tokens; organization admins may revoke any member's.