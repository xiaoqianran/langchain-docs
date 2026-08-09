<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Publish an integration | https://docs.langchain.com/oss/python/contributing/publish-langchain -->

# 发布集成

**将您的集成提供给社区。**

<Warning>
  **请勿将集成 PR 提交到 LangChain 或 Deep Agents 存储库。**

  新集成应在您自己的 GitHub 组织或帐户（例如 `langchain-yourservice`）下作为 **独立 PyPI 包** 发布，而不是作为 [⟦T1⟧](https://github.com/langchain-ai/langchain) 存储库的 PR 发布。

  主存储库仅包含由 LangChain 团队维护的一小部分第一方集成（例如 OpenAI、Anthropic 和 Ollama）。
</Warning>

现在您的包已实现并经过测试，您可以发布它并列出它，以便社区可以发现它。

## 发布你的包

<Info>
  本指南假设您已经实现了您的包并为其编写了测试。如果还没有，请参阅[implementation guide](/oss/python/contributing/implement-langchain)和[testing guide](/oss/python/contributing/standard-tests-langchain)。
</Info>

出于本指南的目的，我们将使用 PyPI 作为包注册表。如果您愿意，您可以选择发布到其他注册管理机构；说明会有所不同。

### 设置凭据

首先，确保您有 PyPI 帐户：

<AccordionGroup>
  <Accordion title="How to create a PyPI Token" icon="key">
    <Steps>
      <Step title="Create account">
        前往[PyPI website](https://pypi.org/)并创建一个帐户
      </Step><Step title="Verify email">
        单击 PyPI 通过电子邮件发送给您的链接来验证您的电子邮件地址
      </Step>

      <Step title="Enable 2FA">
        转到您的帐户设置并单击“生成恢复代码”以启用 2FA。要生成 API 令牌，您**必须**启用 2FA
      </Step>

      <Step title="Generate token">
        转到您的帐户设置并[generate a new API token](https://pypi.org/manage/account/token/)
      </Step>
    </Steps>
  </Accordion>
</AccordionGroup>

### 构建并发布

<Card title="How to publish a package" icon="upload" href="https://docs.astral.sh/uv/guides/package/">
  来自 `uv` 的关于如何构建包并将其发布到 PyPI 的有用指南。
</Card>

## 让您的集成可被发现

发布后，在[LangChain docs repository](https://github.com/langchain-ai/docs)中打开PR，这样你的包就会出现在[integrations tab](/oss/python/integrations/providers/overview)下。您打开哪个 PR 取决于托管指南的资格。

### 托管指南的资格

仅当 **任一** 时，LangChain 才会在此文档存储库中托管完整的集成指南：

* 该软件包在 PyPI（或 TypeScript 的 npm）上每月至少有 **50,000 次下载**，**或**
* 维护者将集成标记为**特色**

如果您不满足任一条件，请不要**打开添加新文档页面的 PR。相反，添加 YAML 列表，以便包显示在组件下载表中，并带有指向您自己的文档的链接。

### 下载表中的列表（默认）打开一个向 [⟦T3⟧](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml) 添加条目的 PR。

每个参赛作品至少需要：

* **`name`**：LangChain类或显示名称（例如，`ChatAI21`）。
* **`pypi`** 或 **`npm`**：用于下载徽章的注册表包名称。
* **`docs_url`**：名称栏的链接。首选合作伙伴文档，然后是 GitHub 存储库，然后是 PyPI 或 npm 页面。

可以选择包含特定于组件的字段（例如，`stream` 和 `tool_calling` 等聊天功能标志），以便表列保持准确。遵循相同语言和组件部分中的现有条目。

合并后，刷新作业会重新生成组件表片段，以便您的行与托管集成一起显示。

<Info>
  此 PR 仅用于**列出元数据**。在您的网站或 GitHub README 上托管您的使用文档。您的集成包本身应该位于您的 GitHub 组织或帐户下的自己的存储库中，作为独立包发布。
</Info>

### 托管指南（50K+ 或精选）

如果您的包符合 [eligibility criteria](#eligibility-for-hosted-guides)，请从以下模板之一创建文档页面，并在文档存储库中打开 PR。根据您构建的集成类型，您将需要创建不同类型的文档页面。 LangChain 提供了不同类型集成的模板来帮助您入门。

<CardGroup>
  <Card title="Chat models" icon="message" href="https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/chat/TEMPLATE.mdx" />

  <Card title="Tools/toolkits" icon="tool" href="https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/tools/TEMPLATE.mdx" />

  <Card title="Middleware" icon="plug" href="https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/middleware/TEMPLATE.mdx" />

  <Card title="Vector stores" icon="database" href="https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/vectorstores/TEMPLATE.mdx" />
</CardGroup>

<Tip>
  要参考现有文档，您可以查看 [list of integrations](/oss/python/integrations/providers/overview) 并找到与您的类似的文档。

  要以原始 Markdown 格式查看给定文档页面，请使用页面右上角“复制页面”旁边的下拉按钮，然后选择“以 Markdown 形式查看”。
</Tip>

在个人 GitHub 帐户下创建 [LangChain docs repository](https://github.com/langchain-ai/docs)（不是主 `langchain` 存储库）的分支，并在本地克隆它。为您的集成创建一个新分支。复制模板并使用您最喜欢的 Markdown 文本编辑器对其进行修改。编写文档时请务必参考并遵循 [documentation guide](/oss/python/contributing/documentation)。

如果您的包之前已在 [⟦T12⟧](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml) 中列出，请删除同一 PR 中的该 YAML 条目，以便表不会显示重复的行。

除非维护者要求，否则不要在 frontmatter 中设置 `featured: true`。特色状态是维护者的决定。<Info>
  此 PR 仅用于**文档**。您的集成包本身应该位于您的 GitHub 组织或帐户下的自己的存储库中，作为独立包发布。
</Info>

<Warning>
  如果出现以下情况，我们可能会拒绝 PR 或要求修改：

  * 包裹不符合[hosted-guide eligibility criteria](#eligibility-for-hosted-guides)
  * CI 检查失败
  * 存在严重的语法错误或拼写错误
  * [Mintlify components](/oss/python/contributing/documentation#mintlify-components)使用错误
  * 页面缺少 [frontmatter](/oss/python/contributing/documentation#page-structure)
  * [Localization](/oss/python/contributing/documentation#localization) 缺失（如适用）
  * [Code examples](/oss/python/contributing/documentation#in-code-documentation) 不运行或有错误
  * 不满足[Quality standards](/oss/python/contributing/documentation#quality-standards)
</Warning>

由于我们处理大量 PR，请耐心等待。我们将尽快审核您的 PR 并提供反馈或合并。 **不要重复为您的 PR 标记维护者。**

<Note>
  如果您的 PR 包含人工智能生成的内容，您必须遵守我们的 [acceptable uses of LLMs](/oss/python/contributing/overview#acceptable-uses-of-llms) 政策。
</Note>

## 后续步骤

**恭喜！** 您的集成已发布并在 LangChain 社区列出。

<Card title="Co-marketing" icon="speakerphone" href="/oss/python/contributing/comarketing">
  与LangChain营销团队取得联系，探索联合营销机会。
</Card>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/publish-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>