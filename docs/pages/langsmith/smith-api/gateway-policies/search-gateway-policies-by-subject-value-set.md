<!-- langchain-docs: Search gateway policies by subject value set | https://docs.langchain.com/langsmith/smith-api/gateway-policies/search-gateway-policies-by-subject-value-set -->

# Search gateway policies by subject value set

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/gateway-policies/search
Batch variant of GET /v1/platform/gateway-policies for
fetching policies that match a set of subject_matcher_values
under one subject_matcher_key. Accepts the values in a JSON
body so callers can include hundreds of subject ids without
bumping into per-server URL-length limits.

Visibility, response shape, and matcher semantics are
identical to the GET list. With `subject_matcher_values`
empty (or omitted) this returns the same result as GET
with only `policy_type` set.