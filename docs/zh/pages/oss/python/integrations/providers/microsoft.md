<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# 微软集成

使用 LangChain Python 与 Microsoft 集成。

浏览 LangChain [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/) 和 [Azure](https://azure.microsoft.com/) 的 Python 集成。有关包选择、共享 Azure 设置、内存、向量存储和托管代理的信息，请参阅 [Azure AI integrations](/oss/python/integrations/providers/azure_ai)。

> [!提示]
>
> **推荐：Microsoft Foundry**
>
> 对于以 [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/) 为中心的新 LangChain、LangGraph 或 Deep Agents 应用程序，请从 [⟦T4⟧](/oss/python/integrations/providers/azure_ai) 开始。它添加了 Foundry 项目端点、Azure 凭据集成、代理服务、托管、工具、内容安全、检索和 Azure 可观察性。
>
> 对于直接 [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python) 模型访问、在 OpenAI 和 Azure 之间切换的代码、传统 Azure OpenAI API 版本、完成 LLM 或更小的依赖关系表面，请使用 `langchain-openai` 包。

## 探索集成

### 聊天模型

选择一个集成来调用聊天模型：

* **Microsoft Foundry（推荐）**：要调用 Microsoft Foundry 中的模型，请使用 `langchain-azure-ai` 中的 `AzureAIOpenAIApiChatModel`。它通过 Azure 凭据处理项目端点解析和 Microsoft Entra ID 身份验证。
* **Azure OpenAI**：使用 `langchain-openai` 中的 `ChatOpenAI` 进行直接 v1 API 调用或在 OpenAI 和 Azure 之间共享代码。对于传统的过时 Azure OpenAI API 版本，请使用 `AzureChatOpenAI`。> [!注意]
>
> **克劳德在蔚蓝**
>
> Microsoft Foundry 还提供对所有[Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) 的访问，包括 Opus、Sonnet 和 Haiku。 Claude 模型通过专用的 Anthropic 本机端点而不是 Azure OpenAI v1 API 提供服务。对于 Foundry 项目端点和 Microsoft Entra ID，优先选择 `langchain-azure-ai` 中的 `AzureAIAnthropicChatModel`。您还可以使用 `langchain-anthropic` 中的 [⟦T13⟧](/oss/python/integrations/chat/anthropic) 指向您的 Foundry Anthropic 端点。

> [卡][Microsoft Foundry](/oss/python/integrations/chat/azure_ai)
>
> 使用`langchain-azure-ai`通过LangChain的聊天模型接口调用部署在Microsoft Foundry中的模型。

> [卡][Azure OpenAI (chat models)](/oss/python/integrations/chat/azure_chat_openai)
>
> 使用`langchain-openai`通过LangChain的聊天模型接口调用Azure OpenAI模型。

#### 调用模型

调用部署在 Foundry 项目中的模型。安装`langchain-azure-ai`并设置`AZURE_AI_PROJECT_ENDPOINT`和`AZURE_AI_MODEL_DEPLOYMENT_NAME`。

为您的环境配置 Microsoft Entra ID 身份验证。在 Azure 上，使用托管标识。对于本地开发，可以使用`az login`登录。

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

有关设置和使用示例，请参阅[Microsoft Foundry chat models](/oss/python/integrations/chat/azure_ai)。

### 决策模型

> [卡][Microsoft Foundry Decisions](/oss/python/integrations/decision_models/azure_ai)
>
> 使用 Microsoft 决策模型和 Azure OpenAI 决策 API 询问键入的 `Noul`、`Choice` 和 `Score` 问题。

### 法学硕士

> [卡][Azure OpenAI (text completions)](/oss/python/integrations/llms/azure_openai)
>
> 通过 LangChain 的 LLM 接口调用 Azure OpenAI 文本完成模型。

### 代理使用现有的 Foundry 代理作为 LangGraph 工作流程中的节点。要在 Microsoft Foundry 上托管新的 LangGraph 代理，请参阅 [Runtime](#runtime)。

> [卡][Microsoft Foundry Agent Service](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/README.md#microsoft-foundry-agent-service)
>
> 使用 `langchain-azure-ai` 调用 Foundry Agent Service 代理作为 LangGraph 工作流程中的节点。

#### 使用现有的 Foundry 代理

安装`langchain-azure-ai`并设置`AZURE_AI_PROJECT_ENDPOINT`。为您的环境配置 Microsoft Entra ID 身份验证。将 `my-echo-agent` 替换为您的代理名称。

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

有关在 LangGraph 中使用 Foundry 代理的更多信息，请参阅 [Microsoft Foundry Agent Service](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/README.md#microsoft-foundry-agent-service)。

### 运行时

[Microsoft Foundry hosted agents](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents) 在托管基础设施上运行您的 LangGraph 代码。 Foundry 管理计算、会话生命周期和扩展。响应托管选项可以启用后台执行、进程中断后的故障恢复、流重播、新用户输入的引导以及响应分支。这些选项默认处于关闭状态。

通过具有自定义 JSON 输入和输出的 OpenAI 兼容响应端点或调用端点公开您的代理。 LangGraph 托管适配器处理请求转换、响应映射和流式传输。响应还提供托管对话历史记录。托管代理可以使用专用的 Microsoft Entra 代理身份调用 Foundry 模型和 Toolbox 工具。 Foundry 还支持 RBAC、专用网络和内容安全护栏。 Application Insights 跟踪有助于调查故障。

> [卡][Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents)
>
> 将 LangGraph 应用程序作为托管代理部署到 Microsoft Foundry。

> [卡][Azure Durable Task Scheduler](/oss/python/integrations/providers/azure_ai#durable-langgraph-execution-with-azure-durable-task-scheduler)
>
> 将持久执行、重试和崩溃恢复添加到 LangGraph 工作流程。

#### 托管 LangGraph 代理

使用 `langchain-azure-ai[hosting]` 在本地运行现有已编译的 LangGraph 图。从配置的项目目录中，将 `langgraph.json` 指向导出的图表。设置 Foundry 项目端点和模型部署名称，然后启动 Responses 端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install -U "langchain-azure-ai[hosting]"
export FOUNDRY_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>"
export AZURE_AI_MODEL_DEPLOYMENT_NAME="<model-deployment-name>"
python -m langchain_azure_ai.agents.hosting.run --protocol responses
```

要进行部署，请使用 `azd ai agent init` 初始化一个托管代理项目，该项目在 `azure.yaml` 中具有相同的托管入口点，使用 `azd ai agent run` 进行本地测试，并使用 `azd deploy` 进行部署。仅当需要创建 Foundry 项目或其他 Azure 资源时，首先运行 `azd provision`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
azd ext install azure.ai.agents
azd auth login
azd ai agent init
azd ai agent run
azd provision
azd deploy
```

要了解为什么在 Microsoft Foundry 上托管 LangGraph，请阅读 [hosting blog post](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/hosting-your-langgraph-application-on-microsoft-foundry-agents/4573342)。要迁移现有图表，请遵循[LangGraph-to-Foundry migration guide](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-ai/docs/hosting/host-langgraph-on-foundry.md)。对于新的或迁移的代理，请参阅 [Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents) 和 [Foundry LangGraph samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/langgraph)。

＃＃＃ 工具> [卡][Azure AI services](/oss/python/integrations/tools/azure_ai_services)
>
> 使用 Azure AI 服务进行文档分析、图像分析和语音处理。

> [卡][Microsoft Foundry built-in tools](/oss/python/integrations/tools/azure_ai#tools)
>
> 使用内置工具进行网页搜索、文件搜索、代码执行和图像生成。

> [卡][Microsoft Foundry Toolbox](/oss/python/integrations/tools/azure_ai#toolboxes)
>
> 通过 Microsoft Foundry Toolbox 访问内置工具、MCP 服务器中的工具以及技能。

> [卡][Azure Logic Apps](/oss/python/integrations/tools/azure_logic_apps)
>
> 让代理将 Azure 逻辑应用工作流作为工具调用。

### 中间件

> [卡][Azure AI Content Safety](/oss/python/integrations/middleware/azure_ai)
>
> 对代理输入和输出应用内容安全检查。

> [卡][Content Safety guardrail policy](/oss/python/integrations/middleware/azure_ai#guardrail-policy)
>
> 跨代理、模型和工具挂钩实施内容安全护栏策略。

> [卡][Microsoft Foundry memory](/oss/python/integrations/middleware/azure_ai#microsoft-foundry-memory)
>
> 在 Microsoft Foundry Memory 中保留并检索长期代理内存。

### 沙箱

> [卡][Azure Container Apps dynamic sessions](/oss/python/integrations/tools/azure_dynamic_sessions)
>
> 在临时 Azure 容器应用会话中运行 Python 代码。

> [卡][Azure Container Apps sandboxes](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-compute/README.md#sandboxes-deep-agents-backend)
>
> 使用 `langchain-azure-compute[sandboxes]` 在 Azure 容器应用程序上提供 Deep Agents 有状态工作区。

### 后端

> [卡][Azure Blob Storage](/oss/python/integrations/providers/azure_ai#azure-blob-storage-backend)
>
> 将 Deep Agents 工作区文件保留在 Azure Blob 存储中。

### 猎犬

> [卡][Azure AI Search](/oss/python/integrations/retrievers/azure_ai_search)
>
> 从现有的 Azure AI 搜索索引中检索文档。

> [卡][Microsoft Foundry memory](/oss/python/integrations/providers/azure_ai#microsoft-foundry-memory)
>
> 使用`AzureAIMemoryRetriever`查询长期用户和对话记忆。

### 嵌入模型> [卡][Microsoft Foundry](/oss/python/integrations/providers/azure_ai#microsoft-foundry-embeddings)
>
> 使用 Microsoft Foundry 中部署的模型生成文本嵌入。

> [卡][Azure OpenAI](/oss/python/integrations/embeddings/azure_openai)
>
> 使用 Azure OpenAI 中部署的模型生成文本嵌入。

### 矢量商店

> [卡][Azure Cosmos DB for MongoDB vCore](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)
>
> 在 Azure Cosmos DB for MongoDB vCore 中存储嵌入和搜索文档。

> [卡][Azure Cosmos DB for NoSQL](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)
>
> 在适用于 NoSQL 的 Azure Cosmos DB 中存储嵌入和搜索文档。

> [卡][Azure Database for PostgreSQL](/oss/python/integrations/vectorstores/azure_db_for_postgresql)
>
> 使用 DiskANN 索引在 Azure Database for PostgreSQL 中运行矢量搜索。

> [卡][Azure SQL Database](/oss/python/integrations/providers/azure_ai#azure-sql-database)
>
> 在 Azure SQL 数据库中存储和查询向量嵌入。

> [卡][pgvector](/oss/python/integrations/vectorstores/pgvector)
>
> 使用 pgvector 扩展存储嵌入并搜索 PostgreSQL 数据。

> [卡][Azure AI Search](/oss/python/integrations/vectorstores/azuresearch)
>
> 在 Azure AI 搜索中存储嵌入并运行矢量、混合和语义搜索。

### 检查点

> [卡][Foundry checkpoint saver](/oss/python/integrations/providers/azure_ai#foundry-checkpoint-saver)
>
> 坚持 LangGraph 跨回合检查点并在 Foundry State Store 中重新启动。

> [卡][Azure Cosmos DB](https://github.com/langchain-ai/langchain-azure/blob/main/libs/azure-cosmosdb/README.md#langgraph-checkpointer)
>
> 使用同步和异步检查指针在 Azure Cosmos DB 中保留 LangGraph 图形状态。

### 聊天消息历史记录

> [卡][Azure Cosmos DB (chat message history)](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-chat-message-history)
>
> 在 Azure Cosmos DB 中保留和检索对话消息。

### 缓存

> [卡][Azure Cosmos DB (semantic cache)](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-semantic-cache)
>
> 通过 Azure Cosmos DB 重复使用缓存的模型响应来获得语义相似的提示。### 文档加载器

> [卡][Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage)
>
> 从 Azure Blob 存储加载文件作为 LangChain 文档。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。