<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents patterns | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-patterns -->

# 托管Deep Agents模式

使用托管 Deep Agents 模式为常见工作流程构建代理。

模式将内存、调度、通道、浏览器和子代理等托管Deep Agents原语组合到工作代理中。使用每个指南作为起点，并根据您的工作流程调整其说明和工具。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

![A central agent connected to eight Managed Deep Agents primitives: channels, schedules, memory, tools, connections, sandboxes, subagents, and skills.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-patterns-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=b903b397b77ccb242eb8b98cc41cd9b1)

## 模式

* [Daily digest](/langsmith/javascript/managed-deep-agents-tutorial)：在持久内存中记住主题并发送工作日新闻摘要。
* [Watch mode](/langsmith/javascript/managed-deep-agents-watch-mode)：监控 Slack 频道，默认保持安静，并安排后续签到。
* [Goals](/langsmith/javascript/managed-deep-agents-goal-oriented)：安排重复的进度检查，直到多轮工作完成。
* [Dreaming](/langsmith/javascript/managed-deep-agents-dreaming)：每晚查看一个人的踪迹以更新他们的记忆并提出改进建议。
* [Swarm](/langsmith/javascript/managed-deep-agents-swarm)：跨并行异步子代理展开事件调查。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-patterns.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。