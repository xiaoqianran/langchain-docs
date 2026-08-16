<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: API and SDK deprecation policy | https://docs.langchain.com/langsmith/endpoint-deprecation -->

# API 和 SDK 弃用政策

LangSmith 在删除 API 端点和 SDK 方法之前先弃用它们，以便您有时间迁移到替代品。本页介绍如何宣布弃用以及它们的支持期限。

<Note>此策略仅适用于[LangSmith API reference](/langsmith/smith-api-ref)和[Agent Server API reference](/langsmith/server-api-ref)中记录的公共端点。内部未记录的端点不包括在内，并且可以随时更改，包括重大更改。</Note>

## 弃用生命周期

每次弃用都遵循相同的阶段：

1. **宣布**：弃用将在 [changelog](/langsmith/changelog) 中发布，并在已知后删除日期，并且在需要更改调用站点的情况下，在记录替换的迁移指南中发布。
2. **标记**：已弃用的 API 端点返回 `Deprecation: true` 和 `Sunset: <date>` 响应标头。已弃用的 SDK 方法会在文档中进行标记，并在支持的情况下在调用时发出弃用警告。
3. **支持**：已弃用的端点在取决于您的部署的最小窗口内继续运行。参见[Deprecation window by deployment](#deprecation-window-by-deployment)。
4. **删除**：支持窗口结束后，端点被删除。在云中，如果活跃消费者仍然接近删除日期，LangSmith可能会对已弃用的端点应用速率限制和增加延迟，并对部分请求返回明确的错误消息，作为在删除之前吸引剩余使用情况的最后手段。我们会提前直接联系受影响的客户。

## 部署的弃用窗口

|部署|最小支持窗口|
|---|---|
|云|从发布到删除 6 个月 |
|自托管 |至少一个主要版本 |

自托管的主要版本大约每六周发布一次。详情请参见[Release policy](/langsmith/release-versions)。

## SDK 方法弃用

大多数 SDK 方法都是 API 端点周围的瘦包装器，因此方法在与其调用的端点相同的时间线上被弃用，并在端点被删除时从 SDK 中删除。

不一对一映射到终结点或独立于任何终结点更改而弃用的方法可以具有不同的弃用时间表。它在两个地方明确宣布：在 SDK 中，通过文档和弃用警告；在 API 中，通过上述过程。

## 字段级弃用不推荐使用的字段会在版本边界而不是日期被删除：

- **API 字段和参数**：已弃用的响应字段、请求正文字段或查询参数在同一端点版本中继续工作。删除是一项重大更改，因此它仅随下一个端点版本一起提供，例如 v1 到 v2。
- **SD​​K 方法字段和参数**：在当前主要 SDK 版本中继续工作。删除需要新的主要 SDK 版本，独立于 API 自身的版本控制。

## 另请参阅

- [Changelog](/langsmith/changelog) 最近的 LangSmith 更新
- [Release stages](/langsmith/release-stages) 了解功能如何从 alpha 迁移到 GA
- [Release policy](/langsmith/release-versions) 用于自托管发布通道、节奏和版本支持

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/endpoint-deprecation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>