<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Assistants | https://docs.langchain.com/langsmith/assistants -->

# 助理

*助手*是一个[Agent Server](/langsmith/agent-server)概念，允许您独立于图表的核心逻辑来管理配置（例如，提示、LLM选择、工具）。这使您能够创建同一图形架构的多个专用版本，在运行时具有不同的行为。通过配置变化（而不是结构图变化），每个助手都针对不同的[use case](#use-cases)进行了优化。

例如，想象一个基于通用图形架构构建的通用写入代理。虽然结构保持不变，但不同的写作风格（例如博客文章和推文）需要量身定制的配置来优化性能。为了支持这些变化，您可以创建多个助手（例如，一个用于博客，另一个用于推文），它们共享底层图表，但模型选择和系统提示不同。

<img alt="assistant versions" />

代理服务器 API 提供了多个用于创建和管理助手及其版本的端点。更多详情请参阅[API reference](/langsmith/server-api-ref)。

<Info>
  助手是一个[LangSmith Deployment](/langsmith/deployment)概念。它们在开源 LangGraph 库中不可用。
</Info>

## 助手如何处理部署当您使用 LangSmith Deployment 部署图形时，[Agent Server](/langsmith/agent-server) 会自动创建一个与该图形的默认配置绑定的**默认助手**。然后，您可以为同一图表创建其他助手，每个助手都有自己的配置。

如果您的部署在[⟦T3⟧](/langsmith/application-structure#configuration-file)中定义了多个图，则每个图都有自己的默认助手：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "graphs": {
        "graph_id_1": "path_to_graph_id_1",  // default assistant created for graph_id_1
        "graph_id_2": "path_to_graph_id_2"   // default assistant created for graph_id_2
    }
}
```

也就是说，可以有多个默认助手 - 一个对应于部署中定义的每个图表。

助手有几个主要功能：

* **[Managed via API and UI](/langsmith/configuration-cloud)**：使用 Agent Server/LangGraph SDK 或 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-assistants) 创建、列出、更新、版本和获取助手。
* **一个图表，多个助手**：单个部署的图表可以支持多个助手，每个助手具有不同的配置（例如提示、模型、工具）。
* **[Versioned](#versioning)配置**：每个助手通过版本控制维护自己的配置历史记录。编辑助手会创建一个新版本，您可以升级或回滚到任何版本。
* **[Configuration](#configuration)更新无需图形更改**：通过助手配置更新提示、模型选择和其他设置，无需修改或重新部署图形代码即可实现快速迭代。<Note>
  调用助手时，您可以在[⟦T4⟧](/langsmith/application-structure#configuration-file)中指定：

  * **图表 ID**（例如，`"agent"`）：使用该图表的默认助手
  * **助手 ID** (UUID)：使用特定的助手配置

  这种灵活性使您可以使用默认设置快速进行测试或精确控制所使用的配置。
</Note>

### 配置

助手基于 [configuration](/oss/python/langgraph/graph-api#runtime-context) 的 LangGraph 开源概念构建。

虽然开源 LangGraph 库中提供了配置，但助手仅出现在 [LangSmith Deployment](/langsmith/deployment) 中，因为它们与您部署的图紧密耦合。部署后，[Agent Server](/langsmith/agent-server)将使用图表的默认配置设置自动为每个图表创建一个默认助手。

实际上，助手只是具有特定配置的图的“实例”。因此，多个助手可以引用相同的图表，但可以包含不同的配置（例如提示、模型、工具）。 LangSmith 部署 API 提供了多个用于创建和管理助手的端点。有关如何创建助手的更多详细信息，请参阅[API reference](/langsmith/server-api-ref)和[this how-to](/langsmith/configuration-cloud)。

### 用例当您需要部署具有不同配置的相同图形架构时，助手是理想的选择。常见用例包括：

* **用户级个性化**
  * 自定义每个用户的模型选择、系统提示或工具可用性。
  * 存储用户偏好并将其自动应用于每次交互。
  * 使用户能够在不同的人工智能个性或专业水平之间进行选择。

* **客户或组织特定的配置**
  * 为不同的客户或组织维护单独的配置。
  * 为每个客户端定制行为，无需部署单独的基础设施。
  * 隔离特定客户的配置更改。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    A["Graph: agent<br/>(deployed)"]
    A --> B["Customer A Assistant<br/>━━━━━━━━━━━━━<br/>Model: GPT-4<br/>Tone: Legal<br/>Tools: Custom"]
    A --> C["Customer B Assistant<br/>━━━━━━━━━━━━━<br/>Model: Claude<br/>Tone: Casual<br/>Tools: Standard"]
    A --> D["Customer C Assistant<br/>━━━━━━━━━━━━━<br/>Model: GPT-3.5<br/>Tone: Formal<br/>Tools: Limited"]

    style A fill:#E5F4FF,stroke:#006DDD,stroke-width:3px,color:#030710
    style B fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
    style C fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
    style D fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
```

* **特定于环境的配置**
  * 使用不同的模型或设置进行开发、暂存和生产。
  * 在升级到生产之前测试暂存中的配置更改。
  * 使用较小的模型降低非生产环境中的成本。

* **A/B 测试和实验**
  * 比较不同的提示、型号或参数设置。
  * 逐步向一部分用户推出配置更改。
  * 测量配置变体之间的性能差异。* **专门任务变体**
  * 创建通用代理的特定于域的版本。
  * 优化不同语言、地区、行业的配置。
  * 在改变执行细节的同时保持一致的图形逻辑。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    A["Graph: writing-agent<br/>(deployed)"]
    A --> B["Blog Assistant<br/>━━━━━━━━━━━━━<br/>Model: GPT-4<br/>Tone: Formal<br/>Style: Long-form<br/>Tools: SEO optimization"]
    A --> C["Tweet Assistant<br/>━━━━━━━━━━━━━<br/>Model: GPT-4-mini<br/>Tone: Casual<br/>Style: 280-char limit<br/>Tools: Hashtag suggestions"]
    A --> D["Email Assistant<br/>━━━━━━━━━━━━━<br/>Model: GPT-4<br/>Tone: Professional<br/>Style: Medium length<br/>Tools: Templates"]

    style A fill:#E5F4FF,stroke:#006DDD,stroke-width:3px,color:#030710
    style B fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
    style C fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
    style D fill:#B3E0F2,stroke:#4A90E2,stroke-width:2px,color:#1E3A5F
```

### 版本控制

助手支持版本控制以跟踪随时间的变化。创建助手后，后续编辑将自动创建新版本。

* 每次更新都会创建一个新版本的助手。
* 您可以将任何版本升级为活动版本。
* 回滚到以前的版本就像将其设置为活动状态一样简单。
* 所有版本仍可供参考和回滚。

<Warning>
  更新助手时，您必须提供完整的配置负载。更新端点从头开始创建新版本，并且不会与以前的版本合并。确保包含您想要保留的所有配置字段。
</Warning>

有关如何管理助手版本的更多详细信息，请参阅[Manage assistants guide](/langsmith/configuration-cloud#create-a-new-version-for-your-assistant)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/assistants.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>