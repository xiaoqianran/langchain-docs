<!-- langchain-docs: Import Oauth Token | https://docs.langchain.com/api-reference/auth-service-v2/import-oauth-token -->

# Import Oauth Token

https://api.host.langchain.com/openapi.json post /v2/auth/tokens/import
Persist a directly-obtained OAuth token (no authorization-code exchange).

The Slack managed-install flow receives a bot token inline from
``apps.managedInstall`` instead of through the browser OAuth redirect. This
stores it (Fernet-encrypted at rest, via ``create_oauth_token``) for the
caller's org/user against an existing provider. Requiring the provider to
already exist in the caller's org scopes the write and blocks cross-org
token creation. The token value is never logged or returned.