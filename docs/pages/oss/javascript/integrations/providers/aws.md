<!-- langchain-docs: AWS integrations | https://docs.langchain.com/oss/javascript/integrations/providers/aws -->

# AWS integrations

Integrate with AWS using LangChain JavaScript.

All functionality related to the [Amazon AWS](https://aws.amazon.com/) platform.

## Chat models

### Bedrock Converse

See a [usage example](/oss/javascript/integrations/chat/bedrock_converse).

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatBedrockConverse } from "@langchain/aws";
```

## Text embedding models

### Bedrock

See a [usage example](/oss/javascript/integrations/embeddings/bedrock).

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { BedrockEmbeddings } from "@langchain/aws";
```

## Retrievers

### Knowledge bases for Amazon Bedrock

See a [usage example](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases).

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AmazonKnowledgeBaseRetriever } from "@langchain/aws";
```

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/aws.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>