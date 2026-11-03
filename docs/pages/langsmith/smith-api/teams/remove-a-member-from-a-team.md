<!-- langchain-docs: Remove a member from a team | https://docs.langchain.com/langsmith/smith-api/teams/remove-a-member-from-a-team -->

# Remove a member from a team

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/teams/{team_id}/members/{identity_id}
Removes an organization member from a team, along with the workspace identities
the team recorded for them. Returns 204 also when the identity was not a member.
Needs the same permissions as adding members.