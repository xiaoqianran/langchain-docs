<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Work toward a goal over time | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-goal-oriented -->

# 随着时间的推移朝着一个目标努力

让代理决定工作何时需要跟进，并安排自己的进度检查，直到工作完成。

有些工作无法一次性完成：一份合同等待签署，一份拉取请求等待审核，或者一份公告尚未发布。以目标为导向的代理会立即执行其能执行的操作，然后在进度取决于外部事件时安排自己的后续检查。在每次检查中，它都会向前推进工作，并在达到目标后停止计划。

> [!注意]
>
> 托管 Deep Agents 位于 [beta](/langsmith/release-stages) 上的 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc)。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> 此 TypeScript 示例需要 `managed-deepagents` 版本 0.10.4 或更高版本以及匹配的 `mda` CLI。

![Mock Slack thread in #deals-ops showing Goal Agent checking a vendor contract, scheduling daily progress checks with check_progress, reporting a mid-week update, and calling stop_checking once countersigned.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-goals-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=7fcd22120dfd5d0aadf4c5bc80f5ea2e)

## 添加日程工具

给代理两个包裹[runtime schedules](/langsmith/javascript/managed-deep-agents-schedules#create-schedules-at-runtime)的[tools](/langsmith/javascript/managed-deep-agents-tools)。 `check_progress` 在当前通道线程中启动代理拥有的定期检查，`stop_checking` 删除它：

在 `managed-deepagents` 0.10.4 中，使用 npm：pnpm 可以解决不兼容的 LangChain 版本。安装工具的依赖项：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langchain zod
```

```ts tools/goals.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import type { ManagedDeepAgentRuntime } from "managed-deepagents";
import { z } from "zod";

const owner = { type: "agent" } as const;

export const checkProgress = tool(
  async ({ goal, cron }, runtime) => {
    const { schedules } = runtime as typeof runtime & Pick<ManagedDeepAgentRuntime, "schedules">;
    const item = await schedules!.create({
      owner,
      cron,
      newThread: false,
      prompt: `Check progress on this goal: ${goal}`,
    });
    return `Checking progress with schedule ${item.id}.`;
  },
  {
    name: "check_progress",
    description: "Check back on unfinished work in this thread on a cron schedule, until you stop it.",
    schema: z.object({ goal: z.string(), cron: z.string() }),
  },
);

export const stopChecking = tool(
  async ({ scheduleId }, runtime) => {
    const { schedules } = runtime as typeof runtime & Pick<ManagedDeepAgentRuntime, "schedules">;
    await schedules!.delete(scheduleId, { owner });
    return `Stopped schedule ${scheduleId}.`;
  },
  {
    name: "stop_checking",
    description: "Stop checking progress on a goal that is met or abandoned.",
    schema: z.object({ scheduleId: z.string() }),
  },
);
```

将工具与快速入门模型和 Web 搜索工具一起注册：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent, type DefineDeepAgentConfig } from "managed-deepagents";

import { checkProgress, stopChecking } from "./tools/goals";

export const agent = defineDeepAgent({
  name: "goal-agent",
  model: "openai:gpt-6.1-sol",
  tools: [
    { type: "web_search_preview" },
    checkProgress,
    stopChecking,
  ] as DefineDeepAgentConfig["tools"],
});
```

## 编写说明使用 `instructions.md` 告诉代理何时自行安排后续行动，并自定义示例并检查节奏以匹配您的工作流程：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
## Follow through

Finish every request in the current turn when possible. If the work depends on
something outside your control, such as an approval, review, or publication,
define what "done" looks like and pick a check interval. Call check_progress
and end your turn instead of waiting.

On each check, inspect the current state with your tools rather than assuming.
Move the work forward if you can; otherwise, note who needs to act. When the
goal is met or blocked permanently, report the outcome and call stop_checking.
```

每次检查都在同一线程中运行，保留原始请求、先前的更新以及`stop_checking`所需的调度 ID。对于 Slack 对话，每个检查都会在同一 Slack 线程中回复。

## 尝试一下

从 [quickstart](/langsmith/javascript/managed-deep-agents-quickstart) 代理开始，您可以通过网络搜索来跟踪公共事件。添加 [Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack)（同线程代理拥有的计划需要通道）、[deploy the agent](/langsmith/javascript/managed-deep-agents-deploy)，并在 Slack 中询问：“告诉我 LangChain 何时发布其下一个版本。”代理首先进行搜索，如果版本尚未发布，则安排定期检查，并在版本出现后停止。它可以立即完成的请求，无需时间表。

## 扩展模式* 连接 [MCP servers](/langsmith/javascript/managed-deep-agents-mcp-connectors) 到您的工具，例如 GitHub、Linear 或 CRM，以便代理可以跟踪目标，例如合并拉取请求或签署合同，并一路推动所有者。
* 将每个目标保存到[memory](/langsmith/javascript/managed-deep-agents-memory)，以便代理可以列出并报告每个未完成的目标。
* 在 `check_progress` 中设置最小间隔以保持成本可预测：每次检查都是一次模型运行。
* 修剪已完成或放弃的目标：座席拥有的计划在所有对话中共享每个座席 20 个的默认限制（请参阅[Schedule limits](/langsmith/javascript/managed-deep-agents-schedules#schedule-limits)）。

## 另请参阅

* [Schedules](/langsmith/javascript/managed-deep-agents-schedules)：创建和管理运行时计划。
* [Tools](/langsmith/javascript/managed-deep-agents-tools)：编写自定义工具。
* [Watch mode](/langsmith/javascript/managed-deep-agents-watch-mode)：安排从 Slack 进行一次性签到。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-goal-oriented.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。