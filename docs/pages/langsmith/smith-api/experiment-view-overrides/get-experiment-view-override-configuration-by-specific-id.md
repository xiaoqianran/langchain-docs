<!-- langchain-docs: Get experiment view override configuration by specific ID | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/get-experiment-view-override-configuration-by-specific-id -->

# Get experiment view override configuration by specific ID

/langsmith/langsmith-platform-openapi.json get /datasets/{dataset_id}/experiment-view-overrides/{id}
Retrieves a specific experiment view override configuration using both dataset ID and override ID.
This endpoint provides more precise access to experiment view overrides when you have
the specific override ID, useful for direct links or cached references.

The response includes the same column override information as the dataset-level endpoint:
- Column identifiers with validation prefixes
- Color gradient settings for numeric data visualization
- Numeric precision configurations
- Column visibility controls

Both the dataset and override must exist and be accessible by the authenticated user.