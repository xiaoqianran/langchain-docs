<!-- langchain-docs: Delete feedback config endpoint | https://docs.langchain.com/langsmith/smith-api/feedback-configs/delete-feedback-config-endpoint -->

# Delete feedback config endpoint

/langsmith/langsmith-platform-openapi.json delete /api/v1/feedback-configs
Soft delete one feedback config by id, or every config of a feedback key.

The config can be recreated later with the same key (simple reuse pattern).
Existing feedback records with this key will remain unchanged. Deleting an
enforced config turns off its enforcement instead of removing it, and needs
the feedback-configs:manage-enforced permission.
Deleting an unenforced config that an annotation queue uses is refused.