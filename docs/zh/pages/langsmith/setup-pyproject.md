<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to set up an application with pyproject.toml | https://docs.langchain.com/langsmith/setup-pyproject -->

# 如何使用 pyproject.toml 设置应用程序

应用程序必须配置[configuration file](/langsmith/cli#configuration-file)才能部署到LangSmith（或自托管）。本操作指南讨论了使用 `pyproject.toml` 定义包的依赖项来设置部署应用程序的基本步骤。

本示例基于[this repository](https://github.com/langchain-ai/langgraph-example-pyproject)，使用LangGraph框架。

最终的存储库结构将如下所示：

```bash
my-app/
├── my_agent # all project code lies within here
│   ├── utils # utilities for your graph
│   │   ├── __init__.py
│   │   ├── tools.py # tools for your graph
│   │   ├── nodes.py # node functions for your graph
│   │   └── state.py # state definition of your graph
│   ├── __init__.py
│   └── agent.py # code for constructing your graph
├── .env # environment variables
├── langgraph.json  # configuration file for LangGraph
└── pyproject.toml # dependencies for your project
```
<Tip>
LangSmith部署支持部署[LangGraph](/oss/python/langgraph/overview)_graph_。然而，图的节点的实现可以包含任意代码。这意味着任何框架都可以在节点内实现并部署在LangSmith部署上。这使您可以在不使用额外的 LangGraph OSS API 的情况下实现核心应用程序逻辑，同时仍使用LangSmith进行[deployment](/langsmith/deployment)、缩放和[observability](/langsmith/observability)。详情请参阅[Use any framework with LangSmith Deployment](/langsmith/application-structure#use-any-framework-with-langsmith-deployment)。
</Tip>

您还可以设置：

- `requirements.txt`：对于依赖管理，请查看[this how-to guide](/langsmith/setup-app-requirements-txt)，了解如何将`requirements.txt`用于LangSmith。
- monorepo：要部署位于 monorepo 内的图表，请查看 [this repository](https://github.com/langchain-ai/langgraph-example-monorepo) 了解如何执行此操作的示例。

每个步骤之后，都会提供一个示例文件目录来演示如何组织代码。

## 指定依赖关系可以选择在以下文件之一中指定依赖项：`pyproject.toml`、`setup.py` 或 `requirements.txt`。如果没有创建这些文件，则可以稍后在[configuration file](#create-the-configuration-file)中指定依赖项。

下面的依赖项将包含在映像中，您也可以在代码中使用它们，只要具有兼容的版本范围即可：

```
langgraph>=0.4.10,<2
langgraph-sdk>=0.3.5
langgraph-checkpoint>=3.0.1,<5
langchain-core>=0.3.66
langsmith>=0.7.31
orjson>=3.9.7
httpx>=0.25.0
tenacity>=8.0.0
uvicorn>=0.26.0
sse-starlette>=2.1.3,<3.4.0
uvloop>=0.18.0
httptools>=0.5.0
jsonschema-rs>=0.20.0
structlog>=24.1.0
cloudpickle>=3.0.0
truststore>=0.1
protobuf>=6.32.1,<7.0.0
grpcio>=1.81.0,<1.82.0
grpcio-tools>=1.81.0,<1.82.0
grpcio-health-checking>=1.81.0,<1.82.0
opentelemetry-api>=0.0.1
opentelemetry-sdk>=0.0.1
opentelemetry-exporter-otlp-proto-http>=0.0.1
```

示例 `pyproject.toml` 文件：

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-agent"
version = "0.0.1"
description = "An excellent agent build for LangSmith."
authors = [
    {name = "Assistant", email = "1223+assistant@users.noreply.github.com"}
]
license = {text = "MIT"}
readme = "README.md"
requires-python = ">=3.9"
dependencies = [
    "langgraph>=0.6.0",
    "langchain-fireworks>=0.1.3"
]

[tool.hatch.build.targets.wheel]
packages = ["my_agent"]
```

示例文件目录：

```bash
my-app/
└── pyproject.toml   # Python packages required for your graph
```

## 指定环境变量

可以选择在文件中指定环境变量（例如`.env`）。请参阅 [Environment Variables reference](/langsmith/env-var-cloud) 来配置部署的其他变量。

示例 `.env` 文件：

```
MY_ENV_VAR_1=foo
MY_ENV_VAR_2=bar
FIREWORKS_API_KEY=key
```

示例文件目录：

```bash
my-app/
├── .env # file with environment variables
└── pyproject.toml
```

<Tip>
默认情况下，LangSmith遵循`uv`/`pip`的行为，除非明确允许，否则**不**安装预发布版本。如果想使用预发行版，您有以下选择：

- 使用`pyproject.toml`：将`allow-prereleases = true`添加到您的`[tool.uv]`部分。
- 使用`requirements.txt`或`setup.py`：您必须显式指定每个预发布依赖项，包括传递依赖项。例如，如果您声明 `a==0.0.1a1` 和 `a` 依赖于 `b==0.0.1a1`，那么您还必须在依赖项中显式包含 `b==0.0.1a1`。
</Tip>

## 定义图实现你的图表。图形可以在单个文件或多个文件中定义。记下要包含在应用程序中的每个 [CompiledStateGraph](https://reference.langchain.com/python/langgraph/graph/state/CompiledStateGraph) 的变量名称。稍后创建 [configuration file](/langsmith/cli#configuration-file) 时将使用变量名称。

示例`agent.py`文件，显示如何从您定义的其他模块导入（此处未显示模块的代码，请参阅[this repository](https://github.com/langchain-ai/langgraph-example-pyproject)查看其实现）：

```python
# my_agent/agent.py
from typing import Literal
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END, START
from my_agent.utils.nodes import call_model, should_continue, tool_node # import nodes
from my_agent.utils.state import AgentState # import state

# Define the runtime context
class GraphContext(TypedDict):
    model_name: Literal["anthropic", "openai"]

workflow = StateGraph(AgentState, context_schema=GraphContext)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "action",
        "end": END,
    },
)
workflow.add_edge("action", "agent")

graph = workflow.compile()
```

示例文件目录：

```bash
my-app/
├── my_agent # all project code lies within here
│   ├── utils # utilities for your graph
│   │   ├── __init__.py
│   │   ├── tools.py # tools for your graph
│   │   ├── nodes.py # node functions for your graph
│   │   └── state.py # state definition of your graph
│   ├── __init__.py
│   └── agent.py # code for constructing your graph
├── .env
└── pyproject.toml
```

## 创建配置文件

创建一个名为 `langgraph.json` 的 [configuration file](/langsmith/cli#configuration-file)。配置文件的 JSON 对象中各个键的详细解释请参见[configuration file reference](/langsmith/cli#configuration-file)。

示例 `langgraph.json` 文件：

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./my_agent/agent.py:graph"
  },
  "env": ".env"
}
```

请注意，`CompiledGraph`的变量名称出现在顶级`graphs`键中每个子键值的末尾（即`:<variable_name>`）。

<Warning>
    **配置文件位置**
    配置文件必须放置在与包含编译图和关联依赖项的 Python 文件同一级别或更高级别的目录中。
</Warning>

示例文件目录：

```bash
my-app/
├── my_agent # all project code lies within here
│   ├── utils # utilities for your graph
│   │   ├── __init__.py
│   │   ├── tools.py # tools for your graph
│   │   ├── nodes.py # node functions for your graph
│   │   └── state.py # state definition of your graph
│   ├── __init__.py
│   └── agent.py # code for constructing your graph
├── .env # environment variables
├── langgraph.json  # configuration file for LangGraph
└── pyproject.toml # dependencies for your project
```

## 下一步

设置项目并将其放入 GitHub 存储库后，就可以[deploy your app](/langsmith/deployment-quickstart) 了。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/setup-pyproject.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>