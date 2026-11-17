<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Load a browser's extensions (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/load-a-browsers-extensions-beta -->

# 加载浏览器的扩展（测试版）

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/browsers/{name}/extensions/load
Beta：使浏览器的 Chrome 与其 /var/lib/browserd/extensions 中解压的扩展保持一致（每个目录一个）。在具有相同清单名称的多个清单中，仅加载最高的清单版本，因此安装在旧版本旁边的新版本会替换它。 Chrome 尚未加载的扩展程序会在运行时加载，因此窗口、选项卡和连接会保持原样。当 Chrome 扩展程序被删除或替换时，Chrome 在运行时无法卸载它，因此它会使用目录的扩展程序重新启动：登录保留，打开的选项卡关闭和连接断开，并且每个窗口返回后调用都会返回。