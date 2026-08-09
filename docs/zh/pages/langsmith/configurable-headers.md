<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use HTTP headers for runtime configuration | https://docs.langchain.com/langsmith/configurable-headers -->

# 使用 HTTP 标头进行运行时配置

LangGraph 允许运行时配置动态修改代理行为和权限。使用[LangSmith Deployment](/langsmith/deployment-quickstart)时，可以在请求体（`config`）或特定请求头中传递此配置。这使得可以根据用户身份或其他请求进行调整。

为了隐私，请通过 [⟦T8⟧](/langsmith/application-structure#configuration-file) 文件中的 `http.configurable_headers` 部分控制将哪些标头传递到运行时配置。

以下是自定义包含和排除标头的方法：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "http": {
    "configurable_headers": {
      "includes": ["x-user-id", "x-organization-id", "my-prefix-*"],
      "excludes": ["authorization", "x-api-key"]
    }
  }
}
```

`includes` 和 `excludes` 列表接受精确的标头名称或使用 `*` 的模式来匹配任意数量的字符。为了您的安全，不支持其他正则表达式模式。

## 在图表中使用

您可以使用任何节点的 `config` 参数访问图表中包含的标头。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def my_node(state, config):
  organization_id = config["configurable"].get("x-organization-id")
  ...
```

或者通过从上下文中获取（在工具和/或其他嵌套函数中很有用）。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.config import get_config

def search_everything(query: str):
  organization_id = get_config()["configurable"].get("x-organization-id")
  ...
```

您甚至可以使用它来动态编译图表。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# my_graph.py.
import contextlib

@contextlib.asynccontextmanager
async def generate_agent(config):
  organization_id = config["configurable"].get("x-organization-id")
  if organization_id == "org1":
    graph = ...
    yield graph
  else:
    graph = ...
    yield graph

```

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "graphs": {"agent": "my_grph.py:generate_agent"}
}
```

### 选择退出可配置标头

如果您想选择退出可配置标头，您可以简单地在 `s` 列表中设置通配符模式：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "http": {
    "configurable_headers": {
      "excludes": ["*"]
    }
  }
}
```

这将排除所有标头添加到您的运行配置中。请注意，排除项优先于包含项。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configurable-headers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>