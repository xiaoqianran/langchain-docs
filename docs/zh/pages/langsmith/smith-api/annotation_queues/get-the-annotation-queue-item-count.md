<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get the annotation queue item count | https://docs.langchain.com/langsmith/smith-api/annotation_queues/get-the-annotation-queue-item-count -->

# 获取注解队列项数

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/annotation-queues/{queue_id}/items/count
返回一个状态桶中注释队列项的数量。这两个时间窗口是独立的：归档项目时的 start_time/end_time 限制，跟踪运行时的 min_start_time/max_start_time 限制。当设置后者时，没有跟踪开始时间的项目将被排除。