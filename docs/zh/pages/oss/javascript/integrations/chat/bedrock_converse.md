<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: ChatBedrockConverse integration | https://docs.langchain.com/oss/javascript/integrations/chat/bedrock_converse -->

# ChatBedrockConverse 集成

使用 LangChain JavaScript 与 ChatBedrockConverse 聊天模型集成。

[Amazon Bedrock Converse](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) 是一项完全托管的服务，可通过 API 提供来自领先 AI 初创公司和 Amazon 的基础模型 (FM)。您可以从多种 FM 中进行选择，找到最适合您的使用案例的型号。它为基岩模型提供统一的对话界面。

这将帮助您开始使用 `ChatBedrockConverse` [chat models](/oss/javascript/langchain/models)。有关所有 `ChatBedrockConverse` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse)。

## 概述

### 集成细节|班级 |套餐 |可串行化| [PY support](https://python.langchain.com/docs/integrations/chat/bedrock/#beta-bedrock-converse-api) |                                            下载 |                                           版本 |
| :-------------------------------------------------------------------------------------------------------- | ：---------------------------------------------------------------- | :----------: | :--------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: |
| [⟦T12⟧](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse) | [⟦T13⟧](https://npmjs.com/@langchain/aws) |       ✅ |                                                   ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/aws?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/aws?style=flat-square\&label=%20&) |

### 模型特点

有关如何使用特定功能的指南，请参阅下面表标题中的链接。| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ❌ |      ❌ |                               ✅ |                              ✅ |                                ❌ |

## 设置

要访问 Bedrock 模型，您需要创建一个 AWS 账户、设置 Bedrock API 服务、获取访问密钥 ID 和密钥，并安装 `@langchain/aws` 集成包。

＃＃＃ 证书前往 [AWS docs](https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html) 注册 AWS 并设置您的凭证。您还需要为您的帐户打开模型访问权限，可以通过 [following these instructions](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) 来完成。

在环境中设置您的 Bedrock 凭据：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export BEDROCK_AWS_REGION="us-east-1"
export BEDROCK_AWS_ACCESS_KEY_ID="your-access-key-id"
export BEDROCK_AWS_SECRET_ACCESS_KEY="your-secret-access-key"
```

或者，设置 `AWS_BEARER_TOKEN_BEDROCK` 进行 API 密钥身份验证。请参阅[AWS Bedrock API key docs](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。

如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain `ChatBedrockConverse` 集成位于 `@langchain/aws` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/aws @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/aws @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/aws @langchain/core
  ```
</CodeGroup>

## 实例化

现在我们可以实例化模型对象并生成聊天完成结果。

有几种不同的方法可以通过 AWS 进行身份验证 - 以下示例依赖于环境变量中设置的访问密钥、秘密访问密钥和区域：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatBedrockConverse } from "@langchain/aws";

const llm = new ChatBedrockConverse({
  model: "us.anthropic.claude-sonnet-4-6",
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});
```

## 调用

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const aiMsg = await llm.invoke([
  [
    "system",
    "You are a helpful assistant that translates English to French. Translate the user sentence.",
  ],
  ["human", "I love programming."],
])
aiMsg
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessage {
  "id": "f5dc5791-224e-4fe5-ba2e-4cc51d9e7795",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "$metadata": {
      "httpStatusCode": 200,
      "requestId": "f5dc5791-224e-4fe5-ba2e-4cc51d9e7795",
      "attempts": 1,
      "totalRetryDelay": 0
    },
    "metrics": {
      "latencyMs": 584
    },
    "stopReason": "end_turn",
    "usage": {
      "inputTokens": 29,
      "outputTokens": 11,
      "totalTokens": 40
    }
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 29,
    "output_tokens": 11,
    "total_tokens": 40
  }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.content)
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore la programmation.
```

## 工具调用

基岩模型的工具调用方式与[other models](/oss/javascript/langchain/tools)类似，但请注意，并非所有基岩模型都支持工具调用。更多信息请参阅[AWS model documentation](https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html)。

***

## API 参考

有关所有 `ChatBedrockConverse` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/bedrock_converse.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>