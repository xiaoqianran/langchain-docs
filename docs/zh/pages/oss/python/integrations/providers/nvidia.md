<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: NVIDIA | https://docs.langchain.com/oss/python/integrations/providers/nvidia -->

# 英伟达

使用 LangChain Python 与 NVIDIA 集成。

LangChain 和 NVIDIA 在代理堆栈上进行了合作：

1.[Components](#components)
2.[Sandboxed agents with OpenShell](#sandboxed-agents-with-openshell)
3.[LangGraph acceleration primitives](#accelerate-langgraph-with-nvidia)
4.[NeMo Agent Toolkit optimizations](#nemo-agent-toolkit-optimizations-with-langsmith-telemetry)
5.[Post-training agent workflows](#post-training-agent-workflows)
6.[Model Routing with NeMo Switchyard](#model-routing-with-nemo-switchyard)
7. [Full Stack blueprints](#full-stack-blueprints)

## 组件

`langchain-nvidia-ai-endpoints` 软件包提供了由 NVIDIA AI 支持的用于聊天、嵌入、重新排名和检索的 LangChain 集成，其中包括 [Nemotron](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/)（专为代理 AI 构建的 NVIDIA 开放模型系列）以及[NVIDIA API Catalog](https://build.nvidia.com/) 上的数百个社区模型。

模型在 NVIDIA NIM 微服务上运行：公开标准 OpenAI 兼容 API 的容器映像，并使用 TensorRT-LLM 进行优化，以实现 NVIDIA 硬件上的峰值吞吐量。可以通过托管 API 目录或本地自托管来访问它们。|组件|班级 |描述 |
| :------------ | :---------------------------------------------------- | :------------------------------------------------------------------------ |
|聊天 | [⟦T17⟧](#chat-chatnvidia) |与任何 NVIDIA 托管模型或本地 NIM 聊天完成 |
|聊天（Dynamo）| [⟦T18⟧](#chat-chatnvidiadynamo) | `ChatNVIDIA` 带有用于 Dynamo 部署的 KV 缓存路由提示 |
|嵌入 | [⟦T20⟧](#embeddings-nvidiaembeddings) |用于语义搜索和 RAG 的密集向量嵌入 |
|重新排名 | [⟦T21⟧](#reranking-nvidiarerank) |按查询相关性对文档重新排序 |
|检索| [⟦T22⟧](#retrieval-nvidiaragretriever) |从 NVIDIA RAG 蓝图服务器检索 |

### 聊天：聊天NVIDIA

`ChatNVIDIA` 通过 NVIDIA 托管的模型和本地 NIM 部署提供聊天完成功能。它支持工具调用、结构化输出、图像输入和流式传输。

####安装

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install -qU langchain-nvidia-ai-endpoints
```

#### 访问 NVIDIA API 目录

1. 在[NVIDIA API Catalog](https://build.nvidia.com/)上创建免费帐户并登录。
2. 单击您的个人资料图标，然后单击 **API 密钥** > **生成 API 密钥**。
3. 复制密钥并保存为`NVIDIA_API_KEY`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import getpass
import os

if os.environ.get("NVIDIA_API_KEY", "").startswith("nvapi-"):
    print("Valid NVIDIA_API_KEY already in environment. Delete to reset")
else:
    nvapi_key = getpass.getpass("NVAPI Key (starts with nvapi-): ")
    assert nvapi_key.startswith(
        "nvapi-"
    ), f"{nvapi_key[:5]}... is not a valid key"
    os.environ["NVIDIA_API_KEY"] = nvapi_key
```#### Nemotron：代理 AI 的特色模型

[Nemotron](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/) 是 NVIDIA 专为代理 AI 设计的开放模型系列。这些模型使用混合 Mamba-Transformer 专家混合架构，可提供领先的基准性能和高吞吐量，并支持高达 1M 的令牌上下文窗口。 Nemotron 模型权重、训练数据和实施方法均根据 NVIDIA 开放模型许可证公开发布。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_ai_endpoints import ChatNVIDIA

# Nemotron 3 Ultra - frontier reasoning and agentic workflows
llm = ChatNVIDIA(model="nvidia/nemotron-3-ultra-550b-a55b")
result = llm.invoke("Plan a three-step research workflow for competitive analysis.")
print(result.content)
```

请参阅 [⟦T25⟧ integration page](/oss/python/integrations/chat/nvidia_ai_endpoints) 了解完整文档，包括工具调用、多模式输入和 Nemotron 特定示例。

### 聊天：聊天NVIDIADynamo

`ChatNVIDIADynamo` 是 `ChatNVIDIA` 的直接替代品，可与 [NVIDIA Dynamo](https://developer.nvidia.com/dynamo) 部署一起使用。它会自动将 KV 缓存路由提示注入每个请求中，从而允许 Dynamo 调度程序优化内存分配、负载路由和请求优先级。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_ai_endpoints import ChatNVIDIADynamo

llm = ChatNVIDIADynamo(
    base_url="http://localhost:8099/v1",
    model="nvidia/nemotron-3-ultra-550b-a55b",
    osl=512,             # expected output sequence length (tokens)
    iat=250,             # expected inter-arrival time (ms)
    latency_sensitivity=1.0,
    priority=1,
)
result = llm.invoke("Summarize KV cache routing in one sentence.")
print(result.content)
```

请参阅 [⟦T28⟧ integration page](/oss/python/integrations/chat/nvidia_ai_endpoints#use-with-nvidia-dynamo) 了解完整的 `ChatNVIDIADynamo` 参考，包括每次调用覆盖和流式传输。

### 嵌入：NVIDIAEmbeddings

`NVIDIAEmbeddings` 生成密集向量嵌入，用于语义搜索和 RAG 管道。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

embedder = NVIDIAEmbeddings(model="NV-Embed-QA")
embedder.embed_query("What's the temperature today?")
```

请参阅 [⟦T31⟧ integration page](/oss/python/integrations/embeddings/nvidia_ai_endpoints) 获取完整文档。

### 重新排名：NVIDIARerank

`NVIDIARerank` 使用 NeMo Retriever 重新排序 NIM 根据与查询的相关性对文档列表进行重新排序。```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.documents import Document
from langchain_nvidia_ai_endpoints import NVIDIARerank

ranker = NVIDIARerank(model="nvidia/llama-3.2-nv-rerankqa-1b-v1")
docs = ranker.compress_documents(
    query="What is GPU memory bandwidth?",
    documents=[Document(page_content=p) for p in passages],
)
```

### 检索：NVIDIARAGRetriever

`NVIDIARAGRetriever`将LangChain连接到正在运行的[NVIDIA RAG Blueprint](https://docs.nvidia.com/rag/latest/index.html)服务器，并通过`/v1/search`端点检索相关文档。它支持重新排名、查询重写和元数据过滤。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_ai_endpoints import NVIDIARAGRetriever

retriever = NVIDIARAGRetriever(base_url="http://localhost:8081", k=4)
docs = retriever.invoke("What is NVIDIA NIM?")
```

请参阅 [⟦T35⟧ integration page](/oss/python/integrations/retrievers/nvidia) 获取完整文档。

### 使用 NVIDIA NIM 微服务进行自托管

当您准备好部署 AI 应用程序时，您可以使用 NVIDIA NIM 自托管模型。欲了解更多信息，请参阅[NVIDIA NIM Microservices](https://www.nvidia.com/en-us/ai-data-science/products/nim-microservices/)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_ai_endpoints import ChatNVIDIA, NVIDIAEmbeddings, NVIDIARerank

# connect to a chat NIM running at localhost:8000, specifying a model
llm = ChatNVIDIA(base_url="http://localhost:8000/v1", model="nvidia/nemotron-3-ultra-550b-a55b")

# connect to an embedding NIM running at localhost:8080
embedder = NVIDIAEmbeddings(base_url="http://localhost:8080/v1")

# connect to a reranking NIM running at localhost:2016
ranker = NVIDIARerank(base_url="http://localhost:2016/v1")
```

## 使用 OpenShell 沙盒代理

[OpenShell](https://github.com/NVIDIA/OpenShell)为LangChain代理提供了一个受策略管理的Linux沙箱，用于代码执行、文件访问、进程权限和网络出口。这对于需要检查数据、编写代码、运行命令或针对本地资源使用工具同时保持执行环境与主机隔离的深度代理非常有用。

对于LangChain应用程序，[⟦T36⟧](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/openshell)包使OpenShell适应Deep Agents沙箱接口。代理可以在具有`ChatNVIDIA`的主机上运行，​​而工具执行则通过`OpenShellSandbox`后端分派到OpenShell沙箱中。

资源：* [LangChain NVIDIA samples](https://github.com/langchain-samples/langchain-nvidia-samples) 包括可运行的 NVIDIA 示例，其中包括 OpenShell 事件分析代理。
* [OpenShell Deep Agent](https://github.com/langchain-ai/openshell-deepagent) 是一个在 OpenShell 沙箱内运行的参考编码代理，由 Deep Agents 精心编排并由 NVIDIA Nemotron 提供支持。
* [⟦T39⟧](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/openshell) 为沙盒深度代理提供 Python 适配器、设置说明、策略指南和笔记本演练。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import openshell
from deepagents import create_deep_agent
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_nvidia_openshell import OpenShellSandbox

with openshell.Sandbox() as sandbox:
    backend = OpenShellSandbox(sandbox=sandbox)
    agent = create_deep_agent(
        model=ChatNVIDIA(model="nvidia/nemotron-3-ultra-550b-a55b"),
        system_prompt="You are a careful coding agent.",
        backend=backend,
    )
```

## 使用 NVIDIA 加速 LangGraph

`langchain-nvidia-langgraph` 软件包为 LangGraph 图提供了 NVIDIA 优化的执行策略。它提供了两种在编译时应用的互补优化：

* **并行执行**：自动识别独立节点并并发运行，消除不必要的顺序瓶颈。
* **推测执行**：条件边的两个分支同时运行；一旦路由条件解决，错误的分支就会被丢弃。

这两种优化都不需要更改节点逻辑或图边。

### 安装

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install -qU langchain-nvidia-langgraph
```

### 并行执行

将 LangGraph 中的 `StateGraph` 替换为 `langchain_nvidia_langgraph.graph` 中的 `StateGraph`。图形定义的其余部分保持不变。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_langgraph.graph import StateGraph, OptimizationConfig
from langgraph.graph import END
from typing import TypedDict

class AgentState(TypedDict):
  ...

graph = StateGraph(AgentState)
app = graph.compile(optimization=OptimizationConfig(enable_parallel=True))
```

或者包装现有的`StateGraph`：

```
from langgraph.graph import StateGraph as LangGraphStateGraph
graph = LangGraphStateGraph(AgentState)
app = with_app_compile(graph).compile(optimization=OptimizationConfig(enable_parallel=True))
```

装饰器可以明确控制哪些节点参与优化：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_nvidia_langgraph.graph import sequential, depends_on, speculation_unsafe

# Prevent a node from being parallelized (e.g., it writes to shared state)
@sequential
def write_to_db(state):
    ...

# Declare a dependency not expressed in graph edges
@depends_on("write_to_db")
def next_action(state):
    ...
```### 推测执行

在编译时通过`OptimizationConfig`启用推测。执行器并行运行条件分支并保留与路由决策匹配的结果。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
app = graph.compile(optimization=OptimizationConfig(enable_speculation=True))
```

## NeMo Agent 工具包通过 LangSmith 遥测进行优化

NVIDIA NeMo Agent Toolkit 是一个开源 AI 工具包，用于构建、分析和优化代理。开发人员可以将 LangChain 与 NeMo Agent Toolkit 结合使用，只需进行最少的代码更改即可实现分析、评估、GPU 容量规划和自动优化。 NeMo Agent Toolkit 可与 LangSmith 互操作。

* [Get Started with NeMo Agent Toolkit and LangChain](https://github.com/NVIDIA/NeMo-Agent-Toolkit/blob/develop/examples/frameworks/auto_wrapper/langchain_deep_research/langgraph_deep_research.ipynb)

* [Optimize LangChain with NeMo Agent Toolkit and LangSmith](https://github.com/NVIDIA/NeMo-Agent-Toolkit/blob/develop/docs/source/run-workflows/observe/observe-workflow-with-langsmith.md)

## 训练后代理工作流程

NVIDIA NeMo Gym 为代理系统提供训练后工作流程，包括将 LangGraph 代理与 Responses API 式训练数据和评估循环配对的示例。当您想要在初始提示和线束调整后改进代理行为时，尤其是对于工具使用和多步骤推理任务，请使用这些工作流。

* [NeMo Gym LangGraph agent example](https://github.com/NVIDIA-NeMo/Gym/tree/main/responses_api_agents/langgraph_agent)

## 使用 NeMo Switchyard 进行模型路由实验性的[⟦T46⟧](/oss/python/integrations/middleware/nvidia#model-routing-with-nemo-switchyard)包让深度代理可以使用[NeMo Switchyard](https://github.com/NVIDIA-NeMo/Switchyard)算法在现有的LangChain聊天模型上路由每个模型调用。使用它来组合一个代理背后的高效且强大的模型，同时深度代理继续管理代理循环、工具、状态和中间件。

该集成提供：

* **与模型无关的目标**：调整任何 LangChain `BaseChatModel` 用作 Switchyard 目标。
* **可插入路由**：提供已安装的 `nemo-switchyard` Python 绑定公开的任何算法，包括 LLM 任务分类和信号驱动的 Stage 路由。
* **与代理兼容的中间件**：在路由模型调用时保留 Deep Agents 工具绑定、回调、LangChain 跟踪和结构化输出。
* **决策元数据**：检查所选模型并在每个返回的`AIMessage`上完成有序路由跟踪。

### 从源安装

该包需要 Python 3.12 或更高版本。从 Switchyard 源代码树构建 Switchyard 的 `libsy` Python 绑定，然后安装与 OpenRouter 和 Deep Agents 依赖项的集成：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/NVIDIA-NeMo/Switchyard.git
python -m pip install -e ./Switchyard

git clone https://github.com/langchain-ai/langchain-nvidia.git
python -m pip install -e "./langchain-nvidia/libs/switchyard[openrouter]"
```

### 路由深度代理创建两个LangChain聊天模型，将它们包装为Switchyard目标，并将路由算法传递给`SwitchyardRoutingMiddleware`。传递给`stage_router`的目标顺序很重​​要：首先传递有能力的目标，然后传递高效的目标。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain_openrouter import ChatOpenRouter

from switchyard.libsy import LlmTarget, algorithms
from langchain_nvidia_switchyard import LangChainLlmClient, SwitchyardRoutingMiddleware

efficient_model = ChatOpenRouter(model="nvidia/nemotron-3-ultra-550b-a55b")
capable_model = ChatOpenRouter(model="anthropic/claude-sonnet-4.6")

router = algorithms.stage_router(
    LlmTarget("capable", LangChainLlmClient(capable_model)),
    LlmTarget("efficient", LangChainLlmClient(efficient_model)),
    picker="efficient_first",
    confidence_threshold=0.5,
    recent_window=3,
)

agent = create_deep_agent(
    model=efficient_model,
    middleware=[SwitchyardRoutingMiddleware(router)],
)

result = await agent.ainvoke({
    "messages": [
        {
            "role": "user",
            "content": "Summarize the important files in this project.",
        }
    ]
})
```

有关高级路由配置、支持的请求和响应数据以及当前限制，请参阅[⟦T53⟧ package README](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/switchyard#readme)。

## 全栈蓝图

NVIDIA 和 LangChain 合作开发了[full stack examples](https://github.com/langchain-ai/deepagents/tree/main/examples)，展示了如何将所有这些组件组合用于两个企业用例，重点关注生产准备情况：

* [NVIDIA AI-Q](https://github.com/NVIDIA-AI-Blueprints/aiq/tree/develop)是使用LangChain Deep Agents跨企业数据源进行深度研究的蓝图
* [NVIDIA VSS](https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization)是使用LangChain和LangGraph进行视频搜索和摘要的蓝图

## 其他资源

* [⟦T54⟧ package README](https://github.com/langchain-ai/langchain-nvidia/blob/main/libs/ai-endpoints/README.md)
* [⟦T55⟧ package](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/langgraph)
* [⟦T56⟧ package](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/switchyard)
* [Nemotron model family](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/)
* [⟦T57⟧ package](https://github.com/langchain-ai/langchain-nvidia/tree/main/libs/openshell)
* [LangChain NVIDIA samples](https://github.com/langchain-samples/langchain-nvidia-samples)
* [OpenShell Deep Agent](https://github.com/langchain-ai/openshell-deepagent)
* [NeMo Gym LangGraph agent example](https://github.com/NVIDIA-NeMo/Gym/tree/main/responses_api_agents/langgraph_agent)
* [Overview of NVIDIA NIM for Large Language Models (LLMs)](https://docs.nvidia.com/nim/large-language-models/latest/introduction.html)
* [Overview of NeMo Retriever Embedding NIM](https://docs.nvidia.com/nim/nemo-retriever/text-embedding/latest/overview.html)
* [Overview of NeMo Retriever Reranking NIM](https://docs.nvidia.com/nim/nemo-retriever/text-reranking/latest/overview.html)
* [⟦T58⟧ Model](/oss/python/integrations/chat/nvidia_ai_endpoints)
* [⟦T59⟧ Model for RAG Workflows](/oss/python/integrations/embeddings/nvidia_ai_endpoints)
* [⟦T60⟧](/oss/python/integrations/retrievers/nvidia)
* [NVIDIA Dynamo](https://developer.nvidia.com/dynamo)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/nvidia.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>