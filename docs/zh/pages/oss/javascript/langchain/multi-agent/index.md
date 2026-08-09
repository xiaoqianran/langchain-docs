<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Multi-agent | https://docs.langchain.com/oss/javascript/langchain/multi-agent/index -->

# 多代理

多代理系统协调专门的组件来处理复杂的工作流程。然而，并非所有复杂的任务都需要这种方法——具有正确（有时是动态）工具和提示的单个代理通常可以实现类似的结果。

<Tip>
  对于内置多代理支持，请使用[Deep Agents](/oss/javascript/deepagents/overview)：基于 LangChain 构建的更高级别的工具，附带[subagents](/oss/javascript/deepagents/subagents)、[skills](/oss/javascript/deepagents/skills)、规划、虚拟文件系统和上下文管理。
</Tip>

## 为什么要使用多代理？

当开发人员说他们需要“多代理”时，他们通常会寻找以下一项或多项功能：

* <Icon icon="brain" /> **上下文管理**：提供专业知识，而不会压垮模型的上下文窗口。如果上下文是无限的并且延迟为零，您可以将所有知识转储到单个提示中 - 但由于事实并非如此，您需要模式来有选择地显示相关信息。
* <Icon icon="users" /> **分布式开发**：允许不同团队独立开发和维护能力，组成一个边界清晰的更大系统。
* <Icon icon="git-branch" /> **并行化**：为子任务生成专门的工作人员并同时执行它们以获得更快的结果。当单个代理有太多[tools](/oss/javascript/langchain/tools)并且对使用哪个代理做出错误的决定时，当任务需要具有广泛上下文的专业知识（长提示和特定于领域的工具）时，或者当您需要强制执行顺序约束以仅在满足某些条件后解锁功能时，多代理模式特别有价值。

<Tip>
  多智能体设计的核心是**[context engineering](/oss/javascript/langchain/context-engineering)**——决定每个智能体看到什么信息。系统的质量取决于确保每个代理都能访问其任务所需的正确数据。
</Tip>

## 模式

以下是构建多代理系统的主要模式，每种模式适合不同的用例：|图案|它是如何运作的 |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |主代理作为工具来协调子代理。所有路由都经过主代理，主代理决定何时以及如何调用每个子代理。                                                         |
| [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |行为根据状态动态变化。工具调用更新状态变量，触发路由或配置更改、切换代理或调整当前代理的工具和提示。 || [**Skills**](/oss/javascript/langchain/multi-agent/skills) |按需加载专业提示和知识。单个代理保持控制，同时根据需要从技能加载上下文。                                                                    |
| [**Router**](/oss/javascript/langchain/multi-agent/router) |路由步骤对输入进行分类并将其定向到一个或多个专门代理。结果被综合为综合响应。                                                                 |
| [**Custom workflow**](/oss/javascript/langchain/multi-agent/custom-workflow) |使用 [LangGraph](/oss/javascript/langgraph/overview) 构建定制执行流，混合确定性逻辑和代理行为。将其他模式作为节点嵌入到您的工作流程中。                |

### 选择模式

使用此表将您的要求与正确的模式相匹配：<div>
  |图案|分布式开发 |并行化 |多跳 |直接用户交互 |
  | ---------------------------------------------------------------- | :---------------------: | :-------------: | :-----: | :---------------------: |
  | [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |          ⭐⭐⭐⭐⭐ |      ⭐⭐⭐⭐⭐ |   ⭐⭐⭐⭐⭐ |            ⭐ |
  | [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |            - |        - |   ⭐⭐⭐⭐⭐ |          ⭐⭐⭐⭐⭐ |
  | [**Skills**](/oss/javascript/langchain/multi-agent/skills) |          ⭐⭐⭐⭐⭐ |       ⭐⭐⭐ |   ⭐⭐⭐⭐⭐ |          ⭐⭐⭐⭐⭐ |
  | [**Router**](/oss/javascript/langchain/multi-agent/router) |           ⭐⭐⭐ |      ⭐⭐⭐⭐⭐ |     - |           ⭐⭐⭐ |
</div>

* **分布式开发**：不同团队可以独立维护组件吗？
* **并行化**：多个代理可以同时执行吗？
* **多跳**：该模式是否支持串联调用多个子代理？
* **直接用户交互**：子代理可以直接与用户对话吗？<Tip>
  您可以混合图案！例如，**子代理**架构可以调用调用自定义工作流或路由器代理的工具。子代理甚至可以使用 **技能** 模式来按需加载上下文。可能性是无限的！
</Tip>

### 视觉概述

<Tabs>
  <Tab title="Subagents">
    主代理作为工具来协调子代理。所有路由都经过主代理。

    <Frame>
      <img alt="Subagents pattern: main agent coordinates subagents as tools" />
    </Frame>
  </Tab>

  <Tab title="Handoffs">
    代理通过工具调用相互转移控制权。每个代理可以移交给其他代理或直接响应用户。

    <Frame>
      <img alt="Handoffs pattern: agents transfer control via tool calls" />
    </Frame>
  </Tab>

  <Tab title="Skills">
    单个代理可以按需加载专门的提示和知识，同时保持控制。

    <Frame>
      <img alt="Skills pattern: single agent loads specialized context on-demand" />
    </Frame>
  </Tab>

  <Tab title="Router">
    路由步骤对输入进行分类并将其定向到专门的代理。综合结果。

    <Frame>
      <img alt="Router pattern: routing step classifies input to specialized agents" />
    </Frame>
  </Tab>
</Tabs>

<Tip>
  使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-index) 跟踪代理之间的完整协调流程。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。
</Tip>

## 性能比较不同的模式有不同的性能特点。了解这些权衡有助于您选择适合您的延迟和成本要求的模式。

**关键指标：**

* **模型调用**：LLM 调用次数。更多调用 = 更高的延迟（尤其是连续调用）和更高的每个请求 API 成本。
* **处理的令牌**：所有调用的[context window](/oss/javascript/langchain/context-engineering)使用总量。更多令牌 = 更高的处理成本和潜在的上下文限制。

### 一次性请求

> **用户：**“买咖啡”

专门的咖啡代理/技能可以调用`buy_coffee`工具。

|图案|模型调用 |最适合|
| ---------------------------------------------------------------- | :---------: | :------: |
| [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |      4 |          |
| [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |      3 |     ✅ |
| [**Skills**](/oss/javascript/langchain/multi-agent/skills) |      3 |     ✅ |
| [**Router**](/oss/javascript/langchain/multi-agent/router) |      3 |     ✅ |

<Tabs>
  <Tab title="Subagents">
    **4个模型调用：**

    <Frame>
      <img alt="Subagents one-shot: 4 model calls for buy coffee request" />
    </Frame>
  </Tab>

  <Tab title="Handoffs">
    **3个模型调用：**

    <Frame>
      <img alt="Handoffs one-shot: 3 model calls for buy coffee request" />
    </Frame>
  </Tab>

  <Tab title="Skills">
    **3个模型调用：**

    <Frame>
      <img alt="Skills one-shot: 3 model calls for buy coffee request" />
    </Frame>
  </Tab>

  <Tab title="Router">
    **3个模型调用：**<Frame>
      <img alt="Router one-shot: 3 model calls for buy coffee request" />
    </Frame>
  </Tab>
</Tabs>

**关键见解：** 切换、技能和路由器对于单个任务（每个任务 3 个调用）最有效。子代理添加一个额外的调用，因为结果通过主代理流回 - 这一开销提供了集中控制。

### 重复请求

> **第 1 回合：** “买咖啡”
> **第2回合：**“再买咖啡”

用户在同一对话中重复同一请求。

<div>
  |图案|转 2 次通话 |总计（两回合）|最适合|
  | ---------------------------------------------------------------- | :----------: | :----------------: | :------: |
  | [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |       4 |          8 |          |
  | [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |       2 |          5 |     ✅ |
  | [**Skills**](/oss/javascript/langchain/multi-agent/skills) |       2 |          5 |     ✅ |
  | [**Router**](/oss/javascript/langchain/multi-agent/router) |       3 |          6 |          |
</div>

<Tabs>
  <Tab title="Subagents">
    **再次调用 4 次 → 总共 8 次*** 子代理**设计为无状态** - 每次调用都遵循相同的流程
    * 主代理维护对话上下文，但子代理每次都重新开始
    * 这提供了强大的上下文隔离，但重复了整个流程
  </Tab>

  <Tab title="Handoffs">
    **2 次呼叫 → 总共 5 次**

    * 咖啡代理从第 1 回合开始**仍然处于活动状态**（状态持续）
    * 无需切换——座席直接调用`buy_coffee`工具（调用1）
    * 代理响应用户（调用 2）
    * **通过跳过切换节省 1 个呼叫**
  </Tab>

  <Tab title="Skills">
    **2 次呼叫 → 总共 5 次**

    * 技能上下文**已加载**在对话历史记录中
    * 无需重新加载——agent直接调用`buy_coffee`工具（调用1）
    * 代理响应用户（调用 2）
    * **通过重用加载的技能节省 1 次调用**
  </Tab>

  <Tab title="Router">
    **再次调用 3 次 → 总共 6 次**

    * 路由器是**无状态**——每个请求都需要一个 LLM 路由调用
    * 第 2 回合：路由器 LLM 调用 (1) → Milk 代理调用 buy\_coffee (2) → Milk 代理响应 (3)
    * 可以通过包装为有状态代理中的工具来优化
  </Tab>
</Tabs>**关键见解：** 有状态模式（交接、技能）可节省 40-50% 的重复请求呼叫。子代理保持每个请求的一致成本——这种无状态设计提供了强大的上下文隔离，但代价是重复模型调用。

### 多域

> **用户：**“比较 Python、JavaScript 和 Rust 的 Web 开发”

每个语言代理/技能包含约 2000 个文档标记。所有模式都可以进行并行工具调用。

|图案|模型调用 |代币总数 |最适合|
| ---------------------------------------------------------------- | :---------: | :----------: | :------: |
| [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |      5 |     \~9K |     ✅ |
| [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |      7+ |    \~14K+ |          |
| [**Skills**](/oss/javascript/langchain/multi-agent/skills) |      3 |     \~15K |          |
| [**Router**](/oss/javascript/langchain/multi-agent/router) |      5 |     \~9K |     ✅ |

<Tabs>
  <Tab title="Subagents">
    **5 次调用，\~9K 代币**

    <Frame>
      <img alt="Subagents multi-domain: 5 calls with parallel execution" />
    </Frame>

    每个子代理都在**隔离**中工作，仅与其相关的上下文相关。总计：**9K 代币**。
  </Tab>

  <Tab title="Handoffs">
    **7+ 次调用，\~14K+ 代币**

    <Frame>
      <img alt="Handoffs multi-domain: 7+ sequential calls" />
    </Frame>切换**顺序**执行——无法并行研究所有三种语言。不断增长的对话历史会增加开销。总计：**\~14K+ 代币**。
  </Tab>

  <Tab title="Skills">
    **3 次调用，\~15K 代币**

    <Frame>
      <img alt="Skills multi-domain: 3 calls with accumulated context" />
    </Frame>

    加载后，**后续每次调用都会处理技能文档的所有 6K 令牌**。由于上下文隔离，子代理处理的令牌总体减少了 67%。总计：**15K 代币**。
  </Tab>

  <Tab title="Router">
    **5 次调用，\~9K 代币**

    <Frame>
      <img alt="Router multi-domain: 5 calls with parallel execution" />
    </Frame>

    路由器使用 **LLM 进行路由**，然后并行调用代理。与子代理类似，但具有显式路由步骤。总计：**9K 代币**。
  </Tab>
</Tabs>

**关键见解：** 对于多域任务，并行执行的模式（子代理、路由器）是最有效的。由于上下文积累，技能调用较少，但令牌使用率很高。此处的切换效率很低，它必须按顺序执行，并且无法利用并行工具调用来同时咨询多个域。

### 总结

以下是所有三种情况下的模式比较：<div>
  |图案|一击|重复请求 |      多域 |
  | ---------------------------------------------------------------- | :------: | :------------: | :--------------------: |
  | [**Subagents**](/oss/javascript/langchain/multi-agent/subagents) |  4 次通话 |  8 次通话 (4+4) |   5 次调用，9K 代币 |
  | [**Handoffs**](/oss/javascript/langchain/multi-agent/handoffs) |  3 次通话 |  5 次通话 (3+2) | 7+ 次调用，14K+ 代币 |
  | [**Skills**](/oss/javascript/langchain/multi-agent/skills) |  3 次通话 |  5 次通话 (3+2) |  3 次调用，15K 代币 |
  | [**Router**](/oss/javascript/langchain/multi-agent/router) |  3 次通话 |  6 次通话 (3+3) |   5 次调用，9K 代币 |
</div>

**选择图案：**<div>
  |优化 | [Subagents](/oss/javascript/langchain/multi-agent/subagents) | [Handoffs](/oss/javascript/langchain/multi-agent/handoffs) | [Skills](/oss/javascript/langchain/multi-agent/skills) | [Router](/oss/javascript/langchain/multi-agent/router) |
  | -------------------- | :----------------------------------------------------------: | :--------------------------------------------------------: | :----------------------------------------------------: | :----------------------------------------------------: |
  |单个请求 |                                                              |                              ✅ |                            ✅ |                            ✅ |
  |重复请求 |                                                              |                              ✅ |                            ✅ |                                                        |
  |并行执行 |                               ✅ |                                                            |                                                        |                            ✅ ||大上下文域 |                               ✅ |                                                            |                                                        |                            ✅ |
  |简单、专注的任务 |                                                              |                                                            |                            ✅ |                                                        |
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>