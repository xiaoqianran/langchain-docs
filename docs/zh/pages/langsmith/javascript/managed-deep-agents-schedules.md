<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add schedules to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-schedules -->

# 将计划添加到托管Deep Agents

为托管 Deep Agents 部署声明托管 cron 计划，或在运行时创建它们。

托管 Deep Agents 可以按 cron 计划运行代理。当您部署项目时，`mda deploy` 在部署上线后将每个计划配置为 LangSmith cron。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

时间表声明位于项目级`schedules/`目录中，每个文件有一个时间表：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
  schedules/
    daily-digest.ts
```

## 添加时间表

文件名成为托管计划名称。

调度模块必须导出命名的`schedule`声明。

```ts schedules/daily-digest.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineSchedule } from "managed-deepagents";

export const schedule = defineSchedule({
  cron: "0 8 * * 1-5",
  timezone: "America/Los_Angeles",
  prompt: "Write the daily digest.",
});
```

## 配置日程输入

每个计划必须准确定义以下之一：

* `prompt`：自然语言提示。当 cron 触发时，托管 Deep Agents 将其转换为用户消息。
* `input`：结构化LangGraph 输入对象。当您需要传递自定义图形输入而不是单个提示时，请使用此选项。

```ts schedules/nightly-sweep.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineSchedule } from "managed-deepagents";

export const schedule = defineSchedule({
  cron: "30 2 * * *",
  input: {
    messages: [
      { role: "user", content: "Sweep stale tickets and summarize changes." },
    ],
  },
});
```

`cron` 必须是标准的五字段 cron 表达式：分钟、小时、月份中的某一天、月份和星期几。如果省略 `timezone`，LangSmith crons 将使用 UTC。

## 选择线程行为默认情况下，调度使用临时线程。托管 Deep Agents 为每次运行创建一个新线程，并要求 LangSmith 在运行完成后删除该临时线程。

仅当计划运行应在调用之间累积持久线程状态时，才使用持久线程。

持久线程 ID 必须是部署中已存在的线程的 UUID。托管 Deep Agents 将值直接传递到代理服务器，代理服务器会拒绝任何非 UUID 的 ID。

### 创建持久线程

在部署计划之前创建线程。在[LangSmith Studio](/langsmith/studio)中打开部署，创建一个新线程，并复制其线程ID。 `mda deploy` 打印部署 URL，LangSmith 在部署页面上列出它。

托管 Deep Agents 和 `mda` CLI 都不会创建线程，因此这是每个持久计划的一次性手动步骤。

### 声明持久调度

在调度声明中使用该线程 ID。

<Note>
  以下示例需要[durable memory](/langsmith/javascript/managed-deep-agents-memory)。
</Note>

```ts schedules/nightly-memory.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineSchedule } from "managed-deepagents";

export const schedule = defineSchedule({
  cron: "0 3 * * *",
  prompt: "Review the current project memory and list follow-up tasks.",
  thread: { mode: "persistent", id: "<thread-uuid>" },
});
```

## 将结果发送到 Slack

设置 `deliverTo` 以通过配置的 [Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack) 发布最终响应。

使用 Slack 通道 ID，因为计划运行没有原始线程。<Note>
  计划交付需要 `managed-deepagents` 0.4.0 或更高版本。
</Note>

```ts schedules/monday-greeting.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineSchedule } from "managed-deepagents";

export const schedule = defineSchedule({
  cron: "0 9 * * 1",
  prompt: "Write a short Monday greeting.",
  deliverTo: {
    channel: "slack",
    to: {
      type: "provider_conversation",
      conversationId: "C0123456789",
    },
  },
});
```

Slack 机器人必须有权访问目的地。

## 使用静态声明

时间表声明是在编译时提取的。保持调度配置静态可序列化：

* 使用文字、数组、对象和对顶级文字常量的引用。

* 不要动态读取环境变量、调用函数、传播对象或计算调度值。

* 将动态行为改为在代理、工具、中间件或运行时上下文中。

## 本地测试时间表

`mda dev` 编译 `schedules/` 并在其启动横幅中列出每个计划，但不提供它们。计划仅在部署上运行。

<Warning>
  在 `mda dev` 下，时间表永远不会触发。本地服务器未报告错误，因此启动时列出的计划仍处于非活动状态。
</Warning>

要测试计划触发的代理行为，请将计划的 `prompt` 或 `input` 直接发送到本地 Studio 中的代理。要测试计划本身，请将项目部署到开发部署。

## 部署计划使用[⟦T24⟧](/langsmith/javascript/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T25⟧](/langsmith/javascript/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。

当部署达到 `DEPLOYED` 时，`mda deploy` 会删除早期 `schedules/` 声明创建的 cron 作业，并为当前声明创建 cron 作业。删除本地计划文件并重新部署会删除相应的托管 cron。在运行时创建的计划不受影响。

<Warning>
  如果您使用 `--no-wait` 进行部署，CLI 会在部署达到 `DEPLOYED` 之前触发远程构建并退出，因此它不会在该调用期间协调计划。添加、更改或删除计划时，运行 `mda deploy`，而不运行 `--no-wait`。
</Warning>

## 在运行时创建计划

<Note>
  运行时计划需要 `managed-deepagents` 0.9.0 或更高版本。
</Note>

`schedules/` 中的声明在部署时已修复。 `schedules` API 在代理运行时创建计划，因此代理可以设置重复性或一次性工作来响应对话。从工具或[middleware](/langsmith/javascript/managed-deep-agents-middleware)调用它。每个计划都属于当前用户或代理。代理只能通过您编写的工具来访问此 API。公开代理需要的呼叫，并忽略不应该接通的呼叫。

当工具在 [channel](/langsmith/javascript/managed-deep-agents-channels) 运行期间创建计划（例如 Slack 对话）时，该计划将继承该通道。每次运行都会将其最终答案发回给它。新线程发布新的 Slack 消息，当前线程在现有 Slack 线程中回复。

`newThread` 决定时间表使用两者中的哪一个。

### 创建定期计划

`remind_me` 为代理提供了一种为其正在交谈的人设置重复提醒的方法。代理调用它时会提示运行提示以及运行频率的 cron 表达式。每次 cron 触发时，都会开始新的运行，并以该提示作为其用户消息。代理决定每个计划的运行被要求做什么。

```ts tools/schedules.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";
import { schedules } from "managed-deepagents";

export const remindMe = tool(
  async ({ prompt, cron, timezone }) => {
    const item = await schedules.create({
      owner: { type: "user" },
      cron,
      timezone,
      prompt,
    });
    return `Created schedule ${item.id}.`;
  },
  {
    name: "remind_me",
    description: "Run a prompt for the current user on a cron schedule.",
    schema: z.object({
      prompt: z.string(),
      cron: z.string(),
      timezone: z.string().default("UTC"),
    }),
  },
);
```

当要求 Slack 每个工作日发送站立提醒时，客服人员会致电 `remind_me`。它传递了自己的措辞和 cron `0 9 * * 1-5` 的提示。每个工作日运行都会将其对 Slack 对话的答案作为新消息发布，因为 `cron` 会默认安排到新线程。

### 创建一次性计划对于运行一次的工作，传递 `at` 代替 `cron`。 `follow_up_later` 为代理提供了一种设置单个后续操作的方法，例如在部署完成后检查部署。

```ts tools/follow-up.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";
import { schedules } from "managed-deepagents";

export const followUpLater = tool(
  async ({ prompt, hours }) => {
    const item = await schedules.create({
      owner: { type: "user" },
      at: new Date(Date.now() + hours * 60 * 60_000),
      prompt,
    });
    return `Scheduled a one-time follow-up: ${item.id}.`;
  },
  {
    name: "follow_up_later",
    description: "Run a prompt once, a number of hours from now.",
    schema: z.object({
      prompt: z.string(),
      hours: z.number(),
    }),
  },
);
```

一次性计划默认为当前线程，因此它的运行会继续创建它的对话并在同一个 Slack 线程中进行回复。

### 创建选项

<ParamField type="object">
  `{ type: "user" }` 选择当前运行的经过身份验证的人员，并且计划以该人员身份运行。可选的 `id` 必须与该人匹配。 `{ type: "agent" }` 选择代理拥有的计划，这些计划作为代理的服务身份运行。
</ParamField>

<ParamField type="string">
  用于循环计划的五字段 cron 表达式。请准确给出 `cron` 和 `at` 之一。
</ParamField>

<ParamField type="Date | string">
  `Date`，或以 `Z` 或 UTC 偏移量结尾的 ISO 8601 时间戳。该计划运行一次。运行时将其四舍五入到下一整分钟。它必须是至少一分钟、最多 365 天的未来。
</ParamField>

<ParamField type="string">
  `cron` 的 IANA 时区，例如 `America/Los_Angeles`。不要用`at`通过。
</ParamField>

<ParamField type="string">
  每次运行都会收到作为用户消息的提示。请准确给出 `prompt` 和 `input` 之一。
</ParamField>

<ParamField type="object | object[]">
  每次运行的结构化LangGraph输入。
</ParamField><ParamField type="boolean">
  `true` 在新线程上开始每次运行。 `false` 继续当前线程。默认为 `true` 与 `cron` 以及 `false` 与 `at`。
</ParamField>

<ParamField type="boolean">
  创建计划而不运行它。
</ParamField>

<ParamField type="object">
  JSON 元数据供您自己使用。以`mda_`开头的键被保留。
</ParamField>

### 管理日程

`list`、`get`、`update` 和 `delete` 涵盖时间表生命周期的剩余时间。当代理应该管理它创建的计划时，将它们公开为工具。具有`list`和`delete`的客服人员可以回答“我有什么提醒？”并根据要求取消一项。使用 `update` 暂停日程安排，而不是在用户稍后想要恢复日程安排时将其删除。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const owner = { type: "user" } as const;

const page = await schedules.list({ owner, limit: 20 });
const item = await schedules.get(page.items[0].id, { owner });
await schedules.update(item.id, { paused: true }, { owner });
await schedules.delete(item.id, { owner });
```

`update` 接受 `cron`、`at`、`timezone`、`prompt`、`input`、`paused` 和 `metadata`。通道和线程选择在创建时是固定的。 `list` 隐藏过期的一次性时间表，除非您通过 `includeExpired: true`。对于代理所有者，`list` 和 `get` 还会返回 `schedules/` 中的计划，您可以在代码中更改这些计划。

## 日程安排疑难解答

* `must export a named schedule declaration`：从`schedules/`中的每个文件导出一个顶级`schedule`。

* `must define exactly one of prompt or input`：添加 `prompt` 或 `input`，但不能同时添加两者。

* `cron must be a standard 5-field expression`：使用五个 cron 字段，而不是基于秒的 cron 语法。* `schedule is not static`：用文字或顶级文字常量替换计算值。

* `failed to create cron for schedule`：打开LangSmith中的部署URL并确认部署的Agent Server是健康的。

* `Invalid thread ID: must be a UUID (HTTP 422)`：持久调度声明的线程ID不是UUID。将其替换为现有线程的 UUID。参见[Choose thread behavior](#choose-thread-behavior)。

* **本地开发期间不会运行时间表**：`mda dev` 不提供时间表。参见[Test schedules locally](#test-schedules-locally)。

## 后续步骤

<CardGroup>
  <Card title="Deploy an agent" icon="upload" href="/langsmith/javascript/managed-deep-agents-deploy">
    部署并协调计划更改。
  </Card>

  <Card title="CLI reference" icon="terminal" href="/langsmith/javascript/managed-deep-agents-cli">
    查找 `mda deploy` 标志和故障排除。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-schedules.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>