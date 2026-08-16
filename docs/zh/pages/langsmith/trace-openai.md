<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI applications | https://docs.langchain.com/langsmith/trace-openai -->

# 跟踪OpenAI应用程序

Python/TypeScript 中的 [⟦T2⟧](https://reference.langchain.com/python/langsmith/wrappers/_openai/wrap_openai) / [⟦T3⟧](https://reference.langchain.com/javascript/langsmith/wrappers/wrapOpenAI) 方法允许您包装 OpenAI 客户端以便自动记录跟踪 - 不需要装饰器或函数包装！使用包装器可确保消息（包括工具调用和多模式内容块）在 LangSmith 中得到良好呈现。另请注意，包装器与 [⟦T4⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 装饰器或 [⟦T5⟧](https://reference.langchain.com/javascript/functions/langsmith.traceable.traceable.html) 函数无缝协作，您可以在同一应用程序中使用两者。

<Note>
`LANGSMITH_TRACING` 环境变量必须设置为 `'true'`，以便将跟踪记录到 LangSmith，即使在使用 [⟦T8⟧](https://reference.langchain.com/python/langsmith/wrappers/_openai/wrap_openai) 或 [⟦T9⟧](https://reference.langchain.com/javascript/langsmith/wrappers/wrapOpenAI) 时也是如此。这允许您在不更改代码的情况下打开和关闭跟踪。

此外，您需要将 `LANGSMITH_API_KEY` 环境变量设置为您的 API 密钥（有关更多信息，请参阅 [Setup](/)）。

如果您的 LangSmith API 密钥链接到多个工作区，请设置 `LANGSMITH_WORKSPACE_ID` 环境变量以指定要使用的工作区。

默认情况下，跟踪将记录到名为 `default` 的项目中。要将跟踪记录到不同的项目，请参阅[Log traces to a specific project](/langsmith/log-traces-to-project)。
</Note>

<CodeGroup>

```python Python
import openai
from langsmith import traceable
from langsmith.wrappers import wrap_openai

client = wrap_openai(openai.Client())

@traceable(run_type="tool", name="Retrieve Context")
def my_tool(question: str) -> str:
  return "During this morning's meeting, we solved all world conflict."

@traceable(name="Chat Pipeline")
def chat_pipeline(question: str):
  context = my_tool(question)
  messages = [
      { "role": "system", "content": "You are a helpful assistant. Please respond to the user's request only based on the given context." },
      { "role": "user", "content": f"Question: {question}\nContext: {context}"}
  ]
  chat_completion = client.chat.completions.create(
      model="gpt-5.5", messages=messages
  )
  return chat_completion.choices[0].message.content

chat_pipeline("Can you summarize this morning's meetings?")
```

```typescript TypeScript
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";

const client = wrapOpenAI(new OpenAI());

const myTool = traceable(async (question: string) => {
  return "During this morning's meeting, we solved all world conflict.";
}, { name: "Retrieve Context", run_type: "tool" });

const chatPipeline = traceable(async (question: string) => {
  const context = await myTool(question);
  const messages = [
      {
          role: "system",
          content:
              "You are a helpful assistant. Please respond to the user's request only based on the given context.",
      },
      { role: "user", content: `Question: ${question} Context: ${context}` },
  ];
  const chatCompletion = await client.chat.completions.create({
      model: "gpt-5.5",
      messages: messages,
  });
  return chatCompletion.choices[0].message.content;
}, { name: "Chat Pipeline" });

await chatPipeline("Can you summarize this morning's meetings?");
```

</CodeGroup>

要跟踪具有OpenAI兼容 API 的提供商，请参阅[Trace OpenAI-compatible providers](/langsmith/trace-with-openai-compatible)。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-openai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>