<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AzureChatOpenAI integration | https://docs.langchain.com/oss/javascript/integrations/chat/azure -->

# AzureChatOpenAI 集成

使用 LangChain JavaScript 与 AzureChatOpenAI 聊天模型集成。

Azure OpenAI 是一项 Microsoft Azure 服务，提供来自 OpenAI 的强大语言模型。

这将帮助您开始使用 `AzureChatOpenAI` [chat models](/oss/javascript/langchain/models)。有关所有 `AzureChatOpenAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-openai/AzureChatOpenAI)。

## 概述

### 集成细节

|班级 |套餐 |可串行化| [PY support](https://python.langchain.com/docs/integrations/chat/azure_chat_openai) |                                             下载 |                                             版本 || :------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------- | :----------: | :---------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| [⟦T21⟧](https://reference.langchain.com/javascript/langchain-openai/AzureChatOpenAI) | [⟦T22⟧](https://www.npmjs.com/package/@langchain/openai) |       ✅ |                                          ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/openai?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/openai?style=flat-square\&label=%20&) |

### 模型特点

有关如何使用特定功能的指南，请参阅下面表标题中的链接。| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ❌ |      ❌ |                               ✅ |                              ✅ |                                ✅ |

## 设置

[Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 是一项云服务，可帮助您使用 OpenAI、Meta 等多种预构建和策划的模型快速开发生成式 AI 体验。

LangChain.js 支持使用 [OpenAI SDK](https://github.com/openai/openai-node) 中新的 Azure 集成与 [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 集成。您可以在[this page](https://learn.microsoft.com/azure/ai-services/openai/overview)上了解更多有关Azure OpenAI及其与OpenAI API的区别。

### 凭证

如果您没有 Azure 帐户，可以[create a free account](https://azure.microsoft.com/free/) 开始。

您还需要部署一个 Azure OpenAI 实例。您可以在 Azure 门户上部署以下[this guide](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource?pivots=web-portal) 的版本。

实例运行后，请确保您拥有实例的名称和密钥。您可以在 Azure 门户中实例的“密钥和端点”部分下找到密钥。然后，如果使用 Node.js，您可以将凭据设置为环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
AZURE_OPENAI_API_DEPLOYMENT_NAME=<YOUR_DEPLOYMENT_NAME>
AZURE_OPENAI_API_KEY=<YOUR_KEY>
AZURE_OPENAI_API_VERSION="2024-02-01"
```

如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain AzureChatOpenAI 集成位于 `@langchain/openai` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/openai @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/openai @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/openai @langchain/core
  ```
</CodeGroup>

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureChatOpenAI } from "@langchain/openai"

const llm = new AzureChatOpenAI({
    model: "gpt-5.5",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
})
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
  "id": "chatcmpl-9qrWKByvVrzWMxSn8joRZAklHoB32",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "completionTokens": 8,
      "promptTokens": 31,
      "totalTokens": 39
    },
    "finish_reason": "stop"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 31,
    "output_tokens": 8,
    "total_tokens": 39
  }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.content)
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore la programmation.
```

## 使用 Azure 托管身份

如果您使用的是 Azure 托管标识，则可以按如下方式配置凭据：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureChatOpenAI } from "@langchain/openai";

const credentials = new DefaultAzureCredential();
const azureADTokenProvider = getBearerTokenProvider(
  credentials,
  "https://cognitiveservices.azure.com/.default"
);

const llmWithManagedIdentity = new AzureChatOpenAI({
  azureADTokenProvider,
  azureOpenAIApiInstanceName: "<your_instance_name>",
  azureOpenAIApiDeploymentName: "<your_deployment_name>",
  azureOpenAIApiVersion: "<api_version>",
});
```

## 使用不同的域如果您的实例托管在默认 `openai.azure.com` 以外的域下，则需要使用备用 `AZURE_OPENAI_BASE_PATH` 环境变量。
例如，以下是连接到域 `https://westeurope.api.microsoft.com/openai/deployments/{DEPLOYMENT_NAME}` 的方法：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureChatOpenAI } from "@langchain/openai";

const llmWithDifferentDomain = new AzureChatOpenAI({
  temperature: 0.9,
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiDeploymentName: "<your_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  azureOpenAIBasePath:
    "https://westeurope.api.microsoft.com/openai/deployments", // In Node.js defaults to process.env.AZURE_OPENAI_BASE_PATH
});

```

## 自定义标头

您可以通过传入 `configuration` 字段来指定自定义标头：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureChatOpenAI } from "@langchain/openai";

const llmWithCustomHeaders = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  configuration: {
    defaultHeaders: {
      "x-custom-header": `SOME_VALUE`,
    },
  },
});

await llmWithCustomHeaders.invoke("Hi there!");
```

`configuration`字段还接受官方SDK接受的其他`ClientOptions`参数。

**注意：** 特定标头`api-key`目前无法以这种方式覆盖，并将传递来自`azureOpenAIApiKey`的值。

## 从 Azure OpenAI SDK 迁移

如果您将已弃用的 Azure OpenAI SDK 与 `@langchain/azure-openai` 包一起使用，则可以按照以下步骤更新代码以使用新的 Azure 集成：

1. 安装新的 `@langchain/openai` 软件包并删除之前的 `@langchain/azure-openai` 软件包：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/openai
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/openai
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/openai
  ```
</CodeGroup>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm uninstall @langchain/azure-openai
```

2. 更新您的导入以使用 `@langchain/openai` 包中的新 [⟦T35⟧](https://reference.langchain.com/javascript/langchain-openai/AzureChatOpenAI) 类：

   ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import { AzureChatOpenAI } from "@langchain/openai";
   ```

3. 更新代码以使用新的 [⟦T37⟧](https://reference.langchain.com/javascript/langchain-openai/AzureChatOpenAI) 类并传递所需的参数：

   ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   const model = new AzureChatOpenAI({
     azureOpenAIApiKey: "<your_key>",
     azureOpenAIApiInstanceName: "<your_instance_name>",
     azureOpenAIApiDeploymentName: "<your_deployment_name>",
     azureOpenAIApiVersion: "<api_version>",
   });
   ```

   请注意，构造函数现在需要 `azureOpenAIApiInstanceName` 参数而不是 `azureOpenAIEndpoint` 参数，并添加 `azureOpenAIApiVersion` 参数来指定 API 版本。* 如果您使用的是 Azure 托管身份，现在需要在构造函数中使用 `azureADTokenProvider` 参数，而不是 `credentials`，请参阅 [Azure Managed Identity](#using-azure-managed-identity) 部分了解更多详细信息。

   * 如果您之前使用环境变量，现在必须设置 `AZURE_OPENAI_API_INSTANCE_NAME` 环境变量而不是 `AZURE_OPENAI_API_ENDPOINT`，并添加 `AZURE_OPENAI_API_VERSION` 环境变量来指定 API 版本。

***

## API 参考

有关所有 `AzureChatOpenAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-openai/AzureChatOpenAI)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>