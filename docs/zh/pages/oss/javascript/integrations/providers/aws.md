<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS integrations | https://docs.langchain.com/oss/javascript/integrations/providers/aws -->

# AWS 集成

使用 LangChain JavaScript 与 AWS 集成。

与[Amazon AWS](https://aws.amazon.com/)平台相关的所有功能。

## 聊天模型

###基岩匡威

请参阅[usage example](/oss/javascript/integrations/chat/bedrock_converse)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatBedrockConverse } from "@langchain/aws";
```

## 文本嵌入模型

### 基岩

参见[usage example](/oss/javascript/integrations/embeddings/bedrock)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { BedrockEmbeddings } from "@langchain/aws";
```

## 猎犬

### Amazon Bedrock 知识库

参见[usage example](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AmazonKnowledgeBaseRetriever } from "@langchain/aws";
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>