<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Start a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/start-a-sandbox -->

# 启动沙箱

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/boxes/{name}/start
启动已停止或失败的沙箱。该端点不是幂等的。可选的卷字段是测试版，需要为您的工作区启用沙箱卷。省略它以保留附件，或发送一个空数组以分离所有卷。更改附件需要停止或失败的沙箱、对其的运行时访问（其创建者或沙箱：exec），并且对于每个新附加的卷，成为其创建者或持有沙箱：exec。如果启动的卷与捕获的沙箱保存的内存不同，则启动会失败并返回 409，除非设置了丢弃内存，这会在没有该内存的情况下冷启动沙箱。