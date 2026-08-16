<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Distributed tracing with Agent Server | https://docs.langchain.com/langsmith/agent-server-distributed-tracing -->

# 使用代理服务器进行分布式跟踪

当您从另一个服务调用已部署的 [Agent Server](/langsmith/agent-server) 时，您可以传播跟踪上下文，以便整个请求在 LangSmith 中显示为单个统一跟踪。这使用了 LangSmith 的 [distributed tracing](/langsmith/distributed-tracing) 功能，该功能通过 HTTP 标头传播上下文。

## 它是如何工作的

分布式跟踪链接使用上下文传播标头跨服务运行：

1. **客户端** 从当前运行推断跟踪上下文并将其作为 HTTP 标头发送。
2. **服务器** 读取标头并将其作为 `langsmith-trace` 和 `langsmith-project` 可配置值添加到运行的配置和元数据中。您可以选择使用这些来设置使用代理时给定运行的跟踪上下文。

使用的标头是：
- `langsmith-trace`：包含迹线的点顺序。
- `baggage`：指定LangSmith项目以及其他可选标签和元数据。

要选择加入分布式跟踪，客户端和服务器都需要选择加入。

## 配置服务器

要接受分布式跟踪上下文，您的图形必须从配置中读取跟踪标头并设置跟踪上下文。标头作为 `langsmith-trace` 和 `langsmith-project` 通过 `configurable` 字段传递。<Warning>
分布式跟踪标头（`langsmith-trace`、`baggage`）用作可信跟踪上下文。仅将服务器配置为对受信任的内部服务调用的部署应用入站跟踪上下文。如果您的代理服务器直接从不受信任的第三方或公共互联网接收请求，请勿将这些标头传播到跟踪上下文中：而是在您的网关或代理处剥离它们。信任来自外部呼叫者的`baggage`，可以让他们影响您的跑步记录方式。
</Warning>

```python
import contextlib
import langsmith as ls
from langgraph.graph import StateGraph, MessagesState

# Define your graph
builder = StateGraph(MessagesState)
# ... add nodes and edges ...
my_graph = builder.compile()

@contextlib.contextmanager
async def graph(config):
    configurable = config.get("configurable", {})
    parent_trace = configurable.get("langsmith-trace")
    parent_project = configurable.get("langsmith-project")
    # If you want to also include metadata and tags from the client
    metadata = configurable.get("langsmith-metadata")
    tags = configurable.get("langsmith-tags")
    with ls.tracing_context(parent=parent_trace, project_name=parent_project, metadata=metadata, tags=tags):
        yield my_graph
```

在您的 `langgraph.json` 中导出此 `graph` 函数：

```json
{
  "graphs": {
    "agent": "./src/agent.py:graph"
  }
}
```

## 从客户端连接

<Tabs>
<Tab title="RemoteGraph">

初始化[⟦T17⟧](https://reference.langchain.com/python/langgraph/pregel/remote/RemoteGraph)时设置`distributed_tracing=True`。这会自动在所有请求上传播跟踪标头。

```python
from langgraph.graph import StateGraph
from langgraph.pregel.remote import RemoteGraph

remote_graph = RemoteGraph(
    "agent",
    url="<DEPLOYMENT_URL>",
    distributed_tracing=True,  # Enable trace propagation
)

def subgraph_node(query: str):
    # Trace context is automatically propagated
    return remote_graph.invoke({
        "messages": [{"role": "user", "content": query}]
    })['messages'][-1]['content']

# The RemoteGraph is called in the context of some on going work.
# This could be a parent LangGraph agent, code traced with `@ls.traceable`,
# or any other instrumented code.
graph = (
        StateGraph(str)
            .add_node(subgraph_node)
            .add_edge("__start__", "subgraph_node")
            .compile()
)
# The remote graph's execution will appear as a child of this trace
result = graph.invoke("What's the weather in SF?")
```

</Tab>
<Tab title="SDK">

如果您直接使用 [LangGraph SDK](/langsmith/reference)，请使用 `run_tree.to_headers()` 手动传播跟踪标头：

```python
from langgraph_sdk import get_client
import langsmith as ls

client = get_client(url="<DEPLOYMENT_URL>")

with ls.trace("call_remote_agent", inputs={"query": query}) as rt:
    headers = rt.to_headers()
    async for chunk in client.runs.stream(
        thread_id=None,
        assistant_id="agent",
        input={"messages": [{"role": "user", "content": query}]},
        stream_mode="values",
        headers=headers,  # Pass trace headers
    ):
        pass
    return chunk

result = await call_remote_agent("What's the weather in SF?")
```

</Tab>
</Tabs>

## 相关

- [Distributed tracing](/langsmith/distributed-tracing)：通用分布式跟踪概念和模式
- [RemoteGraph](/langsmith/use-remote-graph)：使用 RemoteGraph 与部署交互的完整指南

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-server-distributed-tracing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>