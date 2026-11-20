<!-- langchain-docs: Query traces | https://docs.langchain.com/langsmith/smith-api/runs/query-traces -->

# Query traces

/langsmith/langsmith-platform-openapi.json post /api/v2/traces/query
GET with body payload — no resources created. Returns the traces matching the query passed as the request payload.

Returns a paginated list of traces (root runs) for a single tracing project. Each item carries the trace's root run plus optional trace-wide aggregates (`total_tokens`, `total_cost`, `first_token_time`) under `trace_aggregates`, so clients never have to merge by `trace_id`.

Traces are scanned within a `start_time` window: `min_start_time` defaults to 24 hours before the request, `max_start_time` defaults to the request time. Set either explicitly to widen or narrow the window.

Supports filters (`trace_filter`, `tree_filter`), cursor pagination (`cursor`), and field projection (`selects`).

`ai_search` cannot be combined with `sem_filter`. With full AI search enabled, `ai_search` translates natural language into query filters and time bounds and cannot be combined with explicit filter expressions. Otherwise, `ai_search` retains legacy semantic-only behavior. Use `sem_filter` for semantic-only matching combined with structured filters. AI search requires organization consent.
When semantic matching is needed, `Accept: text/event-stream` is required; requests without it return 406. AI search is unavailable on deployments that route queries to the v1 backend and returns 501 there.

Self-hosted deployments require LangSmith `v0.16` or later.