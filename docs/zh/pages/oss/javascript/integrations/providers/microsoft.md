<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/javascript/integrations/providers/microsoft -->

# 微软集成

使用 LangChain JavaScript 与 Microsoft 集成。

与`Microsoft Azure`和其他`Microsoft`产品相关的所有功能。

## 聊天模型

### Azure OpenAI

查看[usage example](/oss/javascript/integrations/chat/azure)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureChatOpenAI } from "@langchain/openai";

const model = new AzureChatOpenAI({
  temperature: 0.9,
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: "<your_instance_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: "<your_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
});
```

## 法学硕士

### Azure OpenAI

> [Microsoft Azure](https://en.wikipedia.org/wiki/Microsoft_Azure)，通常简称为`Azure`，是`Microsoft`运行的云计算平台，通过全球数据中心提供应用程序和服务的访问、管理和开发。它提供了一系列功能，包括软件即服务 (SaaS)、平台即服务 (PaaS) 和基础设施即服务 (IaaS)。 `Microsoft Azure` 支持多种编程语言、工具和框架，包括 Microsoft 特定和第三方软件和系统。

> [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 是一项云服务，可帮助您使用 OpenAI、Meta 等多种预构建和策划的模型快速开发生成式 AI 体验。

LangChain.js 支持使用 [OpenAI SDK](https://github.com/openai/openai-node) 中新的 Azure 集成与 [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service/) 集成。

您可以在[this page](https://learn.microsoft.com/azure/ai-services/openai/overview)了解更多有关Azure OpenAI及其与OpenAI API的区别。如果您没有 Azure 帐户，可以[create a free account](https://azure.microsoft.com/free/) 开始。您需要部署一个 Azure OpenAI 实例。您可以按照[this guide](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource?pivots=web-portal)在Azure门户上部署版本。

实例运行后，请确保您拥有实例的名称和密钥。您可以在 Azure 门户中实例的“密钥和端点”部分下找到密钥。

如果您使用 Node.js，则可以定义以下环境变量来使用该服务：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
AZURE_OPENAI_API_DEPLOYMENT_NAME=<YOUR_DEPLOYMENT_NAME>
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=<YOUR_EMBEDDINGS_DEPLOYMENT_NAME>
AZURE_OPENAI_API_KEY=<YOUR_KEY>
AZURE_OPENAI_API_VERSION="2024-02-01"
```

<Info>
  **您可以在[Azure OpenAI documentation](https://learn.microsoft.com/azure/ai-services/openai/reference)中找到支持的API版本列表。**
</Info>

<Tip>
  参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。
</Tip>

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/openai @langchain/core
```

请参阅[usage example](/oss/javascript/integrations/llms/azure)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureOpenAI } from "@langchain/openai";

const model = new AzureOpenAI({
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: "<your_instance_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: "<your_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
});
```

## 文本嵌入模型

### Azure OpenAI

查看[usage example](/oss/javascript/integrations/embeddings/azure_openai)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const model = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: "<your_key>", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: "<your_instance_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiEmbeddingsDeploymentName: "<your_embeddings_deployment_name>", // In Node.js defaults to process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "<api_version>", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
});
```

## 向量存储

### 适用于 NoSQL 的 Azure cosmos DB

> [Azure Cosmos DB for NoSQL](https://learn.microsoft.com/azure/cosmos-db/nosql/) 提供对具有灵活模式的查询项目的支持以及对 JSON 的本机支持。它现在提供矢量索引和搜索。此功能旨在处理高维向量，从而实现任何规模的高效、准确的向量搜索。现在，您可以将向量与数据一起直接存储在文档中。数据库中的每个文档不仅可以包含传统的无模式数据，还可以包含高维向量作为文档的其他属性。

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/azure-cosmosdb @langchain/core
```

请参阅[usage example](/oss/javascript/integrations/vectorstores/azure_cosmosdb_nosql)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureCosmosDBNoSQLVectorStore } from "@langchain/azure-cosmosdb";
```

### Azure DocumentDB> [Azure DocumentDB](https://learn.microsoft.com/azure/documentdb/)（以前称为 Azure Cosmos DB for MongoDB vCore）可以轻松创建具有完整本机 MongoDB 支持的数据库。通过将应用程序指向连接字符串，您可以应用您的 MongoDB 经验并继续使用您最喜欢的 MongoDB 驱动程序、SDK 和工具。使用 Azure DocumentDB 中的矢量搜索将基于 AI 的应用程序与存储在 Azure DocumentDB 中的数据无缝集成。

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/azure-cosmosdb @langchain/core
```

请参阅[usage example](/oss/javascript/integrations/vectorstores/azure_documentdb)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureDocumentDBVectorStore } from "@langchain/azure-cosmosdb";
```

## 语义缓存

### Azure cosmos DB NoSQL 语义缓存

> Azure Cosmos DB 支持 NoSQL 集成的语义缓存功能，使用户能够根据用户输入与之前缓存的结果之间的语义相似性来检索缓存的响应。它利用 [AzureCosmosDBNoSQLVectorStore](/oss/javascript/integrations/vectorstores/azure_cosmosdb_nosql)，它存储缓存提示的向量嵌入。这些嵌入支持基于相似性的搜索，允许系统检索相关的缓存结果。

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/azure-cosmosdb @langchain/core
```

请参阅[usage example](/oss/javascript/integrations/llm_caching/azure_cosmosdb_nosql)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AzureCosmosDBNoSQLSemanticCache } from "@langchain/azure-cosmosdb";
```

## 工具

### Azure 容器应用程序动态会话

> [Azure Container Apps dynamic sessions](https://learn.microsoft.com/azure/container-apps/sessions) 提供对安全沙盒环境的快速访问，该环境非常适合运行需要与其他工作负载强隔离的代码或应用程序。

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/azure-dynamic-sessions @langchain/core
```

请参阅[usage example](/oss/javascript/integrations/tools/azure_dynamic_sessions)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { SessionsPythonREPLTool } from "@langchain/azure-dynamic-sessions";
```

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/microsoft.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>