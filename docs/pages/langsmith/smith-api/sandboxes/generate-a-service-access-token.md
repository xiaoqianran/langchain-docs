<!-- langchain-docs: Generate a service access token | https://docs.langchain.com/langsmith/smith-api/sandboxes/generate-a-service-access-token -->

# Generate a service access token

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/boxes/{name}/service-url
Create a short-lived JWT for accessing an HTTP service running on a specific port inside a sandbox. Returns a browser_url (sets auth cookie via redirect), a service_url (for use with the X-Langsmith-Sandbox-Service-Token header), the raw token, and its expiry. Set access=restricted|workspace to instead enable durable LangSmith login (no token; users authenticate with their normal LangSmith session), or access=off to disable it. LangSmith login and token access are mutually exclusive per service URL.