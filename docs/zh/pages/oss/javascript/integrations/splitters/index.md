<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Text splitter integrations | https://docs.langchain.com/oss/javascript/integrations/splitters/index -->

# 文本分割器集成

使用 LangChain 与文本分割器集成。

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/textsplitters @langchain/core
  # Requires Node.js 22+
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/textsplitters @langchain/core
  # Requires Node.js 22+
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/textsplitters @langchain/core
  # Requires Node.js 22+
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/textsplitters @langchain/core
  # Requires Node.js 22+
  ```
</CodeGroup>

**文本拆分器** 将大型文档分解为较小的块，这些块可单独检索并适合模型上下文窗口限制。

有多种分割文档的策略，每种策略都有自己的优点。

<Tip>
  对于大多数用例，从[⟦T6⟧](/oss/javascript/integrations/splitters/recursive_text_splitter)开始。它在保持上下文完整和管理块大小之间提供了坚实的平衡。此默认策略开箱即用，效果很好，只有在需要针对特定​​应用程序微调性能时才应考虑调整它。
</Tip>

## 基于文本结构

文本自然地组织成层次单元，例如段落、句子和单词。我们可以利用这种固有的结构来告知我们的分割策略，创建保持自然语言流的分割，保持分割内的语义连贯性，并适应不同级别的文本粒度。 LangChain的`RecursiveCharacterTextSplitter`实现了这个概念：* [⟦T8⟧](/oss/javascript/integrations/splitters/recursive_text_splitter) 试图保持较大的单元（例如段落）完整。
* 如果一个单元超过了块大小，它就会移动到下一个级别（例如，句子）。
* 如有必要，此过程会继续到单词级别。

用法示例：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 100, chunkOverlap: 0 })
const texts = splitter.splitText(document)
```

**可用的文本分割器**：

* [Recursively split text](/oss/javascript/integrations/splitters/recursive_text_splitter)

## 基于长度

一个直观的策略是根据文档的长度来分割文档。这种简单而有效的方法可确保每个块不超过指定的大小限制。基于长度的拆分的主要优点：

* 直接实施
* 一致的块大小
* 轻松适应不同型号需求

基于长度的分割类型：

* 基于标记：根据标记数量分割文本，这在使用语言模型时非常有用。
* 基于字符：根据字符数分割文本，这样在不同类型的文本之间可以更加一致。

使用 LangChain 的 `CharacterTextSplitter` 进行基于令牌的拆分的示例实现：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { TokenTextSplitter } from "@langchain/textsplitters";

const splitter = new TokenTextSplitter({ encodingName: "cl100k_base", chunkSize: 100, chunkOverlap: 0 })
const texts = splitter.splitText(document)
```

**可用的文本分割器**：

* [Split by tokens](/oss/javascript/integrations/splitters/split_by_token)
* [Split by characters](/oss/javascript/integrations/splitters/character_text_splitter)

## 基于文档结构有些文档具有固有的结构，例如 HTML、Markdown 或 JSON 文件。在这些情况下，根据文档结构拆分文档是有益的，因为它通常会自然地对语义相关的文本进行分组。基于结构的拆分的主要优点：

* 保留文档的逻辑组织
* 维护每个块内的上下文
* 对于检索或总结等下游任务可以更有效

**可用的文本分割器**：

* [Split code](/oss/javascript/integrations/splitters/code_splitter)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/integrations/splitters/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>