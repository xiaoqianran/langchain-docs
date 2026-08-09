<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Release stages | https://docs.langchain.com/langsmith/release-stages -->

# 发布阶段

LangSmith 如何将功能标记为 alpha、beta 或普遍可用，以及每个阶段对稳定性、支持和可用性意味着什么

LangSmith 通过三个发布阶段提供功能：alpha、beta 和普遍可用 (GA)。每个阶段都对功能的稳定性、运行位置以及支持方式设定了一致的期望，因此您可以决定何时采用它。

一项功能会随着其成熟而经历各个阶段，尽管较小的功能可能会跳过 alpha 或 beta 并直接作为 GA 发布。下表总结了每个阶段。|舞台|可用性 |变化|自托管/BYOC |支持|
| -------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ | | ------------------------------------------------------ |
| [Alpha](#alpha) |仅限设计合作伙伴|预期发生重大变化；该功能可能会发生重大变化或永远不会发货 |不保证 |没有正式的 SLA |
| [Beta](#beta) |公共或私人团体|界面或行为仍可能发生变化；预计几个月内正式上市 |通常在测试期间添加 |积极维护； SLA 因功能而异 |
| [GA](#generally-available-ga) |公共|稳定的;重大更改需要弃用期 |支持 |全力支持|

## 阿尔法

Alpha 是最早的发布阶段，用于在更广泛的发布之前用少量受众验证功能。* **可用性**：仅适用于设计合作伙伴。 Alpha 功能尚未公开公布。
* **准备情况**：可能不完整或部分，旨在用于早期验证而不是生产使用。
* **更改**：预计会发生重大更改。该功能可能会发生重大变化，并且可能永远不会作为 GA 发布。
* **定价**：无定价承诺。
* **部署**：不一定在自托管或 BYOC 环境中可用。
* **支持**：不适用 SLA。

阿尔法是可选的。某个功能可能会跳过此阶段。

## 测试版

Beta 版使一项功能可供实际使用，同时其界面和行为正在最终确定。 Beta 功能是端到端功能，而不是部分实现，因此您可以在生产工作流程中采用它们，并在正式发布之前帮助塑造它们。* **可用性**：公开或向私人团体提供，并在适用的产品 UI 和文档中标记为 `Beta`。
* **准备就绪**：功能端到端，适合实际工作流程。
* **更改**：在该功能达到 GA 之前，界面或行为可能仍会发生变化，预计在几个月内。
* **定价**：定价可能可用，但尚未最终确定。
* **部署**：通常在测试期间添加对自托管和 BYOC 环境的支持。
* **支持**：根据反馈积极维护和完善 Beta 功能。 SLA 覆盖范围因功能而异。

测试版是可选的。较小的功能可能会跳过此阶段。

## 普遍可用 (GA)

GA 功能稳定并完全支持生产使用。

* **可用性**：公开可用。
* **准备就绪**：完整且可投入生产。
* **更改**：API 行为稳定。重大变更需要一个弃用期。
* **定价**：定价已最终确定。
* **部署**：在所有环境中均受支持，包括自托管和 BYOC。
* **支持**：完全支持并完整记录。任何未标记为 alpha 或 beta 的功能都是 GA，并且会立即得到永久支持。 LangSmith 有时可能会弃用普遍可用的功能，但这种情况并不常见。

## 另请参阅

* [Release policy](/langsmith/release-versions) 用于自托管发布通道、节奏和版本支持
* [API and SDK deprecation policy](/langsmith/endpoint-deprecation) 了解如何删除已弃用的端点和方法
* [Changelog](/langsmith/changelog) 最近的 LangSmith 更新

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/release-stages.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>