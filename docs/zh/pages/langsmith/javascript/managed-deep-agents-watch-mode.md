<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a Slack watch agent | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-watch-mode -->

# 构建 Slack 手表代理

Build a Slack agent that reads every channel message and decides when to reply.

Watch mode lets a [Slack-connected agent](/langsmith/javascript/managed-deep-agents-channels-slack) read channel messages without waiting for a mention. The agent decides from context whether to reply or stay silent.

> [!注意]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc).使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> This TypeScript example requires `managed-deepagents` version 0.10.4 or later and the matching `mda` CLI.

![Mock Slack channel #ops-deploys showing Watch Agent staying silent on casual chatter, silently scheduling a 15-minute check-in after a deploy message, and posting a latency check reply in the thread.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-watch-mode-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=421a5e17e7ce21130f9d5ace97a2027c)

## 配置 Slack 通道

Start with a project that has a [Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack#add-a-slack-channel) and update its declaration:

```ts channels/slack.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { channels } from "managed-deepagents";

export const channel = channels.slack({
  triggerMode: "all",
  reactions: false,
  status: false,
});
```

Every message in channels the bot belongs to starts a run, and each run incurs usage. Turning off reactions and working status keeps the agent quiet when it chooses not to reply.

## 编写说明

添加到`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Slack watch agent

Answer direct questions and mentions. For other messages, reply only when you
can add something useful. Otherwise, respond with exactly [quiet].
```

确切的 `[quiet]` 回复什么也没发布。

[Deploy the agent](/langsmith/javascript/managed-deep-agents-deploy) 并邀请它加入频道。 Send a message that needs no reply and a message that mentions the agent, then confirm only the mention gets a reply.

## 添加签到

To let the agent follow up later, add a [custom tool](/langsmith/javascript/managed-deep-agents-tools) that schedules a one-time [check-in](/langsmith/javascript/managed-deep-agents-schedules#create-schedules-at-runtime) in the current thread.在 `managed-deepagents` 0.10.4 中，使用 npm：pnpm 可以解决不兼容的 LangChain 版本。安装该工具的依赖项：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langchain zod
```

```ts tools/watch.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import type { ManagedDeepAgentRuntime } from "managed-deepagents";
import { z } from "zod";

export const scheduleCheckIn = tool(
  async ({ prompt, minutes }, runtime) => {
    const managedRuntime = runtime as typeof runtime &
      Pick<ManagedDeepAgentRuntime, "thread" | "schedules">;
    const origin = managedRuntime.thread?.origin;
    if (!origin || origin.channel.provider !== "slack") {
      return "A Slack conversation is required to schedule a check-in.";
    }
    if (minutes < 2 || minutes > 1440) {
      return "Choose a delay between 2 and 1440 minutes.";
    }
    const item = await managedRuntime.schedules!.create({
      owner: { type: "agent" },
      at: new Date(Date.now() + minutes * 60_000),
      newThread: false,
      prompt,
    });
    return `Scheduled check-in ${item.id}.`;
  },
  {
    name: "schedule_check_in",
    description: "Schedule one check-in in the current conversation, 2 to 1440 minutes from now.",
    schema: z.object({
      prompt: z.string(),
      minutes: z.number().int(),
    }),
  },
);
```

注册工具：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

import { scheduleCheckIn } from "./tools/watch";

export const agent = defineDeepAgent({
  name: "watch-agent",
  model: "openai:gpt-6.1-sol",
  tools: [scheduleCheckIn],
});
```

添加到`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When work is ongoing and a later check could help, call schedule_check_in.
When a check-in runs, reply only if there is something new; otherwise respond
with exactly [quiet].
```

例如，如果有人说修复即将推出，代理可以安排 15 分钟后签入。签入作为代理运行，并且仅查看已传递到其线程的消息。

## 扩展模式

* 在运行开始之前，通过从 `channels.slack(...)` 上的 `onEvent` `"message"` 处理程序返回 `null` 来过滤消息，以减少繁忙通道中的使用。

* 添加 Slack 历史记录[tool](/langsmith/javascript/managed-deep-agents-tools)，以便签到可以读取线程中的最新回复。

* 通过让每个签入安排下一个签入来跟踪多个签入的线程，并使用工具在完成​​后进行 [list and delete](/langsmith/javascript/managed-deep-agents-schedules#manage-schedules) 挂起检查。

## 另请参阅

* [Slack](/langsmith/javascript/managed-deep-agents-channels-slack)：设置 Slack 应用程序并配置通道触发器。
* [Schedules](/langsmith/javascript/managed-deep-agents-schedules)：创建和管理运行时计划。
* [Instructions](/langsmith/javascript/managed-deep-agents-instructions)：配置代理的行为。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-watch-mode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。