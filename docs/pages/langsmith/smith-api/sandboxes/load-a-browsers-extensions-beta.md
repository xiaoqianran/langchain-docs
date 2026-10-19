<!-- langchain-docs: Load a browser's extensions (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/load-a-browsers-extensions-beta -->

# Load a browser's extensions (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/browsers/{name}/extensions/load
Beta: load the unpacked extensions placed in the browser's /var/lib/browserd/extensions (one per directory) that its Chrome does not have yet. Chrome loads them while running, so windows, tabs and connections are left as they are. Extensions already loaded stay loaded, even if removed from the directory, until Chrome next launches.