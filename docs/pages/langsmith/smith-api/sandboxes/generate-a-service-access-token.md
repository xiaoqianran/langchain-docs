<!-- langchain-docs: Generate a service access token | https://docs.langchain.com/langsmith/smith-api/sandboxes/generate-a-service-access-token -->

# Generate a service access token

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/boxes/{name}/service-url
Create a short-lived JWT for accessing an HTTP service running on a specific port inside a sandbox. Returns a browser_url (sets auth cookie via redirect), a service_url (for use with the X-Langsmith-Sandbox-Service-Token header), the raw token, and its expiry.