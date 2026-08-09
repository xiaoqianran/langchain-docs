<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Search gateway policies by subject value set | https://docs.langchain.com/langsmith/smith-api/gateway-policies/search-gateway-policies-by-subject-value-set -->

# 按主题值集搜索网关策略

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/gateway-policies/search
GET /v1/platform/gateway-policies 的批量变体
获取与一组 subject_matcher_values 匹配的策略
在一个 subject_matcher_key 下。接受 JSON 中的值
正文，以便调用者可以包含数百个主题 ID，而无需
遇到每个服务器 URL 长度限制。

可见性、响应形状和匹配器语义是
与 GET 列表相同。与 `subject_matcher_values`
空（或省略）这将返回与 GET 相同的结果
仅设置`policy_type`。