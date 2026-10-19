<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attach a sandbox to a browser (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/attach-a-sandbox-to-a-browser-beta -->

# 将沙箱附加到浏览器（测试版）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers/{name}/attachments
Beta：为沙箱提供自己的浏览器窗口，或者，在没有沙箱的情况下，为调用者打开一个窗口（或者，使用控制器“代理”，为客户端打开 api_cdp_url 驱动）。响应的 cdp_url 是沙箱连接到的 Chrome DevTools 端点，而 api_cdp_url 是通过 API 的同一端点；客户端可以打开更多选项卡，这些选项卡保留在其窗口中。 Windows 共享浏览器的 cookie 和登录信息。将每个沙箱保留在其自己的窗口中是尽最大努力，而不是安全边界：在浏览器中每次登录时仅附加您信任的沙箱。通过 share_localhost，浏览器还可以通过响应的 localhost_alias 访问沙箱运行的服务器。对于浏览器和附加的沙箱来说，附加需要分别成为其创建者或具有 sandboxes:exec 的角色。如果不受限制，则不会过滤任何内容：窗口的 CDP 客户端（其沙箱或使用其 api_cdp_url 的任何人）可以获得整个浏览器，包括人们的窗口、每个站点的 cookie 以及关闭它的命令。除了任何附加所需之外，它不需要任何其他东西。