<!-- langchain-docs: Get annotation queue item placement | https://docs.langchain.com/langsmith/smith-api/annotation_queues/get-annotation-queue-item-placement -->

# Get annotation queue item placement

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/annotation-queues/{queue_id}/items/{item_id}/placement
Resolve a RUN or THREAD item to its current review section and zero-based position for deep linking. The returned cursor counts RUN and THREAD items together, so it is only valid for a list request with no item_type or start-time filter.