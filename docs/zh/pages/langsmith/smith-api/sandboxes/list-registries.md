<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List registries | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-registries -->

# 列出注册表

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/sandboxes/registries
列出用于拉取私有映像的沙箱注册表。
具有 page_size 和光标的页面，重播 next_cursor 直到它为空。结果按最新顺序排列，在相同的创建时间下具有稳定的顺序。保持页面之间的过滤器不变。
没有 page_size 或光标的请求保留旧的默认值 50 个结果。游标请求默认为 20 个结果，最多 100 个。