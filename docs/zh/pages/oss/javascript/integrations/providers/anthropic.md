<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Anthropic integrations | https://docs.langchain.com/oss/javascript/integrations/providers/anthropic -->

# 人择整合

使用 LangChain JavaScript 与 Anthropic 集成。

与人择模型相关的所有功能。

[Anthropic](https://www.anthropic.com/)是一家AI安全和研究公司，是Claude的创建者。
本页面涵盖了 Anthropic 模型和 LangChain 之间的所有集成。

## 提示最佳实践

与 OpenAI 模型相比，人择模型有一些提示性的最佳实践。

**系统消息可能只是第一条消息**

人择模型要求任何系统消息都是提示中的第一个消息。

## `ChatAnthropic`

`ChatAnthropic`是LangChain`ChatModel`的子类，这意味着它与`ChatPromptTemplate`配合得最好。
您可以使用以下代码导入此包装器：

<Tip>
  参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。
</Tip>

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/anthropic @langchain/core
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic } from "@langchain/anthropic";
const model = new ChatAnthropic({});
```

使用 ChatModel 时，最好将提示设计为 `ChatPromptTemplate`s。
下面是执行此操作的示例：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatPromptTemplate } from "@langchain/classic/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful chatbot"],
  ["human", "Tell me a joke about {topic}"],
]);
```

然后您可以在链中使用它，如下所示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const chain = prompt.pipe(model);
await chain.invoke({ topic: "bears" });
```

有关更多示例，请参阅[chat model integration page](/oss/javascript/integrations/chat/anthropic/)，包括多模式输入。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/anthropic.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>