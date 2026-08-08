<!-- langchain-docs: Fireworks integrations | https://docs.langchain.com/oss/python/integrations/providers/fireworks -->

# Fireworks integrations

Integrate with Fireworks AI using LangChain Python.

[Fireworks AI](https://fireworks.ai/) hosts open and proprietary language models with fast inference. The `langchain-fireworks` package implements LangChain chat and embedding interfaces for the Fireworks API.

## Installation and setup

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-fireworks
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-fireworks
  ```
</CodeGroup>

Get an API key from [fireworks.ai](https://app.fireworks.ai/login) and set the `FIREWORKS_API_KEY` environment variable.

## Model interfaces

<Columns>
  <Card title="ChatFireworks" href="/oss/python/integrations/chat/fireworks" icon="message">
    Interface to chat models hosted on Fireworks AI.
  </Card>

  <Card title="FireworksEmbeddings" href="/oss/python/integrations/embeddings/fireworks" icon="layers-difference">
    Embedding models served by Fireworks AI.
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/fireworks.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>