<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine on Self-hosted | https://docs.langchain.com/langsmith/engine-self-hosted -->

# LangSmith 自托管引擎

LangSmith 引擎如何在自托管部署中运行、它依赖于您的环境之外的什么以及它如何处理您的数据。

<Info>
  自承载引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。它在早期图表版本中不可用。 [Contact your account team](https://www.langchain.com/contact-sales) 将权利添加到您的订单中。
</Info>

LangSmith引擎是LangSmith中的一个代理，它监视您的生产跟踪，将它们聚集成问题，根据源代码诊断每个问题，提出修复作为PR，并识别地面真实评估以添加到您的数据集。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

本页介绍了引擎如何在自托管 LangSmith 中运行、它依赖于您的环境之外的因素，以及这对您的数据意味着什么。要安装它，请参阅[Enable Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)。要将其连接到您的源代码，请创建并配置您自己的 GitHub 应用程序，如 [Connect Engine to GitHub](/langsmith/engine-github) 中所述。

引擎处理三种数据：* **代码**（可选）**：** 您的代理的来源，引擎读取该来源以诊断问题并提出修复建议。
* **跟踪：** 来自代理的运行时数据，其中可以包括用户消息、工具输出和 PII。
* **模型：** LLM 调用引擎来运行诊断、生成修复程序和编写评估程序。

在自托管 LangSmith 中，引擎的编排作为 LangSmith 的一部分在您的 VPC 内运行：读取跟踪、读取代码并运行其检测、修复和验证循环。然而，它不能完全在那里运行。引擎依赖于 LangSmith Intelligence (LSI)，即 LangChain 管理的零数据保留 (ZDR) 服务，并向 LSI 发送其工作所需的内容。

## 按云和区域划分的可用性

引擎取决于 LSI 覆盖范围。该覆盖范围正在扩大，因此可用性因云和区域而异：

|云|地区 |状态 |
| -----| ------ | --------- |
|亚马逊AWS |美国 |可用 |
| GCP |美国 |可用 |
|亚马逊AWS |欧盟|计划|
|天蓝色|美国 |计划|

请联系您的客户团队以确认您所在地区的覆盖范围和当前时间。

## 它是如何工作的

LSI 是为引擎提供支持的LangChain 托管服务。

流程：* 您的自托管引擎向其云的 LSI 网关发送 HTTPS 请求，该云在此页面的每个云部分中列出。
* 引擎使用在 LangSmith 许可证验证期间获得的短期许可证 JWT 进行身份验证。您不提供单独的模型提供者凭据。
* LSI 验证 JWT 并通过 LangChain 环境内的专用网络将请求路由到模型提供者。
* LSI 将响应返回到您的自承载引擎。

每个请求都携带引擎完成其工作所需的跟踪内容、代码和中间输出。 LSI 和模型提供者处理该内容来满足请求。 LSI 不保留提示或完成主体。

您的集群必须允许到该网关的出站 HTTPS。连接可以使用公共出口或专用连接。在 AWS 上，请遵循 [Connect with AWS PrivateLink](#connect-with-aws-privatelink) 将引擎流量保持在专用网络上。

如果与 LSI 的连接不可用，引擎将停止并返回错误，而不是降级为较低质量的输出。没有集群内模型，也没有可以依赖的辅助提供商。 LangSmith 部署的其余部分不受影响，并且引擎会再次尝试进行下一次计划扫描。

## LangSmith 智能保留了什么LSI 不保留提示或完成主体。它保留以下元数据用于使用归因和计费：

* 用于归因使用情况的帐户、工作区和项目标识符。
* 用于计费的模型和令牌使用元数据。

有关模型提供商的保留和培训承诺，请参阅[Engine security](/langsmith/engine-security)。

### AWS（美国可用）

网关主机是`beacon.aws.langchain.com`。 LSI 将请求路由到 LangChain 的 AWS 环境中的 AWS Bedrock。

#### 使用 AWS PrivateLink 连接

[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 将引擎流量从 VPC 路由到 LSI，而不将该流量暴露到公共互联网。 LSI端点服务托管在`us-east-2`，AWS支持其他区域的VPC访问。

在开始之前，请收集您的 AWS 账户 ID、VPC ID、私有子网 ID 和终端节点的安全组。将安全组配置为仅允许来自附加到运行引擎的节点或工作负载（或包含它们的最小私有 CIDR）的安全组的端口 443 上的入站 TCP 流量。不允许`0.0.0.0/0`。

要将您的 VPC 连接到 LSI：

<Steps>
  <Step title="Request access">
    请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)并提供您的 AWS 账户 ID。 LangChain 将您的帐户添加到端点服务的允许主体列表中。
  </Step><Step title="Create the interface VPC endpoint">
    为包含您的 VPC 的区域配置 AWS 提供商。将 `service_region` 设置为 `us-east-2`，包括当您的 VPC 位于其他区域时。每个可用区选择一个私有子网。

    <Note>
      `service_region` 参数需要 HashiCorp AWS 提供商 `5.82.0` 或更高版本。
    </Note>

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_vpc_endpoint" "langsmith_intelligence" {
      vpc_id              = var.vpc_id
      service_name        = "com.amazonaws.vpce.us-east-2.vpce-svc-054f37092752bff6b"
      service_region      = "us-east-2"
      vpc_endpoint_type   = "Interface"
      subnet_ids          = var.private_subnet_ids
      security_group_ids  = [var.security_group_id]
      private_dns_enabled = false
    }
    ```
  </Step>

  <Step title="Wait for LangChain to accept the connection">
    LangChain接受连接后，端点状态从`pendingAcceptance`变为`available`。在测试连接之前，请等待几分钟让更改传播。
  </Step>

  <Step title="Route the LSI hostname to the endpoint">
    为您的 VPC 启用 DNS 解析和 DNS 主机名。然后，创建 Route 53 私有托管区域和别名记录，以便 `beacon.aws.langchain.com` 解析为 VPC 内的 VPC 终端节点。保持此主机名不变，以便 TLS 证书验证成功。当端点不可用时，私有托管区域还可以防止回退到公共 DNS。

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_route53_zone" "langsmith_intelligence" {
      name = "beacon.aws.langchain.com"

      vpc {
        vpc_id = var.vpc_id
      }
    }

    resource "aws_route53_record" "langsmith_intelligence" {
      zone_id = aws_route53_zone.langsmith_intelligence.zone_id
      name    = "beacon.aws.langchain.com"
      type    = "A"

      alias {
        name                   = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].dns_name
        zone_id                = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].hosted_zone_id
        evaluate_target_health = true
      }
    }
    ```

    如果工作负载使用公司 DNS 解析器而不是 Amazon 提供的解析器，请配置条件转发到 Route 53 解析器，或为指向终端节点 DNS 名称的 `beacon.aws.langchain.com` 创建等效的私有 DNS 覆盖。
  </Step>

  <Step title="Verify private connectivity">
    从运行引擎的节点或容器中，解析网关主机名：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    getent ahostsv4 beacon.aws.langchain.com
    ```确认结果包含分配给端点网络接口的专用 IP 地址。然后[enable Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)，开始分析，并确认成功完成。
  </Step>
</Steps>

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

## 型号选择和质量

模型选择在很大程度上决定了 Engine 的有效性。引擎在其工作的每个步骤中使用不同的模型，进行不同的调整：聚类问题、根据代码诊断根本原因、生成修复程序以及编写验证它的评估器。 LangChain 调整这些模型的质量和代币效率，并随着更好的模型发布而升级它们。托管推理使这成为可能。由于引擎始终运行LangChain已针对每个步骤进行调整的模型，因此随着这些模型的升级，行为会保持一致并得到改进。自带密钥设置会将引擎与您配置的模型联系起来，因此调整和令牌效率会因请求而异。

## 这对您的数据意味着什么

在自托管中，引擎将您的环境和 LangChain 之间的数据处理分开：

* **您的环境：** 引擎编排和LangSmith存储的跟踪保留在您的自托管环境中。
* **LangChain的环境：** Content Engine发送的内容由LSI和模型提供者处理。 LSI 保留上面列出的计费元数据，但不保留提示或完成主体。

[Engine security](/langsmith/engine-security) 中描述了引擎独立于部署的数据处理，包括每个模型提供商的零数据保留以及不使用客户数据来训练或微调模型。

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