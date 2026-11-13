<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC onboarding | https://docs.langchain.com/langsmith/byoc-onboarding-aws -->

# BYOC 入职

设置 LangSmith BYOC 数据平面，从在组织上启用 BYOC 到创建工作区和私密连接。

本页介绍 AWS 上的 BYOC。有关 GCP 上的 BYOC，请参阅 [BYOC onboarding on GCP](/langsmith/byoc-onboarding-gcp) 或 [BYOC onboarding on Azure](/langsmith/byoc-onboarding-azure)。

在开始之前，请先查看[prerequisites](/langsmith/byoc#prerequisites)。

默认情况下，LangChain 为您的数据平面创建 VPC。要自行创建和管理网络，请在创建下面的 IAM 角色和数据平面之前遵循[Bring your own VPC on AWS](/langsmith/byoc-byovpc-aws)。

**1.在您的组织上启用 BYOC**

在 AWS 上的 [aws.smith.langchain.com](https://aws.smith.langchain.com) 的 LangSmith 中创建一个组织，或重复使用现有组织。

将您的组织 ID 发送给 LangChain 团队以启用 BYOC。

**2.创建 IAM 角色**

LangChain 提供 IAM 角色的外部 ID。导航到 **设置 > 数据平面**，然后使用 **数据平面** 标题旁边的复制按钮进行复制。

使用复制的外部 ID 在您的 AWS 账户中应用 [⟦T0⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)。这将创建跨账户角色LangChain，负责配置和管理数据平面。角色的信任策略必须在其 `ExternalId` 条件下使用此值。

对于 BYOVPC，设置 `allow_vpc_creation_permissions = false` 并在 `vpc_ids` 中提供您的 VPC ID。参见[Create the reduced-permission IAM role](/langsmith/byoc-byovpc-aws#create-the-reduced-permission-iam-role)。

要使用您自己的 KMS 密钥加密数据平面，还需设置 `cmk_service_key_arns`。参见[Bring your own keys](/langsmith/byoc-byok-aws)。> [!注意]
>
> LangChain 建议专门用于 LangSmith BYOC 的新 AWS 账户。

**3.创建数据平面**

导航到 **设置 > 数据平面** 并使用以下参数创建数据平面：

* **名称**：小写字母、数字和连字符，最多 24 个字符。
* **AWS 区域**：[supported regions](/langsmith/byoc#regions-and-cloud-providers) 之一。
* **AWS IAM 角色 ARN**：您在上一步中创建的角色的 ARN，LangSmith 在您的账户中代入。

在 **配置** 下，默认值适用于大多数数据平面。您可以更改这些设置：* **网络**：默认情况下，LangSmith 从`/16` 到 `/18` 的私有 RFC 1918 CIDR 范围创建 VPC，例如 `10.20.0.0/16`。要使用您自己的 VPC，请选择 **使用现有 VPC** 并提供 [VPC and subnet IDs](/langsmith/byoc-byovpc-aws#supply-the-vpc-and-subnet-ids)。默认情况下，负载均衡器是**私有**，只能从 VPC 内部访问。选择 **面向 Internet** 为您的应用程序提供公共端点。对于您自己的 VPC，面向互联网的负载均衡器需要公有子网 ID。
* **IAM 角色**：默认情况下，LangSmith 创建数据平面 IAM 角色。要使用您创建的角色，请选择 **使用现有 IAM 角色** 并按照 [Bring your own IAM roles](/langsmith/byoc-byoiam-aws) 操作。
* **加密密钥**：默认情况下，AWS 管理的密钥对静态数据进行加密。要使用您自己的 KMS 密钥，请为所有服务选择一个密钥或为每个服务选择一个密钥。参见[Bring your own keys](/langsmith/byoc-byok-aws)。
* **沙箱**：默认关闭。打开它们来运行 [sandboxes](/langsmith/sandboxes)，这是引擎和一些评估器所需要的。
* **EKS API 访问**：新数据平面默认通过 PrivateLink 到达 EKS API。
* **标签**：最多 40 个应用于 LangSmith 创建的 AWS 资源的自定义标签。键必须是唯一的，值可以为空。 AWS 和LangSmith 系统标签已保留。

**4.等待配置**LangChain 代表您配置基础设施。数据平面从`Requested`移动到`Provisioning`再到`Active`。

对于 BYOVPC，LangSmith 在预配之前验证您的 VPC 和子网，然后在您的 VPC 内创建工作负载基础设施。

> [!注意]
>
> 数据平面的端到端配置大约需要 60 到 90 分钟。

在 **设置 > 数据平面** 中跟踪其状态。如果数据平面过渡到`Provisioning Failed`，请联系LangChain团队。

**5.设置专用连接**

默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能访问它，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。

在 **设置 > 数据平面** 下找到 API URL。

如果您打开工作区并看到以下屏幕，则您的计算机无法通过网络访问该工作区的数据平面。 LangSmith 前端在您的浏览器中运行并直接调用数据平面，因此您的计算机必须位于可以到达数据平面的专用端点的网络上。通过您的专用连接选项进行连接，然后刷新页面。

![LangSmith error screen titled You may not have network access to this workspace. It states that LangSmith cannot reach the data plane for the selected workspace and lists other workspaces grouped by data plane. Reachable data planes show a green header with active Switch buttons. The unreachable data plane shows a red header with disabled Switch buttons.](https://mintcdn.com/langchain-5e9cc07a/a_vO91vE4oZRWYyY/langsmith/images/byoc-data-plane-unreachable.png?fit=max\&auto=format\&n=a_vO91vE4oZRWYyY\&q=85\&s=881f94a84e295064162e8673517245fd)

从此屏幕中，您可以切换到可访问的数据平面上的工作区，该工作区可以是云工作区。

**6。创建工作区**名为 `dp-<data_plane_name>` 的工作空间会在新数据平面内自动配置。在数据平面可达之前，它是不可访问的。

您可以在数据平面中创建其他工作区。创建每个数据平面时选择目标数据平面：一个工作空间只属于一个数据平面，一个数据平面可以容纳多个工作空间。

> [!警告]
>
> 创建工作区时请仔细选择正确的数据平面。工作空间创建后无法移动到另一个数据平面。

**7. （可选）迁移现有数据**

如果您从现有的LangSmith云或[self-hosted](/langsmith/self-hosted)实例迁移，则可以复制用户、角色、数据集、提示、实验、注释队列配置、自动化规则、仪表板和队列资源。 AWS 支持跟踪迁移。联系LangChain团队安排。

欲了解更多信息，请参阅[Migrate to BYOC](/langsmith/byoc-migration)。

## 后续步骤

* [Use your data plane](/langsmith/byoc-usage) 将应用程序和 API 客户端指向正确的端点。
* [BYOC architecture](/langsmith/byoc-architecture-aws) 涵盖了 LangChain 的规定以及飞机如何通信。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-onboarding-aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。