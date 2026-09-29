<!-- langchain-docs: Get the annotation queue item count | https://docs.langchain.com/langsmith/smith-api/annotation_queues/get-the-annotation-queue-item-count -->

# Get the annotation queue item count

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/annotation-queues/{queue_id}/items/count
Returns the number of annotation queue items in one status bucket. The two time windows are independent: start_time/end_time bound when an item was archived, min_start_time/max_start_time bound when its trace ran. Items with no trace start time are excluded when either of the latter is set.