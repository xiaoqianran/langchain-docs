<!-- langchain-docs: Delete experiment view override configuration | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/delete-experiment-view-override-configuration -->

# Delete experiment view override configuration

/langsmith/langsmith-platform-openapi.json delete /datasets/{dataset_id}/experiment-view-overrides/{id}
Permanently deletes an experiment view override configuration for a dataset.
This operation removes all column override settings including color gradients,
precision configurations, and visibility settings.

After deletion, the experiment view will revert to default column display settings.
This action cannot be undone - you will need to recreate the override configuration
if you want to restore custom column settings.

Both the dataset and override must exist and be accessible by the authenticated user.
The operation will fail if the override doesn't exist or if the user doesn't have
appropriate permissions for the dataset.