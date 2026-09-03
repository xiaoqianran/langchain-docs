<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine on Self-hosted | https://docs.langchain.com/langsmith/engine-self-hosted -->

# LangSmith 自托管引擎

<Info>
自承载引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。它在早期图表版本中不可用。 [Contact our sales team](https://www.langchain.com/contact-sales) 将权利添加到您的订单中。
</Info>

LangSmith引擎是LangSmith中的一个代理，它监视您的生产跟踪，将它们聚集成问题，根据源代码诊断每个问题，提出修复作为PR，并识别地面真实评估以添加到您的数据集。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

在自托管 LangSmith 中，引擎的编排（包括其检测、修复和验证循环）作为 LangSmith 的一部分在您的 VPC 内运行。模型工作无法完全在您的 VPC 中运行：引擎将其所需的内容发送到LangSmith Intelligence (LSI)，这是LangChain 托管的零数据保留 (ZDR) 服务。

本页涵盖了两部分：引擎依赖于您的环境之外的内容，以及如何在您的实例上[install Engine](#install-engine)。要将 Engine 连接到您的源代码，请创建并配置您自己的 GitHub 应用程序，如 [Connect Engine to GitHub](/langsmith/engine-github) 中所述。

引擎处理三种数据：- **代码**（可选）**：** 您的代理的来源，引擎读取该来源以诊断问题并提出修复建议。
- **跟踪：** 来自代理的运行时数据，其中可以包括用户消息、工具输出和 PII。
- **模型：** LLM 调用引擎来运行诊断、生成修复程序和编写评估程序。

## 按云和区域划分的可用性

当 LSI 可用时，引擎可用：

|云|地区 |状态 |
| --- | --- | --- |
|亚马逊AWS |美国 |可用 |
| GCP |美国 |可用 |

对于其他地区的可用性，[contact our sales team](https://www.langchain.com/contact-sales)。

## 它是如何工作的

LSI 是为引擎提供支持的LangChain 托管服务。

流程：

- 您的自托管引擎向其云的 LSI 网关发送 HTTPS 请求，该云在此页面的每个云部分中列出。
- 引擎使用在 LangSmith 许可证验证期间获得的短期许可证 JWT 进行身份验证。您不提供单独的模型提供者凭据。
- LSI 验证 JWT 并通过 LangChain 环境内的专用网络将请求路由到模型提供者。
- LSI 将响应返回到您的自承载引擎。每个请求都携带引擎完成其工作所需的跟踪内容、代码和中间输出。 LSI 和模型提供者处理该内容来满足请求。

您的集群必须允许到该网关的出站 HTTPS。连接可以使用公共出口或专用连接。在 AWS 上，遵循 [Connect with AWS PrivateLink](#connect-with-aws-privatelink) 将引擎流量保持在专用网络上。

如果与 LSI 的连接不可用，引擎将停止并返回错误，而不是降级为较低质量的输出。没有集群内模型，也没有可以依赖的辅助提供商。 LangSmith 部署的其余部分不受影响，并且引擎会再次尝试进行下一次计划扫描。

## LangSmith 智力保留了什么

LSI 不会保留提示或模型响应的内容。它保留以下元数据用于使用归因和计费：

- 用于归因使用情况的帐户、工作区和项目标识符。
- 用于计费的模型和令牌使用元数据。

有关模型提供商的保留和培训承诺，请参阅[Engine security](/langsmith/engine-security)。

## 通过云连接

### AWS（美国可用）

网关主机是[⟦T13⟧](#allow-egress-to-langsmith-intelligence)。 LSI 将请求路由到 LangChain 的 AWS 环境中的 AWS Bedrock。

#### 使用 AWS PrivateLink 连接在配置 PrivateLink 之前，请完成[Install Engine](#install-engine)，包括其 Helm 和 egress 配置。

[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 将引擎流量从 VPC 路由到 LSI，而不将该流量暴露到公共互联网。 LSI端点服务托管在`us-east-2`，AWS支持其他区域的VPC访问。

在开始之前，请收集您的 AWS 账户 ID、VPC ID、私有子网 ID 以及接口终端节点的安全组。配置该端点安全组，以允许端口 443 上的入站 TCP 流量仅来自附加到运行引擎的节点或工作负载的安全组，或者来自包含它们的最小私有 CIDR。不允许`0.0.0.0/0`。

要将您的 VPC 连接到 LSI：

<Steps>
  <Step title="Request access">
    请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)并提供您的 AWS 账户 ID。 LangChain 将您的帐户添加到端点服务的允许主体列表中。
  </Step>

  <Step title="Create the interface VPC endpoint">
    为包含您的 VPC 的区域配置 AWS 提供商。将 `service_region` 设置为 `us-east-2`，包括当您的 VPC 位于其他区域时。每个可用区选择一个私有子网。

    <Note>
    `service_region` 参数需要 HashiCorp AWS 提供商 `5.82.0` 或更高版本。
    </Note>

    ```hcl
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
  </Step><Step title="Wait for LangChain to accept the connection">
    LangChain接受连接后，端点状态从`pendingAcceptance`变为`available`。在测试连接之前，请等待几分钟让更改传播。
  </Step>

  <Step title="Route the LSI hostname to the endpoint">
    为您的 VPC 启用 DNS 解析和 DNS 主机名。然后，创建 Route 53 私有托管区域和别名记录，以便 `beacon.aws.langchain.com` 解析为 VPC 内的 VPC 终端节点。保持此主机名不变，以便 TLS 证书验证成功。当端点不可用时，私有托管区域还可以防止回退到公共 DNS。

    ```hcl
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

    ```bash
    getent ahostsv4 beacon.aws.langchain.com
    ```

    确认结果包含分配给端点网络接口的专用 IP 地址。然后开始分析并确认其成功完成。如果分析未完成，请检查引擎安装和出口配置。
  </Step>
</Steps>

<Frame caption="AWS: LangSmith and Engine run in your VPC; LSI and Bedrock run in LangChain's AWS environment.">
  <img
    src="/langsmith/images/engine-self-hosted-aws.png"
    alt="Architecture diagram of self-hosted LangSmith in your VPC connected by AWS PrivateLink to LangSmith Intelligence and Bedrock in LangChain's AWS environment."
  />
</Frame>### GCP（在美国提供）

网关主机是[⟦T24⟧](#allow-egress-to-langsmith-intelligence)。 LSI 将请求路由到 LangChain 的 GCP 环境中的 Vertex。

<Note>
这与自托管 LangSmith 用于许可证验证和计费遥测的主机相同，因此 GCP 部署添加了一条路径，而不是新的出口目的地。参见[Configure egress](/langsmith/self-host-egress)。
</Note>

<Frame caption="GCP: LangSmith and Engine run in your project; LSI and Vertex run in LangChain's GCP environment.">
  <img
    src="/langsmith/images/engine-self-hosted-gcp.png"
    alt="Architecture diagram of self-hosted LangSmith in your GCP project connected to LangSmith Intelligence and Vertex in LangChain's GCP environment."
  />
</Frame>

## 型号选择和质量

引擎使用不同的模型，每个模型都针对其角色进行了调整，以集群问题、根据代码诊断根本原因、生成修复程序并编写验证它们的评估器。 LangChain 调整这些模型的质量和代币效率，并随着更好的模型可用而更新它们。

引擎使用托管推理，而不是自带密钥设置。这可以保持引擎行为的一致性，并随着 LangChain 更新模型而改进。通过自带密钥设置，模型选择、调整和令牌效率可能会因请求而异。

## 引擎处理数据的地方

在自托管部署中，引擎将您的环境和 LangChain 之间的数据处理分开：- **您的环境：** 引擎编排和LangSmith存储的跟踪保留在您的自托管环境中。
- **LangChain的环境：** LSI和模型提供者处理Engine发送的内容。 LSI 保留上述计费元数据。

[Engine security](/langsmith/engine-security) 中描述了引擎独立于部署的数据处理，包括每个模型提供商的零数据保留以及不使用客户数据来训练或微调模型。

## 安装引擎

默认情况下禁用引擎。它需要[Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)、到[LangSmith Intelligence](#allow-egress-to-langsmith-intelligence)的连接、外部可访问的[⟦T25⟧](#verify-your-hostname-is-externally-reachable)和[Engine encryption key](#generate-the-engine-encryption-key)。在启用引擎之前完成先决条件。

引擎和 [Insights](/langsmith/deploy-self-hosted-full-platform#enable-fleet-insights-and-chat) 从同一映像运行并共享一个部署。 Engine 不需要 Insights。如果您的安装已运行 Insights，则启用 Engine 会添加配置而不是新 Pod。

### 组件

启用引擎配置或重用：

- `standalone-insights-api-server`：同时服务于`engine`和`insights`图表。
- `standalone-insights-queue`：Engine 和 Insights 的后台运行处理。
- 用于共享部署的专用 PostgreSQL 和 Redis 实例，每个实例都可以替换为外部实例。
- [Enable Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)下描述的沙箱组件。引擎还向`platform-backend`和`ingest-queue`添加了配置，用于调度和安排其运行。

### 先决条件

<Steps>
  <Step title="Enable Sandboxes">
    首先完成[Enable Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)，包括支持KVM的节点池和JuiceFS存储。

    引擎的沙箱与一个工作区相关联。带有引擎的安装必须有[shared organization](/langsmith/administration-overview#organizations)。如果共享组织只有一个工作区，则LangSmith 使用该工作区。如果共享组织有多个工作区，LangSmith 不会自动选择一个。您必须将 `engine.sandboxTenantId` 设置为工作区 ID。

    <Warning>
    使用为引擎保留的工作区：- Engine 的沙箱不在 Sandboxes 产品中计费，因为 Engine 会计量自己在 LCU 中的使用情况。
    - 引擎的沙箱使用与工作区中其他沙箱相同的并发沙箱、CPU 和内存配额。如果工作区接近其限制，引擎运行可能会失败或为交互式沙箱留下的容量较少。
    - 引擎的沙箱列在该工作区中，任何有权访问它的人都可以停止。
    - 每个沙箱都运行代理生成的代码。
    - 存储库凭据保留在沙箱身份验证代理中，并且不可用于沙箱内运行的代码。
    </Warning>
  </Step>

  <Step title="Confirm the license entitlement">
    引擎是单独许可的，与沙盒相同。您的许可证必须包含引擎权利。 LangSmith 在启动时根据 `https://beacon.langchain.com` 验证您的许可证密钥，并在此后定期验证，因此，一旦将其添加到订单中，您无需更改任何配置，即可生效。
  </Step>

  <Step title="Allow egress to LangSmith Intelligence" id="allow-egress-to-langsmith-intelligence">
    允许从集群到云的 LangSmith 智能网关 URL 的出站 HTTPS。使用此 URL 作为 `engine.intelligenceBaseUrl` 的值。

    |云| `engine.intelligenceBaseUrl` |
    | --- | --- |
    |亚马逊AWS | `https://beacon.aws.langchain.com/intelligence` |
    | GCP | `https://beacon.langchain.com/intelligence` |在 GCP 上，这使用已用于许可证验证和计费遥测的同一主机LangSmith，因此引擎添加了一条路径而不是新的出口目的地。

    <Note>
    引擎可用于 **AWS US** 和 **GCP US** 中的自托管部署。在计划推出之前，检查[Availability by cloud and region](#availability-by-cloud-and-region)并确认[our sales team](https://www.langchain.com/contact-sales)的覆盖范围。
    </Note>

    将网关添加为特定白名单条目，而不是打开常规出口。为了将 AWS 流量保持在专用网络上，[connect to LangSmith Intelligence with AWS PrivateLink](#connect-with-aws-privatelink)。请求使用在 LangSmith 许可证验证期间获得的短期许可证 JWT。引擎的流量与[Configure egress](/langsmith/self-host-egress)中描述的计费和操作遥测是分开的，即使它共享主机。

    <Note>
    离线（气隙）安装无法运行引擎。没有可供其依赖的集群内模型。
    </Note>
  </Step>

  <Step title="Verify your hostname is externally reachable" id="verify-your-hostname-is-externally-reachable">
    引擎的沙箱使用 `langsmith` CLI 调用您的 LangSmith 安装，因此 `config.hostname` 必须可从沙箱网络访问。 Helm 验证拒绝 `localhost` 和集群内 `*.svc` 地址。使用 TLS 通过您的入口提供该主机名，如 [Set up an ingress](/langsmith/self-host-ingress) 中所述。引擎不要求您公开超出您自己的用户已经到达的地址的任何内容。沙箱出口已列入您的 LangSmith 主机名、`github.com`、`api.github.com` 和 Python 包注册表的允许名单。每次运行的凭据由沙箱外部的代理注入，而不是在沙箱内部可读。
  </Step>

  <Step title="Generate the Engine encryption key" id="generate-the-engine-encryption-key">
    引擎使用自己的 Fernet 密钥来加密传递给它的运行负载LangSmith，这些负载携带短期凭证。生成一个：

    ```bash
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ```

    将其存储在预定义的 Kubernetes Secret 中，名称为 `engine_encryption_key`，而不是存储在配置文件中。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)。

    要稍后轮换密钥，请将当前值复制到 `engine_encryption_key_previous` 并将新密钥设置为 `engine_encryption_key`。之前的密钥仅用于解密，因此在交换完成之前以加密方式运行。
  </Step>
</Steps>

### 使用 Helm 启用

将以下内容添加到您的 [⟦T47⟧](/langsmith/kubernetes#configure-your-helm-charts) 中，以及 [Enable Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes) 中的完整沙箱值。这些示例仅显示特定于引擎的值和 `sandboxes.enabled` 标志。

<Tabs>
  <Tab title="Using Kubernetes secrets (recommended)">
    按名称引用您现有的 Secret。图表自动从中读取`engine_encryption_key`。```yaml
    config:
      existingSecretName: "<your-secret-name>"
      # Must be reachable from the sandbox network.
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"

    sandboxes:
      enabled: true
    ```
  </Tab>
  <Tab title="Using inline values">
    直接在配置文件中设置加密密钥。

    <Warning>
    这会将实时凭证放入您的配置文件中。不要将其提交给版本控制；更喜欢 Kubernetes Secret。
    </Warning>

    ```yaml
    config:
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"
      encryptionKey: "<engine-encryption-key>"

    sandboxes:
      enabled: true
    ```
  </Tab>
</Tabs>

<Note>
如果您的安装具有包含多个工作区的共享组织，请设置拥有引擎沙箱的工作区：
</Note>

```yaml
engine:
  sandboxTenantId: "<workspace-id>"
```

<Warning>
从旧版 Insights 图像 pin 升级需要一项额外检查：如果您的值 pin `images.engineInsightsAgentImage.repository` 到已停用的 `langsmith-clio` 图像，请删除或更新该 pin。引擎和 Insights 现在在 `langsmith-insights-engine` 上运行，并且图表拒绝 `langsmith-clio`。欲了解更多信息，请参阅[Mirror images for your LangSmith installation](/langsmith/self-host-mirroring-images#additional-images-for-engine)。
</Warning>

在应用更新的图表之前验证它：

```bash
helm template langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace>
```

该图表在渲染时验证引擎配置，并失败并显示一条消息，指出缺少的值，因此此命令会在错误配置到达集群之前捕获它。

应用更新后的图表：

```bash
helm upgrade -i langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace> \
  --wait
```

### 验证安装

确认共享 Engine 和 Insights 部署正在运行：

```bash
kubectl get pods -n <namespace> | grep standalone-insights
```

API 服务器和队列 Pod 都应该是`Running`。然后，确认`platform-backend`是健康的，因为它调度引擎运行：

```bash
kubectl rollout status deployment/langsmith-platform-backend -n <namespace>
```如果此后引擎未出现在 LangSmith UI 中，最常见的原因是许可证没有引擎权利和[Turn on Engine in LangSmith](#turn-on-engine-in-langsmith) 中所述的组织级别切换。

在LangSmith UI 中的[enabling and configuring Engine](#turn-on-engine-in-langsmith)之后，启动引擎分析并确认显示跟踪项目的结果。这将验证通过引擎、沙箱和LangSmith智能的完整路径。单独运行 pod 不会验证该路径。

如果分析未完成，请检查 Engine Pod 是否正在运行、沙箱工作区是否有可用配额，以及集群是否可以访问`engine.intelligenceBaseUrl` 中配置的LangSmith 智能网关 URL。

### 在LangSmith中打开引擎

在 Helm 中启用 Engine 即可使用该功能；它不会启动任何扫描。启用图表值后，在LangSmith中完成设置：

1. [Organization Admin](/langsmith/rbac#organization-admin) 在 **设置 > 引擎启用**下为组织打开引擎。欲了解更多信息，请参阅[Find and fix issues](/langsmith/engine#enable-engine-for-your-organization)。
1. 任何用户都可以从项目的 **Engine** 选项卡为跟踪项目设置 Engine。欲了解更多信息，请参阅[Set up Engine for a tracing project](/langsmith/engine#set-up-engine-for-a-tracing-project)。连接 GitHub 存储库是可选的，它可以改进引擎的诊断和修复。如果没有，引擎将无法读取您的源代码或打开拉取请求。要创建 GitHub 应用程序并配置`host-backend`，请参阅[Connect Engine to GitHub](/langsmith/engine-github#self-hosted)。

### 禁用引擎

将 `engine.enabled` 设置为 `false` 并重新应用：

```yaml
engine:
  enabled: false
```

引擎停止调度运行。 Insights 共享相同的部署，因此当 `insights.enabled` 为 `true` 时，`standalone-insights` Pod 继续运行。

## 另请参阅

- [Engine](/langsmith/engine-overview)
- [Configure Engine](/langsmith/engine)
- [Connect Engine to GitHub](/langsmith/engine-github)
- [Engine security](/langsmith/engine-security)
- [Engine webhooks](/langsmith/engine-webhooks)
- [Enable additional LangSmith features](/langsmith/deploy-self-hosted-full-platform)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>