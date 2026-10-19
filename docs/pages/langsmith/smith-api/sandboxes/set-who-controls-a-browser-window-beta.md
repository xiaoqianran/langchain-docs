<!-- langchain-docs: Set who controls a browser window (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/set-who-controls-a-browser-window-beta -->

# Set who controls a browser window (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/browsers/{name}/attachments/{attachment_id}/controller
Beta: give the window to a person ("user") or back to the attached sandbox ("agent"). It takes effect at once and does not wait for anyone. While a person has control, the attached sandbox's commands that read or act on the page fail with a "human has control" error, and it receives no page content. The window's current controller is in the browser's attachments.