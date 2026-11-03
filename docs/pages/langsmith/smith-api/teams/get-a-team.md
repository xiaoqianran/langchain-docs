<!-- langchain-docs: Get a team | https://docs.langchain.com/langsmith/smith-api/teams/get-a-team -->

# Get a team

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}
Gets one team in the organization.
An organization scoped team needs organization:teams:read.
A workspace scoped team needs workspaces:teams:read in its workspace.