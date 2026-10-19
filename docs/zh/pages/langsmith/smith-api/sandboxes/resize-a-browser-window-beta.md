<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Resize a browser window (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/resize-a-browser-window-beta -->

# 调整浏览器窗口大小（测试版）

/langsmith/langsmith-platform-openapi.json 补丁 /api/v2/sandboxes/browsers/{name}/attachments/{attachment_id}
Beta：调整窗口大小，使其页面宽度乘高度 CSS 像素。窗口将保持该大小，直到通过此调用或通过 CDP 使用 Browser.setWindowBounds 再次调整大小；实时视图会缩放以适应它，而不是调整它的大小。未运行的浏览器无法调整大小。