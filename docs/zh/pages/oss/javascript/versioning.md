<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Versioning | https://docs.langchain.com/oss/javascript/versioning -->

# 版本控制

我们的OSS版本号遵循格式：`MAJOR.MINOR.PATCH`，由[Semantic Versioning](https://semver.org/)定义。

* **重大**：需要更改代码的重大 API 更新。
* **次要**：保持向后兼容性的新功能和改进。
* **补丁**：错误修复和细微改进。

例如：

* `1.0.0`：第一个具有生产就绪 API 的稳定版本
* `1.1.0`：以向后兼容的方式添加新功能
* `1.0.1`：向后兼容的错误修复

## API稳定性

我们按如下方式传达 API 的稳定性：

### 稳定的 API

所有没有特殊前缀的 API 都被认为是稳定的并且可供生产使用。我们保持稳定功能的向后兼容性，并且仅在主要版本中引入重大更改。

### 测试版 API

标记为 `beta` 的 API 功能完整，但可能会根据用户反馈进行细微更改。它们对于生产使用是安全的，但在未来的版本中可能需要进行少量调整。

### Alpha API

标记为 `alpha` 的 API 是实验性的，可能会发生重大变化。在生产环境中请谨慎使用这些。

### 已弃用的 API标记为 `deprecated` 的 API 将在未来的主要版本中删除。如果可能，我们会指定预期的删除版本。处理弃用：

1. 切换到推荐的替代API
2.遵循迁移指南（与主要版本一起发布）
3. 使用可用的自动迁移工具

### 内部 API

某些 API 通过多种方式明确标记为“内部”：

* 一些文档引用了内部结构并这样提及它们。如果文档表明某些内容是内部的，则它可能会发生变化。
* 函数、方法和其他对象以前导下划线为前缀 (**`_`**)。这是 Python 的标准约定，表示某些内容是私有的；如果任何方法以单个 **`_`** 开头，则它是内部 API。
  * **例外：** 某些方法以 `_` 为前缀，但不包含实现。这些方法*意味着*会被提供实现的子类覆盖。此类方法一般是LangChain的**公共API**的一部分。

## 发布周期

<AccordionGroup>
  <Accordion title="Major releases">
    主要版本（例如，`1.0.0` → `2.0.0`）可能包括：* 重大 API 变更
    * 删除已弃用的功能
    * 显着的架构改进

    我们提供：

    * 详细的迁移指南
    * 尽可能使用自动迁移工具
    * 延长对先前主要版本的支持期
  </Accordion>

  <Accordion title="Minor releases">
    次要版本（例如，`1.0.0` → `1.1.0`）包括：

    * 新特性和功能
    * 性能改进
    * 新的可选参数
    * 向后兼容的增强功能
  </Accordion>

  <Accordion title="Patch releases">
    补丁版本（例如，`1.0.0` → `1.0.1`）包括：

    * 错误修复
    * 安全更新
    * 文档改进
    * 无需更改 API 即可优化性能
  </Accordion>
</AccordionGroup>

## 版本支持政策

* **最新主要版本**：全面支持积极开发（ACTIVE 状态）
* **上一个主要版本**：下一个主要版本后 12 个月内的安全更新和关键错误修复（维护状态）
* **旧版本**：仅社区支持

### 长期支持 (LTS) 版本

LangChain和LangGraph 1.0都被指定为LTS版本：* 1.0 版将保持 ACTIVE 状态，直至 2.0 版发布
* 2.0版本发布后，1.0版本将进入MAINTENANCE模式至少1年
* LTS 版本遵循语义版本控制 (semver)，允许在次要版本之间安全升级
* 旧版本（LangChain 0.3 和 LangGraph 0.4）处于维护模式直至 2026 年 12 月

### 1.0 之前的包

有关发布状态和支持时间表的详细信息，请参阅[Release policy](/oss/javascript/release-policy)。

## 检查你的版本

要检查您安装的版本：

<CodeGroup>
  ```javascript LangChain theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { version } from "langchain/package.json";
  console.log(version);
  ```

  ```javascript LangGraph theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { version } from "@langchain/langgraph/package.json";
  console.log(version);
  ```
</CodeGroup>

## 升级

<CodeGroup>
  ```bash LangChain theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Upgrade to the latest version
  npm update langchain @langchain/core

  # Install a specific version
  npm install langchain@1.0.0 @langchain/core@1.0.0
  ```

  ```bash LangGraph theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Upgrade to the latest version
  npm update @langchain/langgraph

  # Install a specific version
  npm install @langchain/langgraph@1.0.0
  ```
</CodeGroup>

## 预发布版本

我们偶尔会发布 alpha 和 beta 版本以进行早期测试：

* **Alpha**（例如，`1.0.0a1`）：早期预览，预计会有重大变化
* **Beta**（例如，`1.0.0b1`）：功能完整，可能进行细微更改
* **候选版本**（例如，`1.0.0rc1`）：稳定版本之前的最终测试

## 另请参阅

* [Release policy](/oss/javascript/release-policy) - 详细的发布和弃用政策

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/versioning.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>