<!-- langchain-docs: Load a browser's extensions (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/load-a-browsers-extensions-beta -->

# Load a browser's extensions (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/browsers/{name}/extensions/load
Beta: bring the browser's Chrome in line with the unpacked extensions in its /var/lib/browserd/extensions (one per directory). Of several with the same manifest name, only the highest manifest version is loaded, so a newer version installed beside an older one replaces it. Extensions placed there that Chrome does not have yet are loaded while it runs, so windows, tabs and connections are left as they are. When an extension Chrome has was removed or replaced, Chrome cannot unload it while running, so it is relaunched instead with the directory's extensions: logins stay, open tabs close and connections drop, and the call returns once every window is back.