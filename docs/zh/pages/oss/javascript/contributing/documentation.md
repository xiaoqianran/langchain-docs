<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Contributing to documentation | https://docs.langchain.com/oss/javascript/contributing/documentation -->

# 为文档做出贡献

我们欢迎对 LangChain 文档做出贡献，包括新功能、[integrations](/oss/javascript/contributing/publish-langchain)以及对现有文档的改进。

## 快速入门 - 本地开发

要运行文档的本地预览：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/langchain-ai/docs.git
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd docs
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make install
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make dev
```

这会在 `http://localhost:3000` 处启动热重载的开发服务器。在 `src/` 中编辑文件并立即查看更改。

<Tip>
  **使用AI编码代理？** 安装[LangChain Skills](https://github.com/langchain-ai/langchain-skills)以提高代理在LangChain生态系统任务上的性能，然后单击此页面右上角的“复制页面”按钮，将原始内容粘贴到您的代理中以使其自动设置您的环境。
</Tip>

<Tip>
  如果您的本地预览出现问题，请尝试运行 `mint update` 以确保您使用的是最新的 Mintlify 版本。
</Tip>

<Accordion title="Prerequisites">
  **必填：**

  * Python 3.13+
  * [uv](https://docs.astral.sh/uv/) - Python 包管理器
  * [Node.js](https://nodejs.org/en) 和 npm
  * [Make](https://www.gnu.org/software/make/)
  * [Git](https://git-scm.com/)

  **可选：**

  * [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) - `npm install -g markdownlint-cli`
  * [Mintlify MDX VSCode extension](https://www.mintlify.com/blog/mdx-vscode-extension)
</Accordion>

## 编辑文档

<Accordion title="Quick edits on GitHub">
  对于拼写错误或小的更改，直接在 GitHub 上编辑，无需本地设置：1. 单击任意页面底部的 **在 GitHub 上编辑此页面**。
  2. 分叉到您的个人帐户。
  3. 在 GitHub 的 Web 编辑器中进行更改。
  4. 创建拉取请求。
</Accordion>

<Note>
  **仅编辑`src/`中的文件**--自动生成`build/`目录。
</Note>

1. 按照我们的[writing standards](#writing-standards)编辑`src/`中的文件。
2. 提交前运行[quality checks](#run-quality-checks)。
3. 创建拉取请求以供审核。

<Note>
  所有拉取请求必须链接到维护者批准解决方案的问题或讨论。请参阅我们的[pull request requirements](/oss/javascript/contributing/overview#pull-request-requirements)。
</Note>

<Accordion title="Create a sharable preview build (LangChain team only)">
  当您创建或更新 PR 时，会自动生成 [preview branch/ID](https://github.com/langchain-ai/docs/actions/workflows/create-preview-branch.yml)。将在带有 ID 的 PR 上留下评论。

  1.从评论中复制预览分支的ID
  2. 在[Mintlify dashboard](https://dashboard.mintlify.com/langchain-5e9cc07a/langchain-5e9cc07a?section=previews)中，点击**创建预览部署**
  3. 输入预览分支的ID，然后单击**创建部署**
  4.选择预览，点击**访问**查看

  要使用最新更改重新部署，请单击仪表板上的“**重新部署**”。
</Accordion>

### 运行质量检查

在提交更改之前，请确保您的代码通过格式和 linting 检查：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Check broken links
make broken-links

# Format code automatically
make format

# Check for linting issues
make lint

# Fix markdown issues
make lint_md_fix

# Run tests to ensure your changes don't break existing functionality
make test
```

有关更多详细信息，请参阅`README`中的[available commands](https://github.com/langchain-ai/docs?tab=readme-ov-file#available-commands)部分。<Important>
  所有拉取请求都会由 CI/CD 自动检查。将强制执行相同的 linting 和格式化标准，如果这些检查失败，则无法合并 PR。
</Important>

## 文档类型

所有文档均属于以下四个类别之一：

<CardGroup>
  <Card title="How-to guides" icon="tool" href="#how-to-guides">
    为知道自己想要完成什么任务的用户提供面向任务的说明。
  </Card>

  <Card title="Conceptual guides" icon="bulb" href="#conceptual-guides">
    提供更深入理解和见解的解释。
  </Card>

  <Card title="Reference" icon="book" href="#reference">
    API 的技术描述和实现细节。
  </Card>

  <Card title="Tutorials" icon="school" href="#tutorials">
    指导用户通过实践活动来建立理解的课程。
  </Card>
</CardGroup>

<Note>
  在适用的情况下，所有文档必须同时包含 Python 和 JavaScript/TypeScript 内容。有关更多详细信息，请参阅[co-locate Python and JavaScript/TypeScript content](#co-locate-python-and-javascript%2Ftypescript-content)部分。
</Note>

### 操作指南

操作指南是面向任务的说明，为那些知道自己想要完成什么任务的用户提供指导。操作指南的示例位于 [LangChain](/oss/javascript/langchain/overview) 和 [LangGraph](/oss/javascript/langgraph/overview) 选项卡上。

<AccordionGroup>
  <Accordion title="Characteristics">
    * **以任务为中心**：专注于特定任务或问题
    * **逐步**：将任务分解为更小的步骤
    * **动手**：提供具体示例和代码片段
  </Accordion><Accordion title="Tips">
    * 关注**如何**而不是**为什么**
    * 使用具体示例和代码片段
    * 将任务分解为更小的步骤
    * 相关概念指南和参考文献的链接
  </Accordion>

  <Accordion title="Examples">
    * [Messages](/oss/javascript/langchain/messages)
    * [Tools](/oss/javascript/langchain/tools)
    * [Streaming](/oss/javascript/langgraph/streaming)
  </Accordion>
</AccordionGroup>

### 概念指南

概念指南抽象地涵盖了核心概念，提供了深刻的理解。

<AccordionGroup>
  <Accordion title="Characteristics">
    * **以理解为中心**：解释事物为何如此运作
    * **广阔的视角**：比其他类型更高更宽的视野
    * **以设计为导向**：解释决策和权衡
    * **上下文丰富**：使用类比和比较
  </Accordion>

  <Accordion title="Tips">
    * 关注**“为什么”**而不是“如何”
    * 提供功能使用不一定需要的补充信息
    * 可以使用类比和参考替代方案
    * 避免掺入过多参考内容
    * 链接到相关教程和操作指南
  </Accordion>

  <Accordion title="Examples">
    * [Memory](/oss/javascript/concepts/memory)
    * [Context](/oss/javascript/concepts/context)
    * [Graph API](/oss/javascript/langgraph/graph-api)
    * [Functional API](/oss/javascript/langgraph/functional-api)
  </Accordion>
</AccordionGroup>

### 参考

参考文档包含详细的低级信息，准确描述了存在的功能以及如何使用它。

<CardGroup>
  <Card title="Python reference" href="https://reference.langchain.com/python/" icon="brand-python" /><Card title="JavaScript/TypeScript reference" href="https://reference.langchain.com/javascript/" icon="brand-javascript" />
</CardGroup>

一个好的参考应该：

* 描述存在的内容（所有参数、选项、返回值）
* 全面、结构化，方便查找
* 作为技术细节的权威来源

<AccordionGroup>
  <Accordion title="Contributing to references">
    [reference.langchain.com](https://reference.langchain.com/python/) 处生成的 API 参考是在此存储库外部构建和部署的。要报告错误、丢失的包或损坏的页面，[open a reference documentation issue](https://github.com/langchain-ai/docs/issues/new?template=04-reference-docs.yml)。
  </Accordion>

  <Accordion title="LangChain reference best practices">
    * **保持一致**；遵循特定于提供商的文档的现有模式
    * 包括基本用法（代码片段）和常见的边缘情况/故障模式
    * 当功能需要特定版本时请注意
  </Accordion>

  <Accordion title="When to create new reference documentation">
    * 满足 [hosted-guide eligibility criteria](/oss/javascript/contributing/publish-langchain#eligibility-for-hosted-guides) 要求的新集成（每月下载量或精选次数超过 50,000 次）
    * 复杂的配置选项需要详细解释
    * API 更改引入了新的参数或行为
    * 社区经常询问有关特定功能的问题
  </Accordion>
</AccordionGroup>

### 教程

教程是较长的分步指南，以自身为基础，引导用户通过特定的实践活动来建立理解。教程通常可以在 [Learn](/oss/javascript/learn) 选项卡上找到。<Note>
  如果没有迫切需要，我们通常不会合并来自外部贡献者的新教程。如果您觉得文档中缺少某个主题或未充分涵盖某个主题，请[open a new issue](https://github.com/langchain-ai/docs/issues)。
</Note>

<AccordionGroup>
  <Accordion title="Characteristics">
    * **实践**：注重实践活动以建立理解。
    * **逐步**：将活动分解为更小的步骤。
    * **动手**：提供连续的、可工作的代码片段。
    * **补充**：提供功能使用不一定需要的附加上下文和信息。
  </Accordion>

  <Accordion title="Tips">
    * 如果用户按顺序执行步骤，代码片段应该是连续的并且可以工作。
    * 提供活动的一些背景信息，但链接到相关概念指南和参考以获取更详细的信息。
  </Accordion>

  <Accordion title="Examples">
    * [Semantic search](/oss/javascript/langchain/knowledge-base)
    * [RAG agent](/oss/javascript/deepagents/rag)
  </Accordion>
</AccordionGroup>

## 编写标准

<Note>
  [reference.langchain.com](https://reference.langchain.com/python/) 页面的标准与该站点的构建管道一致，而不是在此存储库中。使用 [reference documentation issue template](https://github.com/langchain-ai/docs/issues/new?template=04-reference-docs.yml) 来解决有关生成的 API 参考内容的问题或修复。
</Note>

### Mintlify 组件

使用 [Mintlify components](https://mintlify.com/docs/text) 增强可读性：<Tabs>
  <Tab title="Callouts">
    * `<Note>` 获取有用的补充信息
    * `<Warning>` 重要注意事项和重大变更
    * `<Tip>` 最佳实践和建议
    * `<Info>` 用于中性上下文信息
    * `<Check>` 用于成功确认
  </Tab>

  <Tab title="Structure">
    * `<Steps>` 用于顺序过程的概述。 **不适用于**长的步骤或教程列表。
    * `<Tabs>` 适用于特定于平台的内容。
    * `<AccordionGroup>` 和 `<Accordion>` 用于默认可折叠的必备信息（例如完整的代码示例）。
    * `<CardGroup>` 和 `<Card>` 用于突出显示内容。
  </Tab>

  <Tab title="Code">
    * `<CodeGroup>` 适用于多种语言示例。
    * 始终在代码块上指定语言标签（例如，` ⟦T5⟧javascript`）。
    * 代码块的标题（例如`Success`、`Error Response`）
  </Tab>
</Tabs>

### 美人鱼图

添加美人鱼图时，使用LangChain品牌调色板进行节点样式设置。从任何现有图表复制`classDef`行，或使用[⟦T33⟧](https://github.com/langchain-ai/docs/blob/main/CLAUDE.md#mermaid-diagram-styling)中的参考表。|角色 |填写|行程|文字|
| -------- | ---------| ---------| ---------|
|流程| `#E5F4FF` | `#006DDD` | `#030710` |
|触发| `#F6FFDB` | `#6E8900` | `#2E3900` |
|决定| `#FDF3FF` | `#7E65AE` | `#504B5F` |
|输出| `#EBD0F0` | `#885270` | `#441E33` |
|警报| `#F8E8E6` | `#B27D75` | `#634643` |
|中立 | `#F2FAFF` | `#40668D` | `#2F4B68` |

请勿使用 Tailwind 默认值、Material Design 颜色或其他非品牌调色板。

### 页面结构

每个文档页面都必须以 YAML frontmatter 开头：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
title: "Clear, specific title"
sidebarTitle: "Short title for the sidebar (optional)"
---
```

### 将 Python 和 JavaScript/TypeScript 内容放在一起

如果可能，所有文档都必须使用 Python 和 JavaScript/TypeScript 编写。为此，我们使用自定义内联语法来区分应以一种或两种语言出现的部分：

```mdx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
:::python
Python-specific content. In real docs, the preceding backslash (before `python`) is omitted.
:::

:::js
JavaScript/TypeScript-specific content. In real docs, the preceding backslash (before `js`) is omitted.
:::

Content for both languages (not wrapped)
```

这将在`/oss/python/concepts/foo.mdx`和`/oss/javascript/concepts/foo.mdx`生成两个输出（每种语言一个）。每个输出的页面都需要添加到 `/src/docs.json` 文件中才能包含在导航中。<Note>
  我们不希望由于缺乏平等而阻碍捐款。如果某个功能仅以一种语言提供，则可以只提供该语言的文档，直到另一种语言赶上。在这种情况下，请添加注释，表明该功能尚不支持其他语言。

  如果您需要在 Python 和 JavaScript/TypeScript 之间翻译内容的帮助，请在 [community slack](https://www.langchain.com/join-community) 中询问或在 PR 中标记维护者。
</Note>

## 质量标准

### 一般准则

<AccordionGroup>
  <Accordion title="Avoid duplication">
    涵盖相同材料的多个页面很难维护并导致混乱。每个概念或功能应该只有一个规范页面。链接到其他指南而不是重新解释。
  </Accordion>

  <Accordion title="Link frequently">
    文档部分并不存在于真空中。经常链接到其他部分，让用户了解不熟悉的主题。这包括链接到 API 参考和概念部分。
  </Accordion>

  <Accordion title="Be concise">
    采取少即是多的方法。如果存在具有良好解释的另一个部分，请链接到它而不是重新解释，除非您的内容提出了新的角度。
  </Accordion>
</AccordionGroup>

### 辅助功能要求确保所有用户都可以访问文档：

* 使用标题和列表构建内容以便于轻松扫描
* 使用具体的、可操作的链接文本而不是“单击此处”
* 包括所有图像和图表的描述性替代文本

### 交叉引用

使用一致的交叉引用将文档与 API 参考文档连接起来。

**从文档到 API 参考：**

使用 `@[]` 语法链接到 API 参考页面：

```mdx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
See @[`ChatAnthropic`] for all configuration options.

The @[`bind_tools`][ChatAnthropic.bind_tools] method accepts...
```

构建管道根据当前语言范围（Python 或 JavaScript）将它们转换为正确的 Markdown 链接。例如，`@[ChatAnthropic]` 成为 Python 或 JS API 参考页面的链接，具体取决于正在构建的文档版本，**但前提是 `link_map.py` 文件中存在条目！** 有关详细信息，请参阅下文。

<Accordion title="How autolinks work">
  `@[]`语法由[⟦T59⟧](https://github.com/langchain-ai/docs/blob/main/pipeline/preprocessors/handle_auto_links.py)处理。它在 [⟦T60⟧](https://github.com/langchain-ai/docs/blob/main/pipeline/preprocessors/link_map.py) 中查找链接键，其中包含 Python 和 JavaScript 范围的字典映射。

  **支持的格式：**|语法 |结果 |
  | ------------------------ | ------------------------------------------------------------------------------------------ |
  | `@[ChatAnthropic]` |显示文本为“ChatAnthropic”的链接 |
  | ``@[`ChatAnthropic`]``   | Link with `` `ChatAnthropic` ``（代码格式）作为文本 |
  | `@[text][ChatAnthropic]` |以“text”为文本、以`ChatAnthropic`为链接映射中的键的链接 |
  | `\@[ChatAnthropic]` |转义：呈现为文字 `@[ChatAnthropic]`（无链接 – 此页面上正在使用什么！） |

  **添加新链接：**

  如果在地图中找不到链接，它将在输出中保持不变。要添加新的自动链接：

  1. 打开`pipeline/preprocessors/link_map.py`
  2. 将条目添加到`LINK_MAPS`中的适当范围（`python`或`js`）
  3. key是`@[key]`或`@[text][key]`中使用的链接名称，value是相对于引用主机的路径
</Accordion>

### 本地化

如果两个 SDK 中都存在某个功能，请为 [Python and JavaScript/TypeScript together](#co-locate-python-and-javascript%2Ftypescript-content) 记录该功能。如果仅支持一种语言，请确保该功能及其引用仅对该语言可见。### 代码内文档

示例必须正确，尽可能可复制粘贴，并且在打开拉取请求之前经过**测试**。清楚地标记不可运行的片段（例如，伪代码或说明性片段）。

## 获取帮助

我们的目标是尽可能实现最简单的开发人员设置。如果您在设置时遇到任何困难，请在[community slack](https://www.langchain.com/join-community)中询问或打开[forum post](https://forum.langchain.com/)。内部团队成员可以通过[#documentation](https://langchain.slack.com/archives/C04GWPE38LV) Slack 频道进行联系。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/documentation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>