<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-Loop | https://docs.langchain.com/oss/javascript/langchain/frontend/human-in-the-loop -->

# 人机交互

添加具有基于中断的人工审核的审批工作流程

并非每个代理操作都应该在无人监督的情况下运行。当代理要发送时
电子邮件、删除记录、执行金融交易或执行任何操作
不可逆转的操作，需要有人先审核并批准该操作。
人在环 (HITL) 模式可让您的代理暂停执行、呈现
用户的待处理操作，只有在明确批准后才能恢复。

因为 HITL 是建立在 LangGraph 中断和检查点之上的，所以暂停是
耐用。用户可以刷新页面，审阅者可以从不同的位置回答
组件，代理仍然从执行的确切位置恢复
停止而不是重播整个运行。

<PatternEmbed />

## 中断如何工作

LangGraph 代理支持**中断**、代理在其中的显式暂停点
将控制权交还给客户端。当代理遇到中断时：1. 代理停止执行并发出中断负载
2. [⟦T15⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)钩子通过`stream.interrupt`表面中断
3. 您的 UI 呈现带有批准/拒绝/编辑选项的审核卡
4. 用户做出决定
5. 您的代码使用恢复命令调用 `stream.submit()`
6. 代理从上次中断的地方继续

前端 SDK 将中断与线程状态的其余部分保持在一起，因此
你的 UI 可以在任何有意义的地方呈现它：内联在文字记录中，在
在管理仪表板中或在阻止下一个用户的模式中查看队列
行动直至做出决定。

## 设置`useStream`

将 [⟦T19⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接到您的人机交互代理。当图表达到
中断，钩子公开`stream.interrupt`上的待处理负载。渲染一个
设置该值后批准卡，然后恢复运行
`stream.submit(null, { command: { resume: response } })` 用户之后
批准、拒绝或编辑操作。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";

  const AGENT_URL = "http://localhost:2024";

  export function Chat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "human_in_the_loop",
    });

    const interrupt = stream.interrupt;

    return (
      <div>
        {stream.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {interrupt && (
          <ApprovalCard
            interrupt={interrupt}
            onRespond={(response) =>
              stream.submit(null, { command: { resume: response } })
            }
          />
        )}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "human_in_the_loop",
  });

  function handleRespond(response: HITLResponse) {
    stream.submit(null, { command: { resume: response } });
  }
  </script>

  <template>
    <div>
      <Message
        v-for="msg in stream.messages.value"
        :key="msg.id"
        :message="msg"
      />
      <ApprovalCard
        v-if="stream.interrupt.value"
        :interrupt="stream.interrupt.value"
        @respond="handleRespond"
      />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    const AGENT_URL = "http://localhost:2024";

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "human_in_the_loop",
    });

    function handleRespond(response: HITLResponse) {
      stream.submit(null, { command: { resume: response } });
    }
  </script>

  <div>
    {#each stream.messages as msg (msg.id)}
      <Message message={msg} />
    {/each}

    {#if stream.interrupt}
      <ApprovalCard interrupt={stream.interrupt} onRespond={handleRespond} />
    {/if}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { injectStream } from "@langchain/angular";
  import type { HITLResponse } from "langchain";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-chat",
    template: `
      @for (msg of stream.messages(); track msg.id) {
        <app-message [message]="msg" />
      }
      @if (stream.interrupt()) {
        <app-approval-card
          [interrupt]="stream.interrupt()"
          (respond)="handleRespond($event)"
        />
      }
    `,
  })
  export class ChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "human_in_the_loop",
    });

    handleRespond(response: HITLResponse) {
      this.stream.submit(null, { command: { resume: response } });
    }
  }
  ```
</CodeGroup>

## 中断负载

当代理暂停时，`stream.interrupt`包含一个[HITLRequest](https://reference.langchain.com/javascript/langchain/index/HITLRequest)，其中
以下结构：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interface HITLRequest {
  actionRequests: ActionRequest[];
  reviewConfigs: ReviewConfig[];
}

interface ActionRequest {
  name: string;
  args: Record<string, unknown>;
  description?: string;
}

interface ReviewConfig {
  allowedDecisions: ("approve" | "reject" | "edit" | "respond")[];
}
```|物业 |描述 |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `actionRequests` |代理想要执行的一系列待处理操作 |
| `actionRequests[].name` |操作名称（例如 `"send_email"`、`"delete_record"`）|
| `actionRequests[].args` |行动的结构化参数 |
| `actionRequests[].description` |该操作的作用的可选人类可读描述 |
| `reviewConfigs` |每个操作配置控制允许哪些决策 |
| `reviewConfigs[].allowedDecisions` |显示哪些按钮：`"approve"`、`"reject"`、`"edit"`、`"respond"` |

## 决策类型

HITL 模式支持四种决策类型：

### 批准

用户确认操作应按原样进行：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response: HITLResponse = {
  decisions: [{ type: "approve" }],
};

stream.submit(null, { command: { resume: response } });
```

### 拒绝

用户以可选原因拒绝该操作。该工具未执行：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response: HITLResponse = {
  decisions: [
    {
      type: "reject",
      message: "The email tone is too aggressive. Do not send it.",
    },
  ],
};

stream.submit(null, { command: { resume: response } });
```<Note>
  当操作被拒绝时，代理会收到拒绝原因并可以
  决定如何进行。如果省略 `message`，则后端使用默认值
  消息告诉模型该工具尚未执行并且不要重试
  除非用户要求，否则调用相同的工具。对于副作用工具，传递一个明确的
  告诉客服人员是否放弃操作、询问后续操作的消息
  问题，或者尝试更安全的替代方案。
</Note>

### 编辑

用户在批准之前修改操作的参数：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response: HITLResponse = {
  decisions: [
    {
      type: "edit",
      editedAction: {
        name: actionRequest.name,
        args: {
          ...actionRequest.args,
          subject: "Updated subject line",
          body: "Revised email body with softer language.",
        },
      },
    },
  ],
};

stream.submit(null, { command: { resume: response } });
```

### 回应

用户为“询问用户”风格的工具提供直接回复。 `message` 成为工具结果，工具本身不被执行：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response: HITLResponse = {
  decisions: [{ type: "respond", message: "Blue." }],
};

stream.submit(null, { command: { resume: response } });
```

<Note>
  当该工具有意充当人工输入的占位符时，请使用`respond`，例如提示代理从用户收集信息的`ask_user`工具。不要使用 `respond` 拒绝建议的操作，因为它会作为成功的工具结果返回到模型。
</Note>

## 构建批准卡

这是批准卡使用的决策接线。 UI 可以拆分每个
操作放入其自己的卡中，但恢复有效负载是单个`HITLResponse`
每个待处理的操作有一个决定：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async function approveAll() {
  const resume: HITLResponse = {
    decisions: actionRequests.map(() => ({ type: "approve" })),
  };
  await stream.submit(null, { command: { resume } });
}

async function rejectOne(index: number, message: string) {
  const resume: HITLResponse = {
    decisions: actionRequests.map((_, i) =>
      i === index
        ? { type: "reject", message }
        : { type: "reject", message: "Rejected along with other actions" },
    ),
  };
  await stream.submit(null, { command: { resume } });
}

async function editOne(index: number, editedArgs: Record<string, unknown>) {
  const originalAction = actionRequests[index];
  const resume: HITLResponse = {
    decisions: actionRequests.map((_, i) =>
      i === index
        ? {
            type: "edit",
            editedAction: { name: originalAction.name, args: editedArgs },
          }
        : { type: "approve" },
    ),
  };
  await stream.submit(null, { command: { resume } });
}
```

## 恢复流程用户做出决定后，完整的周期如下所示：

1.拨打`stream.submit(null, { command: { resume: hitlResponse } })`
2. [⟦T43⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)钩子向LangGraph后端发送resume命令
3. Agent收到`HITLResponse`并继续执行。每个条目在
   `decisions` 可能是以下之一：
   * `{ type: "approve" }`：代理继续执行动作
   * `{ type: "reject", message }`：工具不执行，代理收到拒绝消息后再决定下一步
   * `{ type: "edit", editedAction }`：代理使用编辑后的参数运行工具
   * `{ type: "respond", message }`：人的消息直接作为工具结果返回，而不执行工具
4. 当代理恢复流式传输时，`interrupt` 属性重置为 `null`

<Tip>
  您可以在单个代理运行中链接多个 HITL 检查点。例如，一个
  代理可能会请求批准搜索，然后在发送电子邮件之前再次询问
  与结果。每个中断都是独立处理的。
</Tip>

## 处理多个待处理的操作

当代理想要时，一个中断可以包含多个`actionRequests`
一次执行多个操作。为每个人渲染一张卡片并收集所有卡片
恢复前的决定：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function MultiActionReview({
  interrupt,
  onRespond,
}: {
  interrupt: { value: HITLRequest };
  onRespond: (response: HITLResponse) => void;
}) {
  const [decisions, setDecisions] = useState<Record<number, HITLResponse["decisions"][number]>>({});
  const request = interrupt.value;

  const allDecided =
    Object.keys(decisions).length === request.actionRequests.length;

  return (
    <div className="space-y-4">
      {request.actionRequests.map((action, i) => (
        <SingleActionCard
          key={i}
          action={action}
          config={request.reviewConfigs[i]}
          onDecide={(response) =>
            setDecisions((prev) => ({ ...prev, [i]: response }))
          }
        />
      ))}
      {allDecided && (
        <button
          className="rounded bg-green-600 px-4 py-2 text-white"
          onClick={() =>
            onRespond({
              decisions: request.actionRequests.map((_, i) => decisions[i]),
            })
          }
        >
          Submit All Decisions
        </button>
      )}
    </div>
  );
}
```

## 自定义中断形式[resume flow](#the-resume-flow) 使用`humanInTheLoopMiddleware`，它用一个
通用批准/拒绝/编辑/响应卡。有时单组
按钮是不够的：预订航班、批准退款和查看订单
每个社交帖子都需要一个*不同的*表单，有自己的字段、验证和
复制。为此，从工具内部升起 `interrupt()` 并让
有效负载描述了 UI 应呈现的确切形式。每个工具都可以表面
完全不同的界面。

<PatternEmbed />

### 描述中断负载中的形式

`interrupt()` 接受任何 JSON 可序列化值，这允许您提供“卡片”
前端知道如何呈现，例如表单类型、标题、上下文
人类正在审查，而领域正在收集。 `interrupt()` 是通用的
输入和返回类型 (`interrupt<I, R>(value: I): R`)，因此您可以同时输入
您发送的卡片 (`InterruptCard`) 以及用户解析的值
（`ReviewDecision`）。导出这些类型，以便前端可以导入它们并保留
同步：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, tool } from "langchain";
import { interrupt } from "@langchain/langgraph";
import { z } from "zod";

export interface FormField {
  name: string;
  label: string;
  type: "select" | "checkbox" | "textarea" | "currency";
  options?: string[];
  default?: unknown;
}

/** What the user resolves the interrupt with. */
export interface ReviewDecision {
  approved: boolean;
  /** Edited / collected form values the tool should act on. */
  values?: Record<string, unknown>;
}

/** The form spec ("card") an interrupt hands to the frontend. */
export interface InterruptCard {
  formType: "flight-booking" | "refund-approval" | "content-review";
  tool: string;
  title: string;
  context: Record<string, unknown>;
  fields: FormField[];
  /** Populated by the frontend when it commits the resolved card to state. */
  resolved?: boolean;
  decision?: ReviewDecision;
}

const bookFlight = tool(
  async ({ origin, destination, date, passengers }) => {
    // Pause the tool and hand the frontend a typed form spec; the typed return
    // is whatever the UI resolves the interrupt with.
    const decision = interrupt<InterruptCard, ReviewDecision>({
      formType: "flight-booking",
      tool: "book_flight",
      title: "Confirm flight booking",
      context: { origin, destination, date, passengers },
      fields: [
        {
          name: "seatClass",
          label: "Seat class",
          type: "select",
          options: ["Economy", "Premium Economy", "Business"],
          default: "Economy",
        },
        { name: "insurance", label: "Add trip insurance", type: "checkbox", default: false },
      ],
    });

    if (!decision.approved) {
      return `Booking cancelled. No flight from ${origin} to ${destination} was reserved.`;
    }

    // Run the real (possibly slow) work with the values the human confirmed.
    const seatClass = String(decision.values?.seatClass ?? "Economy");
    return `Flight booked from ${origin} to ${destination} in ${seatClass}.`;
  },
  {
    name: "book_flight",
    description: "Book a flight. Requires human confirmation of trip details.",
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
      date: z.string(),
      passengers: z.number().int().min(1),
    }),
  },
);
```

为每个工具指定一个不同的 `formType`（例如 `"refund-approval"`，
`"content-review"`)，这样前端就可以打开它并渲染匹配的内容
形式。

### 每个工具渲染不同的表单在客户端上，卡到达时为 `stream.interrupt.value`。导入
`InterruptCard` 和 `ReviewDecision` 来自代理模块的类型，因此形式
并且有效负载保持同步，打开 `formType` 选择正确的形式，并且
将 `fields` 输入到您的输入中：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";
import type { InterruptCard, ReviewDecision } from "./agent";

function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "hitl_interrupt_forms",
  });

  const card = stream.interrupt?.value as InterruptCard | undefined;

  return (
    <div>
      {stream.messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {card && <InterruptForm card={card} onResolve={handleResolve} />}
    </div>
  );
}

// `InterruptForm` renders a flight / refund / content card based on
// `card.formType`, collects `card.fields`, and calls `onResolve` with the
// user's decision and edited values.
```

### 使用 `respond(decision, { update })` 将卡片保持在屏幕上

当你解决一个简单的中断时，卡片会立即消失
中断清除，仅返回工具结果。这意味着一张丰富的评论卡
会在运行中消失。要将其保留在屏幕上，请解决中断**并**提交
携带卡在*相同*超级步骤中声明的消息，使用
[⟦T69⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)的`respond`：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage } from "langchain";

function handleResolve(decision: ReviewDecision) {
  // Snapshot the card with the decision baked in so it renders read-only.
  const resolvedCard = { ...card, resolved: true, decision };
  const cardMessage = new AIMessage({
    content: `Review ${decision.approved ? "approved" : "declined"}.`,
    response_metadata: { cards: resolvedCard },
  });

  // Resume the interrupt AND push the card into state atomically. Maps to
  // LangGraph's `Command(resume, update)`: one checkpoint, no extra state write.
  stream.respond(decision, { update: { messages: [cardMessage] } });
}
```

`respond(response, { update })` **乐观地**应用`update`：
一旦恢复运行与以下内容相呼应，卡片会立即绘制并通过 ID 进行协调
回复同样的消息。后端永远不会重新发出该卡，因此它会保持渲染状态
当（可能很慢）工具运行时不会出现闪烁。渲染已解决的
通过读回卡上的消息：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{stream.messages.map((msg) => {
  const card = (msg.response_metadata as { cards?: InterruptCard })?.cards;
  if (card) return <InterruptForm key={msg.id} card={card} readOnly />;
  return <Message key={msg.id} message={msg} />;
})}
```

<Tip>
  因为已解析的卡片存在于消息历史记录中，所以它在刷新后仍然存在
  并且对于读取线程和人类决策的每个组件都是可见的
  成为持久记录的一部分，而不仅仅是短暂的 UI 状态。
</Tip>

## 最佳实践实施 HITL 工作流程时请记住这些准则：

* **显示清晰的上下文**。始终显示客服人员想要做什么以及
  *为什么*。包括操作描述和完整参数。
* **使批准成为最简单的路径**。如果该操作看起来正确，则批准
  应该是单击一下。保留多步骤流程以供拒绝/编辑。
* **验证编辑的参数**。当用户编辑操作参数时，验证
  发送前的 JSON 结构。显示格式错误的输入的内联错误。
* **保持中断状态**。如果用户刷新页面，
  中断应该仍然可见。 [⟦T73⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 通过线程的处理这个
  检查站。
* **记录所有决定**。对于审核跟踪，记录每个批准/拒绝/编辑
  带有时间戳的决策以及做出决策的用户。
* **深思熟虑地设置超时**。长时间运行的代理不应阻塞
  无限期地接受人工审查。考虑显示代理已经工作了多长时间
  等待。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>