<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Update a volume (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/update-a-volume-beta -->

# Update a volume (Beta)

/langsmith/langsmith-platform-openapi.json patch /api/v2/sandboxes/volumes/{volume}
**Beta:** This API is in active development and may change without notice. Requires sandbox volumes to be enabled for your workspace. Update a volume's description or labels. Each field sent replaces the stored value; omitted fields are unchanged. Null, an empty description, or an empty labels object clears it. Only the volume's creator, or a role with sandboxes:exec, may update it.