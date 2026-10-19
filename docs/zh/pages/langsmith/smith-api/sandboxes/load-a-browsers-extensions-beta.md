<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Load a browser's extensions (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/load-a-browsers-extensions-beta -->

# 加载浏览器的扩展（测试版）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers/{name}/extensions/load
Beta：加载浏览器的 /var/lib/browserd/extensions（每个目录一个）中 Chrome 还没有的解压扩展。 Chrome 在运行时加载它们，因此窗口、选项卡和连接保持原样。即使从目录中删除，已加载的扩展程序仍会保持加载状态，直到 Chrome 下次启动。