<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt Slack users with agent-owned interrupts | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-agent-owned-interrupts -->

# 使用代理拥有的中断提示 Slack 用户

代理拥有的中断是您自己的代码创建的暂停。工具发布您在 [Block Kit](https://api.slack.com/block-kit) 中设计的 Slack 消息或模式，然后调用 `interrupt()`。当用户按下按钮或提交模式时，托管 Deep Agents 将答案作为 `user_prompt_response` 通道事件传递给部署，并恢复暂停的运行。您可以在运行中要求用户提供结构化输入，例如批准、选择或一组表单字段，而无需构建自己的 Slack 应用程序或 Webhook。

这与 `interrupt_on` 创建的平台拥有的中断不同。这些在工具调用之前暂停，Slack 或 Studio 会为您呈现批准卡。通过代理拥有的中断，您拥有块、表单状态以及答案到达后发生的情况。平台只返回答案。对于平台拥有的中断，请参阅[Human-in-the-loop](/langsmith/javascript/managed-deep-agents-tools#human-in-the-loop)。

<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

<Note>
代理拥有的中断需要已部署代理上的 `managed-deepagents>=0.8.0` 和 [Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack)。表单仅在 Slack 中呈现。 LangSmith Studio 显示原始中断值。
</Note>

## 它是如何工作的1. 运行从 Slack 消息开始。您的工具从 `runtime.channel` 读取对话，并使用部署的机器人令牌将 Block Kit 消息发布到同一 Slack 线程中。
2. 该工具使用带有关联 ID 的值调用`interrupt()`。线程停在检查点。
3. 用户按下按钮或提交模式。 Slack 将交互发送到 Managed Deep Agents，后者将其作为 `user_prompt_response` 事件转发到部署。
4. SDK 将事件与停放的中断进行匹配并恢复运行。 `interrupt()` 返回用户的响应，工具继续。

以这种方式暂停的工具在恢复运行时会再次从顶部运行，这是标准的 LangGraph 中断行为。守住岗位，这样这种情况只会发生一次。参见[Post a form and pause](#post-a-form-and-pause)。

## 发布表单并暂停

该工具需要三件事：要发布到的 Slack 对话、机器人令牌以及将表单与中断联系起来的相关 ID。- **对话**：`runtime.channel.rawEvent` 是启动运行的 Slack 事件。它携带`channel`、`ts`，对于线程消息，还携带`thread_ts`。发布到该线程中，以便答案路由回同一个代理线程。
- **机器人令牌**：`connections.get("mda/slack-bot-token", { type: "agent" })` 解析为部署配置的托管 Deep Agents 的 Slack 应用程序的令牌。该 slug 是保留的，无法使用 `mda connections create` 创建。
- **关联 ID**：将相同的字符串放在每个按钮的 `value`（作为 JSON）中的 `INTERRUPT_CORRELATION_KEY` 以及传递给 `interrupt()` 的值中。


内置 Slack 通道的 `runtime.channel.post` 仅发送文本，因此可以直接通过 Slack Web API 发布 Block Kit。



```ts tools/approval.ts expandable
import { randomUUID } from "node:crypto";

import { interrupt } from "@langchain/langgraph";
import { tool } from "langchain";
import {
  INTERRUPT_CORRELATION_KEY,
  connections,
  type ManagedDeepAgentRuntime,
  type PromptResponse,
} from "managed-deepagents";
import * as z from "zod";

type SlackEvent = { channel: string; ts: string; thread_ts?: string };

export const requestApproval = tool(
  async ({ amount }, runtime: ManagedDeepAgentRuntime) => {
    const channel = runtime.channel;
    if (!channel || channel.provider !== "slack") {
      return "Approval forms are available only in Slack.";
    }

    const correlationId = randomUUID();
    // The tool runs again when the interrupt resumes. Post only on the first pass.
    if (channel.event.type !== "user_prompt_response") {
      await postApprovalForm(channel.rawEvent as SlackEvent, amount, correlationId);
    }

    const response: PromptResponse = interrupt({
      [INTERRUPT_CORRELATION_KEY]: correlationId,
      amount,
    });
    return `The requester chose ${response.action} for ${amount}.`;
  },
  {
    name: "request_approval",
    description: "Ask the requester to approve or decline a spend.",
    schema: z.object({
      amount: z.string().describe('The spend to approve, such as "$1,200".'),
    }),
  }
);

async function postApprovalForm(
  event: SlackEvent,
  amount: string,
  correlationId: string
): Promise<void> {
  const botToken = await connections.get("mda/slack-bot-token", { type: "agent" });
  const value = JSON.stringify({ [INTERRUPT_CORRELATION_KEY]: correlationId });
  const button = (actionId: string, label: string) => ({
    type: "button",
    action_id: actionId,
    text: { type: "plain_text", text: label },
    value,
  });
  const result = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: event.channel,
      thread_ts: event.thread_ts ?? event.ts,
      text: `Approve a spend of ${amount}?`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `Approve a spend of *${amount}*?` },
        },
        {
          type: "actions",
          elements: [
            button("approve_spend", "Approve"),
            button("decline_spend", "Decline"),
          ],
        },
      ],
    }),
  });
  const body = (await result.json()) as { ok: boolean; error?: string };
  if (!body.ok) {
    throw new Error(`Slack rejected the form: ${body.error}`);
  }
}
```


就像注册任何其他[custom tool](/langsmith/javascript/managed-deep-agents-tools)一样，在代理定义中注册该工具。中断继承了托管检查指针，因此不需要额外的持久性设置。

任何 `action_id` 都适用于消息中的按钮，以 `mda_modal::` 开头的按钮除外。该前缀会打开一个模式。参见[Open a modal](#open-a-modal)。

## 阅读回复

`interrupt()` 返回标准化响应。它仅包含每个提供商共享的字段：|领域|类型 |意义|
| ---| ---| ---|
| `provider` | `"slack"` |渠道商给出了答案。 |
| `action` | `string` |按钮的 `action_id`，或模式的 `callback_id`。 |
| `value` | JSON，可选 |按钮的 `value` 字符串，或模态框的 `state.values` 对象。对平台不透明。 |
| `correlation_id` | `string`，可选 |当按钮的 `value` 是带有 `mda_correlation_id` 键的 JSON 时出现。模态提交从不携带模态提交。 |



与 `runtime.channel.event` 相同的响应在运行上下文中可用，其中 `type` 设置为 `user_prompt_response`。 Slack 的逐字交互有效负载位于 `runtime.channel.rawEvent`。对于在消息内包含输入的表单，用户的条目位于 `rawEvent.state.values`，由块 ID 和操作 ID 键入。


托管 Deep Agents 仅读取 Slack 交互有效负载中的第一个操作，因此按一次必须意味着一个事件。

## 响应如何找到中断

Slack 不知道按钮属于哪个中断，因此 SDK 读取停放在线程上的中断并决定：|停放中断| `correlation_id` 关于回应 |结果 |
| ---| ---| ---|
|一|缺席 |恢复中断。 |
|一个或多个 |呈现并完全匹配 |恢复匹配的中断。 |
|几个|缺席 |没有任何运行。 SDK 记录歧义并确认该事件。 |
|一个或多个 |存在但不匹配任何一个，或匹配多个 |没有任何运行。开始转弯会放弃停放的检查站。 |
|无 |任何 |开始新的运行，没有新消息。仅可在 `runtime.channel.event` 上获取响应。 |

每当代理可能在线程上驻留多个中断时，就携带相关 ID。如果没有一个，则线程只能在恰好有一个中断待处理时得到应答。

## 打开模态框

模式为您提供比消息更多的空间，并支持全套 Block Kit 输入元素。 Slack 将模态称为视图。您创作视图，然后 Managed Deep Agents 打开它。Slack 会在每次点击时发出一次性使用的`trigger_id`，大约三秒后到期，并且它是打开模态的唯一授权。将单击转发到部署并等待运行将错过该窗口，因此托管 Deep Agents 从单击中已有的内容打开视图本身。代理不会被告知有关点击的信息。

要打开模态框，请发布一个按钮，其 `action_id` 以 `mda_modal::` 开头，其 `value` 是 JSON 格式的完整视图：

```json
{
  "type": "button",
  "action_id": "mda_modal::approve_spend",
  "text": { "type": "plain_text", "text": "Review" },
  "value": "{\"type\":\"modal\",\"title\":{\"type\":\"plain_text\",\"text\":\"Approve spend\"},\"submit\":{\"type\":\"plain_text\",\"text\":\"Submit\"},\"blocks\":[...]}"
}
```

当用户按下提交时，部署会收到一个 `user_prompt_response`，其中 `action` 设置为视图的 `callback_id`，它等于按钮的 `action_id`，并且 `value` 设置为视图的 `state.values`。然后模式关闭。

视图上的两个字段属于平台：

- **`callback_id`**：设置为按钮的`action_id`，以便可以识别提交内容。
- **`private_metadata`**：保存打开模态的加密通道和线程。模态提交不携带通道或线程，因此这是返回对话的唯一途径。如果您的视图已设置 `private_metadata`，则模式不会打开。

所有其他字段都按照您所写的那样转到 Slack。 Managed Deep Agents 不会验证视图，因此 Slack 拒绝的视图不会向用户显示任何内容。模态提交永远不会带有 `correlation_id`。仅当恰好有一个中断被停放时，模式才能应答线程。

整个视图必须适合按钮的 `value`，Slack 的字符上限为 2000 个。当工具发布消息时，Slack 会拒绝过大的按钮，因此故障会在工具调用中出现，而不是在单击时出现。

## 不停顿地发帖

工具可以发布表单并让运行结束，而不是调用 `interrupt()`。然后提交开始重新运行，没有新消息，并且您的代码从 `runtime.channel.event` 读取答案。平台上没有任何内容跟踪未完成的提示，因此您的应用程序拥有待处理表单的状态、到期时间以及表单打开时稍后的聊天消息的含义。

当用户下一步要做的事情预计是回答提示时，首选 `interrupt()`。

## 限制和保留名称

平台储备名称：|名称 |哪里 |意义|
| ---| ---| ---|
| `mda_modal::` 前缀 |按钮`action_id` |单击会打开一个模式，但永远不会到达代理。 |
| `mda_correlation_id` |按钮内的钥匙 `value` |将一次点击与一个停放的中断相匹配。导出为 `INTERRUPT_CORRELATION_KEY`。 |
| `callback_id` |应用程序定义的视图 |设置为按钮的 `action_id`。 |
| `private_metadata` |应用程序定义的视图 |由平台设置。提供它会阻止模态打开。 |
| `mda/slack-bot-token` |连接头|部署的 Slack 机器人令牌。无法使用 CLI 创建或覆盖。 |

Managed Deep Agents 在转发视图之前不检查的 Slack 限制：

|限制|价值|
| ---| ---|
|按钮 `value` | 2000 个字符 |
|模态标题 | 24 个字符 |
|每个视图的块数 | 100 | 100
| `callback_id` | 255 个字符 |

超过最后三个会使模式无法打开，并且不会向用户显示任何内容。

## 了解故障模式- **模式未打开。** 视图 JSON 格式错误、超出 Slack 限制或 `trigger_id` 已过期。按下按钮在 Slack 中不会执行任何可见操作。失败会记录在平台上。
- **用户关闭模态。**中断保持停放状态。没有取消路径，也没有过期时间。
- **用户在线程中回复而不是使用表单。**消息采用普通消息路径，不咨询中断状态。运行以新消息开始，停放的检查点被放弃，而卡保留其活动按钮。
- **两个人按下同一个按钮。** 两个交互都会被转发。第一个恢复中断，第二个开始新一轮。没有什么可以消除它们的重复。
- **多个中断被停放，并且响应没有相关 ID。** 没有任何运行。由于模态提交从不携带相关 ID，因此模态无法应答具有两个停放中断的线程。
- **提交不能返回 `response_action`。** 没有每字段验证错误，没有链式模态，也没有就地模态更新。

## 另请参阅- [Human-in-the-loop](/langsmith/javascript/managed-deep-agents-tools#human-in-the-loop)：在使用平台渲染的批准卡调用选定工具之前暂停。
- [Connect a Managed Deep Agent to Slack](/langsmith/javascript/managed-deep-agents-channels-slack)：添加传递表单响应的 Slack 通道。
- [Manage connections](/langsmith/javascript/managed-deep-agents-connections)：`connections.get(...)` 如何解析代理拥有的凭据。
- [Add custom tools](/langsmith/javascript/managed-deep-agents-tools)：注册发布表单的工具。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-agent-owned-interrupts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>