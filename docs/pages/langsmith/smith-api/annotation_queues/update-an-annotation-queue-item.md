<!-- langchain-docs: Update an annotation queue item | https://docs.langchain.com/langsmith/smith-api/annotation_queues/update-an-annotation-queue-item -->

# Update an annotation queue item

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/annotation-queues/{queue_id}/items/{item_id}
Partially update mutable timestamps (added_at, last_reviewed_time) for a RUN or THREAD annotation queue item. Omit a field, or pass JSON null, to leave it unchanged.