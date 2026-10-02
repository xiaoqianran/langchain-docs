<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Publish an integration | https://docs.langchain.com/oss/javascript/contributing/publish-langchain -->

# 发布集成

**将您的集成提供给社区。**

<Warning>
  **请勿将集成 PR 提交到 LangChain 或 Deep Agents 存储库。**

  新集成应在您自己的 GitHub 组织或帐户（例如 `@your-org/langchain-yourservice`）下作为 **独立 npm 包** 发布，而不是作为 [⟦T1⟧](https://github.com/langchain-ai/langchainjs) 存储库的 PR 发布。

  主存储库仅包含由 LangChain 团队维护的一小部分第一方集成。
</Warning>

将您的包发布到 npm，然后按照下面的 [Make your integration discoverable](#make-your-integration-discoverable) 操作。

## 让您的集成可被发现

发布后，在 [LangChain docs repository](https://github.com/langchain-ai/docs/issues/new?template=06-integration-submission.yml) 中提交 **集成列表** 问题，以便您的包出现在 [integrations tab](/oss/javascript/integrations/providers/overview) 下。

维护者审查该问题并应用 `integration-run` 标签。这将启动自动化，它读取表单字段，应用下面的资格规则，并打开一个拉取请求，标记维护者和您以供审核。首选表单中的合作伙伴文档 URL。

除非维护人员要求，否则不要**为新列表打开手动文档 PR。

### 托管指南的资格

仅当 **任一** 时，LangChain 才会在此文档存储库中托管完整的集成指南：* 该软件包在 PyPI（或 TypeScript 的 npm）上每月至少有 **50,000 次下载**，**或**
* 维护者将集成标记为**特色**

如果您不满足任一条件，自动化会添加一个链接到您自己的文档的**外部列表**（YAML + 下载表 + 提供商卡）。它**不**添加托管 MDX 页面。

### 下载表中的列表（默认）

<Card title="File an Integration listing issue" icon="ticket" href="https://github.com/langchain-ai/docs/issues/new?template=06-integration-submission.yml">
  使用固定表单字段显示名称、语言、组件、包名称、文档 URL 和简短的提供程序描述。
</Card>

自动填充您问题中的[⟦T3⟧](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml)和相关列表表面。

每个列表至少需要：

* **`name`**：LangChain 类或显示名称（例如，`ChatAI21`）。
* **`pypi`** 或 **`npm`**：用于下载徽章的注册表包名称。
* **`docs_url`**：名称栏的链接。首选合作伙伴文档，然后是 GitHub 存储库，然后是 PyPI 或 npm 页面。

可以选择在问题表单中包含特定于组件的功能标志（例如，聊天 `stream` 和 `tool_calling`），以便表列保持准确。

合并后，刷新作业会重新生成组件表片段，以便您的行与托管集成一起显示。<Info>
  此流程仅用于**仅列出元数据**。在您的网站或 GitHub README 上托管您的使用文档。您的集成包本身应该位于您的 GitHub 组织或帐户下自己的存储库中，并作为独立包发布。
</Info>

### 托管指南（50K+ 或精选）

如果您的包符合 [eligibility criteria](#eligibility-for-hosted-guides)，集成列表自动化可以从以下模板之一打开带有文档页面的 PR。维护人员还可能要求您手动创作或修改托管页面。

根据您构建的集成类型，您将需要创建不同类型的文档页面。 LangChain 提供不同类型集成的模板来帮助您入门。

<CardGroup>
  <Card title="Chat models" icon="message" href="https://github.com/langchain-ai/docs/blob/main/src/oss/javascript/integrations/chat/TEMPLATE.mdx" />
</CardGroup>

<Tip>
  要参考现有文档，您可以查看 [list of integrations](/oss/javascript/integrations/providers/overview) 并找到与您的类似的文档。

  要以原始 Markdown 格式查看给定文档页面，请使用页面右上角“复制页面”旁边的下拉按钮，然后选择“以 Markdown 形式查看”。
</Tip>

如果要求您手动编辑托管页面，请分叉 [LangChain docs repository](https://github.com/langchain-ai/docs)（不是主 `langchain` 存储库），遵循匹配的模板，然后遵循 [documentation guide](/oss/javascript/contributing/documentation)。如果您的包之前已在 [⟦T12⟧](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml) 中列出，请删除同一 PR 中的该 YAML 条目，以便表不会显示重复的行。

除非维护者要求，否则不要在 frontmatter 中设置 `featured: true`。特色状态是维护者的决定。

<Info>
  托管指南 PR 仅用于**文档**。您的集成包本身应该位于您的 GitHub 组织或帐户下自己的存储库中，并作为独立包发布。
</Info>

<Warning>
  如果出现以下情况，我们可能会拒绝列表问题或 PR，或要求修改：

  * 当请求托管页面时，该包不满足[hosted-guide eligibility criteria](#eligibility-for-hosted-guides)
  * CI 检查失败
  * 存在严重的语法错误或拼写错误
  * [Mintlify components](/oss/javascript/contributing/documentation#mintlify-components)使用错误
  * 页面缺少 [frontmatter](/oss/javascript/contributing/documentation#page-structure)
  * [Localization](/oss/javascript/contributing/documentation#localization) 缺失（如适用）
  * [Code examples](/oss/javascript/contributing/documentation#in-code-documentation) 不运行或有错误
  * 不满足[Quality standards](/oss/javascript/contributing/documentation#quality-standards)
</Warning>

由于我们处理大量提交，请耐心等待。打开自动 PR 后查看它。 **不要重复标记维护者关于您的问题或 PR。**

<Note>
  如果 PR 包含 AI 生成的内容，您必须遵守我们的 [acceptable uses of LLMs](/oss/javascript/contributing/overview#acceptable-uses-of-llms) 政策。
</Note>

## 后续步骤

**恭喜！** 您的集成已发布并在 LangChain 社区列出。<Card title="Co-marketing" icon="speakerphone" href="/oss/javascript/contributing/comarketing">
  与LangChain营销团队联系，探索联合营销机会。
</Card>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/publish-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>