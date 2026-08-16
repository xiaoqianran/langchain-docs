<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace JS functions in serverless environments | https://docs.langchain.com/langsmith/serverless-environments -->

# 在无服务器环境中跟踪 JS 函数

<Note>
本节与使用 LangSmith JS SDK 0.2.0 及更高版本的用户相关。如果您在无服务器环境中使用 LangChain.js 或 LangGraph.js 进行跟踪，请参阅 [this guide](https://js.langchain.com/docs/how_to/callbacks_serverless)。
</Note>

跟踪 JavaScript 函数时，LangSmith 默认情况下会在后台跟踪运行，以避免增加延迟。在执行上下文可能突然终止的无服务器环境中，确保在函数完成之前正确刷新所有跟踪数据非常重要。

为了确保发生这种情况，您可以：

* 将名为 `LANGSMITH_TRACING_BACKGROUND` 的环境变量设置为 `"false"`。这将导致您的跟踪函数在返回之前等待跟踪完成。
  * 请注意，它的命名与 LangChain.js 中的 [environment variable](https://js.langchain.com/docs/how_to/callbacks_serverless) 不同，因为 LangSmith 可以在没有 LangChain 的情况下使用。
* 将自定义客户端传递到跟踪的运行和 `await` `client.awaitPendingTraceBatches();` 方法中。

以下是使用 `awaitPendingTraceBatches` 与 [⟦T8⟧](/langsmith/annotate-code) 方法的示例：

```typescript
import { Client } from "langsmith";
import { traceable } from "langsmith/traceable";
const langsmithClient = new Client({});
const tracedFn = traceable(
  async () => {
    return "Some return value";
  },
  {
    client: langsmithClient,
  }
);
const res = await tracedFn();
await langsmithClient.awaitPendingTraceBatches();
```

## 高并发时的速率限制[ ](#rate-limits-at-high-concurrency "Direct link to rate limits at high concurrency")

默认情况下，LangSmith客户端将在跟踪的运行执行时对操作进行批处理，每隔几毫秒发送一个新批次。这在大多数情况下效果很好，但如果您的跟踪函数长时间运行并且并发性非常高，您也可能会达到与总体请求计数相关的速率限制。

如果您看到与此相关的速率限制错误，您可以尝试在客户端中设置`manualFlushMode: true`，如下所示：

```typescript
import { Client } from "langsmith";
const langsmithClient = new Client({  manualFlushMode: true,});
const myTracedFunc = traceable(
  async () => {
    // Your logic here...
  },
  { client: langsmithClient }
);
```

然后在无服务器函数关闭之前手动调用`client.flush()`：

```typescript
try {
  await myTracedFunc();
} finally {
  await langsmithClient.flush();
}
```

请注意，这将阻止运行出现在 LangSmith UI 中，直到您调用 `.flush()`。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/serverless-environments.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>