<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Cloud (SaaS) | https://docs.langchain.com/langsmith/cloud -->

# 云（SaaS）

**云**托管选项是一个完全托管的模型，其中 LangChain 托管并运营所有 LangSmith 基础设施和服务：

- **完全托管的基础设施**：LangChain 处理所有基础设施、更新、扩展和维护。
- [**LangSmith UI**](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-cloud)：完全访问[observability](/langsmith/observability)、[evaluation](/langsmith/evaluation)、[agent deployment management](/langsmith/deployment) 和 [Studio](/langsmith/studio)。
- **从 GitHub 部署代理服务器**：只需单击几下即可连接您的存储库并将 [Agent Servers](/langsmith/deployment) 部署到云。
- **代理服务器的自动化 CI/CD**：[Agent Servers](/langsmith/deployment) 的构建和部署过程由平台自动处理。

|                   | **谁管理它** | **它在哪里运行** |
|-------------------|--------------------------------|--------------------|
| **LangSmith 平台（UI、API、数据存储）** | LangChain | LangChain 的云（AWS 和 GCP）|
| **您的代理服务器** | LangChain | LangChain 的云（AWS 和 GCP）|
| **您的应用程序的 CI/CD** | LangChain | LangChain 的云（AWS 和 GCP）|

<Callout icon="rocket" color="#4F46E5" iconType="regular">
如果您准备好将应用程序部署到 LangSmith 云（AWS 或 GCP），请按照 [Cloud deployment quickstart](/langsmith/deployment-quickstart) 或 [full setup guide](/langsmith/deploy-to-cloud) 操作。本页介绍了云托管架构以供参考。
</Callout>

![Cloud deployment: LangChain hosts and manages all components including the UI, APIs, and your Agent Servers.](/langsmith/images/langgraph-cloud-architecture.png)

## 云架构和可扩展性<Note>
本部分仅与云管理的 LangSmith（[https://smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-cloud)、[https://eu.smith.langchain.com](https://eu.smith.langchain.com)、[https://apac.smith.langchain.com](https://apac.smith.langchain.com) 和 [https://aws.smith.langchain.com](https://aws.smith.langchain.com)）相关。

有关自托管LangSmith解决方案的信息，请参阅[Self-hosted documentation](/langsmith/self-hosted)。
</Note>

对于美国、欧盟和亚太地区 SaaS 区域，LangSmith 托管在 Google Cloud Platform (GCP) 上；对于 AWS 托管的美国 SaaS 区域，LangSmith 托管在 Amazon Web Services (AWS) 上。该平台被设计为具有高度可扩展性。许多客户在 LangSmith 上运行生产工作负载，以实现 LLM 应用程序可观察性、评估和代理部署。

位于美国的 LangSmith 服务（默认 GCP 区域）托管在 GCP 的 `us-central1`（爱荷华州）区域。

<Note>
[EU-based LangSmith service](https://eu.smith.langchain.com) 在 GCP 的 `europe-west4`（荷兰）区域可用并托管。如果您对该地区的企业计划感兴趣，请[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

<Note>
自 2026 年 4 月起，LangSmith SaaS 在`us-east-2`（俄亥俄州）的 AWS 上可用。
</Note>

<Note>
截至 2026 年 5 月，LangSmith SaaS 在亚太地区的`australia-southeast1`（悉尼）的 GCP 上可用。
</Note>

### 区域存储此表中的资源和服务存储在与注册发生的 URL 对应的位置（GCP US、GCP EU、GCP APAC 或 AWS US）。云管理的 LangSmith 使用 [Supabase](https://supabase.com) 进行身份验证/授权，使用 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行数据仓库。

|                                     |基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
|网址 | [https://smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-cloud) | [https://eu.smith.langchain.com](https://eu.smith.langchain.com) | [https://apac.smith.langchain.com](https://apac.smith.langchain.com) | [https://aws.smith.langchain.com](https://aws.smith.langchain.com) |
| API 网址 | [https://api.smith.langchain.com](https://api.smith.langchain.com) | [https://eu.api.smith.langchain.com](https://eu.api.smith.langchain.com) | [https://apac.api.smith.langchain.com](https://apac.api.smith.langchain.com) | [https://aws.api.smith.langchain.com](https://aws.api.smith.langchain.com) ||云| GCP us-central1（爱荷华州）| GCP europe-west4（荷兰） | GCP 澳大利亚-southeast1（悉尼）| AWS us-east-2（俄亥俄州）|
|苏帕巴斯| AWS us-east-1（弗吉尼亚北部）| AWS eu-central-1（德国）| AWS ap-southeast-2（悉尼）| AWS us-east-2（俄亥俄州）|
| ClickHouse云| us-central1（爱荷华州）| europe-west4 (荷兰) |澳大利亚-southeast1（悉尼） | us-east-2（俄亥俄州） || [LangSmith deployment](/langsmith/deployment) | GCP us-central1（爱荷华州）； `*.us.langgraph.app` | GCP europe-west4（荷兰）； `*.eu.langgraph.app` | GCP 澳大利亚-东南部1（悉尼）； `*.apac.langgraph.app` | AWS us-east-2（俄亥俄州）； `*.aws.us.langgraph.app` |

请参阅[Regions FAQ](/langsmith/regions-faq)了解更多信息。

### 区域无关存储

此处列出的数据仅存储在美国：

- Stripe 和 Metronome 的付款和账单信息

### GCP 服务

以下内容适用于 GCP 上的**美国、欧盟和亚太地区** SaaS 区域。

LangSmith 由以下服务组成，全部托管在 Google Kubernetes Engine (GKE) 上：

- LangSmith 前端：服务于LangSmith UI。
- LangSmith 后端：为LangSmith API 提供服务。
- LangSmith 平台后端：处理身份验证和其他大容量任务。 （内部服务）
- LangSmith Playground：处理向各种 LLM 提供商转发 Playground 功能的请求。
- LangSmith 队列：负责异步任务的处理。 （内部服务）

LangSmith 使用以下 GCP 存储服务：- 用于运行输入和输出的 Google 云存储 (GCS)。
- 用于事务工作负载的 Google Cloud SQL PostgreSQL。
- Google Cloud Memorystore for Redis 用于排队和缓存。
- GCP 上的 Clickhouse Cloud，用于跟踪摄取和分析。我们的服务通过专用端点连接到托管在同一 GCP 区域的 Clickhouse Cloud。

我们使用的一些其他 GCP 服务包括：

- Google Cloud Load Balancer，用于将流量路由到LangSmith服务。
- 用于缓存静态资源的 Google Cloud CDN。
- Google Cloud Armor 提供安全性和速率限制。有关我们执行的速率限制的更多信息，请参阅[Rate limits](/langsmith/usage-and-billing#rate-limits)。

### AWS 服务

以下内容适用于`us-east-2`（俄亥俄州）的 **AWS US** SaaS 区域。相同的逻辑 LangSmith 组件在 **Amazon EKS** 而不是 GKE 上运行。

LangSmith 由以下服务组成，全部托管在 Amazon EKS 上：- LangSmith 前端：服务于LangSmith UI。
- LangSmith后端：为LangSmith API提供服务。
- LangSmith 平台后端：处理身份验证和其他大容量任务。 （内部服务）
- LangSmith Playground：处理向各种 LLM 提供商转发 Playground 功能的请求。
- LangSmith 队列：负责异步任务的处理。 （内部服务）

LangSmith 使用以下 AWS 存储和数据服务：

- 用于运行输入和输出的 Amazon S3。
- 用于事务工作负载的 Amazon RDS for PostgreSQL。
- Amazon ElastiCache for Redis 用于排队和缓存。
- `us-east-2` 中基于 AWS PrivateLink 的 ClickHouse Cloud 用于跟踪摄取和分析，与上表[regional storage](#regional-storage) 一致。

我们使用的一些其他 AWS 服务包括：

- Elastic Load Balancing（网络负载均衡器）和 Istio 入口，用于将流量路由到 LangSmith 服务。已记录的 API 速率限制在 Istio 入口网关处强制执行。详情请参阅[Rate limits](/langsmith/usage-and-billing#rate-limits)。
- 用于缓存静态资产的 Amazon CloudFront（包括 Web UI 主机名 `aws.smith.langchain.com`）。
- CloudFront 上的 AWS WAF，用于边缘的托管规则组（例如，AWS 托管规则常见保护和机器人控制）。

<div style={{ textAlign: 'center' }}>
<img
    className="block dark:hidden"
    src="/langsmith/images/cloud-arch-light.png"
    alt="Light mode overview"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/cloud-arch-dark.png"
    alt="Dark mode overview"
/>
</div>## 将 IP 地址列入白名单

### 来自 LangChain SaaS 的出站流量
所有离开 LangSmith 服务的流量都将通过 NAT 网关进行路由。所有流量都将显示为源自以下 IP 地址：

|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |
| -------------- | -------------- | -------------- | -------------- |
| 34.59.65.97 | 34.13.192.67 | 34.151.89.217 | 18.188.147.158 |
| 34.67.51.221 | 34.147.105.64 | 34.116.97.4 | 18.219.86.202 |
| 34.46.212.37 | 34.90.22.166 | 34.151.162.199 | 34.151.162.199 3.21.57.1​​92 |
| 34.132.150.88 | 34.147.36.213 | 34.116.66.129 |                |
| 35.188.222.201 | 34.32.137.113 | 35.189.8.125 |                |
| 34.58.194.127 | 34.58.194.127 34.91.238.184 | 35.201.9.237 |                |
| 34.59.97.173 | 35.204.101.241 | 35.204.101.241 35.189.57.29 |                |
| 104.198.162.55 | 35.204.48.32 | 34.40.198.11 |                |

如果连接到您自己的 AzureOpenAI 服务或 Playground 或在线评估可能需要的其他端点，将这些 IP 地址列入白名单可能会有所帮助。<Note>
来自部署在 [LangSmith Deployment](/langsmith/deployment) 上的代理的流量通过一组单独的 NAT IP 流出。有关该列表，请参阅云部署指南中的[Allowlist IP addresses](/langsmith/deploy-to-cloud#allowlist-ip-addresses)。
</Note>

### 进入LangChain SaaS
LangChain 终端节点映射到以下静态 IP 地址，以便在我们的 **GCP 负载均衡器**（美国/欧盟/亚太地区）或 **AWS US** 上终止于 `us-east-2` 中的 **网络负载均衡器** 上终止的流量（API 和网关主机名）：

|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |
| -------------- | ------------- | -------------- | ------------- |
| 34.8.121.39 | 34.95.92.214 | 34.149.149.213 | 34.149.149.213 3.129.27.169 | 3.129.27.169
| 34.107.251.234 | 34.107.251.234 34.13.73.122 |                | 13.58.107.119 |
|                |               |                | 16.59.151.49 |
|                |               |                | 16.59.98.147 |
|                |               |                | 3.134.146.243 | 3.134.146.243
|                |               |                | 3.150.87.246 |

您可能需要将这些列入许可名单，以启用从专用网络到 LangSmith SaaS 端点的流量（`api.smith.langchain.com`、`smith.langchain.com`、`beacon.langchain.com`、`eu.api.smith.langchain.com`、`eu.smith.langchain.com`、`eu.beacon.langchain.com`、`apac.api.smith.langchain.com`、 `apac.smith.langchain.com`、`apac.beacon.langchain.com`、`aws.api.smith.langchain.com`、`aws.smith.langchain.com`）。

## 专用连接（企业）<Callout icon="lock" color="#4F46E5" iconType="regular">
[**Enterprise only.**](/langsmith/pricing-plans) 专用连接专供企业客户使用。请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)以启用此功能。
</Callout>

企业客户可以使用 **AWS PrivateLink** 或 **GCP Private Service Connect (PSC)** 连接到 LangSmith，而无需将流量暴露到公共互联网。

### AWS PrivateLink

**AWS** 上的客户可以通过 [AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 连接到 LangSmith，从而提供来自任何 VPC 的私有连接。原生支持跨区域连接。

#### 端点服务名称

|地区 |服务名称 |
|--------|-------------|
|美国 (`us-east-2`) | `com.amazonaws.vpce.us-east-2.vpce-svc-054f37092752bff6b` |

#### 设置

**1.请求访问权限：** 联系您的客户代表或使用您的 AWS 账户 ID [sales@langchain.dev](mailto:sales@langchain.dev)。 LangChain 会将您的帐户添加到端点服务的允许主体列表中。

**2.在您的 AWS 账户中创建接口 VPC 终端节点**。附加一个安全组，允许来自您的 VPC CIDR（或需要到达 LangSmith 的实例）的 **TCP 443 入站**：

<CodeGroup>
```bash AWS CLI
aws ec2 create-vpc-endpoint \
  --vpc-id <YOUR_VPC_ID> \
  --service-name <SERVICE_NAME_FROM_TABLE_ABOVE> \
  --vpc-endpoint-type Interface \
  --subnet-ids <YOUR_SUBNET_IDS> \
  --security-group-ids <YOUR_SECURITY_GROUP_ID> \
  --region <YOUR_REGION>
```

```hcl Terraform
resource "aws_vpc_endpoint" "langsmith" {
  vpc_id              = "<YOUR_VPC_ID>"
  service_name        = "<SERVICE_NAME_FROM_TABLE_ABOVE>"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = ["<YOUR_SUBNET_IDS>"]
  security_group_ids  = ["<YOUR_SECURITY_GROUP_ID>"]
}
```
</CodeGroup>**3.等待接受。** LangChain 将接受连接。端点状态将从`pendingAcceptance`更改为`available`。接受更改后需要几分钟时间才能完全传播，然后再测试连接。

####配置DNS

配置 DNS，以便 `aws.api.smith.langchain.com` 解析为您的 VPC 内的 VPC 终端节点的私有 DNS 名称。您可以使用任何私有 DNS 解决方案：Route 53 私有托管区域、公司 DNS 解析器或可从您的 VPC 访问的任何 DNS 服务器。

首先，获取端点的 DNS 名称：

```bash
aws ec2 describe-vpc-endpoints \
  --vpc-endpoint-ids <YOUR_ENDPOINT_ID> \
  --query 'VpcEndpoints[0].DnsEntries[0].DnsName' \
  --output text --region <YOUR_REGION>
```

然后，为 `aws.api.smith.langchain.com` 创建一条指向该 DNS 名称的 CNAME 记录。以下是使用 Route 53 的示例：

<CodeGroup>
```bash AWS CLI
aws route53 create-hosted-zone \
  --name aws.api.smith.langchain.com \
  --vpc VPCRegion=<YOUR_REGION>,VPCId=<YOUR_VPC_ID> \
  --caller-reference langsmith-privatelink-$(date +%s) \
  --hosted-zone-config PrivateZone=true

aws route53 change-resource-record-sets \
  --hosted-zone-id <HOSTED_ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "aws.api.smith.langchain.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<ENDPOINT_DNS_NAME>"}]
      }
    }]
  }'
```

```hcl Terraform
resource "aws_route53_zone" "langsmith_privatelink" {
  name = "aws.api.smith.langchain.com"

  vpc {
    vpc_id = "<YOUR_VPC_ID>"
  }
}

resource "aws_route53_record" "langsmith_privatelink" {
  zone_id = aws_route53_zone.langsmith_privatelink.zone_id
  name    = "aws.api.smith.langchain.com"
  type    = "CNAME"
  ttl     = 300
  records = [aws_vpc_endpoint.langsmith.dns_entry[0]["dns_name"]]
}
```
</CodeGroup>

#### 验证连接

从 VPC 中的 EC2 实例或容器：

```bash
curl https://aws.api.smith.langchain.com/ok
```

### GCP 专用服务连接

**GCP** 上的企业客户可以通过 [Private Service Connect (PSC)](https://cloud.google.com/vpc/docs/private-service-connect) 连接到 LangSmith，提供私有连接，而无需将流量暴露到公共互联网。

#### 服务附件 URI

使用以下服务附件 URI 在您的 VPC 中创建 PSC 终端节点：

|地区 |服务附件 URI |
|--------|----------------------|
|美国 (`us-central1`) | `projects/langchain-prod/regions/us-central1/serviceAttachments/gateway-psc-publish` |
|欧盟 (`europe-west4`) | `projects/langchain-prod/regions/europe-west4/serviceAttachments/gateway-psc-publish` |
|亚太地区 (`australia-southeast1`) | `projects/langchain-apac-prod/regions/australia-southeast1/serviceAttachments/gateway-psc-publish` |

#### PSC 域设置后，使用以下域通过 PSC 连接连接到 LangSmith：

|地区 |域名 |
|--------|--------|
|美国 | `us-central1.p.api.smith.langchain.com` |
|欧盟| `europe-west4.p.api.smith.langchain.com` |
|亚太地区 | `australia-southeast1.p.api.smith.langchain.com` |

#### 设置

**请求访问权限：** 请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)，并提供您的 GCP 项目 ID。 LangChain 会将您的项目添加到服务附件的允许使用者列表中。

授予访问权限后，使用 gcloud CLI 或 Terraform 创建 PSC 端点并配置 DNS。

#### 创建 PSC 端点

在您的 VPC 中创建针对服务附件的转发规则：

<CodeGroup>
```bash gcloud CLI
# Create the PSC endpoint
gcloud compute forwarding-rules create langsmith-psc-endpoint \
  --region=<REGION> \
  --network=<YOUR_VPC_NETWORK> \
  --subnet=<YOUR_SUBNET> \
  --target-service-attachment=projects/langchain-prod/regions/<REGION>/serviceAttachments/gateway-psc-publish \
  --load-balancing-scheme=""

# Get the assigned IP address
gcloud compute forwarding-rules describe langsmith-psc-endpoint \
  --region=<REGION> \
  --format="value(IPAddress)"
```

```hcl Terraform
resource "google_compute_forwarding_rule" "langsmith_psc" {
  name                  = "langsmith-psc-endpoint"
  project               = "<YOUR_PROJECT_ID>"
  region                = "<REGION>"
  network               = "<YOUR_VPC_NETWORK>"
  subnetwork            = "<YOUR_SUBNET>"
  target                = "projects/langchain-prod/regions/<REGION>/serviceAttachments/gateway-psc-publish"
  load_balancing_scheme = ""
}
```
</CodeGroup>

####配置DNS

在您的 VPC 中创建私有 DNS 区域并添加指向 PSC 终端节点 IP 的 A 记录：

<CodeGroup>
```bash gcloud CLI
# Create a private DNS zone
gcloud dns managed-zones create langsmith-psc \
  --dns-name="<REGION>.p.api.smith.langchain.com." \
  --visibility=private \
  --networks=<YOUR_VPC_NETWORK>

# Add an A record pointing to the PSC endpoint IP
gcloud dns record-sets create "<REGION>.p.api.smith.langchain.com." \
  --zone=langsmith-psc \
  --type=A \
  --rrdatas=<PSC_ENDPOINT_IP>
```

```hcl Terraform
resource "google_dns_managed_zone" "langsmith_psc" {
  name        = "langsmith-psc"
  project     = "<YOUR_PROJECT_ID>"
  dns_name    = "<REGION>.p.api.smith.langchain.com."
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = "<YOUR_VPC_NETWORK_SELF_LINK>"
    }
  }
}

resource "google_dns_record_set" "langsmith_psc" {
  name         = "<REGION>.p.api.smith.langchain.com."
  project      = "<YOUR_PROJECT_ID>"
  managed_zone = google_dns_managed_zone.langsmith_psc.name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_forwarding_rule.langsmith_psc.ip_address]
}
```
</CodeGroup>

#### 验证连接

从 VPC 中的虚拟机：

```bash
curl https://<REGION>.p.api.smith.langchain.com/ok
```

## API 速率限制

LangSmith 对 API 端点实施速率限制，以确保服务稳定性和公平使用。下表显示了 GCP US 和 GCP EU 区域中不同端点的速率限制。 GCP APAC 和 AWS US 强制实施类似的服务特定限制；如果您的组织需要确切的限制，请联系支持人员。注意：- 速率限制表示为 `count / interval`，其中 count 是时间间隔内允许的请求数（以秒为单位）。例如，`2000 / 10`表示每10秒2000个请求。
- 当端点列中未指定 HTTP 方法时，速率限制适用于该端点的所有 HTTP 方法。
- 当列出特定方法时（例如，`POST`、`GET`），速率限制仅适用于该方法。

|匹配/端点（方法）|身份密钥 |美国产品限价|欧盟产品限制|类别 |
| ---| ---| ---| ---| ---|
|选项，`/info`，`*/v1/metadata/submit` |知识产权| 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/auth` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/auth` | `x-user-id`+IP | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/v1/beacon` |知识产权| 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/repos` | `x-api-key` | 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Repository](#rate-limit-categories) |
| `/repos` | `x-user-id` + IP | 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Repository](#rate-limit-categories) |
| `POST /runs/batch` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `POST /otel/v1/traces` | `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `POST` 包含 `/charts` | `x-api-key` | 750 / 600 | 750 / 600 | [Charts](#rate-limit-categories) |
| `POST` 包含 `/charts` | `x-user-id` + IP | 750 / 600 | 750 / 600 | [Charts](#rate-limit-categories) |
| `POST /runs/multipart` | `x-api-key` | 6000 / 10 | 6000 / 10 | [Multipart ingest](#rate-limit-categories) |
| `POST /runs/query` | `x-api-key` | 15 / 10 | 15 / 10 | [Run query (API)](#rate-limit-categories) || `POST /runs/query` | `x-user-id` + IP | 300 / 10 | 300 / 10 | [Run query (User)](#rate-limit-categories) |
| `/generate` | `x-api-key` | 30 / 3600 | 30 / 3600 | [Generation](#rate-limit-categories) |
| `/generate` | `x-user-id`+IP | 30 / 3600 | 30 / 3600 | [Generation](#rate-limit-categories) |
| `/commits` | `x-api-key` | 10000 / 60 | 2000 / 60 | [Commits](#rate-limit-categories) |
| `/commits` | `x-user-id`+IP | 10000 / 60 | 2000 / 60 | [Commits](#rate-limit-categories) |
| `DELETE /sessions` 或 `*/trigger` | `x-api-key` | 10 / 60 | 10 / 60 | [Deletion](#rate-limit-categories) |
| `DELETE /sessions` 或 `*/trigger` | `x-user-id` + IP | 30 / 60 | 30 / 60 | [Deletion](#rate-limit-categories) |
| `POST /runs`（单次运行摄取）| `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `PATCH` 包含 `/runs` | `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `POST /feedback` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `GET /runs/{uuid}` 或 `/api/v1/runs/{uuid}` | `x-api-key` | 30 / 60 | 30 / 60 | [Run lookup](#rate-limit-categories) |
| `GET` 含 `/examples` | `x-api-key` | 5000 / 60 | 5000 / 60 | [Examples](#rate-limit-categories) |
|任何与 `x-api-key` 的请求 | `x-api-key` | 1000 / 10 | 1000 / 10 1000 / 10 | 1000 / 10 [Default (API key)](#rate-limit-categories) |
|任何与 `x-user-id` 的请求 | `x-user-id`+IP | 1000 / 10 | 1000 / 10 1000 / 10 | 1000 / 10 [Default (User)](#rate-limit-categories) |
| `/public/download` |知识产权| 5000 / 60 | 5000 / 60 | [Public download](#rate-limit-categories) |
| `/runs/stats` | `x-api-key` | 1 / 10 | 20 / 10 | [Stats](#rate-limit-categories) |
|所有其他 IP（包罗万象）|知识产权| 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Public (catch-all)](#rate-limit-categories) |

### 速率限制类别- **高吞吐量**：用于身份验证、元数据和反馈等核心操作的一般大容量端点。
- **Repository**：存储库和提示管理操作。
- **运行摄取**：单独的跟踪/运行摄取端点以实现可观察性。
- **图表**：图表生成和可视化端点。
- **分段摄取**：通过分段上传进行批量运行摄取，以进行大容量跟踪。
- **运行查询 (API)**：基于 API 密钥的运行查询操作，对复杂查询具有更严格的限制。
- **运行查询（用户）**：基于用户的运行查询操作，具有更高的交互式使用限制。
- **生成**：人工智能驱动的代码和内容生成端点（仅限于防止滥用）。
- **提交**：提示版本控制和提交操作。
- **删除**：会话删除和工作流触发操作。
- **运行查找**：通过 UUID 检索特定运行。
- **示例**：获取数据集示例以进行少量提示。
- **默认（API 密钥）**：经过身份验证的 API 请求与特定模式不匹配的回退速率限制。
- **默认（用户）**：经过身份验证的用户请求与特定模式不匹配的回退速率限制。- **公共下载**：共享资源的大容量公共下载端点。
- **统计**：运行统计和分析端点（适用区域特定限制）。
- **公共（包罗万象）**：未经身份验证的公共访问的默认速率限制。

有关速率限制和其他服务限制的更多信息，请参阅[Administration overview](/langsmith/usage-and-billing#rate-limits)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>