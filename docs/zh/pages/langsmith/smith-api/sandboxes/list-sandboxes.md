<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List sandboxes | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-sandboxes -->

# 列出沙箱

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/sandboxes/boxes
列出经过身份验证的租户的沙箱，并具有可选的过滤、排序和分页功能。
带有 page_size 和光标的页面：重播响应的 next_cursor 直到它返回 null，这是没有页面剩余的唯一信号。
游标是不透明的，仅在此端点上有效；不要解析或构造一个。