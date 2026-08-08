<!-- langchain-docs: Update existing experiment view override configuration | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/update-existing-experiment-view-override-configuration -->

# Update existing experiment view override configuration

/langsmith/langsmith-platform-openapi.json patch /datasets/{dataset_id}/experiment-view-overrides/{id}
Updates an existing experiment view override configuration by completely replacing
the column overrides for the specified dataset and override ID.

This endpoint performs a complete replacement of the column overrides configuration.
All existing column overrides will be replaced with the new configuration provided
in the request body. To add or modify individual columns, include the complete
desired configuration in the request.

The request format is identical to the create endpoint:
- column_overrides: Required array with at least one override configuration
- Each override can specify color gradients, precision, and visibility

Example request body:
{
"column_overrides": [
{
"column": "metrics.f1_score",
"color_gradient": [[0.0, "#ff4444"], [0.8, "#44ff44"]],
"precision": 4
},
{
"column": "feedback.rating",
"hide": false
}
]
}

Both the dataset and override must exist and be accessible by the authenticated user.