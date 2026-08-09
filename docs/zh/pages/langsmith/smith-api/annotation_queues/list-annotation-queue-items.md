<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List annotation queue items | https://docs.langchain.com/langsmith/smith-api/annotation_queues/list-annotation-queue-items -->

# 列出注释队列项

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/annotation-queues/{queue_id}/items
在单个注释队列中列出一个审阅状态部分的 RUN 和 THREAD 项目，并使用不透明的光标分页。可选的 item_type=RUN|THREAD 过滤页面。 Direction=backward 返回提供的光标之前的项目。响应仅包含项目元数据，不包含扩展的运行或线程有效负载。 status=archived 返回已满足队列审核要求的项目，而不仅仅是调用者亲自标记为已完成的项目。