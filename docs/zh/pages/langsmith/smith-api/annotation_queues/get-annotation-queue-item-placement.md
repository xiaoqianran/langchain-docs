<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get annotation queue item placement | https://docs.langchain.com/langsmith/smith-api/annotation_queues/get-annotation-queue-item-placement -->

# 获取注释队列项的位置

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/annotation-queues/{queue_id}/items/{item_id}/placement
将 RUN 或 THREAD 项解析到其当前审阅部分和从零开始的位置以进行深度链接。返回的游标将 RUN 和 THREAD 项一起计数，因此它仅对没有 item_type 或开始时间过滤器的列表请求有效。