<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# 微软集成

使用 LangChain Python 与 Microsoft 集成。

此页面涵盖所有 LangChain 与 [Microsoft Azure](https://portal.azure.com) 和其他 [Microsoft](https://www.microsoft.com) 产品的集成。

<Tip>
  **推荐：Microsoft Foundry**

  对于以 [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/) 为中心的新 LangChain 或 LangGraph 应用程序，请从 [⟦T76⟧](/oss/python/integrations/providers/azure_ai) 开始。它添加了 Foundry 项目端点、Azure 凭据集成、代理服务、托管、工具、内容安全、检索和 Azure 可观察性。

  对于直接 [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python) 模型访问、在 OpenAI 和 Azure 之间切换的代码、传统 Azure OpenAI API 版本、完成 LLM 或较小的依赖关系表面，请使用 `langchain-openai` 包。

  Foundry 资源包括 Azure OpenAI 功能，并添加了更广泛的模型目录、代理服务和评估功能。如果您使用 Azure OpenAI 资源，[upgrade it to a Foundry resource](https://learn.microsoft.com/en-us/azure/foundry/how-to/upgrade-azure-openai) 可以保留现有的 API 端点、状态和安全配置，同时获得对 Foundry 功能的访问权限。

  对于代理托管，使用 [Microsoft Foundry hosted agents](#microsoft-foundry-hosted-agents) 在具有内置运行时、会话、扩展、身份和协议端点的托管代理平台上部署自定义 LangGraph 代码。

  **示例和教程：*** [microsoft-foundry/foundry-samples LangGraph hosted agent samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/langgraph)：在本地运行 LangGraph 代理或将它们部署到具有响应、调用和 A2A 示例的 Microsoft Foundry。
  * [Azure-Samples/langchain-azure-openai-starter](https://github.com/Azure-Samples/langchain-azure-openai-starter)：从生产就绪的 LangChain 和 Azure OpenAI 应用程序模板开始，让您可以使用单个 `azd` 命令直接部署到 Azure。
  * [microsoft/langchain-for-beginners](https://github.com/microsoft/langchain-for-beginners)：介绍 LangChain 与 Azure OpenAI 的实践课程。
  * [Azure-Samples/langchain-agent-python](https://github.com/Azure-Samples/langchain-agent-python)：在 Azure 上构建和部署 LangChain 代理。
</Tip>

<Note>
  **克劳德在蔚蓝**

  Microsoft Foundry 还提供对所有[Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) 的访问，包括 Opus、Sonnet 和 Haiku。 Claude 模型通过专用的 Anthropic 本机端点而不是 Azure OpenAI v1 API 提供服务。使用 [⟦T79⟧](/oss/python/integrations/chat/anthropic) 指向您的 Foundry Anthropic 端点。
</Note>

## 选择一个包

`langchain-azure-ai` 和 [⟦T81⟧](https://reference.langchain.com/python/langchain-openai/) 是互补而非替代。 `langchain-azure-ai` 依赖于 `langchain-openai` 及其聊天和嵌入类子类 [⟦T84⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI) 和 [⟦T85⟧](https://reference.langchain.com/python/langchain-openai/embeddings/base/OpenAIEmbeddings)，因此安装 Azure 包不会从依赖关系链中删除 OpenAI 包。

使用下表选择起点：|场景|套餐 |
| - | - |
|以 Foundry 项目为中心的新应用程序 | `langchain-azure-ai` |
| Foundry 代理服务，托管 LangGraph、工具箱、内容安全、Azure 工具或 Application Insights | `langchain-azure-ai` |
|从 Foundry 项目端点配置的嵌入 | `langchain-azure-ai` |
|直接 Azure OpenAI v1 聊天通话 | `langchain-openai` |
|相同的代码必须在 OpenAI 和 Azure 之间切换 | `langchain-openai` |
|现有[⟦T91⟧](https://reference.langchain.com/python/langchain-openai/chat_models/azure/AzureChatOpenAI)应用| `langchain-openai` |
|传统过时的 Azure OpenAI API 版本 | `langchain-openai` |
|完成LLM界面| `langchain-openai` |
|最小的依赖性和操作界面| `langchain-openai` |

将现有 `langchain-openai` 应用程序移动到 `langchain-azure-ai` 不是直接导入更改：* 配置不同。 `azure_endpoint`、`azure_deployment`、`api_version` 和令牌提供者参数变为 `project_endpoint` 或 `endpoint`、`model` 和 `credential`。
* 默认行为不同。 `AzureAIOpenAIApiChatModel` 在解析项目端点时默认使用响应 API。设置 `use_responses_api=False` 以保持聊天完成行为。
* `langchain-azure-ai` 中不存在相当于[⟦T107⟧](https://reference.langchain.com/python/langchain-openai/llms/azure/AzureOpenAI) 的完成-LLM。
* [⟦T109⟧](https://reference.langchain.com/python/langchain-openai/chat_models/azure/AzureChatOpenAI) 承载 Foundry 聊天模型不会重现的 Azure 特定响应元数据和内容过滤器处理。
* 两个包都遵循官方 OpenAI 模式，因此可能不会保留兼容提供商（例如 DeepSeek 或 Mistral）返回的非标准字段。

## 聊天模型

Microsoft 提供了通过 Azure 访问聊天模型的三个主要选项：1. **Microsoft Foundry**（建议用于以项目为中心的应用程序）：将 `langchain-azure-ai` 中的 `AzureAIOpenAIApiChatModel` 与 Foundry 项目端点和 Azure 凭据结合使用。该软件包还集成了 Foundry 代理、托管、工具、内容安全、检索和可观察性。
2. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**：使用 `langchain-openai` 中的 `ChatOpenAI` 进行直接 v1 API 调用或在 OpenAI 和 Azure 之间切换的代码。将 `AzureChatOpenAI` 用于传统 Azure OpenAI API 版本和现有应用程序。
3. **[Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/)**：允许使用 Azure 机器学习部署和管理自定义或微调的开源模型。

### 微软代工厂

Microsoft Foundry 提供对模型和 Azure 服务的项目级访问。当应用程序使用 Foundry 项目、Azure 凭据或其他 Foundry 功能时，请使用 `langchain-azure-ai` 中的 `AzureAIOpenAIApiChatModel`。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-azure-ai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai
  ```
</CodeGroup>

设置您的项目端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export AZURE_AI_PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/<project>"
```

然后创建聊天模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from azure.identity import DefaultAzureCredential
from langchain_azure_ai.chat_models import AzureAIOpenAIApiChatModel

llm = AzureAIOpenAIApiChatModel(
    model="gpt-5.2",  # your Foundry model deployment name
    credential=DefaultAzureCredential(),
)
```

有关完整的设置指南，请参阅[Microsoft Foundry chat model integration](/oss/python/integrations/chat/azure_ai)。

### 天蓝色OpenAI

对于直接 Azure OpenAI 访问，[create an Azure deployment](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource) 并安装 `langchain-openai` 包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-openai
  ```
</CodeGroup>

在 v1 API 上，直接针对 Azure 端点使用 `ChatOpenAI`，无需 `api_version`：

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
  </Tab><Tab title="API key">
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

对于传统 Azure OpenAI API 版本，请使用 `AzureChatOpenAI`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import AzureChatOpenAI
```

有关端到端设置、Entra ID 身份验证、工具调用和推理示例，请参阅[Azure ChatOpenAI integration page](/oss/python/integrations/chat/azure_chat_openai)。

#### 响应 API

Azure OpenAI 支持[Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)，它提供有状态对话、内置工具（Web 搜索、文件搜索、代码解释器）和结构化推理摘要。当您设置 `reasoning` 参数时，`ChatOpenAI` 自动路由到 Responses API，或者您可以使用 `use_responses_api=True` 显式选择加入：

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

## 法学硕士

Microsoft 提供了两个通过 Azure 访问 LLM 的主要选项：

1. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**（推荐）：使用 Azure OpenAI 文本完成部署以及 `langchain-openai` 中的 `AzureOpenAI`。
2. **[Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/)**：使用 Azure 机器学习在线端点上托管的自定义或开源模型。

### 天蓝色OpenAI

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

## 嵌入模型根据应用程序连接到 Azure 的方式选择嵌入集成：

1. **Microsoft Foundry**（建议用于以项目为中心的应用程序）：将 `langchain-azure-ai` 中的 `AzureAIOpenAIApiEmbeddingsModel` 与 Foundry 项目配置和 Azure 凭据结合使用。
2. **[Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)**：将`langchain-openai`中的[⟦T128⟧](https://reference.langchain.com/python/langchain-openai/embeddings/azure/AzureOpenAIEmbeddings)用于直接或传统的Azure OpenAI端点、现有应用程序或较小的依赖关系表面。

### 微软代工厂

安装`langchain-azure-ai`：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain-azure-ai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-azure-ai
  ```
</CodeGroup>

设置您的项目端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export AZURE_AI_PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/<project>"
```

然后创建嵌入模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from azure.identity import DefaultAzureCredential
from langchain_azure_ai.embeddings import AzureAIOpenAIApiEmbeddingsModel

embeddings = AzureAIOpenAIApiEmbeddingsModel(
    model="text-embedding-3-small",  # your Foundry model deployment name
    credential=DefaultAzureCredential(),
)
```

<Note>
  Foundry 项目配置当前派生一个直接的 `/openai/v1` 端点，因为嵌入尚未通过项目端点本身提供服务。
</Note>

欲了解更多信息，请参阅[Microsoft Foundry embeddings integration](/oss/python/integrations/providers/azure_ai#azure-ai-model-inference-for-embeddings)。

### 天蓝色OpenAI

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

## 中间件

### Azure AI 内容安全中间件

> [Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview) 提供护栏，您可以通过中间件应用于LangChain 代理。 `langchain-azure-ai`包目前导出用于文本审核、图像审核、提示注入检测、受保护材料检测和接地评估的中间件。安装中间件包：

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

## 后端

### Azure Blob 存储后端

> [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) 是 Microsoft 的云对象存储解决方案。 `AzureBlobBackend` 实现了 Deep Agents `BackendProtocol`，因此深度代理可以将其整个工作区（文件、内存和工件）保留在 blob 容器中。

<Note>
  `AzureBlobBackend` 是 `langchain-azure-storage` 软件包的一部分，目前处于 **公共预览版**。
</Note>

使用 `deepagents` 额外安装（需要 Python 3.11+）：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langchain-azure-storage[deepagents]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain-azure-storage[deepagents]"
  ```
</CodeGroup>```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_storage.deepagents import AzureBlobBackend
```

**快速启动：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain_azure_storage.deepagents import AzureBlobBackend

backend = AzureBlobBackend(
    account_url="https://<my-storage-account-name>.blob.core.windows.net",
    container_name="agent-workspace",
    prefix="session-001/",  # Optional: isolate each agent/session under a prefix.
)

agent = create_deep_agent(backend=backend)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "Write a hello world script to hello.py"}]}
)
```

后端默认为 [⟦T139⟧](https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/credential-chains?tabs=dac#defaultazurecredential-overview) 并接受 `credential` 覆盖。

欲了解更多信息，请参阅[Backend integrations](/oss/python/integrations/backends)。有关完整的使用详细信息和安全指南，请参阅[package repository](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage)。

## 内存

### Azure cosmos DB 聊天消息历史记录

> [Azure Cosmos DB](https://learn.microsoft.com/azure/cosmos-db/) 为对话式AI应用程序提供聊天消息历史记录存储，使您能够以低延迟和高可用性保存和检索对话历史记录。

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

> [⟦T142⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-cosmosdb) 使用向量相似性在 Azure Cosmos DB for NoSQL 中缓存 LLM 响应，当再次看到语义相似的提示时返回缓存的结果。

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

### Azure Cosmos DBAI 代理可以依赖 Azure Cosmos DB 作为统一的[memory system](https://learn.microsoft.com/en-us/azure/cosmos-db/ai-agents#memory-can-make-or-break-agents) 解决方案，享受速度、规模和简单性。该服务成功地[enabled OpenAI's ChatGPT service](https://www.youtube.com/watch?v=6IIUtEFKJec\&t)以高可靠性和低维护量动态扩展。它由原子记录序列引擎提供支持，是世界上第一个提供无服务器模式的全球分布式[NoSQL](https://learn.microsoft.com/en-us/azure/cosmos-db/distributed-nosql)、[relational](https://learn.microsoft.com/en-us/azure/cosmos-db/distributed-relational)和[vector database](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database)服务。

以下是两个可用的 Azure Cosmos DB API，它们可以提供矢量存储功能。

#### 适用于 MongoDB 的 Azure cosmos DB (vCore)

> [Azure Cosmos DB for MongoDB vCore](https://learn.microsoft.com/en-us/azure/documentdb/) 可以轻松创建具有完整原生 MongoDB 支持的数据库。
> 通过将应用程序指向 MongoDB vCore 帐户的连接字符串的 API，您可以应用您的 MongoDB 经验并继续使用您最喜欢的 MongoDB 驱动程序、SDK 和工具。
> 使用 Azure Cosmos DB for MongoDB vCore 中的矢量搜索将基于 AI 的应用程序与存储在 Azure Cosmos DB 中的数据无缝集成。

#### 安装和设置

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

#### 在 Microsoft Azure 上部署 Azure cosmos DBAzure Cosmos DB for MongoDB vCore 为开发人员提供完全托管的 MongoDB 兼容数据库服务，用于使用熟悉的体系结构构建现代应用程序。

借助 Cosmos DB for MongoDB vCore，开发人员在迁移现有应用程序或构建新应用程序时，可以享受本机 Azure 集成、低总拥有成本 (TCO) 以及熟悉的 vCore 架构的优势。

[Sign Up](https://azure.microsoft.com/en-us/free/) 今天免费开始。

请参阅[usage example](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_ai.vectorstores import AzureCosmosDBMongoVCoreVectorSearch
```

#### Azure cosmos DB NoSQL

> [Azure Cosmos DB for NoSQL](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search) 现在提供矢量索引和预览搜索。
> 此功能旨在处理高维向量，从而实现任何规模的高效、准确的向量搜索。您现在可以存储向量
> 直接在文档中与您的数据一起显示。这意味着数据库中的每个文档不仅可以包含传统的无模式数据，
> 而且还有高维向量作为文档的其他属性。数据和向量的这种共置可以实现高效的索引和搜索，
> 因为向量存储在与其表示的数据相同的逻辑单元中。这简化了数据管理、人工智能应用架构和
> 基于矢量的操作的效率。#### 安装和设置

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

#### 在 Microsoft Azure 上部署 Azure cosmos DB

Azure Cosmos DB 通过动态和弹性自动缩放提供快速响应，为现代应用程序和智能工作负载提供解决方案。可用
在每个 Azure 区域中，可以自动复制更靠近用户的数据。它具有 SLA 保证低延迟和高可用性。

[Sign Up](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-python?pivots=devcontainer-codespace) 今天免费开始。

请参阅[usage example](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_azure_cosmosdb import AzureCosmosDBNoSqlVectorSearch
```

### Azure PostgreSQL 数据库

> [Azure Database for PostgreSQL - Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/service-overview)是基于开源Postgres数据库引擎的关系数据库服务。它是一种完全托管的数据库即服务，可以处理关键任务工作负载，并具有可预测的性能、安全性、高可用性和动态可扩展性。

请参阅 [set up instructions](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal) 了解 Azure Database for PostgreSQL。

只需使用 Azure 门户中的 [connection string](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/connect-python?tabs=cmd%2Cpassword#add-authentication-code) 即可。

由于 Azure Database for PostgreSQL 是开源 Postgres，因此可以使用 [LangChain's Postgres support](/oss/python/integrations/vectorstores/pgvector/) 连接到 Azure Database for PostgreSQL。

### Azure SQL 数据库> [Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview?view=azuresql) 是一项强大的服务，集可扩展性、安全性和高可用性于一体，提供现代数据库解决方案的所有优势。  它还提供了专用的矢量数据类型和内置函数，可以直接在关系数据库中简化矢量嵌入的存储和查询。这消除了对单独矢量数据库和相关集成的需要，提高了解决方案的安全性，同时降低了整体复杂性。

通过利用当前的 SQL Server 数据库进行矢量搜索，您可以增强数据功能，同时最大限度地减少费用并避免过渡到新系统的挑战。

#### 安装和设置

参见[detail configuration instructions](https://learn.microsoft.com/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql)。

我们需要安装 `langchain-sqlserver` python 包。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
!pip install langchain-sqlserver==0.1.1
```

#### 在 Microsoft Azure 上部署 Azure SQL DB

[Sign Up](https://learn.microsoft.com/azure/azure-sql/database/free-offer?view=azuresql) 今天免费开始。

请参阅[usage example](https://learn.microsoft.com/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_sqlserver import SQLServer_VectorStore
```

## 向量存储

### Azure PostgreSQL 数据库

> [Azure Database for PostgreSQL - Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/service-overview)是基于开源Postgres数据库引擎的关系数据库服务。它是一种完全托管的数据库即服务，可以处理关键任务工作负载，并具有可预测的性能、安全性、高可用性和动态可扩展性。请参阅 [set up instructions](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal) 了解 Azure Database for PostgreSQL。

您需要在数据库中使用 [enable pgvector extension](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-use-pgvector) 才能使用 Postgres 作为矢量存储。启用扩展后，您可以使用 [PGVector in LangChain](/oss/python/integrations/vectorstores/pgvector/) 连接到 Azure Database for PostgreSQL。

请参阅[usage example](/oss/python/integrations/vectorstores/pgvector/)。只需使用 Azure 门户中的 [connection string](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/connect-python?tabs=cmd%2Cpassword#add-authentication-code) 即可。

## 工具

### Microsoft Foundry 工具

Microsoft Foundry 公开了用于 Azure AI 内容理解、文档智能、图像分析和健康文本分析的 LangChain 服务工具。

安装包含 `tools` 额外内容的软件包：

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

### 文件搜索工具（服务器端）在矢量存储中搜索相关文档内容。

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
请参阅[Azure dynamic sessions setup instructions](/oss/python/integrations/tools/azure_dynamic_sessions/#setup)。

我们需要安装一个python包。

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
````AzureAIServicesToolkit`工具包包括以下工具：

* 图像分析：[AzureAIImageAnalysisTool](/oss/python/integrations/tools/azure_ai_services#azureaiimageanalysistool)
* 文档智能：[AzureAIDocumentIntelligenceTool](/oss/python/integrations/tools/azure_ai_services#azureaidocumentintelligencetool)
* 语音转文字：[AzureAISpeechToTextTool](/oss/python/integrations/tools/azure_ai_services#azureaispeechtotexttool)
* 文字转语音：[AzureAITextToSpeechTool](/oss/python/integrations/tools/azure_ai_services#azureaitexttospeechtool)
* 健康文本分析：[AzureAITextAnalyticsHealthTool](/oss/python/integrations/tools/azure_ai_services#azureaitextanalyticshealthtool)

## 运行时

### Microsoft Foundry 托管代理

[Microsoft Foundry hosted agents](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/langchain-hosted-agents) 在托管运行时运行自定义 LangGraph 代码。使用 `langchain_azure_ai.agents.hosting` 包公开已编译的 LangGraph 图，而 Foundry 则管理运行时、会话、缩放、身份和协议端点。

<Note>
  LangGraph 托管支持需要 `langchain-azure-ai[hosting]>=1.2.8`。
</Note>

在开始之前，您需要 Azure 订阅、Foundry 项目、已部署的聊天模型、Python 3.10 或更高版本以及 Azure CLI 身份验证。部署代理还需要项目的 Foundry 项目经理角色。

根据客户端与代理交互的方式选择托管协议：

|协议|运行参数| SDK主机类|端点|使用时 |
| - | - | - | - | - |
|回应 | `--protocol responses` | `ResponsesHostServer` | `/responses` |您需要与OpenAI兼容的聊天、流媒体、响应历史记录或对话线程。对于大多数对话代理来说，从这里开始。 |
|祈求| `--protocol invocations` | `InvocationsHostServer` | `/invocations` |您需要自定义 JSON 形状、Webhook 样式端点或非会话处理。 |<Note>
  对于使用基于 `BaseChatOpenAI` 的模型和 Responses API 的托管图，请使用 `output_version="responses/v1"`。您可以在 `langchain-openai` 1.0.0 或更高版本中忽略此设置，除非被 `LC_OUTPUT_VERSION` 覆盖。本指南适用于响应和调用托管协议。
</Note>

请参阅 [Responses protocol](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/langgraph/responses/10-run) 和 [Invocations protocol](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/langgraph/invocations/03-run) 的完整运行示例。

#### 使用配置驱动的运行器

如果您的代理已使用 LangGraph CLI 运行，请使用同一项目目录中的 `langchain_azure_ai.agents.hosting.run` 工具。运行器使用现有的 `langgraph.json` 配置来加载已编译的图，因此不需要更改代码。

设置 Foundry 项目端点和模型部署名称，然后在启动主机时选择协议：

<Tabs>
  <Tab title="Responses">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export FOUNDRY_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>"
    export AZURE_AI_MODEL_DEPLOYMENT_NAME="<model-deployment-name>"
    python -m langchain_azure_ai.agents.hosting.run --protocol responses
    ```
  </Tab>

  <Tab title="Invocations">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export FOUNDRY_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>"
    export AZURE_AI_MODEL_DEPLOYMENT_NAME="<model-deployment-name>"
    python -m langchain_azure_ai.agents.hosting.run --protocol invocations
    ```
  </Tab>
</Tabs>

对于部署，请将 `azure.yaml` 中的代理服务上的 `codeConfiguration.entryPoint` 设置为相同的运行器和协议。保留现有项目路径、运行时和依赖项解析设置：

<Tabs>
  <Tab title="Responses">
    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    services:
        my-agent:
            codeConfiguration:
                entryPoint: '-m langchain_azure_ai.agents.hosting.run --protocol responses'
    ```
  </Tab>

  <Tab title="Invocations">
    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    services:
        my-agent:
            codeConfiguration:
                entryPoint: '-m langchain_azure_ai.agents.hosting.run --protocol invocations'
    ...
    ```
  </Tab>
</Tabs>

#### 使用 SDK 主机类

当您需要自定义服务器构造、直接控制服务器生命周期或实现高级托管行为（例如自定义路由或处理程序）时，请使用 SDK 主机类：<Tabs>
  <Tab title="Responses">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_azure_ai.agents.hosting import ResponsesHostServer

    ResponsesHostServer(graph).run()
    ```
  </Tab>

  <Tab title="Invocations">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_azure_ai.agents.hosting import InvocationsHostServer

    InvocationsHostServer(graph).run()
    ```
  </Tab>
</Tabs>

要部署任一方法，请使用 `azd ai agent init` 初始化托管代理项目，使用 `azd ai agent run` 在本地测试它，然后使用 `azd deploy` 部署它。仅当需要创建 Foundry 项目或其他 Azure 资源时，首先运行 `azd provision`。您还可以使用 Foundry Toolkit Visual Studio Code 扩展进行部署。

Microsoft Learn 指南包括两种协议、对话状态、人机交互流程、测试、部署和故障排除的完整示例。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>