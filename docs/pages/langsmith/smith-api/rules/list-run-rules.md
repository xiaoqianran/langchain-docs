<!-- langchain-docs: List run rules | https://docs.langchain.com/langsmith/smith-api/rules/list-run-rules -->

# List run rules

/langsmith/langsmith-platform-openapi.json get /api/v2/runs/rules
List workspace rules in descending updated_at and id order. Filters combine with AND. Pass next_cursor unchanged with the same filters to continue; concurrent changes can affect later pages.