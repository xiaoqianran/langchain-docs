<!-- langchain-docs: Create a browser (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-a-browser-beta -->

# Create a browser (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/browsers
Beta: create a browser sandbox, which runs one persistent Chrome that other sandboxes attach to. Logins made in it persist across restarts. It keeps its memory when it stops and is never deleted automatically.