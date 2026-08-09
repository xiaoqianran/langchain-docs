<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine on Self-hosted | https://docs.langchain.com/langsmith/engine-self-hosted -->

# 自托管的 LangSmith 引擎

LangSmith Engine 如何在自托管部署中运行、它依赖于环境之外的内容以及它如何处理您的数据。

<Info>
  自托管引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。它在早期图表版本中不可用。 [Contact your account team](https://www.langchain.com/contact-sales) 将权利添加到您的订单中。
</Info>

LangSmith Engine 是 LangSmith 中的一个代理，它监视您的生产跟踪，将它们聚集成问题，根据源代码诊断每个问题，提出修复方案作为 PR，并识别地面实况评估以添加到您的数据集。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

本页介绍了 Engine 如何在自托管 LangSmith 中运行、它依赖于您环境之外的内容，以及这对您的数据意味着什么。要安装它，请参阅[Enable Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)。要将其连接到您的源代码，请创建并配置您自己的 GitHub 应用程序，如 [Connect Engine to GitHub](/langsmith/engine-github) 中所述。

引擎处理三种数据：* **代码**（可选）**：** 您的代理的来源，引擎读取该来源以诊断问题并提出修复建议。
* **跟踪：** 来自代理的运行时数据，其中可以包括用户消息、工具输出和 PII。
* **模型：** LLM 调用引擎来运行诊断、生成修复程序和编写评估程序。

在自托管 LangSmith 中，Engine 的编排作为 LangSmith 的一部分在您的 VPC 内运行：读取跟踪、读取代码并运行其检测、修复和验证循环。然而，它不能完全在那里运行。 Engine 依赖于 LangSmith Intelligence (LSI)，这是一项由 LangChain 管理的零数据保留 (ZDR) 服务，并向 LSI 发送其工作所需的内容。

## 按云和区域划分的可用性

引擎取决于 LSI 覆盖范围。该覆盖范围正在扩大，因此可用性因云和区域而异：

|云|地区 |状态 |
| -----| ------ | ---------|
|亚马逊AWS |美国 |可用 |
| GCP |美国 |可用 |
|亚马逊AWS |欧盟|计划|
|天蓝色|美国 |计划|

请联系您的客户团队以确认您所在地区的覆盖范围和当前时间。

## 它是如何工作的

LSI 是由 LangChain 管理的服务，为 Engine 提供动力。

流程：* 您的自托管引擎向其云的 LSI 网关发送 HTTPS 请求，该云在此页面的每个云部分中列出。
* 引擎使用 LangSmith 许可证验证期间获得的短期许可证 JWT 进行身份验证。您不提供单独的模型提供者凭据。
* LSI 验证 JWT 并通过 LangChain 环境内的专用网络将请求路由到模型提供商。
* LSI 将响应返回到您的自承载引擎。

每个请求都携带引擎完成其工作所需的跟踪内容、代码和中间输出。 LSI 和模型提供者处理该内容来满足请求。 LSI 不保留提示或完成主体。

您的集群必须允许到该网关的出站 HTTPS。本文档不假设从您的环境到 LSI 的连接使用 AWS PrivateLink。如果您的安全策略需要专用连接，请在启用引擎之前联系您的客户团队以确认可用性和设置。如果与 LSI 的连接不可用，引擎将无法关闭。没有集群内模型，也没有可以依靠的辅助提供商，因此受影响的运行以错误结束，而不是降级为较低质量的输出。 LangSmith 部署的其余部分不受影响，并且引擎会再次尝试进行下一次计划扫描。

## LangSmith Intelligence 保留的内容

LSI 不保留提示或完成主体。它保留以下元数据用于使用归因和计费：

* 用于归因使用情况的帐户、工作区和项目标识符。
* 用于计费的模型和令牌使用元数据。

有关模型提供商的保留和培训承诺，请参阅[Engine security](/langsmith/engine-security)。

### AWS（美国可用）

网关主机是`beacon.aws.langchain.com`。 LSI 将请求路由到 LangChain 的 AWS 环境中的 AWS Bedrock。

<Frame>
  <img alt="Architecture diagram. Your VPC contains the LangSmith UI, an NLB, an EKS cluster running LangSmith services, and storage on S3, RDS, and ElastiCache. LangChain's cloud contains billing, a monitoring stack, and LangSmith Intelligence, which sends model inference requests to Bedrock. The two environments are connected by a private link." />
</Frame>

### GCP（在美国提供）

网关主机是`beacon.langchain.com`。 LSI 将请求路由到 LangChain 的 GCP 环境中的 Vertex。

<Note>
  这与自托管 LangSmith 已用于许可证验证和计费遥测的主机相同，因此 GCP 部署添加了一条路径，而不是新的出口目的地。参见[Configure egress](/langsmith/self-host-egress)。
</Note>

<Frame>
  <img alt="Architecture diagram showing a self-hosted LangSmith deployment in your GCP project connecting to LangSmith Intelligence in LangChain's cloud, which sends model inference requests to Vertex" />
</Frame>

## 型号选择和质量模型选择在很大程度上决定了 Engine 的有效性。引擎在其工作的每个步骤中使用不同的模型，进行不同的调整：聚类问题、根据代码诊断根本原因、生成修复程序以及编写验证它的评估器。 LangChain 对这些模型的质量和代币效率进行了调整，并随着更好的模型发布而对其进行升级。

托管推理使这成为可能。由于引擎始终运行 LangChain 为每个步骤调整的模型，因此随着这些模型的升级，行为会保持一致并得到改进。自带密钥设置会将引擎与您配置的模型联系起来，因此调整和令牌效率会因请求而异。

## 这对您的数据意味着什么

在自托管中，引擎将您的环境和 LangChain 的环境之间的数据处理分开：

* **您的环境：** 引擎编排和 LangSmith 存储的跟踪保留在您的自托管环境中。
* **LangChain的环境：** Content Engine发送的内容由LSI和模型提供者处理。 LSI 保留上面列出的计费元数据，但不保留提示或完成主体。[Engine security](/langsmith/engine-security) 中描述了引擎独立于部署的数据处理，包括每个模型提供商的零数据保留以及不使用客户数据来训练或微调模型。

## 另请参阅

* [Enable Engine on self-hosted](/langsmith/deploy-self-hosted-full-platform#enable-engine)
* [Connect Engine to GitHub](/langsmith/engine-github)
* [Engine](/langsmith/engine-overview)
* [Configure Engine](/langsmith/engine)
* [Engine security](/langsmith/engine-security)
* [Engine webhooks](/langsmith/engine-webhooks)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>