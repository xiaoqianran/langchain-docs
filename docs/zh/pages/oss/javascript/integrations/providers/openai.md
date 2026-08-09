<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: OpenAI integrations | https://docs.langchain.com/oss/javascript/integrations/providers/openai -->

# OpenAI 集成

使用 LangChain JavaScript 与 OpenAI 集成。

LangChain通过`@langchain/openai`包与OpenAI和Azure OpenAI集成。

> [OpenAI](https://en.wikipedia.org/wiki/OpenAI)是美国人工智能（AI）研究实验室
> 由非营利组织 `OpenAI Incorporated` 组成
> 及其营利性子公司`OpenAI Limited Partnership`。
> OpenAI 开展人工智能研究，其目的是促进和开发友好的人工智能。
> OpenAI 系统在`Microsoft` 基于`Azure` 的超级计算平台上运行。

> [OpenAI API](https://platform.openai.com/docs/models) 由具有不同功能和价位的多种型号提供动力。
>
> [ChatGPT](https://chat.openai.com)是`OpenAI`开发的人工智能（AI）聊天机器人。

## 安装和设置

* 获取 OpenAI api 密钥并将其设置为环境变量 (`OPENAI_API_KEY`)

## 聊天模型

请参阅[usage example](/oss/javascript/integrations/chat/openai)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";
```

## 法学硕士

请参阅[usage example](/oss/javascript/integrations/llms/openai)。

<Tip>
  参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。
</Tip>

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/openai @langchain/core
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OpenAI } from "@langchain/openai";
```

## 文本嵌入模型

查看[usage example](/oss/javascript/integrations/embeddings/openai)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OpenAIEmbeddings } from "@langchain/openai";
```

## 链

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OpenAIModerationChain } from "@langchain/classic/chains";
```

## 中间件

专为 OpenAI 模型设计的中间件。了解更多关于[middleware](/oss/javascript/langchain/middleware/overview)的信息。|中间件|描述 |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| [Content moderation](#content-moderation) |使用 OpenAI 的审核端点来审核代理流量 |

### 内容审核

使用 OpenAI 的审核端点来审核代理流量（用户输入、模型输出和工具结果），以检测和处理不安全内容。内容审核对于以下用途很有用：

* 需要内容安全性和合规性的应用程序
* 过滤有害、仇恨或不当内容
* 需要安全护栏的面向客户的代理
* 满足平台审核要求

<Info>
  了解有关 [OpenAI's moderation models](https://platform.openai.com/docs/guides/moderation) 和类别的更多信息。
</Info>

**API参考：** [⟦T14⟧](https://reference.langchain.com/javascript/langchain/index/openAIModerationMiddleware)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, openAIModerationMiddleware } from "langchain";

const agent = createAgent({
  model: "openai:gpt-5.5",
  tools: [searchTool, databaseTool],
  middleware: [
    openAIModerationMiddleware({
      model: "openai:gpt-5.5",
      moderationModel: "omni-moderation-latest",
      checkInput: true,
      checkOutput: true,
      exitBehavior: "end",
    }),
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="string | BaseChatModel">
    用于审核的 OpenAI 模型。可以是模型名称字符串（例如，`"openai:gpt-5.5"`）或`BaseChatModel`实例。中间件将使用此模型的客户端来访问审核端点。
  </ParamField>

  <ParamField type="ModerationModel">
    要使用的 OpenAI 审核模型。选项：`'omni-moderation-latest'`、`'omni-moderation-2024-09-26'`、`'text-moderation-latest'`、`'text-moderation-stable'`
  </ParamField>

  <ParamField type="boolean">
    模型调用前是否检查用户输入消息
  </ParamField><ParamField type="boolean">
    模型调用后是否检查模型输出消息
  </ParamField>

  <ParamField type="boolean">
    是否在调用模型之前检查工具结果消息
  </ParamField>

  <ParamField type="'error' | 'end' | 'replace'">
    当内容被标记时如何处理违规行为。选项：

    * `'end'` - 立即结束代理执行并显示违规消息
    * `'error'` - 抛出`OpenAIModerationError`异常
    * `'replace'` - 用违规消息替换标记的内容并继续
  </ParamField>

  <ParamField type="string | undefined">
    违规消息的自定义模板。支持模板变量：

    * `{categories}` - 以逗号分隔的标记类别列表
    * `{category_scores}` - 类别分数的 JSON 字符串
    * `{original_content}` - 原始标记内容

    默认值：`"I'm sorry, but I can't comply with that request. It was flagged for {categories}."`
  </ParamField>
</Accordion>

<Accordion title="Full example">
  该中间件集成了 OpenAI 的审核端点来检查不同阶段的内容：

  **审核阶段：**

  * `checkInput` - 模型调用前的用户消息
  * `checkOutput` - 模型调用后的AI消息
  * `checkToolResults` - 模型调用之前的工具输出

  **退出行为：**

  * `'end'`（默认）- 停止执行并显示违规消息
  * `'error'` - 抛出应用程序处理异常
  * `'replace'` - 替换标记的内容并继续

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, openAIModerationMiddleware } from "langchain";

  // Basic moderation
  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [searchTool, customerDataTool],
    middleware: [
      openAIModerationMiddleware({
        model: "openai:gpt-5.5",
        moderationModel: "omni-moderation-latest",
        checkInput: true,
        checkOutput: true,
      }),
    ],
  });

  // Strict moderation with custom message
  const agentStrict = createAgent({
    model: "openai:gpt-5.5",
    tools: [searchTool, customerDataTool],
    middleware: [
      openAIModerationMiddleware({
        model: "openai:gpt-5.5",
        moderationModel: "omni-moderation-latest",
        checkInput: true,
        checkOutput: true,
        checkToolResults: true,
        exitBehavior: "error",
        violationMessage:
          "Content policy violation detected: {categories}. " +
          "Please rephrase your request.",
      }),
    ],
  });

  // Moderation with replacement behavior
  const agentReplace = createAgent({
    model: "openai:gpt-5.5",
    tools: [searchTool],
    middleware: [
      openAIModerationMiddleware({
        model: "openai:gpt-5.5",
        checkInput: true,
        exitBehavior: "replace",
        violationMessage: "[Content removed due to safety policies]",
      }),
    ],
  });
  ```
</Accordion>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/openai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>