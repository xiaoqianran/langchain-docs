<!-- langchain-docs: Put org default usage limit | https://docs.langchain.com/langsmith/smith-api/usage-limits/put-org-default-usage-limit -->

# Put org default usage limit

/langsmith/langsmith-platform-openapi.json put /api/v1/usage-limits/org/default
Set the organization's default monthly trace limit and alert thresholds for new workspaces; with `apply_to`, also update existing workspaces without their own limit.

`alert_thresholds` replaces the stored list; omitting it clears the thresholds. To give workspaces alerts without enforcing a limit, set `limit_value` to -1 and send `COUNT` thresholds; `PERCENT` thresholds need a limit.