<!-- langchain-docs: Oauth Setup Callback | https://docs.langchain.com/api-reference/auth-service-v2/oauth-setup-callback -->

# Oauth Setup Callback

https://api.host.langchain.com/openapi.json get /v2/auth/setup/{provider_id}
Handle OAuth setup callback redirect from GitHub Apps.

This endpoint handles the "Setup URL" callback from GitHub Apps, which is
triggered when a user installs or updates their GitHub App installation.

For "update" actions (user modified repo access via GitHub), we just show
a success page since no token exchange is needed.

For new installations with code/state, we process similar to the regular
OAuth callback.