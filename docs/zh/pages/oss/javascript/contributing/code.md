<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Contributing to code | https://docs.langchain.com/oss/javascript/contributing/code -->

# 贡献代码

欢迎贡献代码！无论您是修复错误、添加功能还是提高性能，您的贡献都有助于为成千上万的开发人员提供更好的开发体验。

## 开始使用

如果您正在寻找解决方案，请查看我们的存储库中标记为“需要帮助”的问题：

<Columns>
  <Card title="LangChain" icon="link" href="https://github.com/langchain-ai/deepagents/labels?q=help+wanted">标签</Card>
  <Card title="LangGraph" icon="topology-ring" href="https://github.com/langchain-ai/langgraphjs/labels?q=help+wanted">标签</Card>
  <Card title="Deep Agents" icon="robot" href="https://github.com/langchain-ai/deepagentsjs/labels?q=help+wanted">标签</Card>
</Columns>

<Note>
  在提交大型**新功能或重构**之前，请先打开问题或发帖到[the forum](https://forum.langchain.com/)进行讨论。这可确保与项目目标保持一致并防止重复工作。
</Note>

### 快速修复：提交错误修复

对于简单的错误修复，您可以立即开始：

<Steps>
  <Step title="Reproduce the issue">
    在克隆存储库之前，请确保您可以可靠地重现错误。这有助于确认问题并为您的修复提供起点。维护者和其他贡献者应该能够根据您的描述重现问题，而无需进行额外的设置或修改。
  </Step>

  <Step title="Fork the repository">
    将 [LangChain](https://github.com/langchain-ai/langchainjs)、[LangGraph](https://github.com/langchain-ai/langgraphjs) 或 [Deep Agents](https://github.com/langchain-ai/deepagentsjs) 存储库分叉到您的 <Tooltip>个人 GitHub 帐户</Tooltip>
  </Step>

  <Step title="Clone and setup">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    git clone https://github.com/your-username/name-of-forked-repo.git

    # For instance, for LangChain:
    git clone https://github.com/parrot123/langchainjs.git

    # For LangGraph:
    git clone https://github.com/parrot123/langgraphjs.git
    ```

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Inside your repo, install dependencies
    pnpm install
    # Create a build for all packages to resolve workspace dependencies
    pnpm build
    ```
  </Step><Step title="Create a branch">
    为您的修复创建一个新分支。这有助于让您的更改井井有条，并使以后提交拉取请求变得更加容易。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    git checkout -b your-username/short-bugfix-name
    ```
  </Step>

  <Step title="Write failing tests">
    添加 [unit tests](#test-writing-guidelines)，如果不修复，它将会失败。这使我们能够验证错误是否已解决并防止回归
  </Step>

  <Step title="Make your changes">
    遵循我们的[code quality standards](#code-quality-standards)修复错误。进行**最少的必要更改**来解决问题。我们强烈鼓励贡献者在开始编码之前对该问题发表评论。例如：

    > *“我想解决这个问题。我的预期方法是\[...简要描述...]。这符合维护者的期望吗？”*

    如果您最初的方法是错误的，30 秒的评论通常可以避免浪费精力。
  </Step>

  <Step title="Run build">
    运行构建命令以确保包仍然可以正确构建

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm build
    # or build a specific workspace package
    pnpm --filter @langchain/core build
    ```
  </Step>

  <Step title="Verify the fix">
    确保测试通过并且不引入回归。在提交 PR 之前确保所有测试在本地通过

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm lint
    pnpm test

    # For bugfixes involving integrations, also run:
    pnpm test:int

    # Or run tests in a specific workspace package
    cd libs/langchain-core
    pnpm test
    pnpm lint

    # Or run tests for a specific package from the root of the repo
    pnpm --filter @langchain/core test
    pnpm --filter @langchain/core lint
    ```
  </Step>

  <Step title="Document the change">
    如果行为发生变化，请更新文档字符串和/或内联注释
  </Step><Step title="Submit a pull request">
    请遵循提供的 PR 模板。如果适用，请使用 [closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)（例如 `Fixes #ISSUE_NUMBER`）引用您正在修复的问题，以便在合并您的 PR 时自动关闭该问题。
  </Step>
</Steps>

### 完整的开发设置

对于持续开发或更大贡献：

1. 查看我们的 [contribution guidelines](#contribution-guidelines) 的功能、错误修复和集成
2. 按照下面的[setup guide](#development-environment)设置您的环境
3. 了解[repository structure](#repository-structure)和包组织
4.了解我们的[development workflow](#development-workflow)，包括测试和检查

***

## 贡献指南

在开始为 LangChain 项目做出贡献之前，请花点时间思考一下您为什么想要这样做。如果您的唯一目标是在简历中添加“第一次贡献”（或者如果您只是寻求快速获胜），那么您最好参加训练营或在线教程。

为开源项目做出贡献需要时间和精力，但它也可以帮助您成为更好的开发人员并学习新技能。然而，重要的是要知道这可能比参加培训课程更难、更慢。也就是说，如果您愿意花时间把事情做好，那么为开源做出贡献是值得的！

### 向后兼容性<Warning>
  除关键安全修复外，不允许对公共 API 进行重大更改。

  有关主要版本发布的详细信息，请参阅我们的[versioning policy](/oss/javascript/versioning)。
</Warning>

通过以下方式保持兼容性：

<AccordionGroup>
  <Accordion title="Stable interfaces">
    **始终保留**：

    * 函数签名和参数名称
    * 类接口和方法名
    * 返回值结构和类型
    * 公共API的导入路径
  </Accordion>

  <Accordion title="Safe changes">
    **可接受的修改**：

    * 添加新的可选参数/类型参数

    * 向类添加新方法

    * 在不改变行为的情况下提高性能

    * 添加新的模块或功能
  </Accordion>

  <Accordion title="Before making changes">
    * **这会破坏现有的用户代码吗？**

    * 检查你的目标是否是公开的

    * 测试中是否存在现有的使用模式？
  </Accordion>
</AccordionGroup>

### 新功能

我们的目标是保持新功能的高标准。如果现有问题表明对外部贡献者的新核心抽象有迫切的需求，我们通常不会接受它们。这也适用于基础设施和依赖项的更改。

一般来说，功能贡献要求包括：

<Steps>
  <Step title="Design discussion">
    打开一个问题描述：* 你要解决的问题
    * 提议的API设计
    * 预期的使用模式
  </Step>

  <Step title="Implementation">
    * 遵循现有的代码模式
    * 包括全面的测试和文档
    * 考虑安全隐患
  </Step>

  <Step title="Integration considerations">
    * 这如何与现有功能交互？
    * 对性能有影响吗？
    * 这会引入新的依赖关系吗？

    我们将拒绝可能导致安全漏洞或报告的功能。
  </Step>
</Steps>

### 安全指南

<Warning>
  安全至关重要。切勿引入漏洞或不安全模式。
</Warning>

安全检查清单：

<AccordionGroup>
  <Accordion title="Input validation">
    * 验证并清理所有用户输入

    * 正确转义模板和查询中的数据

    * 切勿使用`eval()`，因为这可能导致任意代码执行漏洞
  </Accordion>

  <Accordion title="Error handling">
    * 使用特定的异常类型
    * 不要在错误消息中暴露敏感信息
    * 实施适当的资源清理
  </Accordion>

  <Accordion title="Dependencies">
    * 避免添加硬依赖
    * 保持最小的可选依赖关系
    * 检查第三方软件包的安全问题
  </Accordion>
</AccordionGroup>

***

## 开发环境<Tip>
  **使用AI编码代理？** 安装[LangChain Skills](https://github.com/langchain-ai/langchain-skills)以提高代理在LangChain生态系统任务上的性能，然后单击此页面右上角的“复制页面”按钮，将原始内容粘贴到您的代理中以使其自动设置您的环境。
</Tip>

<Warning>
  我们的 JS/TS 项目使用 [⟦T16⟧](https://pnpm.io/) 进行依赖管理。确保您安装了最新版本，或运行 `corepack enable`（在 Node 24+ 上）来设置所需的 pnpm 版本。
</Warning>

<Info>
  我们努力保持所有 JS/TS 包的设置一致。从存储库根目录运行：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm install
  pnpm --filter {package-name} test  # Verify tests pass before starting development
  ```
</Info>

查看完 [contribution guidelines](#contribution-guidelines) 后，请在下面的 [repository structure](#repository-structure) 部分中找到您正在处理的组件的包目录。

***

## 存储库结构

<Tabs>
  <Tab title="LangChain" icon="link">
    LangChain 被组织为具有多个包的单一存储库：

    <AccordionGroup>
      <Accordion title="Core packages">
        * **[⟦T18⟧](https://github.com/langchain-ai/langchainjs/tree/main/langchain#readme)**（位于`libs/langchain/`）：包含链、代理和检索逻辑的主包
        * **[⟦T20⟧](https://github.com/langchain-ai/langchainjs/tree/main/langchain-core#readme)**（位于`libs/langchain-core/`）：基础接口和核心抽象
      </Accordion>

      <Accordion title="Partner packages">
        这些位于 `libs/providers/` 中，是用于特定集成的独立版本控制包。例如：* **[⟦T23⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-openai#readme)**：[OpenAI](/oss/javascript/integrations/providers/openai)集成
        * **[⟦T24⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-anthropic#readme)**：[Anthropic](/oss/javascript/integrations/providers/anthropic)集成
        * **[⟦T25⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google#readme)**：[Google](/oss/javascript/integrations/providers/google)集成
      </Accordion>

      <Accordion title="Supporting packages">
        * **[⟦T26⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-textsplitters#readme)**：文本分割实用程序
        * **[⟦T27⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-standard-tests#readme)**：用于集成的标准测试套件
      </Accordion>
    </AccordionGroup>
  </Tab>

  <Tab title="LangGraph" icon="topology-ring">
    LangGraph 被组织为具有多个 Python 包的单一存储库：

    <AccordionGroup>
      <Accordion title="Core packages">
        * **[⟦T28⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/langgraph#readme)**（位于`libs/langgraph/`）：用于构建有状态、多参与者代理的核心框架
        * **[⟦T30⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/prebuilt#readme)**（位于`libs/prebuilt/`）：用于创建和运行代理和工具的高级 API
      </Accordion>

      <Accordion title="Checkpoint packages">
        * **[⟦T32⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint#readme)**（位于`libs/checkpoint/`）：检查点保存程序的基础接口
        * **[⟦T34⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres#readme)**（位于`libs/checkpoint-postgres/`）：Postgres 实现
        * **[⟦T36⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-sqlite#readme)**（位于`libs/checkpoint-sqlite/`）：SQLite 实现
      </Accordion>

      <Accordion title="SDK and CLI">
        * **[⟦T38⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/sdk-py#readme)**（位于`libs/sdk-py/`）：用于代理服务器 API 的 Python SDK
        * **[⟦T40⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/cli#readme)**（位于`libs/cli/`）：官方命令行界面
      </Accordion>
    </AccordionGroup>
  </Tab>

  <Tab title="Deep Agents" icon="robot">
    Deep Agents 被组织为具有多个 Python 包的单一存储库：<AccordionGroup>
      <Accordion title="Core packages">
        * **[⟦T42⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/deepagents#readme)**（位于`libs/deepagents/`）：用于构建具有规划、文件系统和子代理功能的深度代理的核心框架
        * **[⟦T44⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/code#readme)**（位于`libs/code/`）：深层代理代码 — 具有对话恢复、网络搜索和沙箱的交互式终端界面
        * **[⟦T46⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/cli#readme)**（位于`libs/cli/`）：将运输代理部署工具（`deepagents deploy`、`deepagents init`、`deepagents dev`）到 LangSmith 部署
      </Accordion>

      <Accordion title="Integration packages">
        * **[⟦T51⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/harbor#readme)**（位于`libs/harbor/`）：Harbor 与 LangSmith 跟踪集成
        * **[⟦T53⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/acp#readme)**（位于`libs/acp/`）：代理客户端协议集成
      </Accordion>
    </AccordionGroup>
  </Tab>
</Tabs>

***

## 开发流程

### 预提交挂钩

### 运行测试

<Info>
  目录与您正在使用的包相关。
</Info>

如果可能的话，我们更喜欢单元测试而不是集成测试。单元测试针对每个拉取请求运行，因此它们应该快速且可靠。集成测试按计划运行并需要更多设置，因此应保留它们以确认与外部服务的接口点。

#### 单元测试

**地点**：`src/tests/FILENAME_BEING_TESTED.test.ts`单元测试涵盖不需要调用外部 API 的模块化逻辑。如果添加新逻辑，则应该添加单元测试。在单元测试中，检查前/后处理并模拟外部依赖项。

**要求**：

* 不允许网络调用
* 测试所有代码路径，包括边缘情况
* 使用模拟来实现外部依赖

运行单元测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Run the entire test suite
pnpm test

# Or run a specific test file
pnpm test src/tests/FILENAME_BEING_TESTED.test.ts

# Or run a specific test function
pnpm test -t "the test that should be run"
```

#### 集成测试

**地点**：`src/tests/FILENAME_BEING_TESTED.int.test.ts`

集成测试涵盖需要调用外部 API（通常与其他服务集成）的逻辑。

集成测试需要访问外部服务/提供商 API（这可能需要花钱），因此默认情况下不会运行。

并非每个代码更改都需要集成测试，但请记住，作为审核过程的一部分，我们将单独要求/运行集成测试。

**要求**：

* 测试与外部服务的真实集成
* 使用环境变量作为 API 密钥
* 如果凭据不可用，则优雅地跳过

要运行集成测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm test:int
```

### 代码质量标准

贡献必须遵守以下质量要求：

<Tabs>
  <Tab title="Type hints">
    **必需**：所有功能的完整类型

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    function processDocuments(
        docs: Document[],
        processor: DocumentProcessor,
        batchSize: number = 100
    ): ProcessingResult {
        // ...
    }
    ```
  </Tab><Tab title="Documentation">
    **必需**：[JSDocs](https://jsdoc.app/about-getting-started) 对于所有导出的函数和接口

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    /**
     * Document processing instance.
     */
    interface FooDocumentProcessor {
        /**
         * Process documents in batches.
         *
         * @param docs - List of documents to process.
         * @returns Processing results with success/failure counts.
         */
        process(docs: Document[]): ProcessingResult;
    }

    /**
     * Process documents in batches.
     *
     * @param docs - List of documents to process.
     * @param processor - Document processing instance.
     * @param batchSize - Number of documents per batch.
     * @returns Processing results with success/failure counts.
     */
    export function processDocuments(
        docs: Document[],
        processor: DocumentProcessor,
        batchSize: number = 100
    ): ProcessingResult {
        // ...
    }
    ```
  </Tab>

  <Tab title="Code style">
    **自动化**：格式化和检查：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm lint    # Check style and types
    pnpm format  # Apply formatting
    ```

    **标准**：

    * 描述性变量名称
    * 分解复杂的函数（目标是少于 20 行）
    * 遵循代码库中的现有模式
  </Tab>
</Tabs>

***

### 测试写作指南

为了编写有效的测试，需要遵循一些好的实践：

* 将测试封装在描述被测试组件的`describe`块中
* 使用自然语言描述测试名称
* 断言要详尽无遗
* 仅对大小合理的数据对象使用快照

<Tabs>
  <Tab title="Unit tests">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    describe("DocumentProcessor", () => {
        it("Should handle empty document list", () => {
            const processor = new DocumentProcessor();
            const result = processor.process([]);

            expect(result.success).toBe(true);
            expect(result.processedCount).toBe(0);
            expect(result.errors).toHaveLength(0);
        });
    });
    ```
  </Tab>

  <Tab title="Integration tests">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    describe("ChatOpenAI", () => {
        it("Should test with real API", () => {
            const chat = new ChatOpenAI();
            const response = chat.invoke("Hello");
        });
    });
    ```
  </Tab>

  <Tab title="Mock usage">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    describe("APIService", () => {
        it("Should call with retry", () => {
            const mockClient = new MockClient();
            const service = new APIService(client: mockClient);
            const result = service.callWithRetry();
        });
    });
    ```
  </Tab>
</Tabs>

### 提交你的 PR

一旦您的测试通过且代码符合质量标准：

1. 推送您的分支并打开拉取请求
2. 按照提供的 PR 模板进行操作
3. 使用[closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)（例如`Fixes #123`）参考相关问题
4.等待CI检查完成

<Note>
  如果您的 PR 包含人工智能生成的内容，您必须遵守我们的 [acceptable uses of LLMs](/oss/javascript/contributing/overview#acceptable-uses-of-llms) 政策。看似省力、由人工智能生成的垃圾邮件的 PR 将被关闭而不发表评论。
</Note><Warning>
  及时解决 CI 故障。维护者可以在合理的时间内关闭未通过 CI 的 PR。
</Warning>

## 获取帮助

我们的目标是尽可能提供最方便的开发人员设置。如果您在设置时遇到任何困难，请在[community slack](https://www.langchain.com/join-community)中询问或打开[forum post](https://forum.langchain.com/)。

<Check>
  现在您已经准备好向LangChain贡献高质量的代码了！
</Check>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>