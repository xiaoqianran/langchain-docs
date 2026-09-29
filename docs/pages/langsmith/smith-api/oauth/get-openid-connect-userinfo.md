<!-- langchain-docs: Get openid connect userinfo | https://docs.langchain.com/langsmith/smith-api/oauth/get-openid-connect-userinfo -->

# Get openid connect userinfo

/langsmith/langsmith-platform-openapi.json get /userinfo
Returns identity claims for the user represented by a LangSmith access token whose audience is the identity resource or the API resource. The token is passed as a Bearer credential in the Authorization header (OpenID Connect Core 1.0 §5.3).