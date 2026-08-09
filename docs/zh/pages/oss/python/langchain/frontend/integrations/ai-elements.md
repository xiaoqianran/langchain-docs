<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AI Elements | https://docs.langchain.com/oss/python/langchain/frontend/integrations/ai-elements -->

# 人工智能元素

基于 shadcn/ui 的可组合组件，用于使用 useStream 的 AI 聊天界面

[AI Elements](https://elements.ai-sdk.dev/)是一个可组合的、基于shadcn/ui的组件库，专为AI聊天界面而构建。 `Conversation`、`Message`、`Tool`、`Reasoning` 和 `PromptInput` 等组件旨在直接放入任何 React 项目中，并使用最少的粘合代码连接到 `stream.messages`。

<ExampleEmbed />

<Tip>
  克隆并运行 [full AI Elements example](https://github.com/langchain-ai/langgraphjs/tree/main/examples/ai-elements) 以在工作项目中查看工具调用渲染、推理显示、流消息等。
</Tip>

## 它是如何工作的

1. **将组件安装为源文件：** AI Elements 通过 CLI 提供，将组件直接添加到您的项目中（shadcn/ui 注册表样式）
2. **将消息映射到组件：** 迭代`stream.messages`，将`HumanMessage`实例渲染为用户气泡，将`AIMessage`实例渲染为辅助响应
3. **构建更丰富的UI：**在`<Tool>`中包装工具调用，在`<Reasoning>`中进行推理，以及`<Conversation>`中用于滚动管理的所有内容

## 安装

通过 CLI 安装 AI Elements 组件。它们作为可编辑源文件添加到您的项目中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/react
npx ai-elements@latest add conversation message prompt-input tool reasoning suggestion
```

## 接线 useStream

直接从 `stream.messages` 渲染 AI Elements 组件。每个LangChain`BaseMessage`映射到一个组件：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";
import { HumanMessage, AIMessage } from "langchain";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

function getReasoningText(msg: AIMessage) {
  return msg.contentBlocks.find((block) => block.type === "reasoning")?.reasoning ?? "";
}

function getTextContent(msg: AIMessage) {
  return msg.text;
}

function getToolCalls(msg: AIMessage) {
  return (msg.tool_calls ?? []).map((tc) => ({
    id: tc.id,
    name: tc.name,
    args: tc.args,
    state: "input-available" as const,
  }));
}

export function Chat() {
  const stream = useStream({
    apiUrl: "http://localhost:2024",
    assistantId: "ai_elements",
  });

  return (
    <div className="flex flex-col h-dvh">
      <Conversation className="flex-1">
        <ConversationContent>
          {stream.messages.map((msg, i) => {
            if (HumanMessage.isInstance(msg)) {
              return (
                <Message key={i} from="user">
                  <MessageContent>{msg.text}</MessageContent>
                </Message>
              );
            }
            if (AIMessage.isInstance(msg)) {
              return (
                <div key={i}>
                  {/* Reasoning block (shows when model emits thinking tokens) */}
                  <Reasoning>
                    <ReasoningTrigger />
                    <ReasoningContent>{getReasoningText(msg)}</ReasoningContent>
                  </Reasoning>

                  {/* Inline tool calls with input/output display */}
                  {getToolCalls(msg).map((tc) => (
                    <Tool key={tc.id} defaultOpen>
                      <ToolHeader type={`tool-${tc.name}`} state={tc.state} />
                      <ToolContent>
                        <ToolInput input={tc.args} />
                        {tc.output && (
                          <ToolOutput output={tc.output} errorText={undefined} />
                        )}
                      </ToolContent>
                    </Tool>
                  ))}

                  {/* Streamed text response */}
                  <Message from="assistant">
                    <MessageContent>
                      <MessageResponse>{getTextContent(msg)}</MessageResponse>
                    </MessageContent>
                  </Message>
                </div>
              );
            }
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        onSubmit={({ text }) =>
          stream.submit({ messages: [{ type: "human", content: text }] })
        }
      >
        <PromptInputBody>
          <PromptInputTextarea placeholder="Ask me something..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit
            status={stream.isLoading ? "streaming" : "ready"}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
```

## 最佳实践* **自由编辑源文件：** 组件在您的项目中提供，而不是作为外部包依赖项，因此您可以更改任何内容而无需分叉
* **使用`MessageResponse`进行流式传输：**它可以正确处理流式传输的部分令牌；避免在流式传输期间直接渲染原始消息内容
* **包裹在 `Conversation`:** `Conversation` 组件管理滚动行为，以便新消息自动滚动到视图中
* **`isInstance` 上的门：** 使用 `HumanMessage.isInstance(msg)` 和 `AIMessage.isInstance(msg)` 而不是检查 `msg.getType()` 是否正确的 TypeScript 缩小

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/ai-elements.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>