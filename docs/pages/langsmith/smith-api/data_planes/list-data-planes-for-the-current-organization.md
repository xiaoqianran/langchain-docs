<!-- langchain-docs: List data planes for the current organization | https://docs.langchain.com/langsmith/smith-api/data_planes/list-data-planes-for-the-current-organization -->

# List data planes for the current organization

/langsmith/langsmith-platform-openapi.json get /orgs/current/data-planes
Returns up to 50 data planes owned by the caller's organization across all lifecycle states. Sorted by status priority (active first), then newest first. Requires BYOC to be enabled for the org.
Omit view or use view=FULL for the full response (requires organization:infrastructure:read). view=SUMMARY returns only id, name, api_url, status, and workspaces and requires organization:read or organization:infrastructure:read. Without infrastructure read, workspace references are limited to the caller's memberships.