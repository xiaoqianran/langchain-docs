<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Install LangChain | https://docs.langchain.com/oss/javascript/langchain/install -->

# 安装LangChain

为您使用的模型和集成安装 LangChain 包和独立提供程序包。

要安装 LangChain 软件包：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add langchain @langchain/core
  # Requires Bun v1.0.0+
  ```
</CodeGroup>

LangChain 提供与数百个法学硕士和数千个其他集成的集成。这些位于独立提供商包中。

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Installing the OpenAI integration
  npm install @langchain/openai
  # Installing the Anthropic integration
  npm install @langchain/anthropic
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Installing the OpenAI integration
  pnpm install @langchain/openai
  # Installing the Anthropic integration
  pnpm install @langchain/anthropic
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Installing the OpenAI integration
  yarn add @langchain/openai
  # Installing the Anthropic integration
  yarn add @langchain/anthropic
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Installing the OpenAI integration
  bun add @langchain/openai
  # Installing the Anthropic integration
  bun add @langchain/anthropic
  ```
</CodeGroup>

<Tip>
  有关可用集成的完整列表，请参阅 [Integrations tab](/oss/javascript/integrations/providers/overview)。
</Tip>

现在您已经安装了LangChain，您可以按照[Quickstart guide](/oss/javascript/langchain/quickstart)开始操作。

<Tip>
  设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-install) 跟踪来调试您的第一个 LangChain 应用程序。按照[tracing quickstart](/langsmith/trace-with-langchain)开始。我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/install.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>