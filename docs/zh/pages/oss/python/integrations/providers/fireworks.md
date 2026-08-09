<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fireworks integrations | https://docs.langchain.com/oss/python/integrations/providers/fireworks -->

# 烟花集成

使用 LangChain Python 与 Fireworks AI 集成。

[Fireworks AI](https://fireworks.ai/) 托管具有快速推理功能的开放和专有语言模型。 `langchain-fireworks`包实现了LangChain聊天和Fireworks API的嵌入接口。

## 安装和设置

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-fireworks
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-fireworks
  ```
</CodeGroup>

从 [fireworks.ai](https://app.fireworks.ai/login) 获取 API 密钥并设置 `FIREWORKS_API_KEY` 环境变量。

## 模型接口

<Columns>
  <Card title="ChatFireworks" href="/oss/python/integrations/chat/fireworks" icon="message">
    Fireworks AI 上托管的聊天模型的接口。
  </Card>

  <Card title="FireworksEmbeddings" href="/oss/python/integrations/embeddings/fireworks" icon="layers-difference">
    由 Fireworks AI 提供服务的嵌入模型。
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/fireworks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>