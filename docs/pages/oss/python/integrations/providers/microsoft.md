<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# Microsoft integrations

Integrate with Microsoft using LangChain Python.

Browse LangChain Python integrations for [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/) and [Azure](https://azure.microsoft.com/). For package selection, shared Azure setup, memory, vector stores, and hosted agents, see [Azure AI integrations](/oss/python/integrations/providers/azure_ai).

> [!TIP]
>
> **Recommended: Microsoft Foundry**
>
> For new LangChain, LangGraph, or Deep Agents applications centered on [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/), start with [`langchain-azure-ai`](/oss/python/integrations/providers/azure_ai). It adds Foundry project endpoints, Azure credential integration, Agent Service, hosting, tools, Content Safety, retrieval, and Azure observability.
>
> For direct [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python) model access, code that switches between OpenAI and Azure, traditional Azure OpenAI API versions, completion LLMs, or a smaller dependency surface, use the `langchain-openai` package.

## Explore integrations

### Chat models

> [!NOTE]
>
> **Claude on Azure**
>
> Microsoft Foundry also offers access to all [Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude), including Opus, Sonnet, and Haiku. Claude models are served through a dedicated Anthropic-native endpoint rather than the Azure OpenAI v1 API. Prefer `AzureAIAnthropicChatModel` from `langchain-azure-ai` for Foundry project endpoints and Microsoft Entra ID. You can also use [`ChatAnthropic`](/oss/python/integrations/chat/anthropic) from `langchain-anthropic` pointed at your Foundry Anthropic endpoint.

> [card] [Microsoft Foundry](/oss/python/integrations/chat/azure_ai)
>
> Use `langchain-azure-ai` to call models deployed in Microsoft Foundry through LangChain's chat model interface.

> [card] [Azure OpenAI (chat models)](/oss/python/integrations/chat/azure_chat_openai)
>
> Use `langchain-openai` to call Azure OpenAI models through LangChain's chat model interface.

### LLMs

> [card] [Azure OpenAI (text completions)](/oss/python/integrations/llms/azure_openai)
>
> Call Azure OpenAI text-completion models through LangChain's LLM interface.

### Agents

> [card] [Microsoft Foundry Agent Service](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/README.md#microsoft-foundry-agent-service)
>
> Use `langchain-azure-ai` to invoke Foundry Agent Service agents as nodes in a LangGraph workflow.

### Runtime

> [card] [Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents)
>
> Deploy LangGraph applications to Microsoft Foundry as hosted agents.

> [card] [Azure Durable Task Scheduler](/oss/python/integrations/providers/azure_ai#durable-langgraph-execution-with-azure-durable-task-scheduler)
>
> Add durable execution, retries, and crash recovery to LangGraph workflows.

### Tools

> [card] [Azure AI services](/oss/python/integrations/tools/azure_ai_services)
>
> Use Azure AI services for document analysis, image analysis, and speech processing.

> [card] [Microsoft Foundry built-in tools](/oss/python/integrations/tools/azure_ai#tools)
>
> Use built-in tools for web search, file search, code execution, and image generation.

> [card] [Microsoft Foundry Toolbox](/oss/python/integrations/tools/azure_ai#toolboxes)
>
> Access built-in tools, tools from MCP servers, and skills through Microsoft Foundry Toolbox.

> [card] [Azure Logic Apps](/oss/python/integrations/tools/azure_logic_apps)
>
> Let agents invoke Azure Logic Apps workflows as tools.

### Middleware

> [card] [Azure AI Content Safety](/oss/python/integrations/middleware/azure_ai)
>
> Apply Content Safety checks to agent inputs and outputs.

### Sandboxes

> [card] [Azure Container Apps dynamic sessions](/oss/python/integrations/tools/azure_dynamic_sessions)
>
> Run Python code in ephemeral Azure Container Apps sessions.

> [card] [Azure Container Apps sandboxes](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-compute/README.md#sandboxes-deep-agents-backend)
>
> Use `langchain-azure-compute[sandboxes]` to give Deep Agents stateful workspaces on Azure Container Apps.

### Backends

> [card] [Azure Blob Storage](/oss/python/integrations/providers/azure_ai#azure-blob-storage-backend)
>
> Persist Deep Agents workspace files in Azure Blob Storage.

### Retrievers

> [card] [Azure AI Search](/oss/python/integrations/retrievers/azure_ai_search)
>
> Retrieve documents from an existing Azure AI Search index.

### Embedding models

> [card] [Microsoft Foundry](/oss/python/integrations/providers/azure_ai#microsoft-foundry-embeddings)
>
> Generate text embeddings with models deployed in Microsoft Foundry.

> [card] [Azure OpenAI](/oss/python/integrations/embeddings/azure_openai)
>
> Generate text embeddings with models deployed in Azure OpenAI.

### Vector stores

> [card] [Azure Cosmos DB for MongoDB vCore](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)
>
> Store embeddings and search documents in Azure Cosmos DB for MongoDB vCore.

> [card] [Azure Cosmos DB for NoSQL](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)
>
> Store embeddings and search documents in Azure Cosmos DB for NoSQL.

> [card] [Azure Database for PostgreSQL](/oss/python/integrations/vectorstores/azure_db_for_postgresql)
>
> Run vector search in Azure Database for PostgreSQL with DiskANN indexing.

> [card] [Azure SQL Database](/oss/python/integrations/providers/azure_ai#azure-sql-database)
>
> Store and query vector embeddings in Azure SQL Database.

> [card] [pgvector](/oss/python/integrations/vectorstores/pgvector)
>
> Store embeddings and search PostgreSQL data with the pgvector extension.

> [card] [Azure AI Search](/oss/python/integrations/vectorstores/azuresearch)
>
> Store embeddings and run vector, hybrid, and semantic searches in Azure AI Search.

### Chat message history

> [card] [Azure Cosmos DB (chat message history)](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-chat-message-history)
>
> Persist and retrieve conversation messages in Azure Cosmos DB.

### Caches

> [card] [Azure Cosmos DB (semantic cache)](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-semantic-cache)
>
> Reuse cached model responses for semantically similar prompts with Azure Cosmos DB.

### Document loaders

> [card] [Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage)
>
> Load files from Azure Blob Storage as LangChain documents.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).