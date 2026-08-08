<!-- langchain-docs: Get granular usage | https://docs.langchain.com/langsmith/smith-api/orgs/get-granular-usage -->

# Get granular usage

/langsmith/langsmith-platform-openapi.json get /api/v1/orgs/current/billing/granular-usage
Get granular usage data with flexible grouping.

`kind` selects the billable usage domain:
- `traces` (default): trace counts.
- `langsmith_deployments`: LangSmith Deployment metrics (nodes
  executed, agent runs, agent uptime). The three Deployment fields
  are populated and `traces` is `0`.

`trace_tier` (only meaningful for `kind=traces`) optionally restricts
results to a single retention tier (longlived = extended retention,
shortlived = standard retention). When `group_by=trace_tier`, results
are split into one record per retention tier per time bucket.

`workspace_ids` filters results to the specified workspaces. Only
workspaces the user has read access to are included. When omitted, all
workspaces the user can read are included (avoids enumerating every
workspace id in the URL, which can exceed proxy header limits).