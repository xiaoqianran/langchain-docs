<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Using standard tests | https://docs.langchain.com/oss/javascript/contributing/standard-tests-langchain -->

# 使用标准测试

**标准测试确保您的集成按预期工作。**

当为自己创建自定义类或在 LangChain 集成中发布时，有必要添加测试以确保其按预期工作。 LangChain为您提供了针对每种集成类型的全面的[set of tests](https://pypi.org/project/langchain-tests/)。本指南将向您展示如何将LangChain的标准测试套件添加到每种集成类型中。

## 设置

首先，安装所需的依赖项：

<CardGroup>
  <Card title="langchain-core" icon="cube" href="https://github.com/langchain-ai/langchainjs/tree/main/langchain-core#readme">
    定义我们想要导入的接口来定义我们的自定义组件
  </Card>

  <Card title="langchain-tests" icon="flask" href="https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-standard-tests#readme">
    提供运行它们所需的标准测试和插件
  </Card>
</CardGroup>

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/core
  npm install @langchain/standard-tests
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/core
  pnpm add @langchain/standard-tests
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/core
  yarn add @langchain/standard-tests
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/core
  bun add @langchain/standard-tests
  ```
</CodeGroup>

`langchain-tests`包中有2个命名空间：

<AccordionGroup>
  <Accordion title="Unit tests" icon="settings">
    **地点**：`src.unit_tests`

    旨在隔离测试组件，无需访问外部服务

    [View API reference](https://reference.langchain.com/python/langchain_tests/unit_tests)
  </Accordion>

  <Accordion title="Integration tests" icon="network">
    **地点**：`src.integration_tests`

    旨在测试可访问外部服务的组件（特别是组件设计用于交互的外部服务）

    [View API reference](https://reference.langchain.com/python/langchain_tests/integration_tests)
  </Accordion>
</AccordionGroup>

## 实施标准测试根据您的集成类型，您需要实施单元测试和集成测试之一或两者。

通过对集成类型的标准测试套件进行子类化，您可以获得该类型的标准测试的完整集合。为了使测试运行成功，只有当模型支持正在测试的功能时，给定的测试才应该通过。否则，应跳过测试。

由于不同的集成提供独特的功能集，因此 LangChain 提供的大多数标准测试都是**默认选择**以防止误报。因此，您需要重写属性来指示您的集成支持哪些功能 - 请参阅下面的示例以获取说明。

```javascript tests/chat_models.standard.int.test.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Indicate that a chat model supports parallel tool calls

class ChatParrotLinkStandardIntegrationTests extends ChatModelIntegrationTests<
    ChatParrotLinkCallOptions,
    AIMessageChunk
> {
    constructor() {
        // ... other required properties

        super({
            // ... other required properties
            supportsParallelToolCalls: true,  // (The default is False)
            // ...
        });
    }
```

<Note>
  您应该在相对于包根目录的这些子目录中组织测试：

  * `tests/unit_tests` 用于单元测试
  * `tests/integration_tests` 用于集成测试
</Note>

要查看可配置功能及其默认值的完整列表，请参阅[Implementing standard tests](/oss/javascript/contributing/standard-tests-langchain#implementing-standard-tests)。

## 沙盒集成

Deep Agents 沙箱集成使用 `@langchain/sandbox-standard-tests` 中的 `sandboxStandardTests`。
使用包含 `createSandbox`、`resolvePath` 和 `closeSandbox` 的配置对象调用它。
使用 [Daytona integration tests](https://github.com/langchain-ai/deepagentsjs/blob/main/libs/providers/daytona/src/sandbox.int.test.ts) 作为参考实现。
请参阅[Contributing a sandbox integration](/oss/javascript/contributing/integrations-langchain)了解发布指南。

***## 故障排除

有关可用标准测试套件的完整列表，以及有关包含哪些测试以及如何解决常见问题的信息，请参阅[contributing README](https://github.com/langchain-ai/langchainjs/blob/main/CONTRIBUTING.md)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/standard-tests-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>