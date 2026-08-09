<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get audit logs | https://docs.langchain.com/langsmith/smith-api/audit-logs/get-audit-logs -->

# 获取审计日志

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/audit-logs
以 OCSF 格式检索经过身份验证的用户组织的审核日志记录。

需要 start_time 和 end_time 参数来过滤日期范围内的日志。
支持基于光标的分页。

以 OCSF API 活动（类 UID：6003）格式返回结果，
与安全监控和SIEM工具兼容。
参考：https://schema.ocsf.io/1.7.0/classes/api_activity