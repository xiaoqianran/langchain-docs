<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: IP allowlisting | https://docs.langchain.com/langsmith/cloud-ip-allowlist -->

# IP白名单

LangSmith 云的静态出口和入口 IP 地址，以及将其列入防火墙或 VPC 配置白名单的说明。

## 将 IP 地址列入白名单

### 来自 LangChain SaaS 的出站流量

离开 LangSmith 服务的互联网流量通过 NAT 网关进行路由，并源自以下 IP 地址。 Vertex AI 请求可以使用不同的路径，如 [Allow Vertex AI access](#allow-vertex-ai-access) 中所述。

> [!注意]
>
> [LangSmith Agent Server](/langsmith/deployment) 出口处的特工从 [separate IP list](/langsmith/cloud-platform-features#allowlist-ip-addresses) 出口。

|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |蔚蓝美国 |
| - | - | - | - | - |
| 34.59.65.97 | 34.13.192.67 | 34.151.89.217 | 18.188.147.158 | 9.234.98.209 |
| 34.67.51.221 | 34.147.105.64 | 34.116.97.4 | 18.219.86.202 | |
| 34.46.212.37 | 34.90.22.166 | 34.151.162.199 | 34.151.162.199 3.21.57.1​​92 | |
| 34.132.150.88 | 34.147.36.213 | 34.116.66.129 | | |
| 35.188.222.201 | 34.32.137.113 | 35.189.8.125 | | |
| 34.58.194.127 | 34.58.194.127 34.91.238.184 | 35.201.9.237 | | |
| 34.59.97.173 | 35.204.101.241 | 35.204.101.241 35.189.57.29 | | |
| 104.198.162.55 | 35.204.48.32 | 34.40.198.11 | | |

当连接到您自己的 AzureOpenAI 服务或 Playground 或在线评估所需的其他端点时，将这些 IP 地址列入白名单可能会很有用。#### 允许 Vertex AI 访问

对于来自 GCP 上的LangSmith SaaS 的 Vertex AI 连接，单独的公共出口 IP 许可名单可能无法满足 VPC 服务控制。专用 Google 访问将 Google API 流量保留在 Google 网络内，而不是使用 NAT 网关的公共 IP 地址。请参阅 Google 的 [source IP access guidance](https://docs.cloud.google.com/vpc-service-controls/docs/access-level-design#granting_access_based_on_source_ip)。

为您的 LangSmith SaaS 区域对应的源项目配置 VPC Service Controls 入口规则：

| LangSmith SaaS 区域 |源 GCP 项目 ID |入口规则的源项目编号 |
| - | - | - |
|美国 (`smith.langchain.com`) | `langchain-prod` | `projects/83409505503` |
|欧盟 (`eu.smith.langchain.com`) | `langchain-prod` | `projects/83409505503` |
|亚太地区 (`apac.smith.langchain.com`) | `langchain-apac-prod` | `projects/774533884377` |

这些源项目专门针对来自美国、欧盟和亚太地区 GCP SaaS 区域的 Vertex AI 连接。在入口规则中使用数字 `projects/PROJECT_NUMBER` 值，而不是项目 ID。将规则限制为调用身份、目标项目和所需的 Vertex AI 操作。连接仍需要适当的 IAM 权限。请参阅 Google 的 [ingress rule configuration](https://docs.cloud.google.com/vpc-service-controls/docs/ingress-egress-rules)。按您的 LangSmith SaaS 区域选择源项目，而不是 Vertex AI 模型的区域。 Pod 或节点缩放不会更改源项目编号。将源工作负载或 VPC 网络移动到另一个项目可以更改所需的许可列表。

### 出口 IP 库存

获取 [egress IP inventory (JSON)](/langsmith/egress-ip-addresses.json) 以自动更新白名单。

过滤`addresses`：

* `service`：`langsmith`或`langsmith-deployment`（部署特工）。
* `cloud`：`gcp`、`aws` 或 `azure`。
* `region`：`us`、`eu` 或 `apac`。

将每个匹配的 `cidr` 列入白名单。列出的地址可以现在或将来使用。定期轮询并比较`version`以检测变化。在更新防火墙规则之前查看添加和删除内容。

### 进入LangChain SaaS

LangChain 端点映射到以下静态 IP 地址。流量终止于 **GCP 负载均衡器**（美国/欧盟/亚太地区）、`centralus` 中的 **Azure** 入口，或者对于 **AWS US**，`us-east-2` 中的 **网络负载均衡器**（API 和网关主机名）：|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |天蓝色|
| - | - | - | - | - |
| 34.8.121.39 | 34.95.92.214 | 34.149.149.213 | 34.149.149.213 3.129.27.169 | 3.129.27.169 20.106.1.6 |
| 34.107.251.234 | 34.107.251.234 34.13.73.122 | | 13.58.107.119 | |
| | | | 16.59.151.49 | |
| | | | 16.59.98.147 | |
| | | | 3.134.146.243 | 3.134.146.243 |
| | | | 3.150.87.246 | |
| 34.56.47.75（新）| 34.32.254.168（新）| 34.151.160.163（新）| | |

将您所在区域列中的每个地址列入白名单，以便您的专用网络可以访问 LangSmith 云（`api.smith.langchain.com`、`smith.langchain.com`、`beacon.langchain.com`、`eu.api.smith.langchain.com`、`eu.smith.langchain.com`、`eu.beacon.langchain.com`、`apac.api.smith.langchain.com`、`apac.smith.langchain.com`、 `apac.beacon.langchain.com`、`azure.smith.langchain.com`、`azure.api.smith.langchain.com`、`beacon.azure.langchain.com`、`aws.api.smith.langchain.com`、`aws.smith.langchain.com`）。

GCP 美国、欧盟和亚太地区正在移至最后一行中的其他地址（`34.56.47.75`、`34.32.254.168` 和 `34.151.160.163`）。现在添加这些地址。当前的 GCP 地址将继续为这些主机名提供服务，直至 2027 年 2 月 10 日。在此日期之后，主机名仅使用其他地址。仅当主机名不再解析为当前 GCP 地址时，才将其从允许列表中删除。 AWS US 和 Azure 地址没有变化。此列表仅适用于LangSmith云。 BYOC 或自托管部署在您自己的环境中使用负载均衡器。如果您的专用网络通过公共互联网（包括通过 BYOC 控制平面连接）到达云，请将您所在区域的云地址列入白名单。 AWS PrivateLink、GCP Private Service Connect 和 Azure Private Link 不使用这些地址。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud-ip-allowlist.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。