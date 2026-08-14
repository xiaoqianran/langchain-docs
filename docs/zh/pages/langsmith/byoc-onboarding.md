<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC onboarding | https://docs.langchain.com/langsmith/byoc-onboarding -->

# BYOC 入职

设置 LangSmith BYOC 数据平面，从在组织上启用 BYOC 到创建工作区和私密连接。

在开始之前，请先查看 [prerequisites](/langsmith/byoc#prerequisites)。

<Steps>
  <Step title="Enable BYOC on your organization">
    在 AWS 上的 [aws.smith.langchain.com](https://aws.smith.langchain.com) 的 LangSmith 中创建一个组织，或重复使用现有组织。

    将您的组织 ID 发送给 LangChain 团队以启用 BYOC。
  </Step>

  <Step title="Create the IAM role">
    在您的 AWS 账户中应用 [⟦T0⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)。这将创建跨账户角色LangChain，负责配置和管理数据平面。

    <Note>
      LangChain 建议专门用于 LangSmith BYOC 的新 AWS 账户。
    </Note>
  </Step>

  <Step title="Create the data plane">
    导航到 **设置 > 数据平面** 并使用以下参数创建数据平面：* **名称**：小写字母、数字和连字符，最多 24 个字符。
    * **AWS 区域**：[supported regions](/langsmith/byoc#regions-and-cloud-providers) 之一。
    * **AWS IAM 角色 ARN**：您在上一步中创建的角色的 ARN，LangSmith 在您的账户中代入。
    * **外部 ID**：必须与角色信任策略中的 `ExternalId` 条件匹配。
    * **VPC CIDR 范围**：私有 RFC 1918 范围，从 `/16` 到 `/18`。
    * **负载均衡器访问**：默认情况下为私有，这使得入口负载均衡器只能从您的 VPC 访问。将其设置为 **Public** 以使负载均衡器面向互联网。
  </Step>

  <Step title="Wait for provisioning">
    LangChain 代表您配置基础设施。数据平面从`Requested`移动到`Provisioning`再到`Active`。

    <Note>
      数据平面的端到端配置大约需要 60 到 90 分钟。
    </Note>

    在 **设置 > 数据平面** 中跟踪其状态。如果数据平面过渡到`Provisioning Failed`，请联系LangChain团队。
  </Step>

  <Step title="Set up private connectivity">
    默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能访问它，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。在 **设置 > 数据平面** 下找到 API URL。如果前端无法访问您的数据平面，LangSmith 会提示您切换到可访问的数据平面上的工作区，该工作区可以是云工作区。
  </Step>

  <Step title="Create workspaces">
    名为 `dp-<data_plane_name>` 的工作空间会在新数据平面内自动配置。在数据平面可达之前，它是不可访问的。

    您可以在数据平面中创建其他工作区。创建每个数据平面时选择目标数据平面：一个工作空间只属于一个数据平面，一个数据平面可以容纳多个工作空间。

    <Warning>
      创建工作区时请仔细选择正确的数据平面。工作空间创建后无法移动到另一个数据平面。
    </Warning>
  </Step>

  <Step title="(Optional) Migrate existing data">
    如果您从现有的LangSmith云或[self-hosted](/langsmith/self-hosted)实例迁移，则可以复制用户、角色、数据集、提示、实验、注释队列配置、自动化规则和仪表板。今天无法迁移痕迹。

    要计划迁移，请联系 LangChain 团队。
  </Step>
</Steps>

## 后续步骤* [Use your data plane](/langsmith/byoc-usage) 将应用程序和 API 客户端指向正确的端点。
* [BYOC architecture](/langsmith/byoc-architecture) 涵盖了 LangChain 的规定以及飞机如何通信。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-onboarding.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>