<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC architecture on GCP | https://docs.langchain.com/langsmith/byoc-architecture-gcp -->

# GCP 上的 BYOC 架构

LangSmith BYOC 在您的 GCP 项目中部署什么、数据平面如何连接到 LangChain 控制平面以及 LangSmith 在您的项目中获得的访问权限。

GCP 上的 BYOC 在 GCP 项目中运行 LangSmith 数据平面，而 LangChain 在 `us-central1` 中自己的 GCP 环境中运行控制平面。您的跟踪数据保留在您的项目中。本页面介绍了 LangSmith 部署的内容、流量如何流动以及 LangSmith 在您的项目中获得的访问权限。对于 AWS 上的 BYOC，请参阅 [BYOC architecture](/langsmith/byoc-architecture-aws)。

> [!注意]
>
> GCP 上的 BYOC 位于 [beta](/langsmith/release-stages)。资源和权限可能会在版本之间发生变化。此页面上的值是当前默认值。

要设置数据平面，请遵循[BYOC onboarding on GCP](/langsmith/byoc-onboarding-gcp)。

![BYOC architecture diagram for GCP. The LangSmith UI and the client apps in your application VPC reach the data plane over VPC peering or Cloud VPN, which terminates at an internal load balancer. The load balancer feeds an Istio ingress in a GKE cluster in your Google Cloud project, which routes to the LangSmith services that run the backend, SmithDB, and sandboxes, and those services read and write Cloud Storage, Cloud SQL, and Memorystore. The LangChain cloud control plane in us-central1 holds Crossplane, on-call engineers, alerting, and the LangSmith control plane services. Crossplane reaches the cluster through the GKE DNS endpoint with IAM for scaling and upgrades, the data plane sends auth and telemetry back over Private Service Connect, and the control plane impersonates a service account in your project to provision resources.](https://mintcdn.com/langchain-5e9cc07a/HiBWiLuTxHfhLZqh/langsmith/images/byoc-architecture-gcp.png?fit=max\&auto=format\&n=HiBWiLuTxHfhLZqh\&q=85\&s=277a80cf315c7517a6e2b22e050b24fe)

## 部署什么

LangSmith 在您的 GCP 项目中创建以下内容：* **网络**：具有 GKE 子网的 VPC、具有静态出口 IP 地址的 Cloud NAT 和私有服务访问。
* **GKE**：具有工作负载身份和屏蔽节点的区域私有 GKE 标准集群。
* **Cloud SQL for PostgreSQL**：仅私有 IP、高可用性、TLS 和 IAM 数据库登录，因此不存在数据库密码。
* **Redis 集群的 Memorystore**：TLS 和 IAM 身份验证，通过 Private Service Connect 实现。
* **云存储**：强制实施公共访问阻止的存储桶。
* **DNS 和入口**：数据平面主机名的 Cloud DNS 区域、带有 Let's Encrypt 的证书管理器、带有 Secret Manager 的外部密钥以及 Istio 入口网关。
* **专用服务连接**：LangSmith 的端点，因此数据平面无需互联网即可到达控制平面。

> [!注意]
>
> GCP数据平面在[SmithDB](/langsmith/self-host-smithdb)中存储和查询轨迹，并且不运行ClickHouse。

## 流量如何流动1. **用户到数据平面**：用户到达`https://<first 8 characters of the data plane ID>.gcp.langchain-byoc.com`。主机名指向公共或内部负载均衡器上的 Istio 入口网关，您在创建数据平面时选择该网关。
2. **数据平面到控制平面**：数据平面通过其 VPC 中的 Private Service Connect 终端节点到达位于 `us-central1.p.api.smith.langchain.com` 的 LangSmith API。该路径承载心跳、登录和身份验证调用以及遥测。它不使用互联网。
3. **GCP API 的控制平面**：控制平面充当一个LangChain 身份、`byoc-crossplane@langchain-prod.iam.gserviceaccount.com`。它会模拟您的配置者服务帐户，因此项目中的每个 GCP API 调用都是作为配置者进行的。 LangSmith API 将数据平面机密写入 Secret Manager，Crossplane 创建、更新和删除其他资源。4. **控制平面到 GKE**：Crossplane 通过集群基于 DNS 的控制平面端点安装和更新集群内资源。每个请求都需要一个 Google 令牌来作为有权访问集群的身份。 Crossplane 的 Helm 和 Kubernetes 提供者无法模拟配置者，因此控制平面服务帐户本身持有`roles/container.admin`。您的 Terraform 模块仅在标记为 `managed_by: langsmith` 的 GKE 集群上授予该权限，并且 LangSmith 在创建每个数据平面集群时对其进行标记。
5. **DNS 委托**：控制平面在LangChain 的父区域`gcp.langchain-byoc.com` 中写入数据平面主机名的 NS 委托。这张唱片是LangChain的项目，不是你的。

## 创建和删除生命周期1.您的 Terraform 创建配置程序服务帐户及其角色，创建 `managed_by: langsmith` 标签，并让控制平面服务帐户模拟配置程序。
2. 您使用 API 创建数据平面。
3. 控制平面检查其访问权限，将数据平面机密写入 Secret Manager，并将数据平面交给 Crossplane。
4. Crossplane 构建网络、GKE、Cloud SQL、Memorystore、Cloud Storage 和 DNS，标记 GKE 集群`managed_by: langsmith`，然后安装LangSmith。
5. 数据平面发送心跳，LangSmith显示为`active`。
6. 删除数据平面时，控制平面解除删除保护，Crossplane 删除资源，控制平面删除机密。 Cloud Storage 存储桶和 Cloud SQL 备份将保留。有关更多信息，请参阅[What teardown keeps](/langsmith/byoc-onboarding-gcp#what-teardown-keeps)。

## 网络

所有子网都来自您选择的`vpc_cidr`，范围从`/16`到`/18`。全部都开启了私人 Google 访问权限。|范围 |尺寸|使用 |
| - | - | - |
| GKE 子网 |第一`/20` | GKE 节点。 Pod 使用辅助范围 `192.168.0.0/18`，服务使用 `192.168.64.0/18`。 |
|端点子网 | `/24` | Memorystore 的专用服务连接端点。 |
|控制平面端点子网| `/24` | Private Service Connect 端点到LangSmith 控制平面，位于`us-central1`。 |
|私人服务接入| `/20` |与 Cloud SQL 专用 IP 的 Google 服务对等。 |

VPC 是一种具有自定义子网的区域 VPC。 Cloud NAT 使用一个静态外部 IP 地址，因此您可以将数据平面列入白名单，并且仅记录错误。

## 存储

所有数据存储都没有公共端点。|商店 |配置|
| - | - |
| PostgreSQL 的云 SQL |企业版，区域性，在另一个区域具有备用，具有自动存储增长。仅限私有IP。需要 TLS。 IAM数据库登录，因此不存在应用程序密码。自动备份（保留 7 个）和时间点恢复（7 天）。删除保护开启。拆卸时，Cloud SQL 会进行最终备份，保存 365 天，并保留自动备份。保存 LangSmith 和 SmithDB 元存储数据库。 |
| Redis 集群的内存存储 |一个分片和一个副本。 IAM 身份验证和 TLS。通过 Private Service Connect 端点到达。删除保护开启。 |
|云存储|用于存储 LangSmith blob 和 SmithDB 数据的一个区域存储桶。统一的存储桶级访问，并强制执行公共访问预防。生命周期规则删除 TTL 前缀下的对象。拆解保留桶及其对象。 |
|秘密经理|数据平面配置和 Postgres 的区域秘密，以及启用沙箱时的区域秘密。标有数据平面 ID。控制平面在创建时写入它们并在拆卸时删除它们。 |

## GKE 和计算* **集群**：`REGULAR` 发布通道上的区域 GKE 标准集群。节点自动修复和升级。
* **私有集群**：私有节点和私有IP端点，在VPC内具有全局访问权限。
* **基于 DNS 的控制平面端点**：接受外部流量，并需要 IAM：带有 `container.clusters.connect` 的 Google 令牌，然后是 Kubernetes RBAC。 LangSmith 保留的 kubeconfig 不包含任何凭据。
* **工作负载身份**：通过每个节点池上的 GKE 元数据服务器启用，因此 Pod 永远不会看到节点凭据。
* **Dataplane V2**：强制执行 Kubernetes NetworkPolicy。
* **屏蔽节点**：每个池上的安全启动和完整性监控，没有 kubelet 只读端口。
* **安全态势**：基本镜像漏洞扫描。仅系统指标，Prometheus 托管服务关闭。
* **删除保护**：打开。拆解首先将其抬起。
* **节点服务帐户**：GKE 的默认节点池已删除，并且没有池作为项目的默认 Compute Engine 服务帐户运行。该集群为平台工作负载运行系统节点池，并为应用程序自动配置节点。通过`sandboxes_enabled`，它还运行一个具有嵌套虚拟化功能的沙箱节点池，仅针对沙箱主机并具有自己的节点服务帐户。沙箱无法到达元数据服务器。

默认情况下不启用：使用 Cloud KMS 密钥、二进制授权和机密 GKE 节点进行应用程序层 Secrets 加密。

## 集群内资源

* **LangSmith**：LangSmith Helm 图表，带有 SmithDB。每个 LangSmith Pod 通过 Workload Identity 作为工作负载服务帐户运行。 SmithDB 通过 Cloud SQL Auth Proxy sidecar 访问 Cloud SQL。
* **KEDA**：自动扩展 LangSmith 服务。
* **外部 Secrets Operator**：Secret Manager 上的 ClusterSecretStore，只能从 LangSmith 命名空间使用。它每小时同步一次数据平面秘密。
* **cert-manager 和 trust-manager**：cert-manager 仅在数据平面区域中使用具有 DNS-01 质询的 Let's Encrypt 颁发者。 trust-manager 与公共 CA 以及 Cloud SQL 和 Memorystore CA 构建一个 CA 捆绑包。
* **Istio**：基础、istiod 和入口网关。* **Postgres 设置作业**：创建 IAM 数据库用户并授予其数据库所有者角色。它不保留密码。

## DNS 和入口

* **主机名**：`<first 8 characters of the data plane ID>.gcp.langchain-byoc.com`。 LangChain 拥有父区域。
* **公共区域**：项目中主机名的公共云 DNS 区域，由 LangChain 从父区域委托。
* **公共端点**：外部直通负载均衡器。主机名在互联网上解析。
* **内部端点**（默认）：GKE 子网中的内部直通负载均衡器，具有全局访问权限。地址记录位于私有区域中，仅在数据平面 VPC 中可见，因此私有地址永远不会发布。公共区域保留用于委托和证书挑战。
* **TLS**：Let's Encrypt 证书。 HTTP 重定向到 HTTPS。
* **网关强化**：网关在路由之前规范化路径，拒绝超过 100 MiB 的请求正文，限制每个网关 pod 的请求，并拒绝 `TRACE`、`TRACK` 和 `CONNECT`。
* **控制平面路径**：登录等路径通过 Private Service Connect 转发到控制平面。

## 私人服务连接* LangChain 在`us-central1` 发布服务附件。 LangSmith 在数据平面配置期间自动将您的项目添加到其接受列表中。无需手动将项目列入许可名单。
* 数据平面创建端点：控制平面端点子网中的内部地址，以及服务附件的转发规则。其他区域的数据平面通过全局访问到达端点。
* `us-central1.p.api.smith.langchain.com` 的私有 DNS 区域，仅在数据平面 VPC 中可见，指向端点。
* Private Service Connect 仅将流量从数据平面传输到控制平面。控制平面通过基于 GKE DNS 的端点到达集群。

## 访问和权限

### Terraform 模块资源

[⟦T29⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/gcp/langsmith-byoc-service-account) 在您的项目中创建以下内容：|资源 |它有什么作用 |
| - | - |
| `langsmith-byoc-provisioner` 服务帐号 |服务帐户LangSmith规定如下。它的描述是您的外部 ID。 |
|供应商上的令牌创建者 |让 `byoc-crossplane@langchain-prod.iam.gserviceaccount.com` 模拟配置者。没有其他 LangChain 身份受到信任。 |
| `langsmithByocProvisioner` 自定义角色 |名称条件无法限制的创建、更新和删除数据平面资源的权限，绑定在项目上。 |
| `langsmithByocNamed<Kind>` 自定义角色 |每种资源类型一个角色：Cloud SQL 实例、GKE 集群、网络、子网、Cloud Routers、地址、转发规则、Memorystore for Redis 集群、服务连接策略、Cloud Storage 和 Secret Manager。每个资源名称都与 IAM 条件绑定，因此配置者只能创建、更改和删除名称以 `langsmith-` 开头的资源以及 ID 以 `ls-` 开头的机密。 |
| `managed_by: langsmith` 标签 |一个项目标签。配置程序只能将其绑定到名称以 `langsmith-` 开头的 GKE 集群。 |
| `roles/container.admin` 用于控制平面 |授予`byoc-crossplane@langchain-prod.iam.gserviceaccount.com`，条件是集群具有`managed_by: langsmith`标签。它涵盖了 GKE API 和 Kubernetes API。 || `langsmithByocClusterConnect`自定义角色| `container.clusters.connect` 用于控制平面服务帐户，仅限于名称以 `langsmith-` 开头的集群。基于 DNS 的端点在没有集群标签的情况下检查它。连接不允许访问集群内部。 |
| `langsmithByocProjectIamGranter`自定义角色| `resourcemanager.projects.getIamPolicy` 和 `setIamPolicy`。 IAM 条件允许配置者仅添加或删除以下项目角色：`artifactregistry.reader`、`cloudsql.admin`、`cloudsql.client`、`cloudsql.instanceUser`、`container.defaultNodeServiceAccount`、`redis.dbConnectionUser` 和 `secretmanager.secretAccessor`。该条件限制了哪些角色，而不是限制了谁。 |
| `langsmithByocServiceAccountUser`自定义角色| `iam.serviceAccounts.actAs`，因此 GKE 节点和工作负载可以作为数据平面服务帐户运行。 IAM 不评估 `actAs` 的条件，因此此绑定没有。 |
|项目 API |使用 `enable_apis`（默认 `true`）：计算引擎、GKE、Cloud DNS、IAM、IAM 服务账户凭证、网络连接、Redis 内存存储、Secret Manager、服务目录、服务网络和 Cloud SQL 管理。 |

自定义角色ID前缀默认为`langsmithByoc`。如果项目已经具有具有这些 ID 的角色，则设置 `custom_role_id_prefix`。每个项目应用该模块的一份副本，因为它会创建项目的 `managed_by` 标签键。有关每个角色的完整权限列表，请参阅模块的 [README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/gcp/langsmith-byoc-service-account) 和源代码。

### 创建时检查当这些检查之一失败时，控制平面将停止创建：

* 可以冒充provisioner，provisioner在项目上有`resourcemanager.projects.get`、`secretmanager.secrets.create`、`secretmanager.secrets.delete`。它在删除之前运行相同的检查。
* 配置器位于数据平面项目中。
* 配置者的描述是您组织的外部 ID。每个客户的配置程序都信任同一个控制平面服务帐户，因此此检查会阻止另一个 LangSmith 组织使用您的配置程序。
* 对于`byoiam_enabled`，该项目具有[Data plane service accounts](#data-plane-service-accounts) 中列出的六个服务帐户。

### 数据平面服务帐户

Crossplane 为每个数据平面的每个工作负载类创建一个 Google 服务帐户，并使用 Workload Identity (`roles/iam.workloadIdentityUser`) 将其绑定到其 Kubernetes 服务帐户。使用 `byo_iam`，您的 Terraform 使用固定 ID 创建它们，并且项目中的所有数据平面共享它们。|服务帐户（默认/`byo_iam`）|使用者 |角色 |
| - | - | - |
| `lsa-<hash>` / `langsmith-workload` | LangSmith 应用程序和 SmithDB |项目：`redis.dbConnectionUser`、`cloudsql.client`、`cloudsql.instanceUser`。铲斗：`storage.objectAdmin`。 Token Creator 本身，用于对 Cloud Storage URL 进行签名。 |
| `lse-<hash>` / `langsmith-external-secrets` |外部秘密运营商| `secretmanager.secretAccessor`，每个数据平面的秘密 ID 都有一个条件。使用`byo_iam`：ID 以`ls-` 开头的秘密。 |
| `lsc-<hash>` / `langsmith-cert-manager` |证书经理 | `dns.admin` 仅在数据平面的 DNS 区域上，从不在项目上。 |
| `lsp-<hash>` / `langsmith-postgres-setup` | Postgres 设置工作 |项目：`cloudsql.admin`。 |
| `lsn-<hash>` / `langsmith-node` | GKE 节点 |项目：`container.defaultNodeServiceAccount`、`artifactregistry.reader`。 |
| `lsh-<hash>` / `langsmith-sandbox-host` |沙箱节点，启用沙箱 |项目：`container.defaultNodeServiceAccount`、`artifactregistry.reader`、`redis.dbConnectionUser`。存储桶：仅位于 `smithbox/` 托管文件夹上的 `storage.objectAdmin`。 |

您的 Terraform 模块仅在标记的集群上授予 `byoc-crossplane@langchain-prod.iam.gserviceaccount.com` 其 `roles/container.admin`，无论是否带有 `byo_iam`。 Crossplane 不给予它任何资助。

使用`byo_iam`时，请勿在以`ls-`开头的项目ID中提供您自己的秘密，否则外部秘密可以读取它们。

### 带上您自己的 IAM在项目中创建数据平面之前，请在模块中设置`byo_iam = true`，并在创建数据平面时将`byoiam_enabled`设置为`true`。当项目还拥有非 LangSmith 的资源时使用它。当数据平面存在时，请勿更改`byo_iam`。对于 `byo_iam`：

* 您的 Terraform 创建六个服务帐户及其项目角色。
* 配置者角色失去 `iam.serviceAccounts.create`、`delete`、`update` 和 `setIamPolicy`。它保留 `get`、`list` 和 `getIamPolicy`。
* 该模块不会创建 `ProjectIamGranter` 或 `ServiceAccountUser` 角色，因此配置者无法更改项目 IAM 策略。
* 配置者仅在六个帐户上获取 `iam.serviceAccounts.getIamPolicy` 和 `setIamPolicy`（自定义角色 `langsmithByocServiceAccountIamManager`），以添加工作负载身份绑定。它仅在 `langsmith-node` 和 `langsmith-sandbox-host` 上获得 `roles/iam.serviceAccountUser`。
* LangSmith 仍将数据平面区域上的 `dns.admin` 授予 `langsmith-cert-manager`，因为这些区域在数据平面之前不存在。

### LangChain 可以访问什么，不能访问什么* **可以**：通过provisioner创建、更改和删除数据平面资源，这对于大多数类型来说意味着名称以`langsmith-`开头的资源。阅读项目的 IAM 策略和服务账户。担任标记为 `managed_by: langsmith`（通过 `container.admin`）的 GKE 集群的集群管理员。这就是LangSmith安装和升级应用程序的方式。
* **不能，按角色**：配置器没有`storage.objects.get`，因此无法读取存储桶中的对象。它可以列出并删除它们。它没有`secretmanager.versions.access`，因此无法读取秘密。它没有 Cloud SQL 用户或数据库登录权限，也没有项目外部的权限。

这些是配置者角色的限制，而不是拒绝策略。配置者仍然可以在`langsmith-`存储桶、项目中的每个DNS区域和ArtifactRegistry存储库上以及在没有`byo_iam`的服务帐户上设置IAM策略。> [!警告]
>
> 使用仅包含 LangSmith 资源的项目。对于大多数种类，名称条件将配置者限制为 `langsmith-` 资源，但并非在所有情况下。如果项目还拥有其他资源，`byo_iam` 会删除下面的服务帐户和项目角色授予访问权限，但不会删除其余资源：
>
> * **服务帐户**：IAM 通过其数字唯一 ID 检查服务帐户，因此条件无法通过帐户名称限制服务帐户权限。如果没有 `byo_iam`，配置程序的 `setIamPolicy` 和 `actAs` 适用于项目中的每个服务帐户，因此它可以充当其中的任何一个。
> * **项目角色授予**：如果没有`byo_iam`，配置者可以将上面列出的项目角色授予任何主体，包括其自身。使用 `cloudsql.admin` 或 `secretmanager.secretAccessor`，它可以到达项目中的每个 Cloud SQL 实例或密钥。
> * **DNS 区域、ArtifactRegistry 存储库和 Cloud SQL 数据库**：配置者可以更改、删除和设置项目中任何 DNS 区域及其记录以及任何 ArtifactRegistry 存储库的 IAM 策略。它可以删除和更改任何 Cloud SQL 数据库，但无法连接到数据库。> * **Postgres 设置**：Cloud SQL 用户的 IAM 检查不包含实例名称。使用 `byo_iam`，Postgres 设置帐户可以在项目中的每个 Cloud SQL 实例上创建和更新数据库用户，包括 `postgres` 密码。如果没有 `byo_iam`，其项目拨款 `cloudsql.admin` 将涵盖项目中的每个 Cloud SQL 实例。
> * **您自己的 `langsmith-` 资源**：如果您的资源名称也以 `langsmith-` 开头，则名称条件无法区分您的资源与 LangSmith 的资源。

### 删除访问权限

要删除 LangChain 对您项目的访问权限：

* **推荐**：删除LangSmith中的数据平面。等到它消失，如果没有其他数据平面使用该项目，则运行`terraform destroy`。
* **立即**：删除 LangChain 授予：绑定在配置者（或配置者本身）上的 Token Creator，以及标记条件的 `roles/container.admin` 和 `langsmithByocClusterConnect` 授予 `byoc-crossplane@langchain-prod.iam.gserviceaccount.com`。 LangSmith 则无法更改或删除数据平面。资源会保留，您必须自行删除它们。

## 另请参阅

* [BYOC onboarding on GCP](/langsmith/byoc-onboarding-gcp)
* [BYOC overview](/langsmith/byoc)
* [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-architecture-gcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。