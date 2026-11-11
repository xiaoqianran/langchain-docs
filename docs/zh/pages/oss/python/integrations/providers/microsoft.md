<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# 微软集成

使用 LangChain Python 与 Microsoft 集成。

浏览常见的 LangChain Python 与 [Microsoft Azure](https://portal.azure.com) 和其他 [Microsoft](https://www.microsoft.com) 产品的集成。有关包选择、共享 Azure 设置、内存、向量存储和托管代理的信息，请参阅 [Azure AI integrations](/oss/python/integrations/providers/azure_ai)。

> [!提示]
>
> **推荐：Microsoft Foundry**
>
> 对于以 [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/) 为中心的新 LangChain 或 LangGraph 应用，请从 [⟦T0⟧](/oss/python/integrations/providers/azure_ai) 开始。它添加了 Foundry 项目端点、Azure 凭据集成、代理服务、托管、工具、内容安全、检索和 Azure 可观察性。
>
> 对于直接 [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python) 模型访问、在 OpenAI 和 Azure 之间切换的代码、传统 Azure OpenAI API 版本、完成 LLM 或更小的依赖关系表面，请使用 `langchain-openai` 包。

> [!注意]
>
> **克劳德在蔚蓝**
>
> Microsoft Foundry 还提供对所有 [Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) 的访问，包括 Opus、Sonnet 和 Haiku。 Claude 模型通过专用的 Anthropic 本机端点而不是 Azure OpenAI v1 API 提供服务。对于 Foundry 项目端点和 Microsoft Entra ID，优先选择 `langchain-azure-ai` 中的 `AzureAIAnthropicChatModel`。您还可以使用 `langchain-anthropic` 中的 [⟦T4⟧](/oss/python/integrations/chat/anthropic) 指向您的 Foundry Anthropic 端点。

## 探索集成

### 使用模型

> [卡][Microsoft Foundry chat models](/oss/python/integrations/chat/azure_ai)

> [卡][Azure OpenAI chat](/oss/python/integrations/chat/azure_chat_openai)

> [卡][Azure OpenAI LLMs](/oss/python/integrations/llms/azure_openai)

> [卡][Microsoft Foundry embeddings](/oss/python/integrations/providers/azure_ai#microsoft-foundry-embeddings)> [卡][AzureOpenAIEmbeddings](/oss/python/integrations/embeddings/azure_openai)

### 保留历史记录并缓存响应

> [卡][Azure Cosmos DB chat message history](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-chat-message-history)

> [卡][Azure Cosmos DB semantic cache](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-semantic-cache)

### 加载和检索数据

> [卡][Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage)

> [卡][Azure AI Search](/oss/python/integrations/vectorstores/azuresearch)

> [卡][Azure AI Search retriever](/oss/python/integrations/retrievers/azure_ai_search)

> [卡][Azure Cosmos DB for MongoDB vCore](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)

> [卡][Azure Cosmos DB NoSQL](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)

> [卡][Azure Database for PostgreSQL](/oss/python/integrations/vectorstores/azure_db_for_postgresql)

> [卡][PGVector](/oss/python/integrations/vectorstores/pgvector)

> [卡][Azure SQL Database](/oss/python/integrations/providers/azure_ai#azure-sql-database)

### 使用Deep Agents

> [卡][Azure Blob Storage Backend](/oss/python/integrations/providers/azure_ai#azure-blob-storage-backend)

### 构建和部署代理

> [卡][Microsoft Foundry middleware](/oss/python/integrations/middleware/azure_ai)

> [卡片][Microsoft Foundry tools](/oss/python/integrations/tools/azure_ai)

> [卡][Microsoft Foundry service tools](/oss/python/integrations/tools/azure_ai_services)

> [卡][Azure Container Apps Dynamic Sessions](/oss/python/integrations/tools/azure_dynamic_sessions)

> [卡][Azure Logic Apps](/oss/python/integrations/tools/azure_logic_apps)

> [卡][Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents)

> [卡][Azure Durable Task Scheduler (LangGraph)](/oss/python/integrations/providers/azure_ai#durable-langgraph-execution-with-azure-durable-task-scheduler)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。