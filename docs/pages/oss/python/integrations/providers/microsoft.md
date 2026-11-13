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

Choose an integration to call chat models:

* **Microsoft Foundry (recommended)**: To call models in Microsoft Foundry, use `AzureAIOpenAIApiChatModel` from `langchain-azure-ai`. It handles project endpoint resolution and Microsoft Entra ID authentication through Azure credentials.
* **Azure OpenAI**: Use `ChatOpenAI` from `langchain-openai` for direct v1 API calls or code shared between OpenAI and Azure. Use `AzureChatOpenAI` for traditional dated Azure OpenAI API versions.

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

#### Call a model

Call a model deployed in your Foundry project. Install `langchain-azure-ai` and set `AZURE_AI_PROJECT_ENDPOINT` and `AZURE_AI_MODEL_DEPLOYMENT_NAME`.

Configure Microsoft Entra ID authentication for your environment. On Azure, use a managed identity. For local development, you can sign in with `az login`.

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from azure.identity import DefaultAzureCredential
from langchain_azure_ai.chat_models import AzureAIOpenAIApiChatModel

model = AzureAIOpenAIApiChatModel(
    model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
    credential=DefaultAzureCredential(),
)
model.invoke("Tell me a joke and include some emojis.").pretty_print()
```

For setup and usage examples, see [Microsoft Foundry chat models](/oss/python/integrations/chat/azure_ai).

### LLMs

> [card] [Azure OpenAI (text completions)](/oss/python/integrations/llms/azure_openai)
>
> Call Azure OpenAI text-completion models through LangChain's LLM interface.

### Agents

Use an existing Foundry agent as a node in your LangGraph workflow. To host a new LangGraph agent on Microsoft Foundry, see [Runtime](#runtime).

> [card] [Microsoft Foundry Agent Service](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/README.md#microsoft-foundry-agent-service)
>
> Use `langchain-azure-ai` to invoke Foundry Agent Service agents as nodes in a LangGraph workflow.

#### Use an existing Foundry agent

Install `langchain-azure-ai` and set `AZURE_AI_PROJECT_ENDPOINT`. Configure Microsoft Entra ID authentication for your environment. Replace `my-echo-agent` with your agent name.

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.agents import (
    AgentServiceAgentState,
    AgentServiceFactory,
)
from langgraph.graph import END, START, StateGraph

factory = AgentServiceFactory()
agent_node = factory.get_agent_node(
    name="my-echo-agent", version="latest"
)

workflow = StateGraph(AgentServiceAgentState)
workflow.add_node("foundry_agent", agent_node)
workflow.add_edge(START, "foundry_agent")
workflow.add_edge("foundry_agent", END)

graph = workflow.compile()
result = graph.invoke({"messages": [("user", "Hello, world!")]})
result["messages"][-1].pretty_print()
```

For more on using Foundry agents in LangGraph, see [Microsoft Foundry Agent Service](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/README.md#microsoft-foundry-agent-service).

### Runtime

[Microsoft Foundry hosted agents](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents) run your LangGraph code on managed infrastructure. Foundry manages compute, session lifecycles, and scaling. Responses hosting options can enable background execution, failure recovery after process interruptions, stream replay, and steering for new user input. These options are off by default.

Expose your agent through OpenAI-compatible Responses endpoints or Invocations endpoints with custom JSON inputs and outputs. The LangGraph hosting adapters handle request conversion, response mapping, and streaming. Responses also provides managed conversation history.

Hosted agents can call Foundry models and Toolbox tools with a dedicated Microsoft Entra agent identity. Foundry also supports RBAC, private networking, and Content Safety guardrails. Application Insights tracing helps investigate failures.

> [card] [Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents)
>
> Deploy LangGraph applications to Microsoft Foundry as hosted agents.

> [card] [Azure Durable Task Scheduler](/oss/python/integrations/providers/azure_ai#durable-langgraph-execution-with-azure-durable-task-scheduler)
>
> Add durable execution, retries, and crash recovery to LangGraph workflows.

#### Host a LangGraph agent

Run an existing compiled LangGraph graph locally with `langchain-azure-ai[hosting]`. From your configured project directory, point `langgraph.json` at the exported graph. Set the Foundry project endpoint and model deployment name, then start the Responses endpoint:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install -U "langchain-azure-ai[hosting]"
export FOUNDRY_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>"
export AZURE_AI_MODEL_DEPLOYMENT_NAME="<model-deployment-name>"
python -m langchain_azure_ai.agents.hosting.run --protocol responses
```

To deploy, use `azd ai agent init` to initialize a hosted-agent project with the same hosting entry point in `azure.yaml`, `azd ai agent run` to test locally, and `azd deploy` to deploy. Run `azd provision` first only when you need to create the Foundry project or other Azure resources:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
azd ext install azure.ai.agents
azd auth login
azd ai agent init
azd ai agent run
azd provision
azd deploy
```

For project configuration and deployment steps, see [Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents).

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