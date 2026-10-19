<!-- langchain-docs: Create links to a browser window (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-links-to-a-browser-window-beta -->

# Create links to a browser window (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/browsers/{name}/attachments/{attachment_id}/links
Beta: mint a view link and an act link for one window, as every attachment response does, with a chosen lifetime and the origins allowed to embed the window's pages in an iframe. Without embed_origins no page may frame them. An embedded page sends its parent window messages when control changes and when it connects or disconnects (see the browser guide). Either link opens the window to anyone who holds it until it expires; detaching the window ends it early. Minting takes being the browser's creator or a role with sandboxes:exec.