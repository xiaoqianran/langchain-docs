<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a browser (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-a-browser-beta -->

# 创建一个浏览器（测试版）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers
Beta：创建一个浏览器沙箱，它运行一个持久的 Chrome，其他沙箱附加到该 Chrome。在其中进行的登录在重新启动后仍然存在。当它停止时，它会保留它的记忆。已停止的浏览器将在沙箱默认设置后连同其登录一起删除，除非 delete_after_stop_seconds 设置另一个延迟或 0 来保留它。