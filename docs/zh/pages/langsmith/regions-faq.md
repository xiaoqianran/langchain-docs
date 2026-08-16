<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Regions FAQ | https://docs.langchain.com/langsmith/regions-faq -->

# 地区常见问题解答

<Note>
有关更多详细信息，请参阅[cloud architecture reference](/langsmith/cloud#cloud-architecture-and-scalability)。
</Note>

## 法律与合规

#### *LangSmith（包括其区域实例）遵守哪些隐私和数据保护框架？*

LangSmith 遵守《通用数据保护条例》(GDPR) 以及适用于LangSmith 服务的其他法律法规。我们还通过了 SOC 2 Type 2 认证，并且符合 HIPAA 标准。您可以在[trust.langchain.com](https://trust.langchain.com)索取有关我们安全政策和状况的更多信息。如果您想与我们签署数据处理附录 (DPA)，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员。

有关LangSmith引擎的安全状况，包括其模型子处理器和数据处理，请参阅[Engine security](/langsmith/engine-security)。

#### *我的公司不在某个地区，我仍然可以在那里托管我的数据吗？*

是的，您可以将 LangSmith 数据托管在受支持的区域实例中，无论您所在的位置如何。

#### *您在欧盟有可以与我们签订合同的法人实体吗？*

目前，我们在欧盟没有法人实体来签订客户合同。

#### *如果我选择特定区域，是否适用不同的法律条款？*

这些术语在受支持的云区域中是相同的。

＃＃ 特征#### *如何使用特定区域实例？*

按照[account and API key setup guide](/langsmith/create-account-api-key)创建帐户和API密钥。确保在区域下拉列表中选择正确的区域。

#### *云管理的 LangSmith 区域之间是否存在功能差异？*

根据功能的不同，每个区域的启动之间可能会有轻微的延迟。除此之外，支持的云区域在功能上是等效的。

#### *一个组织可以在不同地区拥有工作空间吗？*

LangSmith 目前不支持此功能，但如果您有兴趣，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员并分享您的用例。

#### *我可以跨区域连接组织并共享账单吗？*

LangSmith 目前不支持此功能，但如果您有兴趣，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员并分享您的用例。

#### *哪些数据将存储在我选择的区域中？*

详情请参阅[cloud architecture reference](/langsmith/cloud#cloud-architecture-and-scalability)。

#### *我如何查看我的组织的区域？*

检查您的 URL - [https://smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-regions-faq) 上的组织位于 GCP US，[https://eu.smith.langchain.com](https://eu.smith.langchain.com) 上的组织位于 GCP EU，[https://apac.smith.langchain.com](https://apac.smith.langchain.com) 上的组织位于 GCP APAC，[https://aws.smith.langchain.com](https://aws.smith.langchain.com) 上的组织位于 AWS US。

#### *我可以在区域之间切换我的组织吗？*目前我们不支持跨区域迁移，但如果您对此功能感兴趣，请通过[support.langchain.com](https://support.langchain.com)联系支持。

## 计划和定价

#### *所有 LangSmith 计划都提供区域实例吗？*

是的，您可以在所有计划（包括免费计划）上注册受支持的区域实例。

#### *定价因地区而异吗？*

不，受支持的云区域的定价是相同的。

#### *如果我使用区域实例，使用什么货币进行支付？*

所有LangSmith计划均以美元支付。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/regions-faq.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>