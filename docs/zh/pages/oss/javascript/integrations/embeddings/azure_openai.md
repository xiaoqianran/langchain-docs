<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AzureOpenAIEmbeddings integration | https://docs.langchain.com/oss/javascript/integrations/embeddings/azure_openai -->

# AzureOpenAIEmbeddings 集成

使用 LangChain JavaScript 与 AzureOpenAIEmbeddings 嵌入模型集成。

[Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 是一项云服务，可帮助您使用 OpenAI、Meta 等多种预构建和策划的模型快速开发生成式 AI 体验。

LangChain.js 支持使用 [OpenAI SDK](https://github.com/openai/openai-node) 中新的 Azure 集成与 [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 集成。

您可以在[this page](https://learn.microsoft.com/azure/ai-services/openai/overview)上了解更多有关Azure OpenAI及其与OpenAI API的区别。如果您没有 Azure 帐户，可以[create a free account](https://azure.microsoft.com/free/) 开始。

这将帮助您开始使用 LangChain 来使用 AzureOpenAIEmbeddings [embedding models](/oss/javascript/integrations/embeddings)。有关`AzureOpenAIEmbeddings`功能和配置选项的详细文档，请参阅[API reference](https://reference.langchain.com/javascript/langchain-openai/AzureOpenAIEmbeddings)。

<Info>
  **此前，LangChain.js 支持使用专用的[Azure OpenAI SDK](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/openai/openai) 与 Azure OpenAI 集成。该 SDK 现已弃用，取而代之的是 OpenAI SDK 中的新 Azure 集成，它允许在最新的 OpenAI 模型和功能发布当天访问它们，并允许 OpenAI API 和 Azure OpenAI 之间的无缝过渡。**

  如果您将 Azure OpenAI 与已弃用的 SDK 结合使用，请参阅 [migration guide](#migration-from-azure-openai-sdk) 更新到新的 API。
</Info>

## 概述### 集成细节

|班级 |套餐 |本地| [Py support](https://python.langchain.com/docs/integrations/embeddings/azure_openai/) |                                             下载 |                                             版本 |
| :------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------- | :---: | :------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| [⟦T19⟧](https://reference.langchain.com/javascript/langchain-openai/AzureOpenAIEmbeddings) | [⟦T20⟧](https://www.npmjs.com/package/@langchain/openai) |   ❌ |                                           ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/openai?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/openai?style=flat-square\&label=%20&) |

## 设置

要访问 Azure OpenAI 嵌入模型，您需要创建 Azure 帐户、获取 API 密钥并安装 `@langchain/openai` 集成包。### 凭证

您需要部署一个 Azure OpenAI 实例。您可以在 Azure 门户上部署以下[this guide](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource?pivots=web-portal) 的版本。

实例运行后，请确保您拥有实例的名称和密钥。您可以在 Azure 门户中实例的“密钥和端点”部分下找到密钥。

如果您使用 Node.js，则可以定义以下环境变量来使用该服务：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=<YOUR_EMBEDDINGS_DEPLOYMENT_NAME>
AZURE_OPENAI_API_KEY=<YOUR_KEY>
AZURE_OPENAI_API_VERSION="2024-02-01"
```

如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain AzureOpenAIEmbeddings 集成位于 `@langchain/openai` 包中：

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

<Info>
  **您可以在[Azure OpenAI documentation](https://learn.microsoft.com/azure/ai-services/openai/reference)中找到支持的API版本列表。**
</Info>

<Tip>
  **如果未定义 `AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME`，它将回退到部署名称的 `AZURE_OPENAI_API_DEPLOYMENT_NAME` 值。这同样适用于 `AzureOpenAIEmbeddings` 构造函数中的 `azureOpenAIApiEmbeddingsDeploymentName` 参数，如果未定义，它将回退到 `azureOpenAIApiDeploymentName` 的值。**
</Tip>

## 实例化

现在我们可以实例化模型对象并嵌入文本：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: "<your_instance_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiEmbeddingsDeploymentName: "<your_embeddings_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  maxRetries: 1,
});
```

## 索引和检索嵌入模型通常用于检索增强生成（RAG）流程，既作为索引数据的一部分，也作为稍后检索数据的一部分。有关更详细的说明，请参阅[**Learn** tab](/oss/javascript/learn/)下的 RAG 教程。

下面，看看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在此示例中，我们将使用演示 [⟦T29⟧](/oss/javascript/integrations/vectorstores/memory) 索引和检索示例文档。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Create a vector store with a sample text
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const text = "LangChain is the framework for building context-aware reasoning applications";

const vectorstore = await MemoryVectorStore.fromDocuments(
  [{ pageContent: text, metadata: {} }],
  embeddings,
);

// Use the vector store as a retriever that returns a single document
const retriever = vectorstore.asRetriever(1);

// Retrieve the most similar text
const retrievedDocuments = await retriever.invoke("What is LangChain?");

retrievedDocuments[0].pageContent;
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LangChain is the framework for building context-aware reasoning applications
```

## 直接使用

在底层，向量存储和检索器实现调用 `embeddings.embedDocument(...)` 和 `embeddings.embedQuery(...)` 分别为 `fromDocuments` 和检索器的 `invoke` 操作中使用的文本创建嵌入。

您可以直接调用这些方法来获取适合您自己的用例的嵌入。

### 嵌入单个文本

您可以使用 `embedQuery` 嵌入查询以进行搜索。这会生成特定于查询的向量表示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const singleVector = await embeddings.embedQuery(text);

console.log(singleVector.slice(0, 100));
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
   -0.024253517, -0.0054218727,   0.048715446,   0.020580322,    0.03180832,
   0.0028770117,  -0.012367731,   0.037383243,  -0.054915592,   0.032225136,
     0.00825818,  -0.023888804,   -0.01184671,   0.012257014,   0.016294925,
    0.009254632,  0.0051353113,  -0.008889917,   0.016855022,    0.04207243,
  0.00082589936,  -0.011664353,    0.00818654,   0.029020859,  -0.012335167,
   -0.019603407,  0.0013945447,    0.05538451,  -0.011625277,  -0.008153976,
    0.038607642,   -0.03811267, -0.0074440846,   0.047647353,   -0.00927417,
    0.024201415, -0.0069230637,  -0.008538228,   0.003910912,   0.052805457,
   -0.023159374,  0.0014352495,  -0.038659744,   0.017141584,   0.005587948,
    0.007971618,  -0.016920151,    0.06658646, -0.0016916894,   0.045667473,
   -0.042202685,   -0.03983204,   -0.04160351,  -0.011729481,  -0.055905532,
    0.012543576,  0.0038848612,   0.007919516,   0.010915386,  0.0033117384,
   -0.007548289,  -0.030427614,  -0.041890074,   0.036002535,  -0.023771575,
   -0.008792226,  -0.049444873,   0.016490309, -0.0060568666,   0.040196754,
    0.014106638,  -0.014575557, -0.0017356506,  -0.011234511,  -0.012517525,
    0.008362384,    0.01253055,   0.036158845,   0.008297256, -0.0010908874,
   -0.014888169,  -0.020489143,   0.018965157,  -0.057937514, -0.0037122732,
    0.004402626,   -0.00840146,   0.042984217,   -0.04936672,   -0.03714878,
    0.004969236,    0.03707063,   0.015396165,   -0.02055427,    0.01988997,
    0.030219207,  -0.021257648,    0.01340326,   0.003692735,   0.012595678
]
```

### 嵌入多个文本

您可以使用 `embedDocuments` 嵌入多个文本进行索引。此方法使用的内部结构可能（但不一定）与嵌入查询不同：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const text2 = "LangGraph is a library for building stateful, multi-actor applications with LLMs";

const vectors = await embeddings.embedDocuments([text, text2]);

console.log(vectors[0].slice(0, 100));
console.log(vectors[1].slice(0, 100));
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
   -0.024253517, -0.0054218727,   0.048715446,   0.020580322,    0.03180832,
   0.0028770117,  -0.012367731,   0.037383243,  -0.054915592,   0.032225136,
     0.00825818,  -0.023888804,   -0.01184671,   0.012257014,   0.016294925,
    0.009254632,  0.0051353113,  -0.008889917,   0.016855022,    0.04207243,
  0.00082589936,  -0.011664353,    0.00818654,   0.029020859,  -0.012335167,
   -0.019603407,  0.0013945447,    0.05538451,  -0.011625277,  -0.008153976,
    0.038607642,   -0.03811267, -0.0074440846,   0.047647353,   -0.00927417,
    0.024201415, -0.0069230637,  -0.008538228,   0.003910912,   0.052805457,
   -0.023159374,  0.0014352495,  -0.038659744,   0.017141584,   0.005587948,
    0.007971618,  -0.016920151,    0.06658646, -0.0016916894,   0.045667473,
   -0.042202685,   -0.03983204,   -0.04160351,  -0.011729481,  -0.055905532,
    0.012543576,  0.0038848612,   0.007919516,   0.010915386,  0.0033117384,
   -0.007548289,  -0.030427614,  -0.041890074,   0.036002535,  -0.023771575,
   -0.008792226,  -0.049444873,   0.016490309, -0.0060568666,   0.040196754,
    0.014106638,  -0.014575557, -0.0017356506,  -0.011234511,  -0.012517525,
    0.008362384,    0.01253055,   0.036158845,   0.008297256, -0.0010908874,
   -0.014888169,  -0.020489143,   0.018965157,  -0.057937514, -0.0037122732,
    0.004402626,   -0.00840146,   0.042984217,   -0.04936672,   -0.03714878,
    0.004969236,    0.03707063,   0.015396165,   -0.02055427,    0.01988997,
    0.030219207,  -0.021257648,    0.01340326,   0.003692735,   0.012595678
]
[
   -0.033366997,   0.010419146,  0.0118083665,  -0.040441725, 0.0020355924,
   -0.015808804,  -0.023629595, -0.0066180876,  -0.040004376,  0.020053642,
  -0.0010797002,   -0.03900105,  -0.009956073,  0.0027896944,  0.003305828,
   -0.034010153,   0.009833873,  0.0061164247,   0.022536227,  0.029147884,
    0.017789727,    0.03182342,   0.010869357,   0.031849146, -0.028093107,
    0.008283865, -0.0145610785,    0.01645196,  -0.029430874,  -0.02508313,
    0.046178687,   -0.01722375,  -0.010046115,   0.013101112, 0.0044538635,
     0.02197025,    0.03985002,   0.007955855,  0.0008819293,  0.012657333,
    0.014368132,  -0.014007963,   -0.03722594,   0.031617608, -0.011570398,
    0.039052505,  0.0020018267,   0.023706773, -0.0046950476,  0.056083307,
    -0.08412496,  -0.043425974,  -0.015512952,   0.015950298,  -0.03624834,
  -0.0053317733,  -0.037251666,  0.0046339477,    0.04193385,  0.023475237,
   -0.021378545,   0.013699248,  -0.026009277,   0.050757967,   -0.0494202,
   0.0007874656,   -0.07208506,   0.015885983,  -0.003259199,  0.015127057,
   0.0068946453,  -0.035373647,  -0.005875241, -0.0032238255,  -0.04185667,
   -0.022047428,  0.0014326327, -0.0070940237, -0.0027864785, -0.016271876,
    0.005097021,   0.034473225,   0.012361481,  -0.026498076, 0.0067274245,
   -0.026330855,  -0.006132504,   0.008180959,  -0.049368747, -0.032337945,
    0.011049441,    0.00186194,  -0.012097787,    0.01930758,   0.07059293,
    0.029713862,    0.04337452, -0.0048461896,  -0.019976463,  0.011473924
]
```

## 使用 Azure 托管身份

如果您使用的是 Azure 托管标识，则可以按如下方式配置凭据：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const credentials = new DefaultAzureCredential();
const azureADTokenProvider = getBearerTokenProvider(
  credentials,
  "https://cognitiveservices.azure.com/.default"
);

const modelWithManagedIdentity = new AzureOpenAIEmbeddings({
  azureADTokenProvider,
  azureOpenAIApiInstanceName: "<your_instance_name>",
  azureOpenAIApiEmbeddingsDeploymentName: "<your_embeddings_deployment_name>",
  azureOpenAIApiVersion: "<api_version>",
});

```

## 使用不同的域如果您的实例托管在默认 `openai.azure.com` 以外的域下，则需要使用备用 `AZURE_OPENAI_BASE_PATH` 环境变量。
例如，以下是连接到域 `https://westeurope.api.microsoft.com/openai/deployments/{DEPLOYMENT_NAME}` 的方法：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const embeddingsDifferentDomain = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiEmbeddingsDeploymentName: "<your_embedding_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  azureOpenAIBasePath:
    "https://westeurope.api.microsoft.com/openai/deployments", // In Node.js defaults to process.env.AZURE_OPENAI_BASE_PATH
});

```

## 自定义标头

您可以通过传入 `configuration` 字段来指定自定义标头：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const embeddingsWithCustomHeaders = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: "<your_key>",
  azureOpenAIApiInstanceName: "<your_instance_name>",
  azureOpenAIApiEmbeddingsDeploymentName: "<your_embeddings_deployment_name>",
  azureOpenAIApiVersion: "<api_version>",
  configuration: {
    defaultHeaders: {
      "x-custom-header": `SOME_VALUE`,
    },
  },
});
```

`configuration`字段还接受官方SDK接受的其他`ClientOptions`参数。

**注意：** 特定标头`api-key`目前无法以这种方式覆盖，并将传递来自`azureOpenAIApiKey`的值。

## 从 Azure OpenAI SDK 迁移

如果您将已弃用的 Azure OpenAI SDK 与 `@langchain/azure-openai` 包一起使用，则可以按照以下步骤更新代码以使用新的 Azure 集成：

1. 安装新的 `@langchain/openai` 软件包并删除之前的 `@langchain/azure-openai` 软件包：

   ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   npm install @langchain/openai
   npm uninstall @langchain/azure-openai
   ```

2. 更新您的导入以使用 `@langchain/openai` 包中的新 `AzureOpenAIEmbeddings` 类：

   ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import { AzureOpenAIEmbeddings } from "@langchain/openai";
   ```

3. 更新代码以使用新的 `AzureOpenAIEmbeddings` 类并传递所需的参数：

   ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   const model = new AzureOpenAIEmbeddings({
     azureOpenAIApiKey: "<your_key>",
     azureOpenAIApiInstanceName: "<your_instance_name>",
     azureOpenAIApiEmbeddingsDeploymentName:
       "<your_embeddings_deployment_name>",
     azureOpenAIApiVersion: "<api_version>",
   });
   ```

   请注意，构造函数现在需要 `azureOpenAIApiInstanceName` 参数而不是 `azureOpenAIEndpoint` 参数，并添加 `azureOpenAIApiVersion` 参数来指定 API 版本。* 如果您使用的是 Azure 托管身份，现在需要在构造函数中使用 `azureADTokenProvider` 参数，而不是 `credentials`，请参阅 [Azure Managed Identity](#using-azure-managed-identity) 部分了解更多详细信息。

   * 如果您之前使用环境变量，现在必须设置 `AZURE_OPENAI_API_INSTANCE_NAME` 环境变量而不是 `AZURE_OPENAI_API_ENDPOINT`，并添加 `AZURE_OPENAI_API_VERSION` 环境变量来指定 API 版本。

***

## API 参考

有关所有 `AzureOpenAIEmbeddings` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-openai/AzureOpenAIEmbeddings)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/embeddings/azure_openai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>