<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to interact with a deployment using RemoteGraph | https://docs.langchain.com/langsmith/use-remote-graph -->

# 如何使用 RemoteGraph 与部署交互

[⟦T11⟧](https://reference.langchain.com/python/langgraph/pregel/remote/RemoteGraph) 是一个客户端界面，允许您与 [deployment](/langsmith/deployment) 交互，就像它是本地图一样。它提供与[⟦T12⟧](/oss/python/langgraph/graph-api#compiling-your-graph)的API奇偶校验，这意味着您可以在开发和生产环境中使用相同的方法（`invoke()`、`stream()`、`get_state()`等）。本页描述了如何初始化 `RemoteGraph` 并与其交互。

`RemoteGraph` 适用于以下情况：

- 开发和部署分离：使用`CompiledGraph`在本地构建和测试图，将其部署到LangSmith，然后使用[use ⟦T19⟧](#initialize-the-graph)在生产中调用它，同时使用相同的API接口。
- 线程级持久性：具有线程 ID 的跨调用的对话的[Persist and fetch the state](#persist-state-at-the-thread-level)。
- 子图嵌入：通过将 `RemoteGraph` 作为 [subgraph](#use-as-a-subgraph) 嵌入到另一个图中，为多智能体工作流程构建模块化图。
- 可重用的工作流程：使用已部署的图作为节点或[tools](https://reference.langchain.com/python/langsmith/deployment/remote_graph/#langgraph.pregel.remote.RemoteGraph.as_tool)，以便您可以重用和公开复杂的逻辑。

<Warning>
**重要提示：避免调用相同的部署**`RemoteGraph` 旨在调用其他部署上的图。不要使用 `RemoteGraph` 调用自身或同一部署上的另一个图，因为这可能会导致死锁和资源耗尽。相反，对同一部署中的图形使用本地图形组合或[subgraphs](/oss/python/langgraph/use-subgraphs)。
</Warning>

## 先决条件

在开始使用 `RemoteGraph` 之前，请确保您拥有：

- 访问[LangSmith](/langsmith/observability)，在那里开发和管理您的图表。
- 正在运行的[Agent Server](/langsmith/agent-server)，它托管您部署的图形以进行远程交互。

## 初始化图表

初始化 `RemoteGraph` 时，您必须始终指定：

- `name`：您想要与之交互的图表的名称**或**助手ID。如果指定图形名称，将使用默认助手。如果您指定助手 ID，则将使用该特定助手。图表名称与您在部署的 `langgraph.json` 配置文件中使用的名称相同。
- `api_key`：有效的[LangSmith API key](/langsmith/create-account-api-key)。您可以设置为环境变量（`LANGSMITH_API_KEY`）或直接传递`api_key`参数。如果使用 `api_key` 参数初始化 `LangGraphClient` / `SyncLangGraphClient`，您还可以在 `client` / `sync_client` 参数中提供 API 密钥。

此外，您还必须提供以下其中一项：- [⟦T35⟧](#use-a-url)：您要与之交互的部署的 URL。如果您传递 `url` 参数，则将使用提供的 URL、标头（如果提供）和默认配置值（例如超时）创建同步和异步客户端。
- [⟦T37⟧](#use-a-client)：用于与部署异步交互的`LangGraphClient`实例（例如，使用`.astream()`、`.ainvoke()`、`.aget_state()`、`.aupdate_state()`）。
- `sync_client`：用于与部署同步交互的`SyncLangGraphClient`实例（例如，使用`.stream()`、`.invoke()`、`.get_state()`、`.update_state()`）。

<Note>
如果您同时传递 `client` 或 `sync_client` 以及 `url` 参数，它们将优先于 `url` 参数。如果未提供任何 `client` / `sync_client` / `url` 参数，`RemoteGraph` 将在运行时引发 `ValueError`。
</Note>

### 使用 URL

<CodeGroup>

```python Python
from langgraph.pregel.remote import RemoteGraph

url = "<DEPLOYMENT_URL>"

# Using graph name (uses default assistant)
graph_name = "agent"
remote_graph = RemoteGraph(graph_name, url=url)

# Using assistant ID
assistant_id = "<ASSISTANT_ID>"
remote_graph = RemoteGraph(assistant_id, url=url)
```

```typescript JavaScript
import { RemoteGraph } from "@langchain/langgraph/remote";

const url = "<DEPLOYMENT_URL>";

// Using graph name (uses default assistant)
const graphName = "agent";
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// Using assistant ID
const assistantId = "<ASSISTANT_ID>";
const remoteGraph = new RemoteGraph({ graphId: assistantId, url });
```

</CodeGroup>

### 使用客户端

<CodeGroup>

```python Python
from langgraph_sdk import get_client, get_sync_client
from langgraph.pregel.remote import RemoteGraph

url = "<DEPLOYMENT_URL>"
client = get_client(url=url)
sync_client = get_sync_client(url=url)

# Using graph name (uses default assistant)
graph_name = "agent"
remote_graph = RemoteGraph(graph_name, client=client, sync_client=sync_client)

# Using assistant ID
assistant_id = "<ASSISTANT_ID>"
remote_graph = RemoteGraph(assistant_id, client=client, sync_client=sync_client)
```

```typescript JavaScript
import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";

const client = new Client({ apiUrl: "<DEPLOYMENT_URL>" });

// Using graph name (uses default assistant)
const graphName = "agent";
const remoteGraph = new RemoteGraph({ graphId: graphName, client });

// Using assistant ID
const assistantId = "<ASSISTANT_ID>";
const remoteGraph = new RemoteGraph({ graphId: assistantId, client });
```

</CodeGroup>

## 调用图表

`RemoteGraph` 实现了与 `CompiledGraph` 相同的 Runnable 接口，因此您可以像编译图一样使用它。它支持全套标准方法，包括`.invoke()`、`.stream()`、`.get_state()`和`.update_state()`及其异步变体。

### 异步

<Note>
要异步使用该图，您必须在初始化 `RemoteGraph` 时提供 `url` 或 `client`。
</Note>

<CodeGroup>```python Python
# invoke the graph
result = await remote_graph.ainvoke({
    "messages": [{"role": "user", "content": "what's the weather in sf"}]
})

# stream outputs from the graph
async for chunk in remote_graph.astream({
    "messages": [{"role": "user", "content": "what's the weather in la"}]
}):
    print(chunk)
```

```typescript JavaScript
// invoke the graph
const result = await remoteGraph.invoke({
    messages: [{role: "user", content: "what's the weather in sf"}]
})

// stream outputs from the graph
for await (const chunk of await remoteGraph.stream({
    messages: [{role: "user", content: "what's the weather in la"}]
})):
    console.log(chunk)
```

</CodeGroup>

### 同步

<Note>
要同步使用该图，您必须在初始化 `RemoteGraph` 时提供 `url` 或 `sync_client`。
</Note>

<CodeGroup>

```python Python
# invoke the graph
result = remote_graph.invoke({
    "messages": [{"role": "user", "content": "what's the weather in sf"}]
})

# stream outputs from the graph
for chunk in remote_graph.stream({
    "messages": [{"role": "user", "content": "what's the weather in la"}]
}):
    print(chunk)
```

</CodeGroup>

## 在线程级别保持状态

默认情况下，图形运行（例如，使用`.invoke()`或`.stream()`进行的调用）是无状态的，这意味着中间检查点和最终状态在运行后不会保留。

如果您想保留运行的输出（例如，为了支持人机交互工作流程），您可以创建一个线程并通过 `config` 参数传递其 ID。这与常规编译图的工作方式相同：

<CodeGroup>

```python Python
from langgraph_sdk import get_sync_client

url = "<DEPLOYMENT_URL>"
graph_name = "agent"
sync_client = get_sync_client(url=url)
remote_graph = RemoteGraph(graph_name, url=url)

# create a thread (or use an existing thread instead)
thread = sync_client.threads.create()

# invoke the graph with the thread config
config = {"configurable": {"thread_id": thread["thread_id"]}}
result = remote_graph.invoke({
    "messages": [{"role": "user", "content": "what's the weather in sf"}]
}, config=config)

# verify that the state was persisted to the thread
thread_state = remote_graph.get_state(config)
print(thread_state)
```

```typescript JavaScript
import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";

const url = "<DEPLOYMENT_URL>";
const graphName = "agent";
const client = new Client({ apiUrl: url });
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id }};
const result = await remoteGraph.invoke({
  messages: [{ role: "user", content: "what's the weather in sf" }],
}, config);

// verify that the state was persisted to the thread
const threadState = await remoteGraph.getState(config);
console.log(threadState);
```

</CodeGroup>

## 用作子图

<Note>
如果您需要将 `checkpointer` 与具有 `RemoteGraph` 子图节点的图一起使用，请确保使用 UUID 作为线程 ID。
</Note>

一个图还可以调用多个 `RemoteGraph` 实例作为 [_subgraph_](/oss/python/langgraph/use-subgraphs) 节点。这允许模块化、可扩展的工作流程，其中不同的职责被划分在不同的图表中。

`RemoteGraph` 公开与常规 `CompiledGraph` 相同的接口，因此您可以直接将其用作另一个图中的子图。例如：

<CodeGroup>

```python Python
from langgraph_sdk import get_sync_client
from langgraph.graph import StateGraph, MessagesState, START
from typing import TypedDict

url = "<DEPLOYMENT_URL>"
graph_name = "agent"
remote_graph = RemoteGraph(graph_name, url=url)

# define parent graph
builder = StateGraph(MessagesState)
# add remote graph directly as a node
builder.add_node("child", remote_graph)
builder.add_edge(START, "child")
graph = builder.compile()

# invoke the parent graph
result = graph.invoke({
    "messages": [{"role": "user", "content": "what's the weather in sf"}]
})
print(result)

# stream outputs from both the parent graph and subgraph
for chunk in graph.stream({
    "messages": [{"role": "user", "content": "what's the weather in sf"}]
}, subgraphs=True):
    print(chunk)
```

```typescript JavaScript
import { MessagesAnnotation, StateGraph, START } from "@langchain/langgraph";
import { RemoteGraph } from "@langchain/langgraph/remote";

const url = "<DEPLOYMENT_URL>";
const graphName = "agent";
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// define parent graph and add remote graph directly as a node
const graph = new StateGraph(MessagesAnnotation)
  .addNode("child", remoteGraph)
  .addEdge(START, "child")
  .compile()

// invoke the parent graph
const result = await graph.invoke({
  messages: [{ role: "user", content: "what's the weather in sf" }]
});
console.log(result);

// stream outputs from both the parent graph and subgraph
for await (const chunk of await graph.stream({
  messages: [{ role: "user", content: "what's the weather in la" }]
}, { subgraphs: true })) {
  console.log(chunk);
}
```

</CodeGroup>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-remote-graph.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>