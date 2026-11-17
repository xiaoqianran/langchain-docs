<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List datasets | https://docs.langchain.com/langsmith/smith-api/datasets/list-datasets -->

# 列出数据集

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/datasets
返回工作区中的一页数据集，并按查询参数进行筛选和排序。
将响应的 next_cursor 作为游标传递，使用相同的过滤器和排序，以获取下一页。最后一页的 next_cursor 为空。