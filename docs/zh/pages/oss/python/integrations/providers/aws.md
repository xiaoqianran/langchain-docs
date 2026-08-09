<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS (Amazon) integrations | https://docs.langchain.com/oss/python/integrations/providers/aws -->

# AWS（亚马逊）集成

使用 LangChain Python 与 AWS (Amazon) 集成。

本页面涵盖了 LangChain 与[Amazon Web Services (AWS)](https://aws.amazon.com/)平台的所有集成。

## 聊天模型

### 基岩聊天

> [Amazon Bedrock](https://aws.amazon.com/bedrock/) 是一项完全托管的服务，提供多种选择
> 来自领先人工智能公司的高性能基础模型 (FM)，如`AI21 Labs`、`Anthropic`、`Cohere`、
> 通过单个 API 实现 `Meta`、`Stability AI` 和 `Amazon`，以及您需要的广泛功能
> 构建具有安全性、隐私性和负责任的人工智能的生成式人工智能应用程序。使用`Amazon Bedrock`，
> 您可以轻松地试验和评估适合您的用例的顶级 FM，并通过以下方式私下定制它们
> 使用微调和 `Retrieval Augmented Generation` (`RAG`) 等技术来调整数据，并构建
> 使用您的企业系统和数据源执行任务的代理。由于 `Amazon Bedrock` 是
> 无服务器，您无需管理任何基础设施，即可安全地集成和部署
> 使用您已经熟悉的 AWS 服务将生成式 AI 功能集成到您的应用程序中。

请参阅[usage example](/oss/python/integrations/chat/bedrock)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import ChatBedrock
```

### 基岩匡威AWS Bedrock 维护 [Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)
为基岩模型提供统一的对话界面。该 API 不
但支持自定义模型。你可以看到所有的列表
[models that are supported here](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)。

<Info>
  **我们建议不需要使用自定义模型的用户使用 Converse API。可以使用[ChatBedrockConverse](https://reference.langchain.com/python/langchain-aws/chat_models/bedrock_converse/ChatBedrockConverse)访问它。**
</Info>

请参阅[usage example](/oss/python/integrations/chat/bedrock)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import ChatBedrockConverse
```

## 法学硕士

### 基岩

请参阅[usage example](/oss/python/integrations/llms/bedrock)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import BedrockLLM
```

### SageMaker 端点

> [Amazon SageMaker](https://aws.amazon.com/sagemaker/)是一个可以构建、训练和部署的系统
> 具有完全托管基础设施、工具和工作流程的机器学习 (ML) 模型。

我们使用 `SageMaker` 来托管我们的模型并将其公开为 `SageMaker Endpoint`。

请参阅[usage example](/oss/python/integrations/llms/sagemaker)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import SagemakerEndpoint
```

## 嵌入模型

### 基岩

请参阅[usage example](/oss/python/integrations/embeddings/bedrock)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import BedrockEmbeddings
```

## 文档加载器

### 亚马逊内存数据库

[Amazon MemoryDB](https://aws.amazon.com/memorydb/) 是一种持久的内存数据库服务，可提供超快的性能。 MemoryDB 与流行的开源数据存储 Redis OSS 兼容，
使您能够使用当今已使用的相同灵活且友好的 Redis OSS API 和命令快速构建应用程序。

InMemoryVectorStore 类提供了一个向量存储来与 Amazon MemoryDB 连接。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.vectorstores.inmemorydb import InMemoryVectorStore

vds = InMemoryVectorStore.from_documents(
            chunks,
            embeddings,
            redis_url="rediss://cluster_endpoint:6379/ssl=True ssl_cert_reqs=none",
            vector_schema=vector_schema,
            index_name=INDEX_NAME,
        )
```

请参阅[usage example](/oss/python/integrations/vectorstores/memorydb)。

### 瓦尔基[Valkey](https://valkey.io/)是一个开源的高性能键/值数据存储，支持缓存、消息队列等工作负载，并且可以充当主数据库。使用 ValkeyVectorStore 与 [Amazon ElastiCache for Valkey](https://aws.amazon.com/elasticache/valkey/) 或 [Amazon MemoryDB for Valkey](https://aws.amazon.com/memorydb/) 连接。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.vectorstores import ValkeyVectorStore
```

请参阅[usage example](/oss/python/integrations/vectorstores/valkey)。

## 猎犬

### Amazon Bedrock（知识库）

> [Knowledge bases for Amazon Bedrock](https://aws.amazon.com/bedrock/knowledge-bases/) 是
> `Amazon Web Services` (`AWS`) 产品可让您使用自己的设备快速构建 RAG 应用程序
> 用于定制基础模型响应的私有数据。

我们需要安装`langchain-aws`库。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-aws
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-aws
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/retrievers/bedrock)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws import AmazonKnowledgeBasesRetriever
```

## 工具

### Amazon Bedrock AgentCore 浏览器

> [Amazon Bedrock AgentCore Browser](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html)
> 使代理能够通过托管 Chrome 浏览器与网页交互，以实现导航、内容提取和 Web 自动化。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-aws bedrock-agentcore playwright beautifulsoup4
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-aws bedrock-agentcore playwright beautifulsoup4
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/tools/bedrock_agentcore_browser)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.tools import create_browser_toolkit

# Create toolkit
toolkit, browser_tools = create_browser_toolkit(region="us-west-2")

# Use with an agent
agent = create_react_agent(model=llm, tools=browser_tools)
result = await agent.ainvoke(
    {"messages": [{"role": "user", "content": "Go to example.com and get the heading"}]},
    config={"configurable": {"thread_id": "session-1"}}
)

# Cleanup when done
await toolkit.cleanup()
```

### Amazon Bedrock AgentCore 代码解释器

> [Amazon Bedrock AgentCore Code Interpreter](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html)
> 使代理能够在安全的托管沙箱环境中执行 Python、JavaScript 和 TypeScript 代码，以进行计算、数据分析和可视化。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-aws bedrock-agentcore
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-aws bedrock-agentcore
  ```
</CodeGroup>

请参阅[usage example](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.tools import create_code_interpreter_toolkit

# Create toolkit (async)
toolkit, code_tools = await create_code_interpreter_toolkit(region="us-west-2")

# Use with an agent
agent = create_react_agent(model=llm, tools=code_tools)
result = await agent.ainvoke(
    {"messages": [{"role": "user", "content": "Calculate factorial of 10"}]},
    config={"configurable": {"thread_id": "session-1"}}
)

# Cleanup when done
await toolkit.cleanup()
```

## 沙箱

<Columns>
  <Card title="AgentCoreSandbox" href="/oss/python/integrations/sandboxes/aws" icon="terminal">
    适用于 Deepagent 的 Amazon Bedrock AgentCore 代码解释器沙箱后端。
  </Card>
</Columns>

## 图表

### 亚马逊海王星> [Amazon Neptune](https://aws.amazon.com/neptune/)
> 是一个高性能图形分析和无服务器数据库，具有卓越的可扩展性和可用性。

对于下面的 Cypher 和 SPARQL 集成，我们需要安装 `langchain-aws` 库。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-aws
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-aws
  ```
</CodeGroup>

### 亚马逊海王星与密码

参见[usage example](/oss/python/integrations/graphs/amazon_neptune_open_cypher)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.graphs import NeptuneGraph
from langchain_aws.graphs import NeptuneAnalyticsGraph
from langchain_aws.chains import create_neptune_opencypher_qa_chain
```

### Amazon neptune 与 SPARQL

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_aws.graphs import NeptuneRdfGraph
from langchain_aws.chains import create_neptune_sparql_qa_chain
```

## 内存

### Amazon Bedrock AgentCore 内存

> [Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html)提供
> LangGraph 代理的托管持久性，通过自动扩展和高可用性实现跨会话的对话历史记录和状态管理。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langgraph-checkpoint-aws
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langgraph-checkpoint-aws
  ```
</CodeGroup>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_checkpoint_aws import AgentCoreMemorySaver

# Create checkpointer
checkpointer = AgentCoreMemorySaver(
    memory_id="your-memory-id",
    region_name="us-west-2"
)

# Use with LangGraph
graph = workflow.compile(checkpointer=checkpointer)

# Invoke with thread_id and actor_id for conversation persistence
config = {
    "configurable": {
        "thread_id": "user-123",
        "actor_id": "my-agent"  # Required for AgentCore
    }
}
result = graph.invoke({"messages": []}, config)
```

主要特点：

* 托管基础架构，无需设置数据库
* 自动缩放和高可用性
* 通过`actor_id`隔离支持多代理
* 静态和传输中加密

### Amazon Bedrock AgentCore 内存存储

> [Amazon Bedrock AgentCore Memory Store](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html)提供
> 具有 LangGraph 代理语义搜索功能的长期记忆，支持跨会话存储和检索用户偏好、事实和提取的记忆。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_checkpoint_aws import AgentCoreMemoryStore

# Initialize store for long-term memories
store = AgentCoreMemoryStore(memory_id="your-memory-id", region_name="us-west-2")

# Use in a pre-model hook to save and retrieve memories
def pre_model_hook(state, config, *, store):
    actor_id = config["configurable"]["actor_id"]
    thread_id = config["configurable"]["thread_id"]
    namespace = (actor_id, thread_id)

    # Save a message
    store.put(namespace, str(uuid.uuid4()), {"message": msg})

    # Search for relevant memories
    results = store.search(("preferences", actor_id), query="user preferences", limit=5)
    return {"model_input_messages": state["messages"]}
```

## 链条

### Amazon Comprehend 审核链> [Amazon Comprehend](https://aws.amazon.com/comprehend/) 是一项自然语言处理 (NLP) 服务，
> 使用机器学习来发现文本中有价值的见解和联系。

我们需要安装`boto3`和`nltk`库。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install boto3 nltk
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add boto3 nltk
  ```
</CodeGroup>

请参阅[usage example](https://python.langchain.com/v0.1/docs/guides/productionization/safety/amazon_comprehend_chain/)。

<Warning>
  `langchain-experimental` 包不再维护。从 `langchain_experimental` 导入的示例可能已过时或已损坏。谨慎使用。
</Warning>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain
```

## 运行时

### Amazon Bedrock AgentCore 运行时

> [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html)提供
> LangGraph 代理的托管、无服务器执行，具有内置可观察性、自动扩展以及与其他 AgentCore 服务的无缝集成。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install bedrock-agentcore
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add bedrock-agentcore
  ```
</CodeGroup>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

@app.entrypoint
def agent_invocation(payload, context):
    result = graph.invoke({"messages": [{"role": "user", "content": payload["prompt"]}]})
    return {"result": result["messages"][-1].content}

app.run()
```

使用 AgentCore CLI 进行部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Configure your agent
agentcore configure

# Deploy to AgentCore Runtime
agentcore launch -e your_agent.py
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>