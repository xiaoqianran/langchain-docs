<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add annotation queue items | https://docs.langchain.com/langsmith/smith-api/annotation_queues/add-annotation-queue-items -->

# 添加注释队列项

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/annotation-queues/{queue_id}/items
将 RUN 或 THREAD 项添加到单个注释队列。 RUN 项目需要 run_id ，除非它们是根据建议的示例创建的。 THREAD 项目需要 thread_id 和 project_id。