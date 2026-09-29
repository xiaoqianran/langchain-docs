<!-- langchain-docs: Get experiment view override configurations for a dataset | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/get-experiment-view-override-configurations-for-a-dataset -->

# Get experiment view override configurations for a dataset

/langsmith/langsmith-platform-openapi.json get /datasets/{dataset_id}/experiment-view-overrides
Retrieves all experiment view override configurations for a specific dataset.
This endpoint returns column display overrides including color gradients,
precision settings, and column visibility configurations that customize how
experiment results are displayed in the UI.

The response includes all column overrides with their display settings:
- Column identifiers (must start with inputs, outputs, reference_outputs, feedback, metrics, attachments, or metadata)
- Color gradients for numeric data visualization
- Precision settings for numeric columns (1-6 decimal places)
- Hide flags to control column visibility