<!-- langchain-docs: Remove a member from a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/remove-a-member-from-a-user-group -->

# Remove a member from a user group

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/user-groups/{user_group_id}/members/{identity_id}
Removes an organization member from a user group, along with the workspace identities
the user group recorded for them. Returns 204 also when the identity was not a member.
Needs the same permissions as adding members.