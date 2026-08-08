<!-- langchain-docs: List annotation queue items | https://docs.langchain.com/langsmith/smith-api/annotation_queues/list-annotation-queue-items -->

# List annotation queue items

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/annotation-queues/{queue_id}/items
List RUN and THREAD items in a single annotation queue for one review status section, with opaque cursor pagination. Optional item_type=RUN|THREAD filters the page. direction=backward returns items before the supplied cursor. The response contains item metadata only, not expanded run or thread payloads. status=archived returns items whose queue review requirements have been satisfied, not merely items the caller personally marked completed.