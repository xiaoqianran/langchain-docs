<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set who controls a browser window (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/set-who-controls-a-browser-window-beta -->

# 设置谁控制浏览器窗口（Beta）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers/{name}/attachments/{attachment_id}/controller
Beta：将窗口提供给某人（“用户”）或返回到附加的沙箱（“代理”）。立即生效，不等任何人。当人拥有控制权时，附加的沙箱读取或操作页面的命令会失败，并出现“人拥有控制权”错误，并且它不会接收任何页面内容。窗口的当前控制器位于浏览器的附件中。