<!-- langchain-docs: Clone a volume (Beta) | https://docs.langchain.com/langsmith/smith-api/sandboxes/clone-a-volume-beta -->

# Clone a volume (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/volumes/{volume}/clone
**Beta:** This API is in active development and may change without notice. Requires sandbox volumes to be enabled for your workspace. Create a new volume holding a copy-on-write copy of an existing one. A volume attached read-write to a sandbox that is not stopped cannot be cloned. Only the volume's creator, or a role with sandboxes:exec, may clone it.