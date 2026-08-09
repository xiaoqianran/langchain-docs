<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# 微软集成

使用 LangChain Python 与 Microsoft 集成。

本页面涵盖了LangChain与[Microsoft Azure](https://portal.azure.com)和其他[Microsoft](https://www.microsoft.com)产品的所有集成。

<Tip>
  **推荐：Microsoft Foundry**

  我们建议在 [chat models](#chat-models)、[LLMs](#llms) 和 [embedding models](#embedding-models) 中使用 [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/)。 Foundry 资源类型是 Azure OpenAI 资源类型的超集，可以访问更广泛的模型目录、代理服务和评估功能，同时保留 Azure OpenAI API。如果您使用 Azure OpenAI 资源，[upgrade it to a Foundry resource](https://learn.microsoft.com/en-us/azure/foundry/how-to/upgrade-azure-openai) 可以保留现有的 API 端点、状态和安全配置，同时获得对 Foundry 功能的访问权限。

  借助 [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python)（自 2025 年 8 月起全面上市），您可以直接将 Azure 端点和 API 密钥与 [⟦T62⟧](https://reference.langchain.com/python/langchain-openai/) 包结合使用，通过单个界面调用 Microsoft Foundry 中部署的任何模型（包括 OpenAI、Llama、DeepSeek、Mistral 和 Phi）。您还可以获得对 Microsoft Entra ID 身份验证的本机支持并访问最新功能，包括 [Responses API](#responses-api) 和 [reasoning models](/oss/python/integrations/chat/azure_chat_openai)。 [Get started here](#azure-openai)。对于代理托管，使用 [Microsoft Foundry hosted agents](#microsoft-foundry-hosted-agents) 在具有内置运行时、会话、扩展、身份和协议端点的托管代理平台上部署自定义 LangGraph 代码。

  **示例和教程：**

  * [microsoft-foundry/foundry-samples LangGraph hosted agent samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/langgraph)：在本地运行 LangGraph 代理或将其部署到具有响应、调用和 A2A 示例的 Microsoft Foundry。
  * [Azure-Samples/langchain-azure-openai-starter](https://github.com/Azure-Samples/langchain-azure-openai-starter)：从生产就绪的 LangChain 和 Azure OpenAI 应用程序模板开始，让您可以使用单个 `azd` 命令直接部署到 Azure。
  * [microsoft/langchain-for-beginners](https://github.com/microsoft/langchain-for-beginners)：介绍LangChain和Azure OpenAI的实践课程。
  * [Azure-Samples/langchain-agent-python](https://github.com/Azure-Samples/langchain-agent-python)：在Azure上构建和部署LangChain代理。
</Tip>

<Note>
  **克劳德在蔚蓝**

  Microsoft Foundry 还提供对所有[Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) 的访问，包括 Opus、Sonnet 和 Haiku。 Claude 模型通过专用的 Anthropic-native 端点而不是 Azure OpenAI v1 API 提供服务。使用 [⟦T64⟧](/oss/python/integrations/chat/anthropic) 指向您的 Foundry Anthropic 端点​​。
</Note>

## 聊天模型

Microsoft 提供了通过 Azure 访问聊天模型的三个主要选项：1. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**（推荐）——通过单一界面访问 Microsoft Foundry 中部署的任何模型（包括 OpenAI、Llama、DeepSeek、Mistral 和 Phi），并具有通过 [Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/managed-identity) 无密钥身份验证、区域数据驻留和专用网络等企业功能。在 v1 API 上使用 [⟦T65⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)，对于传统部署使用 [⟦T66⟧](https://reference.langchain.com/python/langchain-openai/chat_models/azure/AzureChatOpenAI)。

   Azure OpenAI 还支持[Responses API](#responses-api)，它使你可以直接从聊天模型访问服务器端工具，例如代码解释器、图像生成和文件搜索。
2. **[Azure AI](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models)** — 建议用于从更广泛的 Azure 生态系统以及聊天模型访问工具、存储和自定义中间件。
3. **[Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/)** — 允许使用 Azure 机器学习部署和管理自定义或微调的开源模型。

### Azure OpenAI

要开始使用 Azure OpenAI，[create an Azure deployment](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource) 并安装 `langchain-openai` 包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-openai
  ```
</CodeGroup>

在 v1 API 上，直接针对 Azure 端点使用 [⟦T68⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)，无需 `api_version`：

<Tabs>
  <Tab title="Entra ID (recommended)">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install azure-identity
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from azure.identity import DefaultAzureCredential, get_bearer_token_provider
    from langchain_openai import ChatOpenAI

    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )

    llm = ChatOpenAI(
        model="gpt-5.4-mini",  # your Azure deployment name
        base_url="https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/",
        api_key=token_provider,  # callable that handles token refresh
    )
    ```
  </Tab>

  <Tab title="API key">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model="gpt-5.4-mini",  # your Azure deployment name
        base_url="https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/",
        api_key="your-azure-api-key",
    )
    ```
  </Tab>
</Tabs>

对于传统的 Azure OpenAI API 版本，请使用 [⟦T70⟧](https://reference.langchain.com/python/langchain-openai/chat_models/azure/AzureChatOpenAI)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import AzureChatOpenAI
```请参阅[Azure ChatOpenAI integration page](/oss/python/integrations/chat/azure_chat_openai)了解端到端设置、Entra ID 身份验证、工具调用和推理示例。

#### 响应 API

Azure OpenAI 支持[Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)，它提供有状态对话、内置工具（Web 搜索、文件搜索、代码解释器）和结构化推理摘要。当您设置 `reasoning` 参数时，[⟦T71⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI) 自动路由到 Responses API，或者您可以使用 `use_responses_api=True` 显式选择加入：

<Tabs>
  <Tab title="Entra ID (recommended)">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from azure.identity import DefaultAzureCredential, get_bearer_token_provider
    from langchain_openai import ChatOpenAI

    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )

    llm = ChatOpenAI(
        model="gpt-5.4-mini",
        base_url="https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/",
        api_key=token_provider,
        use_responses_api=True,
    )

    response = llm.invoke("Summarize the bitter lesson.")
    print(response.text)
    ```
  </Tab>

  <Tab title="API key">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model="gpt-5.4-mini",
        base_url="https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/",
        api_key="your-azure-api-key",
        use_responses_api=True,
    )

    response = llm.invoke("Summarize the bitter lesson.")
    print(response.text)
    ```
  </Tab>
</Tabs>

有关推理工作、推理摘要以及使用 Responses API 进行流式传输的演练，请参阅 [Azure ChatOpenAI integration page](/oss/python/integrations/chat/azure_chat_openai)。

### Azure 人工智能

> [Azure AI Foundry](https://learn.microsoft.com/en-us/azure/developer/python/get-started) 是更广泛的 Azure AI 平台。 `langchain-azure-ai`包允许您将Azure原生工具、存储和自定义中间件引入LangChain应用程序中，并通过`AzureAIOpenAIApiChatModel`类公开部署在Foundry中的聊天模型。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-azure-ai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/chat/azure_ai)。

## 法学硕士

Microsoft 提供了两个通过 Azure 访问 LLM 的主要选项：1. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**（推荐）- 使用 [⟦T76⟧](https://reference.langchain.com/python/langchain-openai/llms/azure/AzureOpenAI) 作为完成 LLM 访问 Microsoft Foundry 中部署的任何模型（包括 OpenAI、Llama、DeepSeek、Mistral 和 Phi）。
2. **[Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/)** — 使用 Azure 机器学习在线端点上托管的自定义或开源模型。

### Azure OpenAI

请参阅[usage example](/oss/python/integrations/llms/azure_openai)。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-openai
  ```
</CodeGroup>

<Tabs>
  <Tab title="Entra ID (recommended)">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from azure.identity import DefaultAzureCredential, get_bearer_token_provider
    from langchain_openai import AzureOpenAI

    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )

    llm = AzureOpenAI(
        azure_deployment="gpt-5.4-mini",  # your Azure deployment name
        api_version="2025-04-01-preview",
        azure_ad_token_provider=token_provider,
    )

    print(llm.invoke("Write a haiku about the ocean."))
    ```
  </Tab>

  <Tab title="API key">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_openai import AzureOpenAI

    llm = AzureOpenAI(
        azure_deployment="gpt-5.4-mini",  # your Azure deployment name
        api_version="2025-04-01-preview",
        azure_endpoint="https://YOUR-RESOURCE-NAME.openai.azure.com/",
        api_key="your-azure-api-key",
    )

    print(llm.invoke("Write a haiku about the ocean."))
    ```
  </Tab>
</Tabs>

## 嵌入模型

Microsoft 提供了两个通过 Azure 访问嵌入模型的主要选项：

1. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**（推荐）- 将 Microsoft Foundry 中部署的嵌入模型（包括 OpenAI `text-embedding-3-small`、`text-embedding-3-large` 和 Cohere）与 [⟦T79⟧](https://reference.langchain.com/python/langchain-openai/embeddings/azure/AzureOpenAIEmbeddings) 结合使用。
2. **[Azure AI](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models)** — 建议用于从更广泛的 Azure 生态系统以及嵌入模型访问工具、存储和自定义中间件。

### Azure OpenAI

请参阅[usage example](/oss/python/integrations/embeddings/azure_openai)。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-openai
  ```
</CodeGroup>

<Tabs>
  <Tab title="Entra ID (recommended)">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from azure.identity import DefaultAzureCredential, get_bearer_token_provider
    from langchain_openai import AzureOpenAIEmbeddings

    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )

    embeddings = AzureOpenAIEmbeddings(
        azure_deployment="text-embedding-3-small",  # your Azure deployment name
        api_version="2025-04-01-preview",
        azure_ad_token_provider=token_provider,
    )

    vector = embeddings.embed_query("LangChain makes agents easy.")
    ```
  </Tab>

  <Tab title="API key">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_openai import AzureOpenAIEmbeddings

    embeddings = AzureOpenAIEmbeddings(
        azure_deployment="text-embedding-3-small",  # your Azure deployment name
        api_version="2025-04-01-preview",
        azure_endpoint="https://YOUR-RESOURCE-NAME.openai.azure.com/",
        api_key="your-azure-api-key",
    )

    vector = embeddings.embed_query("LangChain makes agents easy.")
    ```
  </Tab>
</Tabs>

### Azure 人工智能

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-azure-ai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/providers/azure_ai#azure-ai-model-inference-for-embeddings)。

## 中间件

### Azure AI 内容安全中间件> [Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview)提供了护栏，您可以通过中间件向LangChain代理申请。 `langchain-azure-ai` 包目前导出用于文本审核、图像审核、提示注入检测、受保护材料检测和接地评估的中间件。

安装中间件包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-azure-ai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai
  ```
</CodeGroup>

请参阅[Microsoft Foundry middleware guide](/oss/python/integrations/middleware/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.agents.middleware import AzureContentModerationMiddleware
```

## 文档加载器

### Azure Blob 存储

> [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) 是 Microsoft 的云对象存储解决方案。 Blob 存储针对存储大量非结构化数据进行了优化。非结构化数据是不遵守特定数据模型或定义的数据，例如文本或二进制数据。

`Azure Blob Storage` 设计用于：

* 直接向浏览器提供图像或文档。
* 存储文件以供分布式访问。
* 流媒体视频和音频。
* 写入日志文件。
* 存储数据以进行备份和恢复、灾难恢复和归档。
* 存储数据以供本地或 Azure 托管服务进行分析。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-storage
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-storage
  ```
</CodeGroup>

参见[usage examples for the Azure Blob Storage Loader](/oss/python/integrations/document_loaders/azure_blob_storage)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_storage.document_loaders import AzureBlobStorageLoader
```

## 内存

### Azure cosmos DB 聊天消息历史记录> [Azure Cosmos DB](https://learn.microsoft.com/azure/cosmos-db/) 为对话式AI应用程序提供聊天消息历史记录存储，使您能够以低延迟和高可用性保存和检索对话历史记录。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-cosmosdb
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-cosmosdb
  ```
</CodeGroup>

配置 Azure Cosmos DB 连接（同步或异步，使用访问密钥或 Microsoft Entra ID）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_cosmosdb import CosmosDBChatMessageHistory

history = CosmosDBChatMessageHistory(
    cosmos_endpoint="https://<your-account>.documents.azure.com:443/",
    cosmos_database="<your-database>",
    cosmos_container="<your-container>",
    session_id="<session-id>",
    user_id="<user-id>",
    credential="<your-key-or-token-credential>",
    ttl=3600,  # optional: messages expire after 1 hour
)
history.prepare_cosmos()

history.add_user_message("Hello!")
history.add_ai_message("Hi there!")
```

对于异步使用，请从同一包导入`AsyncCosmosDBChatMessageHistory`。

### Azure cosmos DB 语义缓存

> [⟦T83⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-cosmosdb) 使用向量相似性在 Azure Cosmos DB for NoSQL 中缓存 LLM 响应，当再次看到语义相似的提示时返回缓存的结果。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-cosmosdb
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-cosmosdb
  ```
</CodeGroup>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from azure.cosmos import CosmosClient, PartitionKey
from langchain_core.globals import set_llm_cache
from langchain_azure_cosmosdb import AzureCosmosDBNoSqlSemanticCache

cosmos_client = CosmosClient("<endpoint>", "<key>")

cache = AzureCosmosDBNoSqlSemanticCache(
    cosmos_client=cosmos_client,
    embedding=embedding,
    vector_embedding_policy=vector_embedding_policy,
    indexing_policy=indexing_policy,
    cosmos_container_properties={"partition_key": PartitionKey(path="/id")},
    cosmos_database_properties={"id": "cache-db"},
    vector_search_fields={"text_field": "text", "embedding_field": "embedding"},
    database_name="cache-db",
    container_name="cache-container",
)

set_llm_cache(cache)
```

对于异步使用，导入`AsyncAzureCosmosDBNoSqlSemanticCache`。

## 向量存储

### Azure Cosmos DB

AI 代理可以依赖 Azure Cosmos DB 作为统一的[memory system](https://learn.microsoft.com/en-us/azure/cosmos-db/ai-agents#memory-can-make-or-break-agents) 解决方案，享受速度、规模和简单性。该服务成功地[enabled OpenAI's ChatGPT service](https://www.youtube.com/watch?v=6IIUtEFKJec\&t)以高可靠性和低维护量动态扩展。它由原子记录序列引擎提供支持，是世界上第一个提供无服务器模式的全球分布式[NoSQL](https://learn.microsoft.com/en-us/azure/cosmos-db/distributed-nosql)、[relational](https://learn.microsoft.com/en-us/azure/cosmos-db/distributed-relational)和[vector database](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database)服务。

以下是两个可用的 Azure Cosmos DB API，它们可以提供矢量存储功能。

#### 适用于 MongoDB 的 Azure cosmos DB (vCore)> [Azure Cosmos DB for MongoDB vCore](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/) 可以轻松创建具有完整原生 MongoDB 支持的数据库。
> 通过将应用程序指向 MongoDB vCore 帐户的连接字符串的 API，您可以应用您的 MongoDB 经验并继续使用您最喜欢的 MongoDB 驱动程序、SDK 和工具。
> 使用 Azure Cosmos DB for MongoDB vCore 中的矢量搜索将基于 AI 的应用程序与存储在 Azure Cosmos DB 中的数据无缝集成。

##### 安装和设置

参见[detailed configuration instructions](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)。

我们需要安装 `langchain-azure-ai` 和 `pymongo` python 包。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-ai pymongo
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai pymongo
  ```
</CodeGroup>

##### 在 Microsoft Azure 上部署 Azure cosmos DB

Azure Cosmos DB for MongoDB vCore 为开发人员提供完全托管的 MongoDB 兼容数据库服务，用于使用熟悉的体系结构构建现代应用程序。

借助 Cosmos DB for MongoDB vCore，开发人员在迁移现有应用程序或构建新应用程序时，可以享受本机 Azure 集成、低总拥有成本 (TCO) 以及熟悉的 vCore 架构的优势。

[Sign Up](https://azure.microsoft.com/en-us/free/) 今天免费开始。

请参阅[usage example](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.vectorstores import AzureCosmosDBMongoVCoreVectorSearch
```

#### Azure cosmos DB NoSQL> [Azure Cosmos DB for NoSQL](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search) 现在提供矢量索引和预览搜索。
> 此功能旨在处理高维向量，从而实现任何规模的高效、准确的向量搜索。您现在可以存储向量
> 直接在文档中与您的数据一起显示。这意味着数据库中的每个文档不仅可以包含传统的无模式数据，
> 而且还有高维向量作为文档的其他属性。数据和向量的这种共置可以实现高效的索引和搜索，
> 因为向量存储在与其表示的数据相同的逻辑单元中。这简化了数据管理、人工智能应用架构和
> 基于矢量的操作的效率。

##### 安装和设置

参见[detail configuration instructions](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)。

我们需要安装 `langchain-azure-cosmosdb` 和 `azure-cosmos` python 包。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-cosmosdb azure-cosmos
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-cosmosdb azure-cosmos
  ```
</CodeGroup>

##### 在 Microsoft Azure 上部署 Azure cosmos DB

Azure Cosmos DB 通过动态和弹性自动缩放提供快速响应，为现代应用程序和智能工作负载提供解决方案。可用
在每个 Azure 区域中，可以自动复制更靠近用户的数据。它具有 SLA 保证低延迟和高可用性。[Sign Up](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-python?pivots=devcontainer-codespace) 今天免费开始。

请参阅[usage example](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_cosmosdb import AzureCosmosDBNoSqlVectorSearch
```

### Azure PostgreSQL 数据库

> [Azure Database for PostgreSQL - Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/service-overview)是基于开源Postgres数据库引擎的关系数据库服务。它是一种完全托管的数据库即服务，可以处理关键任务工作负载，并具有可预测的性能、安全性、高可用性和动态可扩展性。

请参阅 [set up instructions](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal) 了解 Azure Database for PostgreSQL。

只需使用 Azure 门户中的 [connection string](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/connect-python?tabs=cmd%2Cpassword#add-authentication-code) 即可。

由于 Azure Database for PostgreSQL 是开源 Postgres，因此可以使用 [LangChain's Postgres support](/oss/python/integrations/vectorstores/pgvector/) 连接到 Azure Database for PostgreSQL。

### Azure SQL 数据库

> [Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview?view=azuresql) 是一项强大的服务，集可扩展性、安全性和高可用性于一体，提供现代数据库解决方案的所有优势。  它还提供了专用的矢量数据类型和内置函数，可以直接在关系数据库中简化矢量嵌入的存储和查询。这消除了对单独矢量数据库和相关集成的需要，提高了解决方案的安全性，同时降低了整体复杂性。通过利用当前的 SQL Server 数据库进行矢量搜索，您可以增强数据功能，同时最大限度地减少费用并避免过渡到新系统的挑战。

##### 安装和设置

参见[detail configuration instructions](https://learn.microsoft.com/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql)。

我们需要安装`langchain-sqlserver` python 包。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
!pip install langchain-sqlserver==0.1.1
```

##### 在 Microsoft Azure 上部署 Azure SQL DB

[Sign Up](https://learn.microsoft.com/azure/azure-sql/database/free-offer?view=azuresql) 今天免费开始。

请参阅[usage example](https://learn.microsoft.com/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_sqlserver import SQLServer_VectorStore
```

## 向量存储

### Azure PostgreSQL 数据库

> [Azure Database for PostgreSQL - Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/service-overview)是基于开源Postgres数据库引擎的关系数据库服务。它是一种完全托管的数据库即服务，可以处理关键任务工作负载，并具有可预测的性能、安全性、高可用性和动态可扩展性。

请参阅 [set up instructions](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal) 了解 Azure Database for PostgreSQL。

您需要在数据库中使用 [enable pgvector extension](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-use-pgvector) 才能将 Postgres 用作向量存储。启用扩展后，您可以使用 [PGVector in LangChain](/oss/python/integrations/vectorstores/pgvector/) 连接到 Azure Database for PostgreSQL。

请参阅[usage example](/oss/python/integrations/vectorstores/pgvector/)。只需使用 Azure 门户中的 [connection string](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/connect-python?tabs=cmd%2Cpassword#add-authentication-code) 即可。

## 工具

### Microsoft Foundry 工具

Microsoft Foundry 公开了用于 Azure AI 内容理解、文档智能、图像分析和健康文本分析的 LangChain 服务工具。安装带有 `tools` 额外功能的软件包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langchain-azure-ai[tools]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain-azure-ai[tools]"
  ```
</CodeGroup>

请参阅[Microsoft Foundry Tools guide](/oss/python/integrations/tools/azure_ai_services)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureAIDocumentIntelligenceTool
```

### 图像生成工具

Microsoft Foundry Models 目录中有多个可用于图像生成的模型。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureOpenAIModelImageGenTool
```

### 转录工具

Microsoft Foundry Models 在目录中提供了 Whisper 模型，用于语音到文本转录。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureOpenAITranscriptionsTool
```

### 代码解释工具（服务器端）

使用代码解释器工具在沙盒容器中运行 Python 代码服务器端。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools.builtin import CodeInterpreterTool
```

### 网络搜索工具（服务器端）

在互联网上搜索当前信息和来源。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools.builtin import WebSearchTool
```

### 文件搜索工具（服务器端）

在矢量存储中搜索相关文档内容。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools.builtin import FileSearchTool
```

### 图像生成工具（服务器端）

使用 Azure AI Foundry 中的服务器端 GPT 图像模型生成或编辑图像。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools.builtin import ImageGenerationTool
```

### MCP工具（服务器端）

访问外部模型上下文协议 (MCP) 服务器。

请参阅[Microsoft Foundry tools guide](/oss/python/integrations/tools/azure_ai)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools.builtin import McpTool
```

### Azure 容器应用程序动态会话

我们需要从 Azure 容器应用服务获取 `POOL_MANAGEMENT_ENDPOINT` 环境变量。
请参阅[Azure dynamic sessions setup instructions](/oss/python/integrations/tools/azure_dynamic_sessions/#setup)。我们需要安装一个python包。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-azure-dynamic-sessions
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-dynamic-sessions
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/tools/azure_dynamic_sessions)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_dynamic_sessions import SessionsPythonREPLTool
```

### Azure 逻辑应用

触发 Azure 逻辑应用工作流以自动化业务流程和集成。

安装带有 `tools` 额外功能的软件包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langchain-azure-ai[tools]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain-azure-ai[tools]"
  ```
</CodeGroup>

请参阅[Azure Logic Apps integration guide](/oss/python/integrations/tools/azure_logic_apps)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureLogicAppTool
```

## 工具包

### Microsoft Foundry 项目工具箱

通过模型上下文协议 (MCP) 从 Azure AI Foundry 工具箱动态加载工具。

安装带有 `tools` 额外功能的软件包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langchain-azure-ai[tools]" langchain-mcp-adapters httpx
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain-azure-ai[tools]" langchain-mcp-adapters httpx
  ```
</CodeGroup>

请参阅[Azure AI Foundry Toolbox guide](/oss/python/integrations/tools/azure_ai#azureaiprojecttoolbox)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureAIProjectToolbox
```

### Microsoft Foundry 工具（以前称为 Azure AI 服务）

安装集成包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langchain-azure-ai[tools]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain-azure-ai[tools]"
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/tools/azure_ai_services)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.tools import AzureAIServicesToolkit
```

`AzureAIServicesToolkit`工具包包括以下工具：

* 图像分析：[AzureAIImageAnalysisTool](/oss/python/integrations/tools/azure_ai_services#azureaiimageanalysistool)
* 文档智能：[AzureAIDocumentIntelligenceTool](/oss/python/integrations/tools/azure_ai_services#azureaidocumentintelligencetool)
* 语音转文字：[AzureAISpeechToTextTool](/oss/python/integrations/tools/azure_ai_services#azureaispeechtotexttool)
* 文字转语音：[AzureAITextToSpeechTool](/oss/python/integrations/tools/azure_ai_services#azureaitexttospeechtool)
* 健康文本分析：[AzureAITextAnalyticsHealthTool](/oss/python/integrations/tools/azure_ai_services#azureaitextanalyticshealthtool)

## 运行时

### Microsoft Foundry 托管代理

[Microsoft Foundry hosted agents](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/langchain-hosted-agents) 在托管运行时运行自定义 LangGraph 代码。使用 `langchain_azure_ai.agents.hosting` 包公开已编译的 LangGraph 图，而 Foundry 则管理运行时、会话、缩放、身份和协议端点。

<Note>
  LangGraph 托管支持需要`langchain-azure-ai[hosting]>=1.2.8`。
</Note>在开始之前，您需要 Azure 订阅、Foundry 项目、已部署的聊天模型、Python 3.10 或更高版本以及 Azure CLI 身份验证。部署代理还需要项目的 Foundry 项目经理角色。

根据客户端与代理交互的方式选择托管协议：

|协议|主持班|端点 |使用时 |
| ----------- | ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
|回应 | `ResponsesHostServer` | `/responses` |您需要与 OpenAI 兼容的聊天、流媒体、响应历史记录或对话线程。对于大多数对话代理来说，从这里开始。 |
|祈求| `InvocationsHostServer` | `/invocations` |您需要自定义 JSON 形状、Webhook 样式端点或非会话处理。                                           |

托管和部署图表：1. 将编译后的图表传递到您选择的协议的主机服务器。
2. 设置`FOUNDRY_PROJECT_ENDPOINT`和`FOUNDRY_MODEL_NAME`，然后在本地运行并测试主机。
3. 使用 `azd ai agent init` 初始化托管代理项目，使用 `azd ai agent run` 测试其容器，并使用 `azd provision` 和 `azd deploy` 部署它。您还可以使用 Foundry Toolkit Visual Studio Code 扩展进行部署。

Microsoft Learn 指南包括两种协议、对话状态、人机交互流程、测试、部署和故障排除的完整示例。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>