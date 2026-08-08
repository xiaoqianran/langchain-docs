<!-- langchain-docs: Delete feedback config endpoint | https://docs.langchain.com/langsmith/smith-api/feedback-configs/delete-feedback-config-endpoint -->

# Delete feedback config endpoint

/langsmith/langsmith-platform-openapi.json delete /api/v1/feedback-configs
Soft delete a feedback config by marking it as deleted.

The config can be recreated later with the same key (simple reuse pattern).
Existing feedback records with this key will remain unchanged.