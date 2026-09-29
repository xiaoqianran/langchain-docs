<!-- langchain-docs: Reinstate org personal access token | https://docs.langchain.com/langsmith/smith-api/orgs/reinstate-org-personal-access-token -->

# Reinstate org personal access token

/langsmith/langsmith-platform-openapi.json delete /api/v1/orgs/current/personal-access-tokens/{pat_id}/revocation
Lift a revocation, so the personal access token authenticates again.

The token returns to the expiry it was created with, and one whose expiry has
since passed stays expired. If the token was used while revoked, it starts
working again once the rejection leaves the authentication cache. Lifting a
revocation that is not there changes nothing. Callers may always administer
their own tokens; organization admins may administer any member's.