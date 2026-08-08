<!-- langchain-docs: Revoke All Slack Tokens For Workspace | https://docs.langchain.com/api-reference/auth-service-v2/revoke-all-slack-tokens-for-workspace -->

# Revoke All Slack Tokens For Workspace

https://api.host.langchain.com/openapi.json delete /v2/auth/tokens/workspace/slack
Revoke ALL Slack tokens for the workspace. Admin-only action that disconnects Slack entirely.

This is a destructive operation that:
- Revokes all Slack tokens on Slack's side for all users in the workspace
- Deletes all Slack tokens from the database