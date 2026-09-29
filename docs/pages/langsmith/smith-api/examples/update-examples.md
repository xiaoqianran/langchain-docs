<!-- langchain-docs: Update examples | https://docs.langchain.com/langsmith/smith-api/examples/update-examples -->

# Update examples

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/datasets/{dataset_id}/examples
This endpoint allows clients to update existing examples in a specified dataset by sending a multipart/form-data PATCH request.
Each form part contains either JSON-encoded data or binary attachment files to update an example.