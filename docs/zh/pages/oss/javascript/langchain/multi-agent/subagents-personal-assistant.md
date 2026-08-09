<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a personal assistant with subagents | https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents-personal-assistant -->

## 概述

**主管模式**是一种 [multi-agent](/oss/javascript/langchain/multi-agent) 架构，其中中央主管代理协调专门的工作代理。当任务需要不同类型的专业知识时，这种方法非常有用。您无需构建一个跨域管理工具选择的代理，而是创建由了解整体工作流程的主管协调的专注专家。

在本教程中，您将构建一个个人助理系统，通过实际的工作流程展示这些好处。该系统将协调两名职责截然不同的专家：

* **日历代理**，处理日程安排、可用性检查和事件管理。
* 一个**电子邮件代理**，用于管理通信、起草消息和发送通知。

我们还将合并[human-in-the-loop review](/oss/javascript/langchain/human-in-the-loop)，以允许用户根据需要批准、编辑和拒绝操作（例如出站电子邮件）。

### 为什么要使用主管？多代理架构允许您在工作人员之间划分[tools](/oss/javascript/langchain/tools)，每个工作人员都有自己单独的提示或说明。考虑一个可以直接访问所有日历和电子邮件 API 的代理：它必须从许多类似的工具中进行选择，了解每个 API 的确切格式，并同时处理多个域。如果性能下降，将相关工具和关联提示分成逻辑组可能会有所帮助（部分是为了管理迭代改进）。

### 概念

我们将涵盖以下概念：

* [Multi-agent systems](/oss/javascript/langchain/multi-agent)
* [Human-in-the-loop review](/oss/javascript/langchain/human-in-the-loop)

## 设置

### 安装

本教程需要`langchain`包：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add langchain
  ```
</CodeGroup>

欲了解更多详情，请参阅我们的[Installation guide](/oss/javascript/langchain/install)。

### 朗史密斯

设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-subagents-personal-assistant) 来检查代理内部发生的情况。然后设置以下环境变量：

<CodeGroup>
  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_TRACING="true"
  export LANGSMITH_API_KEY="..."
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  process.env.LANGSMITH_TRACING = "true";
  process.env.LANGSMITH_API_KEY = "...";
  ```
</CodeGroup>

### 组件

我们需要从 LangChain 的集成套件中选择一个聊天模型：

<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/javascript/integrations/chat/openai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/openai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/openai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.OPENAI_API_KEY = "your-api-key";

      const model = await initChatModel("gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatOpenAI } from "@langchain/openai";

      const model = new ChatOpenAI({
        model: "gpt-5.5",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/javascript/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/anthropic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/anthropic
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/anthropic
      ``````bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/anthropic
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.ANTHROPIC_API_KEY = "your-api-key";

      const model = await initChatModel("claude-sonnet-4-6");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatAnthropic } from "@langchain/anthropic";

      const model = new ChatAnthropic({
        model: "claude-sonnet-4-6",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/javascript/integrations/chat/azure/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/azure
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/azure
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/azure
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/azure
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.AZURE_OPENAI_API_KEY = "your-api-key";
      process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
      process.env.OPENAI_API_VERSION = "your-api-version";

      const model = await initChatModel("azure_openai:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { AzureChatOpenAI } from "@langchain/openai";

      const model = new AzureChatOpenAI({
        model: "gpt-5.5",
        azureOpenAIApiKey: "your-api-key",
        azureOpenAIApiEndpoint: "your-endpoint",
        azureOpenAIApiVersion: "your-api-version"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/javascript/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/google-genai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/google-genai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/google-genai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.GOOGLE_API_KEY = "your-api-key";

      const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Bedrock Converse">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/javascript/integrations/chat/bedrock_converse/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/aws
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/aws
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/aws
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = await initChatModel("bedrock:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatBedrockConverse } from "@langchain/aws";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = new ChatBedrockConverse({
        model: "gpt-5.5",
        region: "us-east-2"
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 1. 定义工具

首先定义需要结构化输入的工具。在实际应用程序中，这些将调用实际的 API（Google Calendar、SendGrid 等）。在本教程中，您将使用存根来演示该模式。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";

const createCalendarEvent = tool(
  async ({ title, startTime, endTime, attendees, location }) => {
    // Stub: In practice, this would call Google Calendar API, Outlook API, etc.
    return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees`;
  },
  {
    name: "create_calendar_event",
    description: "Create a calendar event. Requires exact ISO datetime format.",
    schema: z.object({
      title: z.string(),
      startTime: z.string().describe("ISO format: '2024-01-15T14:00:00'"),
      endTime: z.string().describe("ISO format: '2024-01-15T15:00:00'"),
      attendees: z.array(z.string()).describe("email addresses"),
      location: z.string().optional(),
    }),
  }
);

const sendEmail = tool(
  async ({ to, subject, body, cc }) => {
    // Stub: In practice, this would call SendGrid, Gmail API, etc.
    return `Email sent to ${to.join(', ')} - Subject: ${subject}`;
  },
  {
    name: "send_email",
    description: "Send an email via email API. Requires properly formatted addresses.",
    schema: z.object({
      to: z.array(z.string()).describe("email addresses"),
      subject: z.string(),
      body: z.string(),
      cc: z.array(z.string()).optional(),
    }),
  }
);

const getAvailableTimeSlots = tool(
  async ({ attendees, date, durationMinutes }) => {
    // Stub: In practice, this would query calendar APIs
    return ["09:00", "14:00", "16:00"];
  },
  {
    name: "get_available_time_slots",
    description: "Check calendar availability for given attendees on a specific date.",
    schema: z.object({
      attendees: z.array(z.string()),
      date: z.string().describe("ISO format: '2024-01-15'"),
      durationMinutes: z.number(),
    }),
  }
);
```

## 2. 创建专门的子代理

接下来，我们将创建处理每个域的专门子代理。

### 创建日历代理

日历代理理解自然语言调度请求并将其转换为精确的 API 调用。它处理日期解析、可用性检查和事件创建。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

const CALENDAR_AGENT_PROMPT = `
Today's date is ${today}.
You are a calendar scheduling assistant.
Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
into proper ISO datetime formats.
Use get_available_time_slots to check availability when needed.
If there is no suitable time slot, stop and confirm unavailability in your response.
Use create_calendar_event to schedule events.
Always confirm what was scheduled in your final response.
`.trim();

const calendarAgent = createAgent({
  model: llm,
  tools: [createCalendarEvent, getAvailableTimeSlots],
  systemPrompt: CALENDAR_AGENT_PROMPT,
});
```测试日历代理以查看它如何处理自然语言调度：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const query = "Schedule a team meeting next Tuesday at 2pm for 1 hour";

const stream = await calendarAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
      console.log(`Tool result: ${await call.output}`);
    }
  })(),
]);
```

```
================================== Ai Message ==================================
Tool Calls:
  get_available_time_slots (call_EIeoeIi1hE2VmwZSfHStGmXp)
 Call ID: call_EIeoeIi1hE2VmwZSfHStGmXp
  Args:
    attendees: []
    date: 2024-06-18
    duration_minutes: 60
================================= Tool Message =================================
Name: get_available_time_slots

["09:00", "14:00", "16:00"]
================================== Ai Message ==================================
Tool Calls:
  create_calendar_event (call_zgx3iJA66Ut0W8S3NpT93kEB)
 Call ID: call_zgx3iJA66Ut0W8S3NpT93kEB
  Args:
    title: Team Meeting
    start_time: 2024-06-18T14:00:00
    end_time: 2024-06-18T15:00:00
    attendees: []
================================= Tool Message =================================
Name: create_calendar_event

Event created: Team Meeting from 2024-06-18T14:00:00 to 2024-06-18T15:00:00 with 0 attendees
================================== Ai Message ==================================

The team meeting has been scheduled for next Tuesday, June 18th, at 2:00 PM and will last for 1 hour. If you need to add attendees or a location, please let me know!
```

代理将“下周二下午 2 点”解析为 ISO 格式（“2024-01-16T14:00:00”），计算结束时间，调用`create_calendar_event`，并返回自然语言确认。

### 创建电子邮件代理

电子邮件代理处理消息撰写和发送。它侧重于提取收件人信息、制作适当的主题行和正文以及管理电子邮件通信。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const EMAIL_AGENT_PROMPT = `
You are an email assistant.
Compose professional emails based on natural language requests.
Extract recipient information and craft appropriate subject lines and body text.
Use send_email to send the message.
Always confirm what was sent in your final response.
`.trim();

const emailAgent = createAgent({
  model: llm,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
});
```

使用自然语言请求测试电子邮件代理：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const query = "Send the design team a reminder about reviewing the new mockups";

const stream = await emailAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
      console.log(`Tool result: ${await call.output}`);
    }
  })(),
]);
```

```
================================== Ai Message ==================================
Tool Calls:
  send_email (call_OMl51FziTVY6CRZvzYfjYOZr)
 Call ID: call_OMl51FziTVY6CRZvzYfjYOZr
  Args:
    to: ['design-team@example.com']
    subject: Reminder: Please Review the New Mockups
    body: Hi Design Team,

This is a friendly reminder to review the new mockups at your earliest convenience. Your feedback is important to ensure that we stay on track with our project timeline.

Please let me know if you have any questions or need additional information.

Thank you!

Best regards,
================================= Tool Message =================================
Name: send_email

Email sent to design-team@example.com - Subject: Reminder: Please Review the New Mockups
================================== Ai Message ==================================

I've sent a reminder to the design team asking them to review the new mockups. If you need any further communication on this topic, just let me know!
```

代理从非正式请求中推断收件人，制作专业的主题行和正文，致电`send_email`，并返回确认。每个子代理都有一个特定领域的工具和提示，使其能够在特定任务中表现出色。

## 3. 将子代理包装为工具

现在将每个子代理包装为主管可以调用的工具。这是创建分层系统的关键架构步骤。主管将看到“schedule\_event”等高级工具，而不是“create\_calendar\_event”等低级工具。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const scheduleEvent = tool(
  async ({ request }) => {
    const result = await calendarAgent.invoke({
      messages: [{ role: "user", content: request }]
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text;
  },
  {
    name: "schedule_event",
    description: `
Schedule calendar events using natural language.

Use this when the user wants to create, modify, or check calendar appointments.
Handles date/time parsing, availability checking, and event creation.

Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language scheduling request"),
    }),
  }
);

const manageEmail = tool(
  async ({ request }) => {
    const result = await emailAgent.invoke({
      messages: [{ role: "user", content: request }]
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text;
  },
  {
    name: "manage_email",
    description: `
Send emails using natural language.

Use this when the user wants to send notifications, reminders, or any email communication.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'send them a reminder about the meeting')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language email request"),
    }),
  }
);
```工具描述可以帮助主管决定何时使用每种工具，因此要使其清晰具体。我们仅返回子代理的最终响应，因为主管不需要查看中间推理或工具调用。

## 4.创建supervisor代理

现在创建协调子代理的主管。主管只能看到高级工具并在域级别（而不是单个 API 级别）做出路由决策。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const SUPERVISOR_PROMPT = `
You are a helpful personal assistant.
You can schedule calendar events and send emails.
Break down user requests into appropriate tool calls and coordinate the results.
When a request involves multiple actions, use multiple tools in sequence or in parallel as appropriate.
`.trim();

const supervisorAgent = createAgent({
  model: llm,
  tools: [scheduleEvent, manageEmail],
  systemPrompt: SUPERVISOR_PROMPT,
});
```

## 5. 使用主管

现在使用需要跨多个域协调的复杂请求来测试您的整个系统：

### 示例1：简单的单域请求

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const query = "Schedule a team standup for tomorrow at 9am";

const stream = await supervisorAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
      console.log(`Tool result: ${await call.output}`);
    }
  })(),
]);
```

```
================================== Ai Message ==================================
Tool Calls:
  schedule_event (call_mXFJJDU8bKZadNUZPaag8Lct)
 Call ID: call_mXFJJDU8bKZadNUZPaag8Lct
  Args:
    request: Schedule a team standup for tomorrow at 9am with Alice and Bob.
================================= Tool Message =================================
Name: schedule_event

The team standup has been scheduled for tomorrow at 9:00 AM with Alice and Bob. If you need to make any changes or add more details, just let me know!
================================== Ai Message ==================================

The team standup with Alice and Bob is scheduled for tomorrow at 9:00 AM. If you need any further arrangements or adjustments, please let me know!
```

主管将其识别为日历任务，调用`schedule_event`，日历代理处理日期解析和事件创建。

<Tip>
  要完全透明地了解信息流，包括每个聊天模型调用的提示和响应，请查看上述运行的[LangSmith trace](https://smith.langchain.com/public/91a9a95f-fba9-4e84-aff0-371861ad2f4a/r)。
</Tip>

### 示例2：复杂的多域请求

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const query =
  "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
  "and send them an email reminder about reviewing the new mockups.";

const stream = await supervisorAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
      console.log(`Tool result: ${await call.output}`);
    }
  })(),
]);
```

```
================================== Ai Message ==================================
Tool Calls:
  schedule_event (call_YA68mqF0koZItCFPx0kGQfZi)
 Call ID: call_YA68mqF0koZItCFPx0kGQfZi
  Args:
    request: meeting with the design team next Tuesday at 2pm for 1 hour
  manage_email (call_XxqcJBvVIuKuRK794ZIzlLxx)
 Call ID: call_XxqcJBvVIuKuRK794ZIzlLxx
  Args:
    request: send the design team an email reminder about reviewing the new mockups
================================= Tool Message =================================
Name: schedule_event

Your meeting with the design team is scheduled for next Tuesday, June 18th, from 2:00pm to 3:00pm. Let me know if you need to add more details or make any changes!
================================= Tool Message =================================
Name: manage_email

I've sent an email reminder to the design team requesting them to review the new mockups. If you need to include more information or recipients, just let me know!
================================== Ai Message ==================================

Your meeting with the design team is scheduled for next Tuesday, June 18th, from 2:00pm to 3:00pm.

I've also sent an email reminder to the design team, asking them to review the new mockups.

Let me know if you'd like to add more details to the meeting or include additional information in the email!
```主管认识到这需要日历和电子邮件操作，因此致电 `schedule_event` 召开会议，然后致电 `manage_email` 进行提醒。每个子代理完成其任务，主管将两个结果合成为连贯的响应。

<Note>
  默认情况下，主管按顺序将任务分派给子代理。每个工具调用都会在下一个工具调用开始之前完成。但是，许多 LLM 将在单个响应中发出多个工具调用（如上面的跟踪所示，其中 `schedule_event` 和 `manage_email` 一起调用），运行时并行执行。您还可以配置显式并行调度。详情请参阅[⟦T66⟧ reference docs](https://reference.langchain.com/python/langgraph-supervisor/supervisor/create_supervisor)。
</Note>

<Tip>
  参考[LangSmith trace](https://smith.langchain.com/public/95cd00a3-d1f9-4dba-9731-7bf733fb6a3c/r)查看上述运行的详细信息流程，包括单独的聊天模型提示和响应。
</Tip>

### 完整的工作示例

以下是可运行脚本中的所有内容：

<Expandable title="View complete code">
  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  /**
   * Personal Assistant Supervisor Example
   *
   * This example demonstrates the tool calling pattern for multi-agent systems.
   * A supervisor agent coordinates specialized sub-agents (calendar and email)
   * that are wrapped as tools.
   */

  import { tool, createAgent } from "langchain";
  import { ChatAnthropic } from "@langchain/anthropic";
  import { z } from "zod";

  // ============================================================================
  // Step 1: Define low-level API tools (stubbed)
  // ============================================================================

  const createCalendarEvent = tool(
    async ({ title, startTime, endTime, attendees, location }) => {
      // Stub: In practice, this would call Google Calendar API, Outlook API, etc.
      return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees`;
    },
    {
      name: "create_calendar_event",
      description: "Create a calendar event. Requires exact ISO datetime format.",
      schema: z.object({
        title: z.string(),
        startTime: z.string().describe("ISO format: '2024-01-15T14:00:00'"),
        endTime: z.string().describe("ISO format: '2024-01-15T15:00:00'"),
        attendees: z.array(z.string()).describe("email addresses"),
        location: z.string().optional().default(""),
      }),
    }
  );

  const sendEmail = tool(
    async ({ to, subject, body, cc }) => {
      // Stub: In practice, this would call SendGrid, Gmail API, etc.
      return `Email sent to ${to.join(", ")} - Subject: ${subject}`;
    },
    {
      name: "send_email",
      description:
        "Send an email via email API. Requires properly formatted addresses.",
      schema: z.object({
        to: z.array(z.string()).describe("email addresses"),
        subject: z.string(),
        body: z.string(),
        cc: z.array(z.string()).optional().default([]),
      }),
    }
  );

  const getAvailableTimeSlots = tool(
    async ({ attendees, date, durationMinutes }) => {
      // Stub: In practice, this would query calendar APIs
      return ["09:00", "14:00", "16:00"];
    },
    {
      name: "get_available_time_slots",
      description:
        "Check calendar availability for given attendees on a specific date.",
      schema: z.object({
        attendees: z.array(z.string()),
        date: z.string().describe("ISO format: '2024-01-15'"),
        durationMinutes: z.number(),
      }),
    }
  );

  // ============================================================================
  // Step 2: Create specialized sub-agents
  // ============================================================================

  const llm = new ChatAnthropic({
    model: "gpt-5.5",
  });

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const calendarAgent = createAgent({
    model: llm,
    tools: [createCalendarEvent, getAvailableTimeSlots],
    systemPrompt: `
  Today's date is ${today}.
  You are a calendar scheduling assistant.
  Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
  into proper ISO datetime formats.
  Use get_available_time_slots to check availability when needed.
  If there is no suitable time slot, stop and confirm unavailability in your response.
  Use create_calendar_event to schedule events.
  Always confirm what was scheduled in your final response.
    `.trim(),
  });

  const emailAgent = createAgent({
    model: llm,
    tools: [sendEmail],
    systemPrompt: `
  You are an email assistant.
  Compose professional emails based on natural language requests.
  Extract recipient information and craft appropriate subject lines and body text.
  Use send_email to send the message.
  Always confirm what was sent in your final response.
    `.trim(),
  });

  // ============================================================================
  // Step 3: Wrap sub-agents as tools for the supervisor
  // ============================================================================

  const scheduleEvent = tool(
    async ({ request }) => {
      const result = await calendarAgent.invoke({
        messages: [{ role: "user", content: request }],
      });
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.text;
    },
    {
      name: "schedule_event",
      description: `
  Schedule calendar events using natural language.

  Use this when the user wants to create, modify, or check calendar appointments.
  Handles date/time parsing, availability checking, and event creation.

  Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
      `.trim(),
      schema: z.object({
        request: z.string().describe("Natural language scheduling request"),
      }),
    }
  );

  const manageEmail = tool(
    async ({ request }) => {
      const result = await emailAgent.invoke({
        messages: [{ role: "user", content: request }],
      });
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.text;
    },
    {
      name: "manage_email",
      description: `
  Send emails using natural language.

  Use this when the user wants to send notifications, reminders, or any email communication.
  Handles recipient extraction, subject generation, and email composition.

  Input: Natural language email request (e.g., 'send them a reminder about the meeting')
      `.trim(),
      schema: z.object({
        request: z.string().describe("Natural language email request"),
      }),
    }
  );

  // ============================================================================
  // Step 4: Create the supervisor agent
  // ============================================================================

  const supervisorAgent = createAgent({
    model: llm,
    tools: [scheduleEvent, manageEmail],
    systemPrompt: `
  You are a helpful personal assistant.
  You can schedule calendar events and send emails.
  Break down user requests into appropriate tool calls and coordinate the results.
  When a request involves multiple actions, use multiple tools in sequence.
    `.trim(),
  });

  // ============================================================================
  // Step 5: Use the supervisor
  // ============================================================================

  // Example: User request requiring both calendar and email coordination
  const userRequest =
    "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
    "and send them an email reminder about reviewing the new mockups.";

  console.log("User Request:", userRequest);
  console.log(`\n${"=".repeat(80)}\n`);

  const stream = await supervisorAgent.streamEvents(
    { messages: [{ role: "user", content: userRequest }] },
    { version: "v3" }
  );

  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);
  ```
</Expandable>

### 理解架构您的系统有三层。底层包含需要精确格式的严格 API 工具。中间层包含接受自然语言、将其转换为结构化 API 调用并返回自然语言确认的子代理。顶层包含管理器，用于路由到高级功能并综合结果。

这种关注点分离提供了几个好处：每个层都有一个集中的职责，您可以添加新域而不影响现有域，并且可以独立测试和迭代每个层。

## 6. 添加人工参与审核

谨慎地纳入敏感操作的[human-in-the-loop review](/oss/javascript/langchain/human-in-the-loop)。 LangChain 包含[built-in middleware](/oss/javascript/langchain/human-in-the-loop#configuring-interrupts)来审查工具调用，在本例中是子代理调用的工具。

让我们为两个子代理添加人机交互审核：

* 我们将`create_calendar_event`和`send_email`工具配置为中断，允许所有[response types](/oss/javascript/langchain/human-in-the-loop)（`approve`、`edit`、`reject`）
* 我们添加一个[checkpointer](/oss/javascript/langchain/short-term-memory) **仅适用于顶级代理**。这是暂停和恢复执行所必需的。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

const calendarAgent = createAgent({
  model: llm,
  tools: [createCalendarEvent, getAvailableTimeSlots],
  systemPrompt: CALENDAR_AGENT_PROMPT,
  middleware: [ // [!code highlight]
    humanInTheLoopMiddleware({ // [!code highlight]
      interruptOn: { create_calendar_event: true }, // [!code highlight]
      descriptionPrefix: "Calendar event pending approval", // [!code highlight]
    }), // [!code highlight]
  ], // [!code highlight]
});

const emailAgent = createAgent({
  model: llm,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
  middleware: [ // [!code highlight]
    humanInTheLoopMiddleware({ // [!code highlight]
      interruptOn: { send_email: true }, // [!code highlight]
      descriptionPrefix: "Outbound email pending approval", // [!code highlight]
    }), // [!code highlight]
  ], // [!code highlight]
});

const supervisorAgent = createAgent({
  model: llm,
  tools: [scheduleEvent, manageEmail],
  systemPrompt: SUPERVISOR_PROMPT,
  checkpointer: new MemorySaver(), // [!code highlight]
});
```

让我们重复一下查询。请注意，我们将中断事件收集到一个列表中以访问下游：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const query =
  "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
  "and send them an email reminder about reviewing the new mockups.";

const config = { configurable: { thread_id: "6" } };

const interrupts: any[] = [];
const stream = await supervisorAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { ...config, version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
    }
  })(),
]);
if (stream.interrupted) {
  for (const interrupt of stream.interrupts) {
    interrupts.push(interrupt);
    console.log(`\nINTERRUPTED: ${interrupt.interruptId}`);
  }
}
```

```
================================== Ai Message ==================================
Tool Calls:
  schedule_event (call_t4Wyn32ohaShpEZKuzZbl83z)
 Call ID: call_t4Wyn32ohaShpEZKuzZbl83z
  Args:
    request: Schedule a meeting with the design team next Tuesday at 2pm for 1 hour.
  manage_email (call_JWj4vDJ5VMnvkySymhCBm4IR)
 Call ID: call_JWj4vDJ5VMnvkySymhCBm4IR
  Args:
    request: Send an email reminder to the design team about reviewing the new mockups before our meeting next Tuesday at 2pm.

INTERRUPTED: 4f994c9721682a292af303ec1a46abb7

INTERRUPTED: 2b56f299be313ad8bc689eff02973f16
```

这次我们中断了执行。让我们检查一下中断事件：```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for (const interrupt of interrupts) {
  for (const request of interrupt.payload.actionRequests) {
    console.log(`INTERRUPTED: ${interrupt.interruptId}`);
    console.log(`${request.description}\n`);
  }
}
```

```
INTERRUPTED: 4f994c9721682a292af303ec1a46abb7
Calendar event pending approval

Tool: create_calendar_event
Args: {'title': 'Meeting with the Design Team', 'start_time': '2024-06-18T14:00:00', 'end_time': '2024-06-18T15:00:00', 'attendees': ['design team']}

INTERRUPTED: 2b56f299be313ad8bc689eff02973f16
Outbound email pending approval

Tool: send_email
Args: {'to': ['designteam@example.com'], 'subject': 'Reminder: Review New Mockups Before Meeting Next Tuesday at 2pm', 'body': "Hello Team,\n\nThis is a reminder to review the new mockups ahead of our meeting scheduled for next Tuesday at 2pm. Your feedback and insights will be valuable for our discussion and next steps.\n\nPlease ensure you've gone through the designs and are ready to share your thoughts during the meeting.\n\nThank you!\n\nBest regards,\n[Your Name]"}
```

我们可以通过使用[⟦T72⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command)引用每个中断的ID来指定每个中断的决策。有关更多详细信息，请参阅[human-in-the-loop guide](/oss/javascript/langchain/human-in-the-loop)。出于演示目的，这里我们将接受日历事件，但编辑出站电子邮件的主题：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Command } from "@langchain/langgraph"; // [!code highlight]

const resume: Record<string, any> = {};
for (const interrupt of interrupts) {
  const actionRequest = interrupt.payload.actionRequests[0];
  if (actionRequest.name === "send_email") {
    // Edit email
    const editedAction = { ...actionRequest };
    editedAction.args.subject = "Mockups reminder";
    resume[interrupt.interruptId] = {
      decisions: [{ type: "edit", editedAction }]
    };
  } else {
    resume[interrupt.interruptId] = { decisions: [{ type: "approve" }] };
  }
}

const resumeStream = await supervisorAgent.streamEvents(
  new Command({ resume }), // [!code highlight]
  { ...config, version: "v3" }
);

await Promise.all([
  (async () => {
    for await (const message of resumeStream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of resumeStream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
    }
  })(),
]);
```

```
================================= Tool Message =================================
Name: schedule_event

Your meeting with the design team has been scheduled for next Tuesday, June 18th, from 2:00 pm to 3:00 pm.
================================= Tool Message =================================
Name: manage_email

Your email reminder to the design team has been sent. Here’s what was sent:

- Recipient: designteam@example.com
- Subject: Mockups reminder
- Body: A reminder to review the new mockups before the meeting next Tuesday at 2pm, with a request for feedback and readiness for discussion.

Let me know if you need any further assistance!
================================== Ai Message ==================================

- Your meeting with the design team has been scheduled for next Tuesday, June 18th, from 2:00 pm to 3:00 pm.
- An email reminder has been sent to the design team about reviewing the new mockups before the meeting.

Let me know if you need any further assistance!
```

运行根据我们的输入继续进行。

## 7. 高级：控制信息流

默认情况下，子代理仅接收来自主管的请求字符串。您可能想要传递其他上下文，例如对话历史记录或用户首选项。

### 将额外的对话上下文传递给子代理

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { getCurrentTaskInput } from "@langchain/langgraph";
import { type BuiltInState, HumanMessage } from "langchain";

const scheduleEvent = tool(
  async ({ request }, config) => {
    // Customize context received by sub-agent
    // Access full thread messages from the config
    const currentMessages = getCurrentTaskInput<BuiltInState>(config).messages;
    const originalUserMessage = currentMessages.find(HumanMessage.isInstance);
    const prompt = `
You are assisting with the following user inquiry:

${originalUserMessage?.content || "No context available"}

You are tasked with the following sub-request:

${request}
    `.trim();

    const result = await calendarAgent.invoke({
      messages: [{ role: "user", content: prompt }],
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text;
  },
  {
    name: "schedule_event",
    description: "Schedule calendar events using natural language.",
    schema: z.object({
      request: z.string().describe("Natural language scheduling request"),
    }),
  }
);
```

这允许子代理查看完整的对话上下文，这对于解决诸如“安排在明天同一时间”（引用之前的对话）之类的歧义非常有用。

<Tip>
  您可以在 LangSmith 跟踪的 [chat model call](https://smith.langchain.com/public/c7d54882-afb8-4039-9c5a-4112d0f458b0/r/6803571e-af78-4c68-904a-ecf55771084d) 中看到子代理收到的完整上下文。
</Tip>

### 控制主管收到的内容

您还可以自定义流回主管的信息：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const scheduleEvent = tool(
  async ({ request }) => {
    const result = await calendarAgent.invoke({
      messages: [{ role: "user", content: request }]
    });

    const lastMessage = result.messages[result.messages.length - 1];

    // Option 1: Return just the confirmation message
    return lastMessage.text;

    // Option 2: Return structured data
    // return JSON.stringify({
    //   status: "success",
    //   event_id: "evt_123",
    //   summary: lastMessage.text
    // });
  },
  {
    name: "schedule_event",
    description: "Schedule calendar events using natural language.",
    schema: z.object({
      request: z.string().describe("Natural language scheduling request"),
    }),
  }
);
```**重要提示：** 确保子代理提示强调其最终消息应包含所有相关信息。常见的故障模式是子代理执行工具调用但不将结果包含在其最终响应中。

<Tip>
  有关演示具有人机循环审核和高级信息流控制的完整监管模式的完整工作示例，请查看 LangChain.js 示例中的[⟦T73⟧](https://github.com/langchain-ai/langchainjs/blob/main/examples/src/createAgent/supervisor.ts)。
</Tip>

## 8. 要点

主管模式创建了抽象层，其中每一层都有明确的职责。设计主管系统时，从明确的域边界开始，并为每个子代理提供重点工具和提示。为主管编写清晰的工具描述，在集成之前独立测试每一层，并根据您的特定需求控制信息流。

<Tip>
  **何时使用主管模式**

  当您有多个不同的域（日历、电子邮件、CRM、数据库）、每个域有多个工具或复杂的逻辑、您需要集中式工作流控制并且子代理不需要直接与用户交谈时，请使用主管模式。对于仅使用少量工具的简单情况，请使用单个代理。当座席需要与用户对话时，请使用[handoffs](/oss/javascript/langchain/multi-agent/handoffs)。对于代理之间的点对点协作，请考虑其他多代理模式。
</Tip>

## 后续步骤

了解用于代理间对话的 [handoffs](/oss/javascript/langchain/multi-agent/handoffs)，探索 [context engineering](/oss/javascript/langchain/context-engineering) 来微调信息流，阅读 [multi-agent overview](/oss/javascript/langchain/multi-agent) 来比较不同的模式，并使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-subagents-personal-assistant) 来调试和监控您的多代理系统。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/subagents-personal-assistant.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>