<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Contributing integrations | https://docs.langchain.com/oss/javascript/contributing/integrations-langchain -->

# 贡献集成

**集成是LangChain的核心组件。**

LangChain为几种不同的组件（语言模型、向量存储等）提供了标准接口，这些组件在构建LLM应用程序时至关重要。实施新的集成有助于扩展LangChain的生态系统，并使您的服务可以被数百万开发者发现。

<Warning>
  新集成**不被接受为任何 `langchain-ai` 存储库的 PR**。所有新集成都必须作为独立包发布到 PyPI（例如，`langchain-yourprovider`）。您应该向 `langchain-ai` 存储库开放的唯一 PR 是在文档中列出您已发布的包：下载表的 YAML 行，或者如果您满足 [eligibility criteria](/oss/javascript/contributing/publish-langchain#eligibility-for-hosted-guides)，则为托管指南。
</Warning>

## 为什么要集成LangChain？

<Card title="Discoverability" icon="search">
  LangChain 是构建 LLM 应用程序最常用的框架，每月下载量超过 2 亿次。
</Card>

<Card title="Interoperability" icon="refresh">
  LangChain组件公开了标准接口，允许开发人员轻松地相互替换。如果您实现 LangChain 集成，任何使用不同组件的开发人员都可以轻松地替换您的组件。
</Card><Card title="Best Practices" icon="star">
  通过其标准接口，LangChain 组件鼓励并促进最佳实践（流、异步等），从而改善开发人员体验和应用程序性能。
</Card>

## 要集成的组件

虽然任何组件都可以集成到 LangChain 中，但我们更鼓励特定类型的集成：

**整合这些✅**：

* [**Chat Models**](/oss/javascript/integrations/chat)：最常用的组件类型
* [**Tools/Toolkits**](/oss/javascript/integrations/tools)：启用代理功能
* [**Retrievers**](/oss/javascript/integrations/retrievers)：RAG 应用程序的核心
* [**Embedding Models**](/oss/javascript/integrations/embeddings)：向量运算的基础
* [**Vector Stores**](/oss/javascript/integrations/vectorstores)：语义搜索必备
* [**Middleware**](/oss/javascript/integrations/middleware)：用钩子扩展代理行为
* [**Sandboxes**](/oss/javascript/deepagents/sandboxes)：使用 Deep Agent 安全运行代码

**不是这些❌**：

* **LLM（文本完成模型）**：已弃用，支持 [Chat Models](/oss/javascript/integrations/chat)
* [**Document Loaders**](/oss/javascript/integrations/document_loaders)：维护负担高
* [**Key-Value Stores**](/oss/javascript/integrations/stores)：使用有限
* **文档转换器**：利基用例
* **模型缓存**：基础设施问题
* **图**：复杂的抽象
* **消息历史**：存储抽象
* **回调**：系统级组件
* **聊天加载程序**：需求有限
* **适配器**：边缘情况实用程序

## 如何贡献集成

<Steps>
  <Step title="Implement your package">
    <Card title="How to implement a LangChain integration" icon="link" href="/oss/javascript/contributing/implement-langchain" />
  </Step><Step title="Pass standard tests">
    如果适用，请为您的集成实现对 LangChain [standard test](/oss/javascript/contributing/standard-tests-langchain) 套件的支持并成功运行它们。
  </Step>

  <Step title="Publish integration">
    <Card title="How to publish an integration" icon="upload" href="/oss/javascript/contributing/publish-langchain" />
  </Step>

  <Step title="List your integration">
    在 LangChain [docs repo](https://github.com/langchain-ai/docs) 中打开 PR，以便用户可以找到您的包。托管导游数量有限；大多数集成都是通过 YAML 列出的。

    <Accordion title="How listing works" icon="book">
      **默认（每月下载量低于 50,000 次，不推荐）：** 在 [⟦T3⟧](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml) 添加一行。名称列链接到您的`docs_url`（首选合作伙伴文档，然后是 GitHub，然后是 PyPI 或 npm）。不要添加新的 MDX 页面。

      **托管指南（每月下载量超过 50,000 次，或由维护人员推荐）：** 从模板在 `src/oss/python/integrations/<component_type>/` 下创建页面：

      * [Chat models](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/chat/TEMPLATE.mdx)
      * [Tools and toolkits](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/tools/TEMPLATE.mdx)
      * [Middleware](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/middleware/TEMPLATE.mdx)
      * [Vector stores](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/vectorstores/TEMPLATE.mdx)

      有关完整步骤、资格详细信息和拒绝标准，请参阅[Publish an integration](/oss/javascript/contributing/publish-langchain#make-your-integration-discoverable)。
    </Accordion>
  </Step>

  <Step title="Co-marketing" icon="speakerphone">
    （可选）与LangChain团队共同参与[co-marketing](/oss/javascript/contributing/comarketing)。
  </Step>
</Steps>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/integrations-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>