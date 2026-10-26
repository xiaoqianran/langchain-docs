<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fireworks integrations | https://docs.langchain.com/oss/python/integrations/providers/fireworks -->

# 烟花集成

使用 LangChain Python 与 Fireworks AI 集成。

[Fireworks AI](https://fireworks.ai/) 托管具有快速推理功能的开放和专有语言模型。 `langchain-fireworks` 包实现了 Fireworks API 的 LangChain 聊天和嵌入接口。

## 安装和设置

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langchain-fireworks
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add langchain-fireworks
```

从 [fireworks.ai](https://app.fireworks.ai/login) 获取 API 密钥并设置 `FIREWORKS_API_KEY` 环境变量。

## 模型接口

> **[ChatFireworks](/oss/python/integrations/chat/fireworks)**
>
> Fireworks AI 上托管的聊天模型的界面。

> **[FireworksEmbeddings](/oss/python/integrations/embeddings/fireworks)**
>
> 由 Fireworks AI 提供服务的嵌入模型。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/fireworks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。