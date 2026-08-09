<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a voice agent with LangChain | https://docs.langchain.com/oss/javascript/langchain/voice-agent -->

## 概述

聊天界面主导了我们与人工智能的交互方式，但多模式人工智能的最新突破正在开辟令人兴奋的新可能性。现在，高质量的生成模型和富有表现力的文本转语音 (TTS) 系统使得构建感觉不像工具而更像对话伙伴的代理成为可能。

语音代理就是这样的一个例子。您可以使用口语与其进行交互，而不是依靠键盘和鼠标向代理输入输入。这可能是一种更自然、更有吸引力的与人工智能交互的方式，并且对于某些情况特别有用。

### 什么是语音代理？

语音代理是[agents](/oss/javascript/langchain/agents)，可以与用户进行自然的语音对话。这些代理结合了语音识别、自然语言处理、生成式人工智能和文本转语音技术，以创建无缝、自然的对话。

它们适用于各种用例，包括：

* 客户支持
* 私人助理
* 免提接口
* 辅导和培训

### 语音代理如何工作？

从高层次来看，每个语音代理都需要处理三项任务：1. **听** - 捕获音频并转录它
2. **思考** - 解释意图、原因、计划
3. **说话** - 生成音频并将其流回给用户

不同之处在于这些步骤的顺序和耦合方式。在实践中，生产代理遵循两种主要架构之一：

#### 1. STT > Agent > TTS 架构（“三明治”）

Sandwich 架构由三个不同的组件组成：语音转文本 (STT)、基于文本的 LangChain 代理和文本转语音 (TTS)。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    A[User Audio] --> B[Speech-to-Text]
    B --> C[LangChain Agent]
    C --> D[Text-to-Speech]
    D --> E[Audio Output]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,E trigger
    class B,C,D process
```

**优点：**

* 完全控制每个组件（根据需要交换 STT/TTS 提供商）
* 访问现代文本模态模型的最新功能
* 透明的行为，组件之间有清晰的界限

**缺点：**

* 需要编排多个服务
* 管理管道的额外复杂性
* 从语音到文本的转换会丢失信息（例如语气、情绪）

#### 2. 语音到语音架构（S2S）

语音转语音使用多模态模型来处理音频输入并本机生成音频输出。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    A[User Audio] --> B[Multimodal Model]
    B --> C[Audio Output]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,C trigger
    class B process
```

**优点：*** 架构更简单，移动部件更少
* 简单交互的延迟通常较低
* 直接音频处理捕捉语音的语气和其他细微差别

**缺点：**

* 型号选择有限，提供商锁定的风险更大
* 特征可能落后于文本模态模型
* 音频处理方式透明度较低
* 降低可控性和定制选项

本指南演示了**三明治架构**来平衡性能、可控性和对现代模型功能的访问。该三明治可以通过一些 STT 和 TTS 提供商实现低于 700 毫秒的延迟，同时保持对模块化组件的控制。

### 演示应用程序概述

我们将逐步使用三明治架构构建基于语音的代理。该代理将管理一家三明治店的订单。该应用程序将演示三明治架构的所有三个组件，使用[AssemblyAI](https://www.assemblyai.com/)进行STT，使用[Cartesia](https://cartesia.ai/)进行TTS（尽管可以为大多数提供商构建适配器）。

[voice-sandwich-demo](https://github.com/langchain-ai/voice-sandwich-demo) 存储库中提供了端到端参考应用程序。我们将在这里详细介绍该应用程序。该演示使用 WebSockets 在浏览器和服务器之间进行实时双向通信。相同的架构可以适用于其他传输，例如电话系统（Twilio、Vonage）或 WebRTC 连接。

### 架构

该演示实现了一个流管道，其中每个阶段异步处理数据：

**客户端（浏览器）**

* 捕获麦克风音频并将其编码为 PCM
* 与后端服务器建立WebSocket连接
* 将音频块实时传输到服务器
* 接收并播放合成语音音频

**服务器（Node.js）**

* 接受来自客户端的WebSocket连接

* 协调三步管道：
  * [Speech-to-text (STT)](#1-speech-to-text)：将音频转发到 STT 提供者（例如 AssemblyAI），接收转录事件
  * [Agent](#2-langchain-agent)：使用LangChain代理处理成绩单，流响应令牌
  * [Text-to-speech (TTS)](#3-text-to-speech)：将代理响应发送到 TTS 提供者（例如 Cartesia），接收音频块

* 返回合成音频给客户端播放

该管道使用异步迭代器在每个阶段启用流式传输。这允许下游组件在上游阶段完成之前开始处理，从而最大限度地减少端到端延迟。

＃＃ 设置有关详细的安装说明和设置，请参阅[repository README](https://github.com/langchain-ai/voice-sandwich-demo#readme)。

## 1. 语音转文字

STT 阶段将传入的音频流转换为文本转录。该实现使用生产者-消费者模式来同时处理音频流和文字记录接收。

### 关键概念

**生产者-消费者模式**：音频块在接收转录事件的同时发送到 STT 服务。这允许在所有音频到达之前开始转录。

**事件类型**：

* `stt_chunk`：STT 服务处理音频时提供的部分文字记录
* `stt_output`：触发代理处理的最终格式化文本

**WebSocket 连接**：保持与 AssemblyAI 的实时 STT API 的持久连接，配置为具有自动转向格式化功能的 16kHz PCM 音频。

### 实施

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AssemblyAISTT } from "./assemblyai";
import type { VoiceAgentEvent } from "./types";

async function* sttStream(
  audioStream: AsyncIterable<Uint8Array>
): AsyncGenerator<VoiceAgentEvent> {
  const stt = new AssemblyAISTT({ sampleRate: 16000 });
  const passthrough = writableIterator<VoiceAgentEvent>();

  // Producer: pump audio chunks to AssemblyAI
  const producer = (async () => {
    try {
      for await (const audioChunk of audioStream) {
        await stt.sendAudio(audioChunk);
      }
    } finally {
      await stt.close();
    }
  })();

  // Consumer: receive transcription events
  const consumer = (async () => {
    for await (const event of stt.receiveEvents()) {
      passthrough.push(event);
    }
  })();

  try {
    // Yield events as they arrive
    yield* passthrough;
  } finally {
    // Wait for producer and consumer to complete
    await Promise.all([producer, consumer]);
  }
}
```

该应用程序实现了 AssemblyAI 客户端来管理 WebSocket 连接和消息解析。请参阅下面的实现；可以为其他 STT 提供商构建类似的适配器。

<Accordion title="AssemblyAI Client">
  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export class AssemblyAISTT {
    protected _bufferIterator = writableIterator<VoiceAgentEvent.STTEvent>();
    protected _connectionPromise: Promise<WebSocket> | null = null;

    async sendAudio(buffer: Uint8Array): Promise<void> {
      const conn = await this._connection;
      conn.send(buffer);
    }

    async *receiveEvents(): AsyncGenerator<VoiceAgentEvent.STTEvent> {
      yield* this._bufferIterator;
    }

    protected get _connection(): Promise<WebSocket> {
      if (this._connectionPromise) return this._connectionPromise;

      this._connectionPromise = new Promise((resolve, reject) => {
        const params = new URLSearchParams({
          sample_rate: this.sampleRate.toString(),
          format_turns: "true",
        });
        const url = `wss://streaming.assemblyai.com/v3/ws?${params}`;
        const ws = new WebSocket(url, {
          headers: { Authorization: this.apiKey },
        });

        ws.on("open", () => resolve(ws));

        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "Turn") {
            if (message.turn_is_formatted) {
              this._bufferIterator.push({
                type: "stt_output",
                transcript: message.transcript,
                ts: Date.now()
              });
            } else {
              this._bufferIterator.push({
                type: "stt_chunk",
                transcript: message.transcript,
                ts: Date.now()
              });
            }
          }
        });
      });

      return this._connectionPromise;
    }
  }
  ```
</Accordion>

## 2.LangChain代理代理阶段通过 LangChain [agent](/oss/javascript/langchain/agents) 处理文本转录并流式传输响应令牌。在这种情况下，我们流式传输由代理生成的所有[text content blocks](/oss/javascript/langchain/messages#content-block-reference)。

### 关键概念

**流式响应**：代理使用 [⟦T11⟧](/oss/javascript/langchain/streaming) 和 `stream.messages` 在生成响应令牌时发出响应令牌，而不是等待完整响应。这使得 TTS 阶段能够立即开始合成。

**对话内存**：[checkpointer](/oss/javascript/langchain/short-term-memory) 使用唯一的线程 ID 维护各个轮次的对话状态。这允许代理参考对话中之前的交换。

### 实施

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Define agent tools
const addToOrder = tool(
  async ({ item, quantity }) => {
    return `Added ${quantity} x ${item} to the order.`;
  },
  {
    name: "add_to_order",
    description: "Add an item to the customer's sandwich order.",
    schema: z.object({
      item: z.string(),
      quantity: z.number(),
    }),
  }
);

const confirmOrder = tool(
  async ({ orderSummary }) => {
    return `Order confirmed: ${orderSummary}. Sending to kitchen.`;
  },
  {
    name: "confirm_order",
    description: "Confirm the final order with the customer.",
    schema: z.object({
      orderSummary: z.string().describe("Summary of the order"),
    }),
  }
);

// Create agent with tools and memory
const agent = createAgent({
  model: "claude-haiku-4-5",
  tools: [addToOrder, confirmOrder],
  checkpointer: new MemorySaver(),
  systemPrompt: `You are a helpful sandwich shop assistant.
Your goal is to take the user's order. Be concise and friendly.
Do NOT use emojis, special characters, or markdown.
Your responses will be read by a text-to-speech engine.`,
});

async function* agentStream(
  eventStream: AsyncIterable<VoiceAgentEvent>
): AsyncGenerator<VoiceAgentEvent> {
  // Generate unique thread ID for conversation memory
  const threadId = crypto.randomUUID();

  for await (const event of eventStream) {
    // Pass through all upstream events
    yield event;

    // Process final transcripts through the agent
    if (event.type === "stt_output") {
      const stream = await agent.streamEvents(
        { messages: [new HumanMessage(event.transcript)] },
        {
          configurable: { thread_id: threadId },
          version: "v3",
        }
      );

      // Yield agent response chunks as they arrive
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          yield { type: "agent_chunk", text: token, ts: Date.now() };
        }
      }
    }
  }
}
```

## 3. 文本转语音

TTS 阶段将代理响应文本合成为音频并将其流式传输回客户端。与 STT 阶段一样，它使用生产者-消费者模式来处理并发文本发送和音频接收。

### 关键概念

**并发处理**：该实现合并两个异步流：

* **上游处理**：传递所有事件并将代理文本块发送到 TTS 提供商
* **音频接收**：从 TTS 提供商接收合成音频块**流式 TTS**：某些提供程序（例如 [Cartesia](https://cartesia.ai/)）在收到文本后立即开始合成音频，从而使音频播放能够在代理完成生成完整响应之前开始。

**事件传递**：所有上游事件不变地流过，允许客户端或其他观察者跟踪完整的管道状态。

### 实施

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { CartesiaTTS } from "./cartesia";

async function* ttsStream(
  eventStream: AsyncIterable<VoiceAgentEvent>
): AsyncGenerator<VoiceAgentEvent> {
  const tts = new CartesiaTTS();
  const passthrough = writableIterator<VoiceAgentEvent>();

  // Producer: read upstream events and send text to Cartesia
  const producer = (async () => {
    try {
      for await (const event of eventStream) {
        passthrough.push(event);
        if (event.type === "agent_chunk") {
          await tts.sendText(event.text);
        }
      }
    } finally {
      await tts.close();
    }
  })();

  // Consumer: receive audio from Cartesia
  const consumer = (async () => {
    for await (const event of tts.receiveEvents()) {
      passthrough.push(event);
    }
  })();

  try {
    // Yield events from both producer and consumer
    yield* passthrough;
  } finally {
    await Promise.all([producer, consumer]);
  }
}
```

该应用程序实现了 Cartesia 客户端来管理 WebSocket 连接和音频流。请参阅下面的实现；可以为其他 TTS 提供商构建类似的适配器。

<Accordion title="Cartesia Client">
  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export class CartesiaTTS {
    protected _bufferIterator = writableIterator<VoiceAgentEvent.TTSEvent>();
    protected _connectionPromise: Promise<WebSocket> | null = null;

    async sendText(text: string | null): Promise<void> {
      if (!text || !text.trim()) return;

      const conn = await this._connection;
      const payload = { text, try_trigger_generation: false };
      conn.send(JSON.stringify(payload));
    }

    async *receiveEvents(): AsyncGenerator<VoiceAgentEvent.TTSEvent> {
      yield* this._bufferIterator;
    }

    protected _generateContextId(): string {
      const timestamp = Date.now();
      const counter = this._contextCounter++;
      return `ctx_${timestamp}_${counter}`;
    }

    protected get _connection(): Promise<WebSocket> {
      if (this._connectionPromise) return this._connectionPromise;

      this._connectionPromise = new Promise((resolve, reject) => {
        const params = new URLSearchParams({
          api_key: this.apiKey,
          cartesia_version: this.cartesiaVersion,
        });
        const url = `wss://api.cartesia.ai/tts/websocket?${params.toString()}`;
        const ws = new WebSocket(url);

        ws.on("open", () => {
          resolve(ws);
        });

        ws.on("message", (data: WebSocket.RawData) => {
          const message: CartesiaTTSResponse = JSON.parse(data.toString());
          if (message.data) {
            this._bufferIterator.push({
              type: "tts_chunk",
              audio: message.data,
              ts: Date.now(),
            });
          } else if (message.error) {
            throw new Error(`Cartesia error: ${message.error}`);
          }
        });
      });

      return this._connectionPromise;
    }
  }
  ```
</Accordion>

### 朗史密斯

您使用 LangChain 构建的许多应用程序将包含多个步骤以及多次调用 LLM 调用。随着这些应用程序变得越来越复杂，能够检查链或代理内部到底发生了什么变得至关重要。最好的方法是使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-voice-agent)。

在上面的链接注册后，请确保设置环境变量以开始记录跟踪：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

## 将它们放在一起

完整的管道将三个阶段链接在一起：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// using https://hono.dev/
app.get("/ws", upgradeWebSocket(async () => {
  const inputStream = writableIterator<Uint8Array>();

  // Chain the three stages
  const transcriptEventStream = sttStream(inputStream);
  const agentEventStream = agentStream(transcriptEventStream);
  const outputEventStream = ttsStream(agentEventStream);

  // Process pipeline and send TTS audio to client
  const flushPromise = (async () => {
    for await (const event of outputEventStream) {
      if (event.type === "tts_chunk") {
        currentSocket?.send(event.audio);
      }
    }
  })();

  return {
    onMessage(event) {
      // Push incoming audio into pipeline
      const data = event.data;
      if (Buffer.isBuffer(data)) {
        inputStream.push(new Uint8Array(data));
      }
    },
    async onClose() {
      inputStream.cancel();
      await flushPromise;
    },
  };
}));
```每个阶段独立且并发地处理事件：音频到达后就开始音频转录，一旦转录本可用，代理就开始推理，一旦生成代理文本，语音合成就开始。该架构可以实现低于 700 毫秒的延迟，以支持自然对话。

有关使用 LangChain 构建代理的更多信息，请参阅[Agents guide](/oss/javascript/langchain/agents)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/voice-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>