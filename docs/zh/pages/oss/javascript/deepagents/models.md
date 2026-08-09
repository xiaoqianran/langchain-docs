<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Models | https://docs.langchain.com/oss/javascript/deepagents/models -->

# 型号

为深度代理配置模型提供程序和参数

深度代理可与任何支持 [tool calling](/oss/javascript/langchain/models#tool-calling) 的 [LangChain chat model](/oss/javascript/langchain/models) 配合使用。

## 支持的型号

以 `provider:model` 格式指定模型（例如，`google_genai:gemini-3.6-flash`、`openai:gpt-5.4` 或 `anthropic:claude-sonnet-4-6`）。提供者前缀选择 LangChain 集成，冒号后面的所有内容都会作为模型标识符传递给该提供者。有关有效的提供程序字符串，请参阅 [⟦T8⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel) 的 `model_provider` 参数。对于特定于提供商的配置，请参阅[chat model integrations](/oss/javascript/integrations/chat)。

模型标识符必须与提供者期望的格式匹配。一些提供商使用简单的名称，例如 `gpt-5.5`；其他人使用命名空间 ID 或部署路径，例如 `zai-org/GLM-5.2`，因此完整的 Deep Agents 字符串将是 `baseten:zai-org/GLM-5.2`。检查提供商的模型目录或集成文档以获取当前标识符。

### 建议型号

这些模型在测试基本代理操作的[Deep Agents eval suite](https://github.com/langchain-ai/deepagents/tree/main/libs/evals#readme)上表现良好。通过这些评估是必要的，但不足以在更长、更复杂的任务中表现出色。|供应商|型号|
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| [Google](/oss/javascript/integrations/providers/google) | `gemini-3.1-pro-preview`、`gemini-3.6-flash` |
| [OpenAI](/oss/javascript/integrations/providers/openai) | `gpt-5.5`、`gpt-5.4` |
| [Anthropic](/oss/javascript/integrations/providers/anthropic) | `claude-opus-4-8`、`claude-opus-4-7`、`claude-opus-4-6` |
|自由重量 | `GLM-5.2`、`Kimi-K2.7 Code`、`MiniMax-M3` |

开放重量模型可通过 [OpenRouter](/oss/javascript/integrations/chat/openrouter) 和 [Ollama](/oss/javascript/integrations/chat/ollama) 等提供商获得。

### 模型评估

[Deep Agents eval suite](https://github.com/langchain-ai/deepagents/tree/main/libs/evals#readme)测试热门型号：<div>
  |型号|                                                                        总体 |                                                                        文件操作 |                                                                       检索|                                                                       工具使用|                                                                         内存|                                                                   对话 |                                                                   总结|| :------------------------------------------------------------ | ------------------------------------------------------------------------------------------： | ----------------------------------------------------------------------------------------------： | ----------------------------------------------------------------------------------------------：| ------------------------------------------------------------------------------------------：| ------------------------------------------------------------------------------------------：| ------------------------------------------------------------------------------------------：| ----------------------------------------------------------------------------------------------： |
  | google\_genai:gemini-3.6-flash |     [82%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[90%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |     [54%](https://github.com/langchain-ai/deepagents/actions/runs/25290479270) |     [38%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
  |打开：gpt-5.4 |     [18%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |     [18%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) |     [51%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583) |     [38%](https://github.com/langchain-ai/deepagents/actions/runs/24425363630) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |
  |打开：gpt-5.5 |     [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |     [84%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |     [64%](https://github.com/langchain-ai/deepagents/actions/runs/25345307822) | **[52%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
  |人类：claude-opus-4-6 |     [26%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |     [26%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | **[69%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |     [22%](https://github.com/langchain-ai/deepagents/actions/runs/24363491527) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** ||人类：claude-opus-4-7 |     [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |     [82%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |                                                                              — |     [48%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |
  |基础：moonshotai/Kimi-K2.6 |     [79%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906)** |     [84%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) |                                                                              — |     [43%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) |      [60%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) |
  |基础：zai-org/GLM-5 |     [77%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424)** |     [89%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) |     [44%](https://github.com/langchain-ai/deepagents/actions/runs/23872647281) |     [24%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) |      [60%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) |
  |烟花：帐户/烟花/模型/glm-5p1 |     [81%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650)** |     [87%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) |                                                                              — |     [33%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) |
  |烟花：帐户/烟花/模型/minimax-m2p7 |     [79%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412)** |     [85%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) |                                                                              — |     [43%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) |      [60%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) |
  | ollama:minimax-m2.7:云 |     [73%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |      [90%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |     [82%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |     [38%](https://github.com/langchain-ai/deepagents/actions/runs/23872647281) |     [29%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |      [60%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) || openrouter：deepseek/deepseek-v4-flash |     [81%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395)** |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) | **[90%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395)** |                                                                              — |     [33%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) |
  | openrouter：minimax/minimax-m2.7 |     [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |     [89%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |                                                                              — |     [43%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |      [60%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
  |开放路由器：z-ai/glm-5.1 | **[89%](https://github.com/langchain-ai/deepagents/actions/runs/25387853856)** |      [92%](https://github.com/langchain-ai/deepagents/actions/runs/25234719085) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25234686782)** |     [89%](https://github.com/langchain-ai/deepagents/actions/runs/25387853856) |                                                                              — |     [33%](https://github.com/langchain-ai/deepagents/actions/runs/25225620506) |      [80%](https://github.com/langchain-ai/deepagents/actions/runs/25235579950) |
</div>

欲了解更多信息，请参阅[Eval runs](https://github.com/langchain-ai/deepagents/actions/workflows/evals.yml)。

## 配置模型参数

以 `provider:model` 格式将模型字符串传递给 [⟦T22⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent)，或传递已配置的模型实例以实现完全控制。在底层，模型字符串通过 [⟦T24⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel) 解析。

要配置特定于模型的参数，请使用[⟦T25⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel)或直接实例化提供者模型类：

<CodeGroup>
  ```ts initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { initChatModel } from "langchain/chat_models/universal";
  import { createDeepAgent } from "deepagents";

  const model = await initChatModel("google-genai:gemini-3.6-flash", {
    reasoningEffort: "medium", // [!code highlight]
  });
  const agent = createDeepAgent({ model });
  ```

  ```ts Provider package theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatGoogle } from "@langchain/google";
  import { createDeepAgent } from "deepagents";

  const model = new ChatGoogle({
    model: "gemini-3.1-pro-preview",
    reasoningEffort: "medium", // [!code highlight]
  });
  const agent = createDeepAgent({ model });
  ```
</CodeGroup>

<Note>
  可用参数因提供商而异。请参阅 [chat model integrations](/oss/javascript/integrations/chat) 页面了解特定于提供商的配置选项。
</Note>

### 提供商简介[⟦T26⟧](/oss/javascript/deepagents/profiles#provider-profiles) 封装了在创建深度代理时提供 `provider:model` 字符串时应用的初始化参数。当您通过 [⟦T28⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel) 传递预配置模型时，它不适用。

您可以在两个级别上注册，并且两者可以共存：

* **提供商级别** — 像 `"openai"` 这样的裸提供商密钥适用于 `openai` 提供商的每个模型。
* **模型级别** — 像 `"openai:gpt-5.4"` 这样的 `provider:model` 键仅适用于该特定模型，并合并在任何匹配的提供商级别配置文件之上。

有关完整字段列表、合并语义和插件打包，请参阅[Profiles](/oss/javascript/deepagents/profiles)。

<Tip>
  为了塑造模型构建后*代理*的行为方式，请使用[harness profile](/oss/javascript/deepagents/profiles#harness-profiles)。
</Tip>

## 在运行时选择模型

如果您的应用程序允许用户选择模型（例如使用 UI 中的下拉菜单），请使用 [middleware](/oss/javascript/langchain/middleware) 在运行时交换模型，而无需重建代理。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, initChatModel } from "langchain";
import { createDeepAgent } from "deepagents";
import * as z from "zod";

const contextSchema = z.object({
  model: z.string(),
});

const configurableModel = createMiddleware({
  name: "ConfigurableModel",
  wrapModelCall: async (request, handler) => {
    const modelName = request.runtime.context.model;
    const model = await initChatModel(modelName);
    return handler({ ...request, model });
  },
});

const agent = await createDeepAgent({
  model: "google-genai:gemini-3.6-flash",
  middleware: [configurableModel],
  contextSchema,
});

// Invoke with the user's model selection
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Hello!" }] },
  { context: { model: "openai:gpt-5.5" } },
);
```

<Tip>
  有关更多动态模型模式（例如基于对话复杂性或成本优化的路由），请参阅 LangChain 代理指南中的[Dynamic model](/oss/javascript/langchain/models#dynamic-model-selection)。
</Tip>

## 了解更多

* [Models in LangChain](/oss/javascript/langchain/models)：聊天模型功能包括工具调用、结构化输出和多模态

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>