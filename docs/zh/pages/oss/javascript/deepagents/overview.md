<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deep Agents overview | https://docs.langchain.com/oss/javascript/deepagents/overview -->

# Deep Agents 概述

构建可以规划、使用子代理并利用文件系统来执行复杂任务的代理

Deep Agents 是开始构建由 LLM 支持的代理和应用程序的最简单方法 - 具有用于上下文管理、子代理生成和长期内存的文件系统内置功能。
当您的用例需要时，[task planning](#task-planning)和[skills](#skills)等可选功能可扩展线束。
您可以将深度代理用于任何任务，包括复杂的多步骤任务。

Deep Agents具有以下功能：

* **在环境中采取行动**：通过工具采取行动，读写文件，执行代码
* **连接到您的数据**：在适当的时刻加载记忆、技能和领域知识
* **管理不断增长的环境**：总结历史并在长期运行中卸载大量结果
* **并行化任务**：委托给在隔离上下文窗口中运行的通用或专用子代理
* **留在循环中**：在关键决策点暂停以供人工批准
* **随着时间的推移而改进**：根据实际使用情况更新记忆、技能和提示

有关每个组件的完整详细信息，请参阅[Core capabilities](#core-capabilities)。

## 快速入门

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
// npm install deepagents langchain @langchain/core
import { createDeepAgent } from "deepagents";
import { tool } from "langchain";

const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  }),
});

const agent = await createDeepAgent({
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant",
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  }),
);
```请参阅 [Quickstart](/oss/javascript/deepagents/quickstart/) 和 [Customization guide](/oss/javascript/deepagents/customization/) 开始使用 Deep Agents 构建您自己的代理和应用程序。

<Tip>
  使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-overview) 跟踪请求、调试代理行为并评估输出。按照[observability quickstart](/langsmith/observability-quickstart)进行设置。准备好投入生产后，请参阅 [Going to production](/oss/javascript/deepagents/going-to-production) 了解 LangSmith 部署选项。
</Tip>

## 核心能力

<img alt="Agent harness capabilities by category" />

Deep Agents 是["agent harness"](/oss/javascript/concepts/products#agent-harnesses-like-the-deep-agents-sdk)。它与其他代理框架具有相同的核心工具调用循环，但具有使代理可靠地执行实际任务的内置功能：

<CardGroup>
  <Card title="Execution environment" icon="bolt" href="#execution-environment">
    工具、虚拟文件系统、可选沙箱和 REPL（解释器）
  </Card>

  <Card title="Context management" icon="database" href="#context-management">
    技能、记忆、总结、上下文卸载和提示缓存
  </Card>

  <Card title="Delegation" icon="sitemap" href="#delegation">
    子代理生成和可选的任务规划
  </Card>

  <Card title="Steering" icon="user" href="#steering">
    人机交互批准和中断
  </Card>
</CardGroup>

[⟦T9⟧](https://www.npmjs.com/package/deepagents) 是一个独立的库，构建在 [LangChain](/oss/javascript/langchain/) 代理的核心构建块之上，并使用 [LangGraph](/oss/javascript/langgraph/) 的工具在生产中运行代理。

[LangChain](/oss/javascript/langchain/) 是为您的代理提供核心构建块的框架。
要了解有关 LangChain、LangGraph 和 Deep Agents 之间差异的更多信息，请参阅 [Frameworks, runtimes, and harnesses](/oss/javascript/concepts/products)。有关与 Anthropic 安全带的并排比较，请参阅 [Deep Agents vs. Claude Agent SDK](/oss/javascript/deepagents/comparison)。要构建没有这些内置功能的自定义代理，请考虑使用 LangChain 的 [⟦T10⟧](/oss/javascript/langchain/agents) 或构建自定义 [LangGraph](/oss/javascript/langgraph/overview) 工作流程。

## 执行环境

执行环境是代理执行操作的地方。它有四层：

* **[Tools](#tools-and-mcp)**：代理可以调用的自定义函数、API 和数据库
* **[Virtual filesystem](#virtual-filesystem-access)**：由可插拔后端支持的文件工具
* **[Filesystem permissions](#filesystem-permissions)**：代理可以读取或写入的路径的声明性访问控制
* **[Code execution](#code-execution)**：沙盒 shell 执行和进程内 JavaScript 解释器

**[Streaming](#streaming)** 允许您使用消息、工具、值和委派任务的类型化事件流来跟上发生的一切。

### 工具和 MCP

使用 `tools=` 参数传递自定义函数、LangChain 工具或来自任何 [MCP server](/oss/javascript/deepagents/tools#mcp-tools) 的工具。 Deep Agents 完全支持[Model Context Protocol (MCP)](/oss/javascript/langchain/mcp)，让您通过标准接口连接到数据库、API、文件系统等。

有关定义自定义工具、使用 MCP 服务器以及内置线束工具的完整列表的更多信息，请参阅[Tools](/oss/javascript/deepagents/tools)。

### 虚拟文件系统访问该工具提供了一个可配置的虚拟文件系统，可以由不同的[pluggable backends](/oss/javascript/deepagents/backends)支持：内存状态、本地磁盘、LangGraph存储、复合路由或具有[permission rules](/oss/javascript/deepagents/permissions)用于读写访问的自定义后端。

后端支持以下文件系统操作：

|工具|描述 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ls` |列出目录中的文件以及元数据（大小、修改时间）|| `read_file` |使用行号读取文件内容，支持大文件的偏移/限制。还支持返回非文本文件（图像、视频、音频和文档）的多模式内容块。请参阅下面支持的扩展。 |
| `write_file` |创建新文件 |
| `edit_file` |在文件中执行精确的字符串替换（使用全局替换模式）|
| `glob` |查找匹配模式的文件（例如，`**/*.py`）|
| `grep` |使用多种输出模式搜索文件内容（仅文件、带上下文的内容或计数）|| `execute` |在环境中运行 shell 命令（仅适用于[sandbox backends](/oss/javascript/deepagents/sandboxes)）|

<Accordion title="Supported multimodal file extensions">
  |类型 |扩展 |
  | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
  | [Image](/oss/javascript/langchain/messages#multimodal) | `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.heic`、`.heif` |
  | [Video](/oss/javascript/langchain/messages#multimodal) | `.mp4`、`.mpeg`、`.mov`、`.avi`、`.flv`、`.mpg`、`.webm`、`.wmv`、`.3gpp` |
  | [Audio](/oss/javascript/langchain/messages#multimodal) | `.wav`、`.mp3`、`.aiff`、`.aac`、`.ogg`、`.flac` |
  | [File](/oss/javascript/langchain/messages#multimodal) | `.pdf`、`.ppt`、`.pptx` |
</Accordion>

<Accordion title="Running without the default filesystem tools" icon="ban">
  要从模型中隐藏上面列出的文件系统工具，请使用 `excluded_tools` 注册 [harness profile](/oss/javascript/deepagents/profiles#harness-profiles)：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import HarnessProfile, register_harness_profile

  register_harness_profile(
      "anthropic:claude-sonnet-4-6",
      HarnessProfile(
          excluded_tools=frozenset(
              {"ls", "read_file", "write_file", "edit_file", "delete", "glob", "grep"}
          ),
      ),
  )
  ```

  通过 `excluded_middleware` 删除 [⟦T46⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) 本身被故意拒绝——它需要 [Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack) 中的脚手架。使用 `excluded_tools` 仅隐藏模型可见的工具表面并将中间件保留在适当的位置。要删除 `task` 工具，请参阅[Running without subagents](/oss/javascript/deepagents/subagents#running-without-subagents)。
</Accordion>虚拟文件系统由其他几个工具功能使用，例如技能、内存、代码执行和上下文管理。
您还可以在为 Deep Agents 构建自定义工具和中间件时使用文件系统。

欲了解更多信息，请参阅[backends](/oss/javascript/deepagents/backends)。要生成代理可以从文件系统读取的持久存储库 wiki，请参阅[OpenWiki](/oss/openwiki/overview)。

### 文件系统权限

该工具支持声明性权限规则，控制代理可以读取或写入哪些文件和目录。权限适用于上面列出的内置文件系统工具，并按照声明顺序和首匹配胜语义进行评估。

创建代理时，通过将规则列表传递给`permissions=`来定义权限。每条规则包括：

* `operations`: `"read"` 和/或 `"write"`
* `paths`：文件或目录的全局模式
* `mode`: `"allow"` 或 `"deny"`

规则从上到下进行评估，第一个匹配的规则获胜。如果没有规则匹配，则允许该操作。

此模型允许您将代理限制到特定目录（例如，`/workspace/`），保护敏感文件（例如`.env`）或凭据，并为子代理提供比父代理更窄的访问权限。权限不适用于[sandbox backends](/oss/javascript/deepagents/sandboxes)，它支持通过`execute`工具执行任意命令。对于自定义验证逻辑，请使用[backend policy hooks](/oss/javascript/deepagents/backends#add-policy-hooks)。

有关完整的规则结构、示例和子代理继承，请参阅[Permissions](/oss/javascript/deepagents/permissions)。

### 代码执行

Deep Agents支持两种方式执行代码：

* [Sandbox backends](/oss/javascript/deepagents/sandboxes) 在隔离环境中公开用于 shell 命令的 `execute` 工具。
* [Interpreters](/oss/javascript/deepagents/interpreters) 添加一个 `eval` 工具，该工具可在限定范围的 QuickJS 运行时中运行 JavaScript。

当代理需要安装依赖项、运行测试、调用 CLI 或使用操作系统文件系统时，请使用沙箱后端。沙箱后端实现`SandboxBackendProtocolV2`；当检测到时，该工具会将 `execute` 工具添加到代理的可用工具中。

当代理需要轻量级可编程层用于循环、批处理、确定性数据转换或编程工具调用时，请使用解释器。解释器不提供 shell 访问、软件包安装或文件系统和网络访问。

有关沙箱设置、提供程序和文件传输 API，请参阅 [Sandboxes](/oss/javascript/deepagents/sandboxes)。关于 QuickJS 运行时和编程工具调用，请参阅[Interpreters](/oss/javascript/deepagents/interpreters)。

### 流媒体[Event streaming](/oss/javascript/deepagents/event-streaming) 将代理运行公开为消息、工具调用、值和输出的类型化投影。 Deep Agents 添加 `stream.subagents`，以便每个委派任务都有自己的句柄，具有独立的消息、工具调用和嵌套子代理流。

## 上下文管理

上下文管理组件控制代理知道什么、在令牌限制内可以运行多长时间以及在会话中保留什么。它有四层：

* **[Skills](#skills)**：从技能文件逐步加载按需领域知识
* **[Memory](#memory)**：启动时从 `AGENTS.md` 文件加载的持久指令和首选项
* **[Summarization and context offloading](#summarization-and-context-offloading)**：自动压缩对话历史记录和大型工具结果
* **[Prompt caching](#prompt-caching)**：静态提示部分符合缓存条件，可加快推理速度并降低支持模型的成本

### 技能

技能包为您的深度代理提供专门的工作流程、领域知识和自定义说明。

每个技能都遵循 [Agent Skills standard](https://agentskills.io/) 并位于带有 `SKILL.md` 文件的目录中。技能还可以包括脚本、模板、参考文档和其他支持资源。Deep Agents 以渐进式披露的方式加载技能：代理在启动时读取`SKILL.md` frontmatter，然后仅在任务需要时读取完整的技能内容。这使得启动上下文保持紧凑，同时仍然可以按需提供丰富的功能。

有关更多信息，请参阅[Skills](/oss/javascript/deepagents/skills)。

### 内存

记忆为您的深层代理提供跨对话的持久上下文，例如编码风格、偏好、约定和项目指南。

内存使用您在创建代理时通过 `memory` 参数传递的[⟦T69⟧ files](https://agents.md/)。与技能不同，内存文件始终会加载，内容存储在配置的后端（`StateBackend`、`StoreBackend`或`FilesystemBackend`）中。

代理还可以根据交互和反馈更新记忆，因此偏好和模式可以继续下去，而无需在每个线程中重述它们。

有关配置详细信息和示例，请参阅[Memory](/oss/javascript/deepagents/customization#memory)。要生成编码代理通过`AGENTS.md`发现的存储库wiki，请参阅[OpenWiki](/oss/openwiki/overview)。

### 总结和上下文卸载

该工具管理上下文，以便深层代理可以在令牌限制内处理长时间运行的工作，同时将最相关的信息保留在范围内。

该上下文流有四个部分：* **输入上下文**：系统提示、记忆、技能和工具提示定义了代理的起始内容。
* **压缩**：内置卸载和摘要压缩对话历史记录和大型中间结果。
* **隔离**：子代理隔离繁重的子任务并仅返回最终结果（请参阅[Delegation](#delegation)）。
* **长期内存**：虚拟文件系统中的持久存储跨线程传送信息。

这些机制共同支持超出单个上下文窗口的多步骤任务，同时减少手动上下文修剪和令牌使用。

详细配置请参见[Context engineering](/oss/javascript/deepagents/context-engineering)。对于多模式输入和工具输出，请参阅[Multimodal](/oss/javascript/deepagents/multimodal)。

### 提示缓存

对于 Anthropic 和 Amazon Bedrock 模型，`create_deep_agent` 自动将提示缓存应用于系统提示的静态部分 - 每回合重复的基本代理指令、内存和技能内容。这避免了在调用之间重新处理相同的令牌，从而减少了长时间运行的代理的延迟和成本。

使用 Anthropic 模型或基岩模型（Claude 或 Nova）时，默认启用提示缓存。无需配置。对于其他提供程序，请参阅 [Middleware integrations](/oss/javascript/integrations/middleware) 了解可用的特定于提供程序的缓存中间件。

## 代表团

委托组件使代理能够将大问题分解为更小的、可并行的工作单元。它有两层：

* **[Task planning](#task-planning)**：用于结构化任务跟踪的可选 `write_todos` 工具
* **[Subagents](#subagents)**：处理独立子任务的临时子代理

### 任务规划

任务规划是一种可选的利用功能，可让代理在执行期间维护结构化任务列表。

从 v0.7 开始，任务计划只能选择加入。在早期版本中，默认包含任务计划中间件。

规划通常有助于：

* 长或复杂的多步骤任务
* 能力较差的模型受益于明确的问责工具
* 从代理状态传输进度的 UI（参见 [Todo list](/oss/javascript/deepagents/frontend/todo-list)）

将 [⟦T77⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) 传递给中间件参数，为代理提供一个 `write_todos` 工具，用于在执行期间维护结构化任务列表。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    middleware: [todoListMiddleware()],
  });
  ```
</CodeGroup>

任务支持状态跟踪（`'pending'`、`'in_progress'`、`'completed'`）并保留在代理状态。这为代理提供了一个轻量级的规划层，用于组织长期运行和多步骤的工作。有关配置选项和行为详细信息，请参阅[To-do list](/oss/javascript/langchain/middleware/built-in#to-do-list)。

### 子代理

该工具包括一个内置的`task`工具，可让主代理为隔离、长时间运行、多步骤或并行任务创建临时子代理。

子代理执行提供：

* **新鲜上下文**：每次调用都会创建一个具有自己上下文的新代理实例。
* **自主执行**：子代理独立运行直到完成。
* **单次切换**：它将一份最终报告返回给主代理。
* **可配置策略**：使用[default ⟦T83⟧ subagent](/oss/javascript/deepagents/subagents#default-subagent)（默认启用）或定义[custom subagents](/oss/javascript/deepagents/subagents#custom-subagents)。
* **无状态消息传递**：子代理是无状态的，不能发回多条消息。
* **上下文和令牌效率**：繁重的子任务工作保持隔离并被压缩为紧凑的结果。

<Accordion title="Running without subagents (no ⟦T84⟧ tool)" icon="ban">
  要在不使用 `task` 工具的情况下运行代理，请参阅 [Running without subagents](/oss/javascript/deepagents/subagents#running-without-subagents)。不要尝试通过 `excluded_middleware` 删除 [⟦T86⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware)——这是故意拒绝的。相反，通过 [harness profile](/oss/javascript/deepagents/profiles#harness-profiles) 禁用自动添加的子代理，并且不通过 `subagents=` 传递同步子代理。异步子代理不受影响。有关完整订购信息，请参阅[full stack](/oss/javascript/deepagents/customization#full-stack)。
</Accordion>

有关更多信息，请参阅[Subagents](/oss/javascript/deepagents/subagents)。

## 转向控制组件使人们能够在运行时控制代理行为，并为代理工作设置文件系统权限。

### 人机交互

Deep Agents 与 LangGraph 中断集成，以便您可以暂停敏感工具调用以供批准。使用 `create_deep_agent` 中的 `interrupt_on` 参数启用此行为。

`interrupt_on` 接受工具名称到中断配置的映射。例如，`interrupt_on={"edit_file": True}` 在每次编辑之前暂停，让您在执行之前批准调用、添加指导或修改工具输入。

这为您提供了一个运行时安全和控制层，用于破坏性操作、昂贵的 API 调用和交互式调试。

欲了解更多信息，请参阅[Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)。

## 开始吧

<CardGroup>
  <Card title="Quickstart" icon="rocket" href="/oss/javascript/deepagents/quickstart">
    构建您的第一个深度代理
  </Card>

  <Card title="Customization" icon="adjustments" href="/oss/javascript/deepagents/customization">
    了解定制选项
  </Card>

  <Card title="Code" icon="terminal" href="/oss/deepagents/code/overview">
    使用Deep Agents代码
  </Card>

  <Card title="ACP" icon="plug-connected" href="/oss/javascript/deepagents/acp">
    通过 ACP 在代码编辑器中使用深度代理
  </Card>

  <Card title="Reference" icon="external-link" href="https://reference.langchain.com/javascript/modules/deepagents.html">
    请参阅 `deepagents` API 参考
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>