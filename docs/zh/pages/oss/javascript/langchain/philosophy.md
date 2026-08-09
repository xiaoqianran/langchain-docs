<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Philosophy | https://docs.langchain.com/oss/javascript/langchain/philosophy -->

# 理念

LangChain 是开始使用法学硕士进行构建的最简单的地方，同时也具有灵活性和生产就绪性。

LangChain由以下几个核心信念驱动：

* 大型语言模型 (LLM) 是伟大而强大的新技术。
* 当您将法学硕士与外部数据源结合起来时，它们会更好。
* 法学硕士将改变未来应用的面貌。具体来说，未来的应用程序将看起来越来越代理。
* 这种转变还处于早期阶段。
* 虽然构建这些代理应用程序的原型很容易，但构建足够可靠以投入生产的代理仍然非常困难。

如今，开发人员可以选择构建代理的方式：使用 [LangChain](/oss/javascript/langchain/overview) 实现最大的灵活性和控制，或使用 [Deep Agents](/oss/javascript/langchain/overview) 实现类似的灵活性和控制，但附带固定的内置规划、文件系统工具、子代理和上下文管理。两者都是基于[LangGraph](/oss/javascript/langgraph/overview)构建的。

对于LangChain，我们有两个核心关注点：<Steps>
  <Step title="We want to enable developers to build with the best models.">
    不同的提供者公开不同的 API，具有不同的模型参数和不同的消息格式。
    标准化这些模型输入和输出是一个核心焦点，使开发人员可以轻松更改为最新的最先进模型，避免锁定。
  </Step>

  <Step title="We want to make it easy to use models to orchestrate more complex flows that interact with other data and computation.">
    模型不仅仅用于*文本生成* - 它们还应该用于编排与其他数据交互的更复杂的流程。 LangChain 可以轻松定义 LLM 可以动态使用的[tools](/oss/javascript/langchain/tools)，并帮助解析和访问非结构化数据。
  </Step>
</Steps>

## 历史

鉴于该领域的不断变化，LangChain也随着时间的推移而发展。以下是 LangChain 多年来发生的变化的简要时间表，以及与法学硕士一起构建的意义的演变：

<Update label="2022-10-24" description="v0.0.1">
  ChatGPT 前一个月，**LangChain 作为 Python 包推出**。它由两个主要部分组成：

  * 法学硕士摘要
  * 对于常见用例，“链”或要运行的预定计算步骤。例如 - RAG：运行检索步骤，然后运行生成步骤。LangChain这个名字来源于“Language”（如语言模型）和“Chains”。
</Update>

<Update label="2022-12">
  第一个通用代理被添加到 LangChain 中。

  这些通用代理基于[ReAct paper](https://arxiv.org/abs/2210.03629)（ReAct 代表推理和行动）。他们使用 LLM 生成表示工具调用的 JSON，然后解析该 JSON 以确定要调用的工具。
</Update>

<Update label="2023-01">
  OpenAI 发布了“聊天完成”API。

  以前，模型接收字符串并返回字符串。在 ChatCompletions API 中，它们演变为接收消息列表并返回消息。其他模型提供商也纷纷效仿，LangChain 也进行了更新以支持消息列表。
</Update>

<Update label="2023-01">
  LangChain发布了JavaScript版本。

  法学硕士和代理将改变应用程序的构建方式，而 JavaScript 是应用程序开发人员的语言。
</Update>

<Update label="2023-02">
  **LangChain Inc. 是一家围绕开源 LangChain 项目成立的公司**。

  主要目标是“让智能代理无处不在”。该团队认识到，虽然LangChain是一个关键部分（LangChain使LLM的入门变得简单），但还需要其他组件。
</Update><Update label="2023-03">
  OpenAI 在其 API 中发布了“函数调用”。

  这允许 API 显式生成表示工具调用的有效负载。其他模型提供商纷纷效仿，LangChain 也进行了更新，将此作为工具调用的首选方法（而不是解析 JSON）。
</Update>

<Update label="2023-06">
  **LangSmith 由 LangChain Inc. 作为闭源平台发布**，提供可观察性和评估。

  构建代理的主要问题是让它们变得可靠，而提供可观察性和评估的 LangSmith 就是为了解决这一需求而构建的。 LangChain 已更新，可与 LangSmith 无缝集成。
</Update>

<Update label="2024-01" description="v0.1.0">
  **LangChain 发布 0.1.0**，它的第一个非 0.0.x。

  行业从原型到量产已经成熟，LangChain也更加注重稳定性。
</Update>

<Update label="2024-02">
  **LangGraph 作为开源库发布**。

  最初的LangChain有两个重点：LLM抽象和用于入门常见应用程序的高级接口；然而，它缺少一个低级编排层，该层允许开发人员控制其代理的确切流程。输入：LangGraph。在构建 LangGraph 时，我们吸取了构建 LangChain 的经验教训，并添加了我们发现需要的功能：流、持久执行、短期记忆、人机交互等等。
</Update>

<Update label="2024-06">
  **LangChain 拥有超过 700 个集成。**

  集成从核心 LangChain 包中分离出来，并转移到自己的独立包（用于核心集成）或`@langchain/community`中。
</Update>

<Update label="2024-10">
  LangGraph 成为构建任何超过单个 LLM 调用的 AI 应用程序的首选方式。

  当开发人员试图提高应用程序的可靠性时，他们需要比提供的高级接口更多的控制。 LangGraph 提供了这种低级灵活性。大多数链和代理在 LangChain 中都被标记为已弃用，并提供了如何将它们迁移到 LangGraph 的指南。 LangGraph 中仍然创建了一个高级抽象：代理抽象。它建立在低级 LangGraph 之上，并与 LangChain 的 ReAct 代理具有相同的界面。
</Update>

<Update label="2025-04">
  模型 API 变得更加多模式。模特们开始接受文件、图像、视频等。我们相应地更新了`@langchain/core`消息格式，以允许开发人员以标准方式指定这些多模式输入。
</Update>

<Update label="2025-10-20" description="v1.0.0">
  **LangChain发布1.0**，主要有两点变化：

  1. `langchain`所有连锁店和代理商全面改造。所有链和代理现在仅替换为一种高级抽象：构建在 LangGraph 之上的代理抽象。这是最初在 LangGraph 中创建的高级抽象，但刚刚转移到 LangChain。

     对于仍在使用旧LangChain链/代理且不想升级的用户（注：我们建议您这样做），您可以通过安装`@langchain/classic`包来继续使用旧LangChain。

  2. 标准的消息内容格式：模型API从返回简单内容字符串的消息演变为更复杂的输出类型——推理块、引文、服务器端工具调用等。LangChain改进了其消息格式以标准化跨提供商的这些格式。
</Update>

<Update label="2026-03-15" description="v0.5.3">
  **Deep Agents 作为基于 LangGraph 构建的开源代理工具发布**。LangChain 为自定义代理架构提供了灵活的构建块，而[Deep Agents](/oss/javascript/langchain/overview) 为研究和编码等复杂、长时间运行的任务提供了包含电池的选项。它添加了内置规划工具、具有可插入后端（内存中、磁盘、LangGraph 存储、沙箱）的虚拟文件系统以及用于上下文隔离的子代理生成。使用 Deep Agents 来实现具有预定义工具的更多自主代理；使用 LangChain 完全控制您的代理架构。
</Update>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/philosophy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>