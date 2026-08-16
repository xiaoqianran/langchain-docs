<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Application structure | https://docs.langchain.com/langsmith/application-structure -->

# 应用程序结构

要在 LangSmith 上部署，应用程序必须包含一个或多个图、一个配置文件 (`langgraph.json`)、一个指定依赖项的文件以及一个指定环境变量的可选 `.env` 文件。

本页介绍了 LangSmith 应用程序的组织方式以及如何提供部署所需的配置详细信息。

## 关键概念

要使用LangSmith进行部署，请提供以下信息：

1. [configuration file](#configuration-file-concepts) (`langgraph.json`)，指定应用程序使用的依赖项、图表和环境变量。
1. 实现应用程序逻辑的[graphs](#graphs)。
1. 指定运行应用程序所需的[dependencies](#dependencies)的文件。
1. 应用程序运行所需的[Environment variables](#environment-variables)。

<Tip>
**与框架无关**
LangSmith部署支持部署[LangGraph](/oss/python/langgraph/overview)_graph_。然而，图的节点的实现可以包含任意代码。这意味着任何框架都可以在节点内实现并部署在LangSmith部署上。这使您可以在不使用额外的 LangGraph OSS API 的情况下实现核心应用程序逻辑，同时仍使用 LangSmith 进行 [deployment](/langsmith/deployment)、缩放和 [observability](/langsmith/observability)。更多详情请参阅[Use any framework with LangSmith Deployment](/langsmith/application-structure#use-any-framework-with-langsmith-deployment)。
</Tip>

## 文件结构以下是 Python 和 JavaScript 应用程序的目录结构示例：

<Tabs>
    <Tab title="Python (requirements.txt)">
    ```plaintext
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
    ├── requirements.txt # package dependencies
    └── langgraph.json # configuration file for LangGraph
    ```
    </Tab>
    <Tab title="Python (pyproject.toml)">
    ```plaintext
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
    </Tab>
    <Tab title="JS (package.json)">
    ```plaintext
    my-app/
    ├── src # all project code lies within here
    │   ├── utils # optional utilities for your graph
    │   │   ├── tools.ts # tools for your graph
    │   │   ├── nodes.ts # node functions for your graph
    │   │   └── state.ts # state definition of your graph
    │   └── agent.ts # code for constructing your graph
    ├── package.json # package dependencies
    ├── .env # environment variables
    └── langgraph.json # configuration file for LangGraph
    ```
    </Tab>
</Tabs>

<Note>
应用程序的目录结构可能会根据所使用的编程语言和包管理器的不同而有所不同。
</Note>

<a id="configuration-file-concepts"></a>
## 配置文件

`langgraph.json` 文件是一个 JSON 文件，指定部署应用程序所需的依赖项、图表、环境变量和其他设置。

有关 JSON 文件中所有支持的键的详细信息，请参阅 [LangGraph configuration file reference](/langsmith/cli#configuration-file)。

<Tip>
[LangGraph CLI](/langsmith/cli)默认使用当前目录下的配置文件`langgraph.json`。
</Tip>

### 示例

<Tabs>
    <Tab title="Python">
    * 依赖项涉及自定义本地包和`langchain_openai`包。
    * 将从文件 `./your_package/your_file.py` 和变量 `agent` 加载单个图表。
    * 环境变量从`.env`文件加载。

    ```json
    {
        "dependencies": [
            "langchain_openai",
            "./your_package"
        ],
        "graphs": {
            "my_agent": "./your_package/your_file.py:agent"
        },
        "env": "./.env"
    }
    ```
    </Tab>
    <Tab title="JavaScript">
    * 将从本地目录中的依赖文件加载依赖项（例如，`package.json`）。
    * 将使用函数 `agent` 从文件 `./your_package/your_file.js` 加载单个图表。
    * 环境变量`OPENAI_API_KEY`是内联设置的。```json
    {
        "dependencies": [
            "."
        ],
        "graphs": {
            "my_agent": "./your_package/your_file.js:agent"
        },
        "env": {
            "OPENAI_API_KEY": "secret-key"
        }
    }
    ```
    </Tab>
</Tabs>

## 依赖关系

应用程序可能依赖于其他 Python 包或 JavaScript 库（取决于编写应用程序所用的编程语言）。

您通常需要指定以下信息才能正确设置依赖项：

1. 目录中指定依赖项的文件（例如，`requirements.txt`、`pyproject.toml` 或 `package.json`）。
2. [configuration file](#configuration-file-concepts) 中的`dependencies` 键指定运行应用程序所需的依赖项。
3. 任何其他二进制文件或系统库都可以使用 [LangGraph configuration file](#configuration-file-concepts) 中的 `dockerfile_lines` 键指定。

## 图表

使用 [configuration file](#configuration-file-concepts) 中的 `graphs` 键指定哪些图表将在已部署的应用程序中可用。

您可以在配置文件中指定一个或多个图表。每个图都由唯一的名称和 (1) 已编译图或 (2) 定义图的函数的路径来标识。

### 使用任何带有 LangSmith 部署的框架虽然LangSmith部署要求将应用程序构建为LangGraph图，但该图中的各个节点可以包含任意代码。这意味着您可以在节点中使用任何框架或库，同时仍然受益于 LangSmith 的部署基础架构。

图结构充当部署接口，但您的核心应用程序逻辑可以使用最适合您需求的工具和框架。

要使用LangSmith进行部署，您需要：

<Tabs>
  <Tab title="Python">

    1. **LangGraph图结构**：使用[⟦T26⟧](https://reference.langchain.com/python/langgraph/graph/state/StateGraph)与[⟦T27⟧](https://reference.langchain.com/python/langgraph/graph/state/StateGraph/add_node)和[⟦T28⟧](https://reference.langchain.com/python/langgraph/pregel/_draw/add_edge)定义一个图。
    1. **具有任意逻辑的节点函数**：您的节点函数可以调用任何框架或库。
    1. **编译后的图**：[Compile](https://reference.langchain.com/python/langgraph/graph/state/StateGraph/compile)用于创建可部署应用程序的图。

    以下示例展示了如何将现有应用程序逻辑包装在最小的 LangGraph 结构中：

  ```python
  from langgraph.graph import StateGraph, START, END
  from typing import TypedDict

  # Your existing application logic using any framework
  from app_logic import process_data
  from app_logic import fetch_data

  class State(TypedDict):
      input: str
      result: str

  def my_app_node(state: State) -> State:
      """Node containing arbitrary framework code."""
      # Use any framework or library here
      raw_data = fetch_data(state["input"])
      processed = process_data(raw_data)
      return {"result": processed}

  # Define the graph structure
  graph = StateGraph(State)
  graph.add_node("process", my_app_node)  # Add node with your logic
  graph.add_edge(START, "process")  # Connect start to your node
  graph.add_edge("process", END)  # Connect your node to end

  # Compile for deployment
  app = graph.compile()
  ```
  </Tab>
  <Tab title="JavaScript">

    1. **LangGraph图结构**：使用[⟦T29⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.StateGraph.html)与[⟦T30⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.StateGraph.html#addnode)和[⟦T31⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.StateGraph.html#addedge)定义一个图。
    1. **具有任意逻辑的节点函数**：您的节点函数可以调用任何框架或库。
    1. **编译后的图**：[Compile](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.StateGraph.html#compile)用于创建可部署应用程序的图。以下示例展示了如何将现有应用程序逻辑包装在最小的 LangGraph 结构中：

  ```typescript
  import { StateGraph, START, END } from "@langchain/langgraph";
  import { Annotation } from "@langchain/langgraph";

  // Your existing application logic using any framework
  import { processData } from "./app-logic";
  import { fetchData } from "./app-logic";

  const State = Annotation.Root({
    input: Annotation<string>,
    result: Annotation<string>
  });

  async function myAppNode(state: typeof State.State) {
    // Use any framework or library here
    const rawData = await fetchData(state.input);
    const processed = await processData(rawData);
    return { result: processed };
  }

  // Define the graph structure
  const graph = new StateGraph(State)
    .addNode("process", myAppNode)  // Add node with your logic
    .addEdge(START, "process")  // Connect start to your node
    .addEdge("process", END);  // Connect your node to end

  // Compile for deployment
  export const app = graph.compile();
  ```
  </Tab>
</Tabs>

在此示例中，节点函数（对于 Python 为`my_app_node`，对于 JavaScript 为`myAppNode`）可以包含对任何框架或库的调用。 LangGraph结构仅提供部署接口和编排层。

有关端到端示例，请参阅[Google ADK](/langsmith/deploy-google-adk)和[Claude Agent SDK, Strands, CrewAI, and AutoGen](/langsmith/deploy-other-frameworks)的部署指南。 LangSmith 通过 [⟦T34⟧](https://pypi.org/project/deployments-wrap-sdk/) 添加了对 Google ADK 的支持，[⟦T34⟧](https://pypi.org/project/deployments-wrap-sdk/) 是一个可扩展包，用于包装代理 SDK 以在 LangSmith 部署上运行。

## 环境变量

如果您正在使用已部署的 LangGraph 应用程序 [locally](/langsmith/local-dev-testing)，则可以在 [configuration file](#configuration-file-concepts) 的 `env` 键中配置环境变量。

对于生产部署，您通常需要在部署环境中配置环境变量。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/application-structure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>