<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC networking on GCP | https://docs.langchain.com/langsmith/byoc-networking-gcp -->

# GCP 上的 BYOC 网络

LangSmith BYOC 在您的 GCP 项目中创建的网络、如何将您的网络连接到该网络以及离开数据平面的流量。

LangSmith 为 GCP 项目中的每个 BYOC 数据平面创建一个 VPC。本页介绍了其地址范围、如何将您的网络连接到它，以及哪些流量保留在 Google 网络上或需要互联网。对于 LangSmith 部署的其他所有内容，请参阅 [BYOC architecture on GCP](/langsmith/byoc-architecture-gcp)。

> [!注意]
>
> GCP 上的 BYOC 位于 [beta](/langsmith/release-stages)。网络详细信息可能会因版本而异。此页面上的值是当前默认值。

## 地址范围

所有子网都来自您选择的`vpc_cidr`，范围从`/16`到`/18`。全部都开启了私人 Google 访问权限。

|范围 |尺寸|使用|
| - | - | - |
| GKE 子网 |第一`/20`| GKE 节点。 |
|端点子网 | `/24` | Memorystore 的专用服务连接端点。 |
|控制平面端点子网| `/24` |专用服务连接端点到`us-central1`中的LangSmith控制平面。 |
|私人服务接入| `/20` |与 Cloud SQL 专用 IP 的 Google 服务对等。 |
| GKE Pod | `/18` | GKE 子网的次要范围：专用服务访问范围之后的第一个 `/18`。 |`/18` VPC 没有足够的空间容纳 Pod 范围，因此其 Pod 使用 `192.168.0.0/18`，并且 VPC 不得与该范围重叠。使用 `/17` 或 `/16` 将每个范围保留在 VPC 内。

GKE 服务不受 VPC 的影响。 GKE 为它们分配 Google 管理的范围 `34.118.224.0/20`，该范围保留在集群内，不会通过 VPC 对等互连导出。较旧的数据平面为 Pod 保留 `192.168.0.0/18`，为服务保留 `192.168.64.0/18`。

VPC 是一种具有自定义子网的区域 VPC。 Cloud NAT 使用一个静态外部 IP 地址，您可以将其列入许可名单以接受来自数据平面的流量。 Cloud NAT 日志记录仅设置为错误。

## 连接您的网络

默认情况下，数据平面端点是内部的：GKE 子网中的内部直通负载均衡器，具有全局访问权限，因此连接网络的任何区域中的客户端都可以访问它。当您[create the data plane](/langsmith/byoc-onboarding-gcp#choose-a-public-or-internal-endpoint)时，您可以选择公共或内部。

要到达内部端点：* **将您的网络连接到数据平面 VPC**，例如使用 VPC 对等互连或 Cloud VPN。对等交换子网路由，包括 GKE Pod 范围，因此请选择不与您的网络重叠的 `vpc_cidr`。对于 `/18` VPC，您的网络也不得与 `192.168.0.0/18` 重叠。
* **从您的网络解析主机名。** 地址记录位于只有数据平面 VPC 可以看到的私有区域中，因此私有地址永远不会发布。

如果您连接的网络具有较小的 MTU，请设置 VPC [MTU](#mtu) 与之匹配。如果该网络将默认路由导出到数据平面 VPC，则 Google API 流量仍使用[Private Google Access](#private-google-access)，并且所有其他出口都遵循导入的路由。

## MTU

VPC 使用 GCP 默认 MTU，1460 字节。如果您将VPC连接到具有较小MTU的网络，例如中心VPC或1440字节的互连，请在创建数据平面时设置`mtu_bytes`。 LangSmith 接受 1300 至 8896。

## 私人服务连接* LangChain 在`us-central1` 中发布服务附件。 LangSmith 在数据平面配置期间自动将您的项目添加到其接受列表中。无需手动将项目列入许可名单。
* 数据平面创建端点：控制平面端点子网中的内部地址，以及服务附件的转发规则。其他区域的数据平面通过全局访问到达端点。
* `us-central1.p.api.smith.langchain.com` 的私有 DNS 区域，仅在数据平面 VPC 中可见，指向端点。
* Private Service Connect 仅将流量从数据平面传输到控制平面。控制平面通过基于 GKE DNS 的端点到达集群。

## 私人 Google 访问权限

数据平面通过`private.googleapis.com`到达Google API，因此流量保留在Google网络上，不依赖于VPC的默认路由。 LangSmith 在数据平面VPC中创建以下内容：* **路由**：`199.36.153.8/30` (`private.googleapis.com`) 和 `34.126.0.0/18`（某些 Google API 的直接连接），两者都将默认互联网网关作为下一跃点。他们的名字以`langsmith-`开头。
* **私有 DNS 区域**：`googleapis.com`、`pkg.dev` 和 `gcr.io` 解析为 `private.googleapis.com`。 `rep.googleapis.com` 区域将区域端点（例如 `aiplatform.us-central1.rep.googleapis.com`）保留在其公共地址上。这些区域仅在数据平面 VPC 中可见。

这些路由比默认路由更具体，包括从对等网络导入的路由。因此，Secret Manager、云存储、工作负载身份、云日志记录以及从 Artifact Registry 提取的图像不会通过该网络。 VPC 对等互连不会交换下一跳为默认 Internet 网关的路由，因此对等网络不会学习这些路由，并且其 DNS 保持不变。

## DNS 和入口* **主机名**：`<first 8 characters of the data plane ID>.gcp.langchain-byoc.com`。 LangChain 拥有父区域。
* **公共区域**：项目中主机名的公共云 DNS 区域，LangChain 从父区域委托。
* **公共端点**：外部直通负载均衡器。主机名在互联网上解析。
* **内部端点**（默认）：GKE 子网中的内部直通负载均衡器，具有全局访问权限。地址记录位于私有区域中，仅在数据平面 VPC 中可见，因此私有地址永远不会发布。公共区域保留用于委托和证书挑战。
* **TLS**：Let's Encrypt 证书。 HTTP 重定向到 HTTPS。
* **网关强化**：网关在路由之前规范化路径，拒绝超过 100 MiB 的请求正文，限制每个网关 pod 的请求，并拒绝 `TRACE`、`TRACK` 和 `CONNECT`。
* **控制平面路径**：登录等路径通过 Private Service Connect 转发到控制平面。

## 容器镜像LangSmith 及其附加组件通过 Private Google Access 从 LangChain 的 Artifact Registry 存储库 `us-docker.pkg.dev/langchain-artifacts/langsmith-byoc` 提取图像。这些附加组件包括 cert-manager、trust-manager、External Secrets、Istio 和 KEDA。没有图像来自 Docker Hub、Quay 或 GitHub Container Registry。

## 出站流量

以下流量不需要访问互联网：

* **控制平面**：专用服务连接。
* **Google API 和图像**：私人 Google 访问权限。
* **Cloud SQL 和 Memorystore**：私有 IP 和私有服务连接。

所有其他出口均通过 VPC 的默认路由：Cloud NAT 或您的网络（如果您从中导入默认路由）离开。如果您的网络过滤该流量，请允许以下目的地：|特色 |目的地 |
| - | - |
|模型提供商|您的工作区使用的 LLM 提供程序，例如 `api.openai.com` 和 `api.anthropic.com`、Azure OpenAI (`<resource>.openai.azure.com`)、Amazon Bedrock (`bedrock-runtime.<region>.amazonaws.com`) 或自定义基本 URL。对于 Vertex AI（包括 Vertex AI 上的 Gemini），仅允许其区域 `aiplatform.<region>.rep.googleapis.com` 端点。 Gemini 开发者 API (`generativelanguage.googleapis.com`) 通过私有 Google 访问，无需输入。 |
|证书 | TCP 443 上的 `acme-v02.api.letsencrypt.org`，以及 TCP 和 UDP 53 上的 DNS 到 `1.1.1.1` 和 `8.8.8.8`，以进行 DNS-01 传播检查。 |
|来自 GitHub 的部署构建 | `github.com`、`api.github.com`、`codeload.github.com`、`pypi.org`、`files.pythonhosted.org`、`registry.npmjs.org`以及项目使用的任何包索引或 git 主机。 |
|代理和沙箱代码 |代码调用的工具、API 和包索引。 |
| Webhooks、警报、MCP 服务器和集成 |您配置的 URL，例如 `events.pagerduty.com` 或 `slack.com`。 |

如果您的网络检查 TLS，请从检查中排除这些目标。数据平面中的工作负载不信任您的检查 CA。

## 另请参阅

* [BYOC architecture on GCP](/langsmith/byoc-architecture-gcp)
* [BYOC onboarding on GCP](/langsmith/byoc-onboarding-gcp)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-networking-gcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。