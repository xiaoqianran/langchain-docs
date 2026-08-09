<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Runtimes, frameworks, and harnesses | https://docs.langchain.com/oss/javascript/concepts/products -->

# 运行时、框架和工具

了解 LangChain、LangGraph 和 Deep Agent 之间的区别以及何时使用每一种

LangChain维护了多个开源包来帮助您构建代理。每个在代理开发堆栈中都有不同的用途。了解 [agent frameworks](#agent-frameworks-like-langchain)、[agent runtimes](#agent-runtimes-like-langgraph) 和 [agent harnesses](#agent-harnesses-like-the-deep-agents-sdk) 之间的区别有助于您选择适合您需求的工具。

<table>
  <thead>
    <tr>
      <th />

      <th>运行时</th>
      <th>框架</th>
      <th>安全带</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>增值</td>
      <td><ul><li>耐用执行</li><li>流媒体</li><li>HITL</li><li>持久</li></ul></td>
      <td><ul><li>抽象</li><li>集成</li></ul></td>
      <td><ul><li>预定义工具</li><li>提示</li><li>子代理</li></ul></td>
    </tr><tr>
      <td>何时使用</td>
      <td><ul><li>低级控制</li><li>长时间运行、有状态的工作流程和代理</li></ul></td>
      <td><ul><li>快速入门</li><li>标准化团队建设</li></ul></td>
      <td><ul><li>更多自主代理</li><li>面临复杂、不确定性任务的代理</li></ul></td>
    </tr>

    <tr>
      <td>选项</td>
      <td><ul><li>LangGraph</li><li>时间</li><li>摄取</li></ul></td>
      <td><ul><li>LangChain</li><li>Vercel的AI SDK</li><li>CrewAI</li><li>OpenAI代理SDK</li><li>Google ADK</li><li>LlamaIndex</li></ul></td>
      <td><ul><li>深度代理SDK</li><li>克劳德代理SDK</li><li>Manus</li></ul></td>
    </tr>
  </tbody>
</table>

## 代理框架（如 LangChain）

代理框架提供了抽象，使使用 LLM 构建时更容易开始。

[LangChain](/oss/javascript/langchain/overview) 是一个代理框架，提供结构化内容块、代理循环和中间件等抽象。LangChain 的抽象设计易于上手，同时仍提供高级用例所需的灵活性。

虽然 LangChain 是建立在 [LangGraph](/oss/javascript/langgraph/overview) 之上的，但您不需要了解 LangGraph 即可使用 LangChain。

代理框架的其他示例包括 [Vercel's AI SDK](https://ai-sdk.dev/docs/introduction)、[CrewAI](https://www.crewai.com/)、[OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)、[Google ADK](https://google.github.io/adk-docs/)、[LlamaIndex](https://www.llamaindex.ai/) 等等。

### 何时使用LangChain

在以下情况下使用 LangChain：

* 您想要快速构建代理和自治应用程序。
* 您需要模型、工具和代理循环的标准抽象。
* 您需要一个易于使用但仍提供灵活性的框架。
* 您正在构建简单的代理应用程序，无需复杂的编排需求。

## 代理运行时（如 LangGraph）

代理运行时提供了在生产中运行代理的工具。
支持的工具可能包括：* **持久执行**：代理在出现故障时仍能持续运行，并且可以长时间运行，从中断处恢复。
* **流式传输**：支持流式工作流程和响应。
* **人机交互**：通过检查和修改代理状态来纳入人工监督。
* **持久化**：状态管理的线程级和跨线程持久化。
* **低级控制**：直接控制代理编排，无需高级抽象。

[LangGraph](/oss/javascript/langgraph/overview) 是一个低级编排框架和运行时，用于构建、管理和部署长期运行的有状态代理。

代理框架通常是更高级别的并且在代理运行时上运行。
例如，LangChain 1.0 是建立在 LangGraph 之上的。

代理运行时的其他示例包括[Temporal](https://temporal.io/)、[Inngest](https://www.inngest.com/)和其他持久执行引擎。

### 何时使用 LangGraph

在以下情况下使用 LangGraph：

* 您需要对代理编排进行细粒度、低级别的控制。
* 您需要长期运行、有状态代理的持久执行。
* 您正在构建结合了确定性步骤和代理步骤的复杂工作流程。
* 您需要用于代理部署的生产就绪基础设施。

## 代理工具（如 Deep Agents SDK）代理工具是固执己见的、包含电池的框架，具有内置工具和功能，用于构建复杂的、长期运行的代理。
支持的工具可能包括：

* **规划功能**：使用待办事项列表跟踪多个任务。
* **任务委派**：委派工作并使用子代理保持上下文干净。
* **文件系统**：对不同可插拔存储后端上的文件进行读写访问。
* **令牌管理**：对话历史摘要和大型工具结果驱逐。

[Deep Agents SDK](/oss/javascript/deepagents/overview) 构建在 LangGraph 之上，并添加了规划功能、用于上下文管理的文件系统、生成子代理的能力等等。
Deep Agents 专为需要规划和分解的复杂、多步骤任务而设计。

示例任务包括处理搜索结果、脚本和其他状态工件。

代理工具的其他示例包括 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)、[Manus](https://manus.im/) 和其他编码 CLI。

### 何时使用 Deep Agents SDK

在以下情况下使用[Deep Agents SDK](/oss/javascript/deepagents/overview)：* 您正在构建长期运行的代理。
* 您正在构建需要处理复杂、多步骤任务的代理。
* 您想要使用预定义的工具，例如文件系统操作、bash 执行和自动化上下文工程。
* 您想要使用预定义的提示和子代理。

## 功能比较

虽然您可以使用 LangChain、LangGraph 和 Deep Agent 完成类似的任务，但集成它们的级别有所不同：

|特色|郎图|LangChain |深度代理|
| ----------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
|短期记忆 | [Short-term memory](/oss/javascript/langgraph/add-memory#add-short-term-memory) | [Short-term memory](/oss/javascript/langchain/short-term-memory) | [⟦T0⟧](/oss/javascript/deepagents/backends#statebackend) |
|长期记忆 | [Long-term memory](/oss/javascript/langgraph/add-memory#add-long-term-memory) | [Long-term memory](/oss/javascript/langchain/long-term-memory) | [Long-term memory](/oss/javascript/deepagents/memory) ||技能 | - | [Multi-agent skills](/oss/javascript/langchain/multi-agent/skills) | [Skills](/oss/javascript/deepagents/skills) |
|子代理 | [Subgraphs](/oss/javascript/langgraph/use-subgraphs) | [Multi-agent subagents](/oss/javascript/langchain/multi-agent/subagents) | [Subagents](/oss/javascript/deepagents/subagents) |
|人机交互 | [Interrupts](/oss/javascript/langgraph/interrupts) | [Human-in-the-loop middleware](/oss/javascript/langchain/human-in-the-loop) | [⟦T1⟧ parameter](/oss/javascript/deepagents/harness#human-in-the-loop) |
|流媒体| [Streaming](/oss/javascript/langgraph/streaming) | [Agent Streaming](/oss/javascript/langchain/event-streaming) | [Streaming](/oss/javascript/deepagents/event-streaming) |

## 了解更多

* [LangChain overview](/oss/javascript/langchain/overview)
* [LangGraph overview](/oss/javascript/langgraph/overview)
* [Deep Agents overview](/oss/javascript/deepagents/overview)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/products.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>