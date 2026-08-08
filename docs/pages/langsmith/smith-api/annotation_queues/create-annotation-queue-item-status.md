<!-- langchain-docs: Create annotation queue item status | https://docs.langchain.com/langsmith/smith-api/annotation_queues/create-annotation-queue-item-status -->

# Create annotation queue item status

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/annotation-queues/items/{queue_item_id}/status
Log the caller's reviewer status for a RUN or THREAD annotation queue item. A null status re-shows the item for this reviewer.