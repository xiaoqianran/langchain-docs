<!-- langchain-docs: Get audit logs | https://docs.langchain.com/langsmith/smith-api/audit-logs/get-audit-logs -->

# Get audit logs

/langsmith/langsmith-platform-openapi.json get /api/v1/audit-logs
Retrieve audit log records for the authenticated user's organization in OCSF format.

Requires both start_time and end_time parameters to filter logs within a date range.
Supports cursor-based pagination.

Returns results in OCSF API Activity (Class UID: 6003) format,
which is compatible with security monitoring and SIEM tools.
Reference: https://schema.ocsf.io/1.7.0/classes/api_activity