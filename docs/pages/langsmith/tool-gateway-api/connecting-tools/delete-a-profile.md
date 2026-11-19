<!-- langchain-docs: Delete a profile | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/delete-a-profile -->

# Delete a profile

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/profiles/{profile_id}
Deletes a profile and its credentials, and revokes managed OAuth tokens with their provider. Requires workspaces:credentials:manage. Call as yourself. Returns 204 if the profile is already gone. If credential cleanup fails, retry the delete.