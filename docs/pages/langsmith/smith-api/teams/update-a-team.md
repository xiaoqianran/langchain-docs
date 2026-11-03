<!-- langchain-docs: Update a team | https://docs.langchain.com/langsmith/smith-api/teams/update-a-team -->

# Update a team

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/orgs/current/teams/{team_id}
Renames an organization-wide team or changes its description or IdP group mapping.
Omitted fields are left unchanged, and a null description or idp_group_name clears
it. idp_sync_enabled needs an IdP group. A workspace scoped team returns 400: its
workspace grant creates and deletes it. Needs organization:teams:manage.