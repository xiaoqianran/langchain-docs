<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update an annotation queue item | https://docs.langchain.com/langsmith/smith-api/annotation_queues/update-an-annotation-queue-item -->

# 更新注释队列项

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/annotation-queues/{queue_id}/items/{item_id}
部分更新 RUN 或 THREAD 注释队列项的可变时间戳（added_at、last_reviewed_time）。省略字段，或传递 JSON null，以使其保持不变。