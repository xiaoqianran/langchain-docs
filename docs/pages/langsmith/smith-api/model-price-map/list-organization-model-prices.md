<!-- langchain-docs: List organization model prices | https://docs.langchain.com/langsmith/smith-api/model-price-map/list-organization-model-prices -->

# List organization model prices

/langsmith/langsmith-platform-openapi.json get /api/v1/orgs/current/model-price-map
List the model prices set for this organization.

Returns only the organization's own entries, not the workspace or
LangSmith default entries a workspace also prices against; list those
from a workspace with `GET /model-price-map`.