<!-- langchain-docs: Delete a team | https://docs.langchain.com/langsmith/smith-api/teams/delete-a-team -->

# Delete a team

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/teams/{team_id}
Deletes an organization-wide team with its members, workspace grants and access
policies, and the workspace scoped teams under it. A workspace scoped team returns
400: removing its parent's grant in the workspace deletes it. Returns 204 also when
the team does not exist. Needs organization:teams:manage.