<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Contributing to code | https://docs.langchain.com/oss/python/contributing/code -->

# 贡献代码

欢迎贡献代码！无论您是修复错误、添加功能还是提高性能，您的贡献都有助于为成千上万的开发人员提供更好的开发体验。

## 开始使用

如果您正在寻找解决方案，请查看我们的存储库中标记为“需要帮助”的问题：

> **[LangChain](https://github.com/langchain-ai/langchain/labels?q=help+wanted)**
>
> 标签

> **[LangGraph](https://github.com/langchain-ai/langgraph/labels?q=help+wanted)**
>
> 标签

> **[Deep Agents](https://github.com/langchain-ai/deepagents/labels?q=help+wanted)**
>
> 标签

> [!注意]
>
> 在提交大型**新功能或重构**之前，请先打开问题或发帖到[the forum](https://forum.langchain.com/)进行讨论。这可确保与项目目标保持一致并防止重复工作。

### 快速修复：提交错误修复

对于简单的错误修复，您可以立即开始：

**1.重现问题**

在克隆存储库之前，请确保您可以可靠地重现错误。这有助于确认问题并为您的修复提供起点。维护者和其他贡献者应该能够根据您的描述重现问题，而无需进行额外的设置或修改。

**2.分叉存储库**将 [LangChain](https://github.com/langchain-ai/langchain)、[LangGraph](https://github.com/langchain-ai/langgraph) 或 [Deep Agents](https://github.com/langchain-ai/deepagents) 存储库分叉到您的个人 GitHub 帐户（如果您分叉到组织帐户，维护人员将无法进行编辑，这可能会严重延迟接受。）

**3.克隆和设置**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/your-username/name-of-forked-repo.git

# For instance, for LangChain:
git clone https://github.com/parrot123/langchain.git
```

> [!警告]
>
> LangChain Python 存储库是一个 **monorepo** — 存储库根目录中没有 `pyproject.toml`。每个包都有自己的`libs/`（例如`libs/core/`、`libs/langchain/`、`libs/partners/openai/`）。在运行 `uv` 命令之前，您必须先`cd` 进入相关的包目录。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Navigate into the package you want to work on, then install dependencies
cd libs/core          # or libs/langchain, libs/partners/openai, etc.
uv sync --all-groups

# or, to install a specific group only:
uv sync --group test
```

如果您以前没有安装过，则需要安装[⟦T26⟧](https://docs.astral.sh/uv/)。有关软件包及其位置的完整列表，请参阅 [repository structure](#repository-structure) 部分。

**4.创建分支**

为您的修复创建一个新分支。这有助于让您的更改井井有条，并使以后提交拉取请求变得更加容易。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git checkout -b your-username/short-bugfix-name
```

**5.编写失败的测试**

添加 [unit tests](#test-writing-guidelines)，如果不修复，它将会失败。这使我们能够验证错误是否已解决并防止回归

**6。进行更改**

按照我们的[code quality standards](#code-quality-standards)修复错误。进行**最少的必要更改**来解决问题。我们强烈鼓励贡献者在开始编码之前对该问题发表评论。例如：> *“我想解决这个问题。我的预期方法是\[...简要描述...]。这符合维护者的期望吗？”*

如果您最初的方法是错误的，30 秒的评论通常可以避免浪费精力。

**7.验证修复**

确保测试通过并且不引入回归。在提交 PR 之前确保所有测试在本地通过

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make format
make lint
make test

# For bugfixes involving integrations, also run:
make integration_tests
# (You may need to set up API testing credentials)
```

**8.记录变更**

如果行为发生变化，请更新文档字符串和/或内联注释

**9.提交拉取请求**

请遵循提供的 PR 模板。如果适用，请使用 [closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)（例如 `Fixes #ISSUE_NUMBER`）引用您正在修复的问题，以便在合并您的 PR 时自动关闭该问题。

### 完整的开发设置

对于持续开发或更大贡献：

1. 查看我们的 [contribution guidelines](#contribution-guidelines) 的功能、错误修复和集成
2. 按照下面的[setup guide](#development-environment) 设置您的环境
3. 了解[repository structure](#repository-structure)和包组织
4. 了解我们的[development workflow](#development-workflow)，包括测试和 linting

***

## 贡献指南在开始为 LangChain 项目做出贡献之前，请花点时间思考一下您为什么想要这样做。如果您的唯一目标是在简历中添加“第一次贡献”（或者如果您只是寻求快速获胜），那么您最好参加训练营或在线教程。

为开源项目做出贡献需要时间和精力，但它也可以帮助您成为更好的开发人员并学习新技能。然而，重要的是要知道这可能比参加培训课程更难、更慢。也就是说，如果您愿意花时间把事情做好，那么为开源做出贡献是值得的！

### 向后兼容性

> [!警告]
>
> 除了关键的安全修复之外，不允许对公共 API 进行重大更改。
>
> 有关主要版本发布的详细信息，请参阅我们的[versioning policy](/oss/python/versioning)。

通过以下方式保持兼容性：

> **稳定的接口**
>
> **始终保留**：
>
> * 函数签名和参数名称
> * 类接口和方法名
> * 返回值结构和类型
> * 公共API的导入路径> **安全更改**
>
> **可接受的修改**：
>
> * 添加新的可选参数
>
> * 向类添加新方法
>
> * 在不改变行为的情况下提高性能
>
> * 添加新模块或功能

> **进行更改之前**
>
> * **这会破坏现有的用户代码吗？**
>
> * 检查你的目标是否是公开的
>
> * 如果需要，是否以`__init__.py`导出？
>
> * 测试中是否存在现有的使用模式？

### 新功能

我们的目标是保持新功能的高标准。如果现有问题表明对外部贡献者的新核心抽象有迫切的需求，我们通常不会接受它们。这也适用于基础设施和依赖项的更改。

一般来说，功能贡献要求包括：

**1.设计讨论**

打开一个问题描述：

* 你要解决的问题
* 提议的API设计
* 预期的使用模式

**2.实施**

* 遵循现有的代码模式
* 包括全面的测试和文档
* 考虑安全隐患

**3.集成注意事项**

* 这如何与现有功能交互？
* 对性能有影响吗？
* 这会引入新的依赖关系吗？我们将拒绝可能导致安全漏洞或报告的功能。

### 安全指南

> [!警告]
>
> 安全至关重要。切勿引入漏洞或不安全模式。

安全检查清单：

> **输入验证**
>
> * 验证并清理所有用户输入
> * 正确转义模板和查询中的数据
> * 切勿在用户数据上使用 `eval()`、`exec()` 或 `pickle`，因为这可能导致任意代码执行漏洞

> **错误处理**
>
> * 使用特定的异常类型
> * 不要在错误消息中暴露敏感信息
> * 实施适当的资源清理

> **依赖关系**
>
> * 避免添加硬依赖
> * 保持最小的可选依赖关系
> * 检查第三方软件包的安全问题

***

## 开发环境> [!提示]
>
> **使用人工智能编码代理？**
>
> * 安装 [LangChain Docs MCP servers](/use-these-docs) 以使您的代理能够访问最新的 LangChain 文档和示例。
>
> 连接 LangChain 文档 MCP 服务器
>
> 将两个 LangChain 文档 MCP 服务器连接到我的编码代理，以便它可以查找当前的 LangChain、LangGraph 和 LangSmith 文档和 API 参考。
>
> 要添加的服务器：
>
> * `docs-langchain`: [https://docs.langchain.com/mcp](https://docs.langchain.com/mcp)
> * `reference-langchain`: [https://reference.langchain.com/mcp](https://reference.langchain.com/mcp)
>
> 检测我正在使用的代理或编辑器（Claude Code、Cursor、Codex CLI、Claude Desktop、Deep Agents Code、VS Code、Antigravity 或其他 MCP 兼容客户端）。使用 [https://docs.langchain.com/use-these-docs.md](https://docs.langchain.com/use-these-docs.md) 中的匹配设置：
>
> * Claude 代码：`claude mcp add --transport http` 对于每个服务器（默认情况下项目范围；仅当我要求全局访问时才使用`--scope user`）。
> * Codex CLI：`codex mcp add` 以及每个服务器 URL。
> * 光标、Deep Agents 代码、VS 代码或反重力：使用我的客户页面上显示的字段名称将两个条目合并到 MCP 设置 JSON 中。
> * Claude Desktop：在“设置”>“连接器”下添加两个 URL。
>
> 不要发明备用 MCP URL。配置后，确认两台服务器均已列出并且可访问。> * 安装 [LangChain Skills](https://github.com/langchain-ai/langchain-skills) 以提高代理在 LangChain 生态系统任务上的性能，然后单击此页面右上角的 **复制页面** 按钮，并将原始内容粘贴到您的代理中，以使其自动设置您的环境。
>
> 安装LangChain技能
>
> 为我的编码代理安装 LangChain 技能，以便它可以更好地执行 LangChain、LangGraph 和 Deep Agents 任务。
>
> 使用 [https://github.com/langchain-ai/langchain-skills](https://github.com/langchain-ai/langchain-skills) 中的代理技能安装程序：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>   npx skills add langchain-ai/langchain-skills --skill '*' --yes
>   ```
>
> 如果我要求全局安装，请使用：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>   npx skills add langchain-ai/langchain-skills --skill '*' --yes --global
>   ```
>
> 检测我正在使用哪个代理或编辑器。如果我使用 Claude Code 并且更喜欢插件路径，请按照该存储库自述文件中的市场安装（`/plugin marketplace add` 然后`/plugin install`）。不要发明备用技能包名称或安装 URL。安装后，确认代理可以使用该技能。

我们的Python项目使用[⟦T39⟧](https://docs.astral.sh/uv/getting-started/installation/)进行依赖管理。确保您安装了最新版本。

> [!注意]
>
> 我们努力保持所有 Python 包的设置一致。从包目录中运行：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv sync --all-groups
> make test  # Verify unit tests pass before starting development
> ```

查看完 [contribution guidelines](#contribution-guidelines) 后，请在下面的 [repository structure](#repository-structure) 部分中找到您正在处理的组件的包目录。

***

## 存储库结构

**LangChain**LangChain 被组织为具有多个包的单一存储库：

> **核心包**
>
> * **[⟦T40⟧](https://github.com/langchain-ai/langchain/tree/master/libs/langchain#readme)**（位于`libs/langchain/`）：包含链、代理和检索逻辑的主包
> * **[⟦T42⟧](https://github.com/langchain-ai/langchain/tree/master/libs/core#readme)**（位于`libs/core/`）：基础接口和核心抽象

> **合作伙伴套餐**
>
> 位于 `libs/partners/`，这些是用于特定集成的独立版本控制包。例如：
>
> * **[⟦T45⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/openai#readme)**：[OpenAI](/oss/python/integrations/providers/openai) 集成
> * **[⟦T46⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic#readme)**：[Anthropic](/oss/python/integrations/providers/anthropic) 集成
> * **[⟦T47⟧](https://github.com/langchain-ai/langchain-google/)**：[Google Generative AI](/oss/python/integrations/chat/google_generative_ai) 集成
>
> 许多合作伙伴包位于外部存储库中。详情请查看[list of integrations](/oss/python/integrations/providers/overview)。

> **支持包**
>
> * **[⟦T48⟧](https://github.com/langchain-ai/langchain/tree/master/libs/text-splitters#readme)**：文本分割实用程序
> * **[⟦T49⟧](https://github.com/langchain-ai/langchain/tree/master/libs/standard-tests#readme)**：用于集成的标准测试套件

**LangGraph**

LangGraph 被组织为具有多个 Python 包的 monorepo：

> **核心包**
>
> * **[⟦T50⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/langgraph#readme)**（位于`libs/langgraph/`）：用于构建有状态、多参与者代理的核心框架
> * **[⟦T52⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/prebuilt#readme)**（位于`libs/prebuilt/`）：用于创建和运行代理和工具的高级 API> **检查点包**
>
> * **[⟦T54⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint#readme)**（位于`libs/checkpoint/`）：检查点保存程序的基础接口
> * **[⟦T56⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres#readme)**（位于`libs/checkpoint-postgres/`）：Postgres 实现
> * **[⟦T58⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-sqlite#readme)**（位于`libs/checkpoint-sqlite/`）：SQLite 实现

> **SDK 和 CLI**
>
> * **[⟦T60⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/sdk-py#readme)**（位于`libs/sdk-py/`）：用于代理服务器 API 的 Python SDK
> * **[⟦T62⟧](https://github.com/langchain-ai/langgraph/tree/main/libs/cli#readme)**（位于`libs/cli/`）：官方命令行界面

**Deep Agents**

Deep Agents 被组织为具有多个 Python 包的 monorepo：

> **核心包**
>
> * **[⟦T64⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/deepagents#readme)**（位于`libs/deepagents/`）：用于构建具有规划、文件系统和子代理功能的深度代理的核心框架
> * **[⟦T66⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/code#readme)**（位于`libs/code/`）：Deep Agents代码 — 具有对话简历、网络搜索和沙箱的交互式终端界面
> * **[⟦T68⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/cli#readme)**（位于`libs/cli/`）：将运输代理部署工具（`deepagents deploy`、`deepagents init`、`deepagents dev`）部署到LangSmith 部署

> **集成包**
>
> * **[⟦T73⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/evals#readme)**（位于 `libs/evals/`）：评估套件和 Harbor 与 LangSmith 跟踪集成
> * **[⟦T75⟧](https://github.com/langchain-ai/deepagents/tree/main/libs/acp#readme)**（位于`libs/acp/`）：代理客户端协议集成

***

## 开发流程

### 预提交挂钩[LangChain](https://github.com/langchain-ai/langchain) 和 [Deep Agents](https://github.com/langchain-ai/deepagents) 存储库包括 [pre-commit](https://pre-commit.com/) 挂钩，可在每次提交之前自动运行格式化、linting 和验证检查。从存储库根目录安装它们：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install pre-commit  # or: uv tool install pre-commit
pre-commit install
```

钩子强制执行：

* 没有直接提交到受保护的分支
* YAML和TOML语法验证
* 修复尾随空格和文件结尾
* 智能报价和非标空间标准化
* 每个包装 `make format` 和 `make lint`

### 运行测试

> [!注意]
>
> 目录与您正在使用的包相关。

如果可能的话，我们更喜欢单元测试而不是集成测试。单元测试针对每个拉取请求运行，因此它们应该快速且可靠。集成测试按计划运行并需要更多设置，因此应保留它们以确认与外部服务的接口点。

#### 单元测试

**地点**：`tests/unit_tests/`

单元测试涵盖不需要调用外部 API 的模块化逻辑。如果添加新逻辑，则应该添加单元测试。在单元测试中，检查前/后处理并模拟外部依赖项。

**要求**：

* 不允许网络调用
* 测试所有代码路径，包括边缘情况
* 使用模拟来实现外部依赖

运行单元测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make test

# Or directly:
uv run --group test pytest tests/unit_tests

# To run a specific test:
TEST_FILE=tests/unit_tests/test_imports.py make test
```

#### 集成测试**地点**：`tests/integration_tests/`

集成测试涵盖需要调用外部 API（通常与其他服务集成）的逻辑。

集成测试需要访问外部服务/提供商 API（这可能需要花钱），因此默认情况下不会运行。

并非每个代码更改都需要集成测试，但请记住，作为审核过程的一部分，我们将单独要求/运行集成测试。

**要求**：

* 测试与外部服务的真实集成
* 使用环境变量作为 API 密钥
* 如果凭据不可用，则优雅地跳过

要运行集成测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make integration_tests

# Or directly:
uv run --group test --group test_integration pytest --retries 3 --retry-delay 1 tests/integration_tests

# To run a specific test:
TEST_FILE=tests/integration_tests/test_openai.py make integration_tests
```

### 代码质量标准

贡献必须遵守以下质量要求：

**键入提示**

**必需**：所有函数的完整类型注释

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def process_documents(
    docs: list[Document],
    processor: DocumentProcessor,
    *,
    batch_size: int = 100
) -> ProcessingResult:
    """Process documents in batches.

    Args:
        docs: List of documents to process.
        processor: Document processing instance.
        batch_size: Number of documents per batch.

    Returns:
        Processing results with success/failure counts.
    """
```

**文档**

**必需**：[Google-style docstrings](https://google.github.io/styleguide/pyguide.html) 适用于所有公共职能。

**指导原则**：文档字符串描述“什么”；本网站上的文档解释了“如何”和“为什么”。|内容类型 |地点 |目的|
| - | - | - |
|参数类型 |签名|自动生成 API 参考 |
|参数说明 |文档字符串 |自动生成 API 参考 |
|返回类型和异常 |文档字符串 | API参考|
|最小使用示例 |文档字符串 |显示基本实例化模式 |
|功能教程|这个网站|深入演练|
|端到端示例 |这个网站|现实世界的使用模式 |
|概念解释|这个网站|理解和背景|

**文档字符串应包含：**

1. 一行概括类/函数的作用
2. 链接到此站点以获取教程、指南和使用模式
3. 包含类型和描述的参数文档
4.返回值说明
5. 可能提出的例外情况
6. 单个最小示例显示必要的基本实例化/用法

> **良好的文档字符串示例**
>
> ````python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> class ChatAnthropic(BaseChatModel):
>     """Interface to Claude chat models.
>
>     See the [usage guide](https://docs.langchain.com/oss/python/integrations/chat/anthropic)
>     for tutorials, feature walkthroughs, and examples.
>
>     Args:
>         model: Model identifier (e.g., `'claude-sonnet-4-6'`).
>         temperature: Sampling temperature between `0` and `1`.
>         max_tokens: Maximum number of tokens to generate.
>         api_key: Anthropic API key.
>
>             If not provided, reads from the `ANTHROPIC_API_KEY`
>             environment variable.
>         timeout: Request timeout in seconds.
>         max_retries: Maximum number of retries for failed requests.
>
>     Returns:
>         A chat model instance that can be invoked with messages.
>
>     Raises:
>         ValueError: If the model identifier is not recognized.
>         AuthenticationError: If the API key is invalid.
>
>     Example:
>         ```python
> 从 langchain_anthropic 导入 ChatAnthropic
>
> 模型 = ChatAnthropic(模型 =“claude-sonnet-4-6”)
> 响应 = model.invoke("你好！")
> ```
>     """
> ````> **什么不属于文档字符串**
>
> 避免重复属于文档字符串的内容：
>
> * **参数类型**：这些位于函数签名中并自动生成到 API 参考中。
>
> * **功能教程**：不包括扩展演练。相反，链接到该网站：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>   """
>   ...
>
>   See the [extended thinking guide](https://docs.langchain.com/oss/integrations/chat/anthropic#extended-thinking)
>   for configuration options.
>   """
>   ```
>
> * **多个示例变体**：包括一个最小示例，然后链接到综合指南：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>   """
>   Example:
>       \`\`\`python
>       message = HumanMessage(content=[
>           {"type": "image", "url": "https://example.com/image.jpg"}
>       ])
>       \`\`\`
>
>   See the [multimodal guide](https://docs.langchain.com/oss/integrations/chat/anthropic#multimodal)
>   for all supported input formats.
>   """
>   ```
>
> * **概念解释**：遵循事实参数描述。链接到文档以获取更深入的上下文。
>
> * **MkDocs 特定语法**：避免文档字符串中的 `???+`、折叠式或制表符。它们不会在 IDE 中呈现。

**代码风格**

**自动化**：通过 [⟦T82⟧](https://docs.astral.sh/ruff/) 进行格式化和检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make format  # Apply formatting
make lint    # Check style and types
```

**标准**：

* 描述性变量名称
* 分解复杂的函数（目标是少于 20 行）
* 遵循代码库中的现有模式

### 依赖关系

LangChain 软件包区分**硬依赖项**和**可选依赖项**，以保持软件包轻量级并最大限度地减少用户的安装开销。

**可选依赖项**

几乎所有新的依赖项都应该是可选的。在以下情况下使用可选依赖项：* 仅特定集成或功能需要依赖项
* 用户可以在没有这种依赖性的情况下有意义地使用该包
* 依赖关系较大或者有很多传递依赖

**要求：**

* 未安装依赖项的用户必须能够**导入**您的代码，而不会产生任何副作用（无警告、无错误、无异常）
* `pyproject.toml` 和 `uv.lock` **未**修改

**添加可选依赖项：**

1. 将依赖项添加到适当的测试依赖项文件中（例如`extended_testing_deps.txt`）
2. 添加至少尝试导入新代码的单元测试。理想情况下，单元测试使用轻量级的装置来测试代码的逻辑。
3. 对任何需要依赖项的单元测试使用 `@pytest.mark.requires("package_name")` 装饰器。

**硬依赖**

当用户安装软件包时，会自动安装硬依赖项。仅在以下情况下使用硬依赖项：

* 如果没有依赖项，该包基本上无法运行
* 依赖关系小，具有最小的传递依赖
* 没有合理的方法使功能可选> [!警告]
>
> 添加硬依赖项会增加所有用户的安装时间和潜在的版本冲突。
>
> 维护者将仔细检查硬依赖添加！

**添加硬依赖：**

1.提出一个问题或讨论，解释为什么依赖关系必须是硬依赖而不是可选的
2. 在适当的部分下添加对`pyproject.toml`的依赖
3. 运行`uv lock`更新锁文件
4. 包括涵盖新功能的全面测试

***

### 测试写作指南

为了编写有效的测试，需要遵循一些好的实践：

* 使用自然语言在文档字符串中描述测试
* 使用描述性变量名称
* 断言要详尽无遗

**单元测试**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def test_document_processor_handles_empty_input():
    """Test processor gracefully handles empty document list."""
    processor = DocumentProcessor()

    result = processor.process([])

    assert result.success
    assert result.processed_count == 0
    assert len(result.errors) == 0
```

**集成测试**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@pytest.mark.requires("openai")
def test_openai_chat_integration():
    """Test OpenAI chat integration with real API."""

    chat = ChatOpenAI()
    response = chat.invoke("Hello")

    assert isinstance(response.content, str)
    assert len(response.content) > 0
```

**模拟使用**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def test_retry_mechanism(mocker):
    """Test retry mechanism handles transient failures."""
    mock_client = mocker.Mock()
    mock_client.call.side_effect = [
        ConnectionError("Temporary failure"),
        {"result": "success"}
    ]

    service = APIService(client=mock_client)
    result = service.call_with_retry()

    assert result["result"] == "success"
    assert mock_client.call.call_count == 2
```

### 提交你的 PR

一旦您的测试通过且代码符合质量标准：

1. 推送您的分支并打开拉取请求
2. 按照提供的 PR 模板进行操作
3. 使用[closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)（例如`Fixes #123`）参考相关问题
4.等待CI检查完成> [!注意]
>
> 如果您的 PR 包含 AI 生成的内容，您必须遵守我们的 [acceptable uses of LLMs](/oss/python/contributing/overview#acceptable-uses-of-llms) 政策。看似省力、由人工智能生成的垃圾邮件的 PR 将被关闭而不发表评论。

> [!警告]
>
> 及时解决 CI 故障。维护者可以在合理的时间内关闭未通过 CI 的 PR。

## 获取帮助

我们的目标是尽可能提供最方便的开发人员设置。如果您在设置时遇到任何困难，请在[community slack](https://www.langchain.com/join-community)中询问或打开[forum post](https://forum.langchain.com/)。

> [!提示]
>
> 您现在已经准备好向LangChain贡献高质量的代码了！

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。