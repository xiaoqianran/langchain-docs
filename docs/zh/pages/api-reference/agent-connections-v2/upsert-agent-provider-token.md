<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upsert Agent Provider Token | https://docs.langchain.com/api-reference/agent-connections-v2/upsert-agent-provider-token -->

# 更新插入代理提供商令牌

https://api.host.langchain.com/openapi.json 发布 /v2/auth/agents/{agent_id}/providers/{provider_id}/tokens
导入 OAuth 令牌并将其绑定到给定提供商的代理。

替换同一代理+提供商的任何先前连接。之前的
仅当链接令牌为代理所有（无用户所有者）且无代理所有时，才会删除链接令牌
其他代理连接仍然引用它 - 用户保管库凭据和
共享令牌保持不变。令牌在没有 LangSmith 用户的情况下存储
所有者因此合成 MDA actor agent_ids 通过代理连接路径解析。