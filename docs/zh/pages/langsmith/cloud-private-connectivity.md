<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Private connectivity | https://docs.langchain.com/langsmith/cloud-private-connectivity -->

# 私人连接

使用 AWS PrivateLink、GCP Private Service Connect 或 Azure Private Link 连接到 LangSmith 云，无需向公共互联网公开流量。

## 专用连接（企业）

[**Enterprise only.**](/langsmith/pricing-plans) 专用连接专供企业客户使用。请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)以启用此功能。

企业客户可以使用 **AWS PrivateLink**、**GCP Private Service Connect (PSC)** 或 **Azure Private Link** 连接到 LangSmith，而无需向公共互联网公开流量。

### AWS PrivateLink

**AWS** 上的客户可以通过 [AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 连接到 LangSmith，从而提供来自任何 VPC 的私有连接。原生支持跨区域连接。

#### 端点服务名称

|地区 |服务名称 |
| - | - |
|美国 (`us-east-2`) | `com.amazonaws.vpce.us-east-2.vpce-svc-054f37092752bff6b` |

#### 设置

**1.请求访问权限：** 联系您的客户代表或 [sales@langchain.dev](mailto:sales@langchain.dev) 并提供您的 AWS 账户 ID。 LangChain 会将您的帐户添加到端点服务的允许主体列表中。

**2.在您的 AWS 账户中创建接口 VPC 终端节点**。附加一个安全组，允许来自您的 VPC CIDR（或需要到达 LangSmith 的实例）的 **TCP 443 入站**：

```bash AWS CLI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws ec2 create-vpc-endpoint \
  --vpc-id <YOUR_VPC_ID> \
  --service-name <SERVICE_NAME_FROM_TABLE_ABOVE> \
  --vpc-endpoint-type Interface \
  --subnet-ids <YOUR_SUBNET_IDS> \
  --security-group-ids <YOUR_SECURITY_GROUP_ID> \
  --region <YOUR_REGION>
```

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "aws_vpc_endpoint" "langsmith" {
  vpc_id              = "<YOUR_VPC_ID>"
  service_name        = "<SERVICE_NAME_FROM_TABLE_ABOVE>"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = ["<YOUR_SUBNET_IDS>"]
  security_group_ids  = ["<YOUR_SECURITY_GROUP_ID>"]
}
```**3.等待接受。** LangChain 将接受连接。端点状态将从`pendingAcceptance`更改为`available`。接受更改后需要几分钟时间才能完全传播，然后再测试连接。

####配置DNS

配置 DNS，以便 `aws.api.smith.langchain.com` 解析为您的 VPC 内的 VPC 终端节点的私有 DNS 名称。您可以使用任何私有 DNS 解决方案：Route 53 私有托管区域、企业 DNS 解析器或可从您的 VPC 访问的任何 DNS 服务器。

首先，获取端点的 DNS 名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws ec2 describe-vpc-endpoints \
  --vpc-endpoint-ids <YOUR_ENDPOINT_ID> \
  --query 'VpcEndpoints[0].DnsEntries[0].DnsName' \
  --output text --region <YOUR_REGION>
```

然后，为 `aws.api.smith.langchain.com` 创建一条指向该 DNS 名称的 CNAME 记录。以下是使用 Route 53 的示例：

```bash AWS CLI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

#### 验证连接

从 VPC 中的 EC2 实例或容器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://aws.api.smith.langchain.com/ok
```

### GCP 专用服务连接

**GCP** 上的企业客户可以通过 [Private Service Connect (PSC)](https://cloud.google.com/vpc/docs/private-service-connect) 连接到 LangSmith，提供私有连接，而无需将流量暴露到公共互联网。

#### 服务附件 URI

使用以下服务附件 URI 在您的 VPC 中创建 PSC 终端节点：

|地区 |服务附件 URI |
| - | - |
|美国 (`us-central1`) | `projects/langchain-prod/regions/us-central1/serviceAttachments/gateway-psc-publish` |
|欧盟 (`europe-west4`) | `projects/langchain-prod/regions/europe-west4/serviceAttachments/gateway-psc-publish` |
|亚太地区 (`australia-southeast1`) | `projects/langchain-apac-prod/regions/australia-southeast1/serviceAttachments/gateway-psc-publish` |

#### PSC 域设置后，使用以下域通过 PSC 连接连接到 LangSmith：

|地区 |域名 |
| - | - |
|美国 | `us-central1.p.api.smith.langchain.com` |
|欧盟| `europe-west4.p.api.smith.langchain.com` |
|亚太地区 | `australia-southeast1.p.api.smith.langchain.com` |

#### 设置

**请求访问权限：** 请联系您的客户代表或 [sales@langchain.dev](mailto:sales@langchain.dev) 并提供您的 GCP 项目 ID。 LangChain 会将您的项目添加到服务附件的允许使用者列表中。

授予访问权限后，使用 gcloud CLI 或 Terraform 创建 PSC 端点并配置 DNS。

#### 创建 PSC 端点

在您的 VPC 中创建针对服务附件的转发规则：

```bash gcloud CLI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

####配置DNS

在您的 VPC 中创建私有 DNS 区域并添加指向 PSC 终端节点 IP 的 A 记录：

```bash gcloud CLI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

#### 验证连接

从 VPC 中的虚拟机：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://<REGION>.p.api.smith.langchain.com/ok
```

### Azure 专用链接

**Azure** 上的客户可以通过 [Azure Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview) 连接到 LangSmith Azure SaaS API。虚拟网络 (VNet) 中的专用终结点连接到 LangSmith 专用链接服务。

#### 请求访问权限

请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)，并提供您的 Azure 订阅 ID 和所需的终结点区域。 LangChain 将您的订阅添加到专用链接服务自动批准列表中。 LangChain还提供服务资源ID。等待 LangChain 确认订阅访问已启用，然后再创建专用终端节点。来自允许列表订阅的新连接会自动获得批准。来自其他订阅的连接需要手动批准。

#### 创建私有端点

使用 VNet 中的现有子网。将端点位置设置为子网的区域。将占位符替换为您的 Azure 资源详细信息和LangChain 提供的服务资源 ID。

以下 Terraform 示例使用 [AzureRM provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/private_endpoint)：

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "azurerm_private_endpoint" "langsmith" {
  name                = "langsmith-private-endpoint"
  location            = "<YOUR_SUBNET_REGION>"
  resource_group_name = "<YOUR_RESOURCE_GROUP>"
  subnet_id           = "<YOUR_SUBNET_ID>"

  private_service_connection {
    name                           = "langsmith"
    private_connection_resource_id = "<LANGSMITH_PRIVATE_LINK_SERVICE_RESOURCE_ID>"
    is_manual_connection           = false
  }
}

output "langsmith_private_endpoint_id" {
  value = azurerm_private_endpoint.langsmith.id
}
```

应用配置并等待连接状态为`Approved`，然后再测试连接。如果连接保持`Pending`，则将专用端点 ID 发送到LangChain 以确认订阅访问并解决待处理的请求。

####配置DNS

配置私有 DNS，以便 `azure.api.smith.langchain.com` 解析为 VNet 内的私有终结点的 IP 地址。将以下资源添加到相同的 Terraform 配置中：

```hcl Terraform theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "azurerm_private_dns_zone" "langsmith" {
  name                = "azure.api.smith.langchain.com"
  resource_group_name = "<YOUR_RESOURCE_GROUP>"
}

resource "azurerm_private_dns_a_record" "langsmith" {
  name                = "@"
  zone_name           = azurerm_private_dns_zone.langsmith.name
  resource_group_name = "<YOUR_RESOURCE_GROUP>"
  ttl                 = 60
  records             = [azurerm_private_endpoint.langsmith.private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "langsmith" {
  name                  = "langsmith-api"
  resource_group_name   = "<YOUR_RESOURCE_GROUP>"
  private_dns_zone_name = azurerm_private_dns_zone.langsmith.name
  virtual_network_id    = "<YOUR_VNET_ID>"
  registration_enabled  = false

  depends_on = [azurerm_private_dns_a_record.langsmith]
}
```

如果您使用自定义 DNS 服务器，请将其配置为将 `azure.api.smith.langchain.com` 解析为专用端点 IP。单独链接 Azure 私有 DNS 区域不会配置自定义解析器。此示例仅配置对 API 主机名的私有访问。如需对 LangSmith UI 或其他服务进行私人访问，请联系 LangChain 获取其他主机名。

#### 验证连接

从 VNet 中的虚拟机或容器中，确认 DNS 返回专用终结点 IP 并且 HTTPS 成功：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
nslookup azure.api.smith.langchain.com
curl --fail --show-error https://azure.api.smith.langchain.com/ok
```

继续使用 `https://azure.api.smith.langchain.com` 作为您的 LangSmith API 端点。 API 密钥和工作区权限仍然适用。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud-private-connectivity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。