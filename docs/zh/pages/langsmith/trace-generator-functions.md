<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace generator functions | https://docs.langchain.com/langsmith/trace-generator-functions -->

# 跟踪生成器函数

在大多数 LLM 应用程序中，您将希望流式输出以最大限度地缩短用户看到第一个令牌的时间。

LangSmith 的跟踪功能本身支持通过 `generator` 函数进行流式输出。下面是一个例子。

<CodeGroup>

```python Python
from langsmith import traceable
@traceable
def my_generator():
  for chunk in ["Hello", "World", "!"]:
      yield chunk
# Stream to the user
for output in my_generator():
  print(output)
# It also works with async functions
import asyncio
@traceable
async def my_async_generator():
  for chunk in ["Hello", "World", "!"]:
      yield chunk
# Stream to the user
async def main():
  async for output in my_async_generator():
      print(output)
asyncio.run(main())
```

```typescript TypeScript
import { traceable } from "langsmith/traceable";
const myGenerator = traceable(function* () {
  for (const chunk of ["Hello", "World", "!"]) {
      yield chunk;
  }
});
for (const output of myGenerator()) {
  console.log(output);
}
```

</CodeGroup>

## 汇总结果[ ](#aggregate-results "Direct link to aggregate results")

默认情况下，跟踪函数的 `outputs` 聚合到 LangSmith 中的单个数组中。如果您想自定义它的存储方式（例如，将输出连接成单个字符串），您可以使用 `aggregate` 选项（Python 中的`reduce_fn`）。这对于聚合流式 LLM 输出特别有用。

<Note>
聚合输出**仅**影响输出的跟踪表示。它不会改变函数返回的值。
</Note>

<CodeGroup>

```python Python
from langsmith import traceable
def concatenate_strings(outputs: list):
  return "".join(outputs)
@traceable(reduce_fn=concatenate_strings)
def my_generator():
  for chunk in ["Hello", "World", "!"]:
      yield chunk
# Stream to the user
for output in my_generator():
  print(output)
# It also works with async functions
import asyncio
@traceable(reduce_fn=concatenate_strings)
async def my_async_generator():
  for chunk in ["Hello", "World", "!"]:
      yield chunk
# Stream to the user
async def main():
  async for output in my_async_generator():
      print(output)
asyncio.run(main())
```

```typescript TypeScript
import { traceable } from "langsmith/traceable";
const concatenateStrings = (outputs: string[]) => outputs.join("");
const myGenerator = traceable(function* () {
  for (const chunk of ["Hello", "World", "!"]) {
      yield chunk;
  }
}, { aggregator: concatenateStrings });
for (const output of await myGenerator()) {
  console.log(output);
}
```

</CodeGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-generator-functions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>