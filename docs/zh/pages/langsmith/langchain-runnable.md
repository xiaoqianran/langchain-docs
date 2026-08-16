<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate a runnable | https://docs.langchain.com/langsmith/langchain-runnable -->

# 如何评估可运行程序

<Info>
* `langchain`: [Python](https://docs.langchain.com/oss/python/langchain/overview) 和 [JS/TS](https://docs.langchain.com/oss/javascript/langchain/overview)
* 可运行：[Python](https://reference.langchain.com/python/langchain_core/runnables/) 和 [JS/TS](https://reference.langchain.com/javascript/classes/_langchain_core.runnables.Runnable.html)
</Info>

`langchain` [⟦T8⟧](https://reference.langchain.com/python/langchain_core/runnables/) 对象（如聊天模型、检索器、链等）可以直接传入`evaluate()` / `aevaluate()`。

## 设置

让我们定义一个简单的链来评估。首先，安装所有必需的软件包：

<CodeGroup>

```bash Python
pip install -U langsmith langchain[openai]
```

```bash TypeScript
yarn add langsmith @langchain/openai
```

</CodeGroup>

现在定义一个链：

<CodeGroup>

```python Python
from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

instructions = (
    "Please review the user query below and determine if it contains any form "
    "of toxic behavior, such as insults, threats, or highly negative comments. "
    "Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't."
)

prompt = ChatPromptTemplate(
    [("system", instructions), ("user", "{text}")],
)

model = init_chat_model("gpt-5.5")
chain = prompt | model | StrOutputParser()
```

```typescript TypeScript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Please review the user query below and determine if it contains any form of toxic behavior, such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't."],
  ["user", "{text}"]
]);

const chatModel = new ChatOpenAI();
const outputParser = new StringOutputParser();
const chain = prompt.pipe(chatModel).pipe(outputParser);
```

</CodeGroup>

## 评估

为了评估我们的链，我们可以将其直接传递给 `evaluate()` / `aevaluate()` 方法。请注意，链的输入变量必须与示例输入的键匹配。在这种情况下，示例输入的格式应为 `{"text": "..."}`。

<CodeGroup>

```python Python
import asyncio
from langsmith import Client, aevaluate

client = Client()

# Clone a dataset of texts with toxicity labels.
# Each example input has a "text" key and each output has a "label" key.
dataset = client.clone_public_dataset(
    "https://smith.langchain.com/public/3d6831e6-1680-4c88-94df-618c8e01fc55/d"
)

def correct(outputs: dict, reference_outputs: dict) -> bool:
    # Since our chain outputs a string not a dict, this string
    # gets stored under the default "output" key in the outputs dict:
    actual = outputs["output"]
    expected = reference_outputs["label"]
    return actual == expected

async def main():
    results = await aevaluate(
        chain,
        data=dataset,
        evaluators=[correct],
        experiment_prefix="gpt-5.5, baseline",
        metadata={"models": "openai:gpt-5.5"},  # optional, used to populate model/prompt/tool columns in UI
    )
    print(results)

asyncio.run(main())
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";
import { Client } from "langsmith";

const langsmith = new Client();

const dataset = await client.clonePublicDataset(
  "https://smith.langchain.com/public/3d6831e6-1680-4c88-94df-618c8e01fc55/d"
)

await evaluate(chain, {
  data: dataset.name,
  evaluators: [correct],
  experimentPrefix: "gpt-5.5, baseline",
  metadata: { models: "openai:gpt-5.5" },  // optional, used to populate model/prompt/tool columns in UI
});
```

</CodeGroup>

针对每个输出适当地跟踪可运行程序。

![Runnable Evaluation](/langsmith/images/runnable-eval.png)

## 相关

* [How to evaluate a ⟦T14⟧ graph](/langsmith/evaluate-on-intermediate-steps)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langchain-runnable.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>