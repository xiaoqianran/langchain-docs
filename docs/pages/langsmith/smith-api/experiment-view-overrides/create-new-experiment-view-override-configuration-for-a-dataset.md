<!-- langchain-docs: Create new experiment view override configuration for a dataset | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/create-new-experiment-view-override-configuration-for-a-dataset -->

# Create new experiment view override configuration for a dataset

/langsmith/langsmith-platform-openapi.json post /datasets/{dataset_id}/experiment-view-overrides
Creates a new experiment view override configuration for a dataset with column display settings.
This endpoint allows you to customize how experiment results are displayed by configuring
column-specific overrides including colors, precision, and visibility.

The request must include a 'column_overrides' array with at least one override configuration.
Each column override can specify:
- column: Required field name (must start with inputs, outputs, reference_outputs, feedback, metrics, attachments, or metadata)
- color_gradient: Optional array of [number, color] tuples for numeric data visualization
- precision: Optional number (1-6) for decimal places in numeric columns
- hide: Optional boolean to control column visibility

Example request body:
{
"column_overrides": [
{
"column": "outputs.accuracy",
"color_gradient": [[0.0, "#ff0000"], [0.5, "#ffff00"], [1.0, "#00ff00"]],
"precision": 3
},
{
"column": "inputs.model_type",
"hide": false
}
]
}

This operation fails if an override already exists for the dataset (use PATCH to update).