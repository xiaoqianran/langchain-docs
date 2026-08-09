<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monorepo support | https://docs.langchain.com/langsmith/monorepo-support -->

# Monorepo 支持

LangSmith 支持从 monorepo 设置部署代理，其中您的代理代码可能依赖于存储库中其他位置的共享包。本指南展示了如何构建 monorepo 并配置 `langgraph.json` 文件以使用共享依赖项。

## 存储库结构

有关完整的工作示例，请参阅：

* [Python monorepo example](https://github.com/langchain-ai/python-langraph-monorepo-example)
* [JS monorepo example](https://github.com/langchain-ai/js-langgraph-monorepo-example)

<CodeGroup>
  ```plaintext Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  my-monorepo/
  ├── shared-utils/           # Shared Python package
  │   ├── __init__.py
  │   ├── common.py
  │   └── pyproject.toml      # Or setup.py
  ├── agents/
  │   └── customer-support/   # Agent directory
  │       ├── agent/
  │       │   ├── __init__.py
  │       │   └── graph.py
  │       ├── langgraph.json  # Config file in agent directory
  │       ├── .env
  │       └── pyproject.toml  # Agent dependencies
  └── other-service/
      └── ...
  ```

  ```plaintext JS theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  my-monorepo/
  ├── package.json            # Root package.json with workspaces
  ├── shared-utils/           # Shared TypeScript package
  │   ├── package.json
  │   ├── src/
  │   │   └── index.ts
  │   └── tsconfig.json
  ├── agents/
  │   └── customer-support/   # Agent directory
  │       ├── src/
  │       │   └── agent.ts
  │       ├── langgraph.json  # Config file in agent directory
  │       ├── package.json    # Agent dependencies
  │       ├── .env
  │       └── tsconfig.json
  └── other-service/
      └── ...
  ```
</CodeGroup>

## LangGraph.json 配置

将 langgraph.json 文件放在代理的目录中（而不是 monorepo 根目录中）。确保文件遵循所需的结构：

<CodeGroup>
  ```json Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  {
    "dependencies": [
      ".",                    # Current agent package
      "../../shared-utils"    # Relative path to shared package
    ],
    "graphs": {
      "customer_support": "./agent/graph.py:graph"
    },
    "env": ".env"
  }
  ```

  ```json JS theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  {
    "node_version": "20",
    "graphs": {
      "customer_support": "./src/agent.ts:graph"
    },
    "env": ".env"
  }
  ```
</CodeGroup>

Python 实现通过以下方式自动处理父目录中的包：

* 检测以`"."`开头的相对路径。
* 根据需要将父目录添加到 Docker 构建上下文。
* 支持真实包（带有`pyproject.toml`/`setup.py`）和简单的Python模块。

对于 JavaScript monorepos：

* 共享工作区依赖项由包管理器自动解决。
* 您的 `package.json` 应使用工作区语法引用共享包。

代理目录中的`package.json`示例：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "customer-support-agent",
  "dependencies": {
    "@company/shared-utils": "workspace:*",
    "@langchain/langgraph": "^0.2.0"
  }
}
```

## 构建应用程序

运行`langgraph build`：

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  cd agents/customer-support
  langgraph build -t my-customer-support-agent
  ```

  ```bash JS theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Run from the root of the monorepo
  langgraph build -t my-customer-support-agent -c agents/customer-support/langgraph.json
  ```
</CodeGroup>

Python 构建过程：1.自动检测相对依赖路径。
2. 将共享包复制到 Docker 构建上下文中。
3. 按正确的顺序安装所有依赖项。
4. 不需要特殊标志或命令。

JavaScript 构建过程：

1. 使用您称为 `langgraph build` 的目录（在本例中为 monorepo 根目录）作为构建上下文。
2. 自动检测您的包管理器（yarn、npm、pnpm、bun）。
3. 根据您的项目配置运行适当的安装流程。
4. 使用包含`langgraph.json`的目录来定位正在构建的应用程序。

## 提示和最佳实践

1. **将代理配置保留在代理目录中**：将 `langgraph.json` 文件放置在特定代理目录中，而不是放在 monorepo 根目录中。这允许您在同一个 monorepo 中支持多个代理，而不必将它们全部部署在同一个 LangSmith 部署中。

2. **对Python使用相对路径**：对于Python monorepos，使用相对路径，如`dependencies`数组中的`"../../shared-package"`。

3. **利用 JS 的工作区功能**：对于 JavaScript/TypeScript，使用包管理器的工作区功能来管理包之间的依赖关系。4. **首先在本地测试**：在部署之前始终在本地测试您的构建，以确保正确解决所有依赖项。

5. **环境变量**：将环境文件 (`.env`) 保存在代理目录中，以进行特定于环境的配置。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/monorepo-support.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>