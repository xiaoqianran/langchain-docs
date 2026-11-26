<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Investigate an incident with a swarm | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-swarm -->

# 调查群体事件

协调异步子代理以并行调查事件。

群体将任务分配给并行的子代理，并结合他们的发现。在此示例中，首席特工启动三个专门的[async subagents](/langsmith/javascript/managed-deep-agents-subagents#async-subagents)并行调查事件，然后编写一份报告。当并行任务的数量取决于请求时，领导者还可以使用内置的`general-purpose`子代理来[fan out dynamically](#fan-out-dynamically)。

> [!注意]
>
> 托管 Deep Agents 位于 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) 上的 [beta](/langsmith/release-stages)。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> 此 TypeScript 示例需要 `managed-deepagents` 版本 0.10.0 或更高版本以及匹配的 `mda` CLI。

![Mock incident-investigator chat launching logs-investigator, changes-investigator, and issues-investigator in parallel via start_async_task and combining their findings into one report.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-swarm-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=78b935962181244c0b1b208d22295f04)

## 声明子代理

从 [quickstart](/langsmith/javascript/managed-deep-agents-quickstart) 的项目开始并替换代理定义：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

export const agent = defineDeepAgent({
  name: "incident-investigator",
  model: "openai:gpt-6.1-sol",
  subagents: [
    {
      name: "logs-investigator",
      description: "Analyzes incident logs.",
      systemPrompt: "Find symptoms and timing in the logs. Cite sources.",
      async: true,
    },
    {
      name: "changes-investigator",
      description: "Analyzes recent changes.",
      systemPrompt: "Find changes that could explain the incident. Cite sources.",
      async: true,
    },
    {
      name: "issues-investigator",
      description: "Analyzes related issues.",
      systemPrompt: "Find similar past issues. Cite sources.",
      async: true,
    },
  ],
});
```

子代理继承领导者的模型和工具。异步子代理只能看到其任务描述，而看不到领导的对话。

## 编写说明

替换`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Incident investigator

For an incident, start logs-investigator, changes-investigator, and
issues-investigator as async tasks at the same time. Give each one the
relevant evidence from the request. When all three finish, write one report
that separates confirmed findings from hypotheses and lists missing evidence.
```

领导者使用 `start_async_task` 启动每项任务。任务在单独的线程中运行，并在每个任务完成时通知主管。

## 尝试一下使用 `mda dev` 或 [deploy it](/langsmith/javascript/managed-deep-agents-deploy) 运行代理。在新对话中，描述事件并粘贴日志、最近的更改和相关问题。确认领导者同时开始所有三项任务并结合他们的发现。

## 动态扇出

当并行任务的数量取决于请求时（例如每个受影响的服务进行一项调查），您不需要预先声明子代理。每个部署的或`mda dev`代理都包含一个内置的[⟦T10⟧](/oss/javascript/deepagents/subagents#the-general-purpose-subagent)子代理，它继承了领导者的模型、工具和技能。

指示领导一轮启动多个 `general-purpose` 任务，使用 `start_async_task` 进行后台运行或使用 `task` 等待所有结果：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When an incident spans multiple services, launch one `general-purpose` task
per service in the same turn. Include the service, time range, symptoms, and
expected output in each description, then combine the findings.
```

每个任务都在自己的上下文窗口中运行，并且不会看到用户的消息，因此请在 `description` 中包含所有需要的详细信息。

## 扩展模式

* 添加只读 [tools](/langsmith/javascript/managed-deep-agents-tools) 或 [MCP servers](/langsmith/javascript/managed-deep-agents-mcp-connectors)，以便子代理提取实时日志、更改和问题。
* 添加[Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack)，以便人们可以通过提及代理来开始调查。
* 添加更多异步子代理，例如用于指标的异步子代理，并在 `instructions.md` 中命名它们。

## 另请参阅

* [Subagents](/langsmith/javascript/managed-deep-agents-subagents)：配置委派和子代理访问。
* [Async subagents](/oss/javascript/deepagents/async-subagents)：管理后台任务。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-swarm.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。