<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Search or list items within a namespace prefix. | https://docs.langchain.com/langsmith/agent-server-api/store/search-or-list-items-within-a-namespace-prefix -->

# 搜索或列出名称空间前缀内的项目。

/langsmith/agent-server-openapi.json 发布 /store/items/search
列出按上次更新时间排序的项目。如果提供了 `query`，则执行自然语言搜索。支持`limit`和`offset`分页，以及`filter`过滤。