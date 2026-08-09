<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Skills | https://docs.langchain.com/oss/javascript/langchain/multi-agent/skills -->

# 技能

在**技能**架构中，专门的功能被打包为可调用的“技能”，以增强[agent's](/oss/javascript/langchain/agents)行为。技能主要是代理可以按需调用的提示驱动的专业化。
有关内置技能支持，请参阅[Deep Agents](/oss/javascript/deepagents/skills)。

<Tip>
  此模式在概念上与[Agent Skills](https://agentskills.io/)和[llms.txt](https://llmstxt.org/)（由 Jeremy Howard 引入）相同，后者使用工具调用来逐步公开文档。该技能模式将渐进式披露应用于专业提示和领域知识，而不仅仅是文档页面。

  有关提高代理在 LangChain 生态系统任务中的性能的即用型技能，请参阅 [LangChain Skills](https://github.com/langchain-ai/langchain-skills) 存储库。
</Tip>

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A[User] --> B[Agent]
    B --> C[Skill A]
    B --> D[Skill B]
    B --> E[Skill C]
    B --> A

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A trigger
    class B,C,D,E process
```

## 主要特征

* 提示驱动的专业化：技能主要由专门的提示定义
* 渐进式披露：根据上下文或用户需求提供技能
* 团队分布：不同团队可以独立开发和维护技能
* 轻量级组成：技能比全分代理更简单
* 参考意识：技能可以参考脚本、模板等资源

## 何时使用当您想要一个具有许多可能的专业化的[agent](/oss/javascript/langchain/agents)，您不需要在技能之间强制执行特定的约束，或者不同的团队需要独立开发功能时，请使用技能模式。常见的例子包括编码助理（不同语言或任务的技能）、知识库（不同领域的技能）和创意助理（不同格式的技能）。

## 基本实现

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, createAgent } from "langchain";
import * as z from "zod";

const loadSkill = tool(
  async ({ skillName }) => {
    // Load skill content from file/database
    return "";
  },
  {
    name: "load_skill",
    description: `Load a specialized skill.

Available skills:
- write_sql: SQL query writing expert
- review_legal_doc: Legal document reviewer

Returns the skill's prompt and context.`,
    schema: z.object({
      skillName: z
        .string()
        .describe("Name of skill to load")
    })
  }
);

const agent = createAgent({
  model: "gpt-5.5",
  tools: [loadSkill],
  systemPrompt: (
    "You are a helpful assistant. " +
    "You have access to two skills: " +
    "write_sql and review_legal_doc. " +
    "Use load_skill to access them."
  ),
});
```

有关完整的实现，请参阅下面的教程。

<Card title="Tutorial: Build a SQL assistant with on-demand skills" icon="wand" href="/oss/javascript/langchain/multi-agent/skills-sql-assistant">
  了解如何通过渐进式披露来实施技能，其中代理按需而不是预先加载专门的提示和模式。
</Card>

## 扩展模式

在编写自定义实现时，您可以通过多种方式扩展基本技能模式：

* **动态工具注册**：将渐进式披露与状态管理相结合，将新的[tools](/oss/javascript/langchain/tools)注册为技能负载。例如，加载“database\_admin”技能可以添加专门的上下文并注册特定于数据库的工具（备份、恢复、迁移）。这使用了跨多代理模式使用的相同工具和状态机制 - 工具更新状态以动态更改代理功能。* **分层技能**：技能可以在树结构中定义其他技能，从而创建嵌套的专业化。例如，加载“数据\_科学”技能可能会提供诸如“pandas\_expert”、“可视化”和“统计\_分析”等子技能。每个子技能都可以根据需要独立加载，从而实现领域知识的细粒度渐进公开。这种分层方法通过将功能组织到可按需发现和加载的逻辑分组中，帮助管理大型知识库。

* **参考意识**：虽然每项技能只有一个提示，但该提示可以参考其他资产的位置，并提供有关代理何时应使用这些资产的信息。
  当这些资产变得相关时，代理将知道这些文件存在并根据需要将它们读入内存以完成任务。
  这也遵循渐进公开模式并限制上下文窗口中的信息。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>