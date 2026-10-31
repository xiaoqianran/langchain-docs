<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Cloud platform features | https://docs.langchain.com/langsmith/cloud-platform-features -->

# 云平台功能

用于LangSmith部署的纯云平台功能，包括数据区域、静态IP地址、有效负载限制和部署类型。

本页面介绍仅适用于 [Cloud](/langsmith/cloud) 部署的平台功能。对于自托管等效项，请参阅 [Deploy to self-hosted](/langsmith/deploy-to-self-hosted-overview)。

## 数据区域

可以在两个数据区域创建部署：美国和欧盟。

部署的数据区域由创建部署的LangSmith 组织的数据区域隐含。部署和部署的底层数据库无法在数据区域之间迁移。

## 静态IP地址

2025 年 1 月 6 日之后创建的部署中的所有流量均通过 NAT 网关。该 NAT 网关有多个静态 IP 地址，具体取决于数据区域。

### 将 IP 地址列入白名单

使用以下静态 IP 地址将每个区域的流量列入白名单：

> [!注意]
>
> 其他 LangSmith 服务从 [separate IP list](/langsmith/cloud#egress-from-langchain-saas) 出口。

对于自动更新，请使用[egress IP inventory (JSON)](/langsmith/egress-ip-addresses.json)。按 `service: langsmith-deployment`、您的云和您的数据区域进行过滤。将每个匹配的 `cidr` 列入白名单。有关字段定义和更新指南，请参阅[Egress IP inventory](/langsmith/cloud#egress-ip-inventory)。|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |
| - | - | - | - |
| 35.197.29.146 | 34.90.213.236 | 34.40.236.16 | 3.13.80.97 |
| 34.145.102.123 | 34.145.102.123 34.13.244.114 | 34.13.244.114 34.40.140.88 | 3.146.216.198 |
| 34.169.45.153 | 34.169.45.153 34.32.180.189 | 34.32.180.189 34.151.88.209 | 16.59.72.244 |
| 34.82.222.17 | 34.34.69.108 | 35.189.51.120 | |
| 35.227.171.135 | 35.227.171.135 34.32.145.240 | 34.32.145.240 34.40.172.39 | |
| 34.169.88.30 | 34.90.157.44 | 35.189.56.87 | |
| 34.19.93.202 | 34.141.242.180 | 34.141.242.180 35.189.17.201 | |
| 34.19.34.50 | 34.32.141.108 | 35.244.99.196 | |
| 34.59.244.194 | 34.59.244.194 34.12.178.175 | 34.40.149.177 | 34.40.149.177 |
| 34.9.99.224 | 34.91.192.230 | 34.40.144.104 | 34.40.144.104 |
| 34.68.27.146 | 34.32.209.237 | 34.151.130.182 | |
| 34.41.178.137 | 34.41.178.137 34.178.128.69 | 34.116.82.199 | |
| 34.123.151.210 | | | |
| 34.135.61.140 | | | |
| 34.121.166.52 | | | |
| 34.31.121.70 | | | |
| 136.107.81.228 | | | |
| 136.107.155.54 | | | |
| 8.228.118.112 | | | |
| 136.70.239.145 | | | |
| 8.234.246.249 | 8.234.246.249 | | |
| 35.221.47.168 | | | |
| 136.90.3.18 | | | |
| 34.48.88.158 | | | |

## 负载大小

发送到云部署的所有请求的最大负载大小为 25 MB。负载大于 25 MB 的请求会返回 `413 Payload Too Large` 错误。

## 部署类型控制平面提供两种部署类型：无服务器和专用。每个都有三种 [sizes](#sizes) 可供选择：小号、中号和大号。

> [!注意]
>
> `langgraph deploy` 默认创建无服务器部署。较旧的 CLI 版本使用 `dev` 进行遗留开发部署，无需缩放至零，使用 `prod` 进行专用部署。遗留`dev`并不等同于Serverless；参见[⟦T7⟧](/langsmith/cli#deploy)。

| **部署类型** | **缩放** | **数据库** | **最适合** |
| - | - | - | - |
|无服务器|不活动后缩放至零，在下一个请求时唤醒 |共享、多租户 |后台和其他耐延迟生产工作负载、开发和测试 |
|专注|始终在线、跨副本自动缩放 |专用，具有自动备份和高可用性|需要始终在线容量的延迟敏感工作负载 |

> [!警告]
>
> **不可变部署类型**
> LangSmith 不支持创建部署后更改部署类型。要迁移到其他类型，请创建新的部署并使用 [Agent Server API](/langsmith/server-api-ref) 从之前的部署复制数据，或者联系 [support](https://support.langchain.com) 获取迁移帮助。部署的 [size](#sizes) 仍然可以更改。代理服务器在两种部署类型上都是容错的；它会自动从短暂的 Redis 或 Postgres 中断中恢复，并重试失败的后台运行。

### 无服务器

无服务器部署运行一个副本，该副本在空闲时扩展到零，并在下一个请求时唤醒。它适合后台代理、开发和测试，以及可以容忍冷启动延迟的生产工作负载。

在创建时或在“缩放”对话框中将“**之后缩小**”设置为 `1 hour`、`1 day` 或 `1 week`（默认值）。较短的窗口可减少闲置计算费用；更长的窗户可以减少冷启动。

该平台会检查计划运行并在 10 分钟内启用 [cron jobs](/langsmith/cron-jobs)，以提前开始缩减部署。这可以减少冷启动延迟，但不能保证准备就绪。默认情况下，启动期间的请求最多等待 60 秒，然后超时。

副本不会横向扩展。它的队列工作程序默认处理最多 10 个并发运行，可通过 [⟦T11⟧](/langsmith/env-var-cloud#n_jobs_per_worker) 进行配置；额外的运行队列。

> [!注意]
>
> 缩放至零位于 [beta](/langsmith/release-stages) 中，最初仅适用于基于使用情况定价的部署。有关定价和过渡时间表，请参阅[Manage billing](/langsmith/billing#langsmith-deployment-billing)。

＃＃＃ 投入的专用部署保持在[autoscales](#scaling)单独的API服务器和队列工作副本上。每个都有自己的数据库，具有自动备份、时间点恢复和高可用性。它适合需要始终在线容量的延迟敏感型工作负载。

专用部署按运行时计算和数据库容量单独计费，包括空闲时。自动缩放会更改运行时费用，而不是数据库费用。有关费率和示例，请参阅[LangSmith Deployment billing](/langsmith/billing#langsmith-deployment-billing)。

要请求更多资源，[contact support](https://support.langchain.com)。增加取决于您的使用案例和可用容量。

## 尺寸

这些表显示了 GCP 中LangSmith 云上的计费计算请求的 vCPU 和内存。 Redis 被排除在外，因为它不按任何部署类型或规模计费；参见[Compute billing](/langsmith/billing#langsmith-deployment-billing)。

无服务器部署运行一个包含 API 服务器和队列工作线程的副本，以及一个单独的 Redis 容器：|集装箱|无服务器 S |无服务器 M |无服务器 L |
| - | - | - | - |
| API服务器| 0.4 个 vCPU/1 GiB | 2 个 vCPU / 2 GiB | 4 个 vCPU/4 GiB |
|队列工作者 | 0.4 个 vCPU/1 GiB | 2 个 vCPU / 2 GiB | 4 个 vCPU/4 GiB |
| **可计费运行时间总计** | **0.8 vCPU / 2 GiB** | **4 个 vCPU/4 GiB** | **8 个 vCPU/8 GiB** |
|数据库|共享、多租户 |共享、多租户 |共享、多租户 |

专用部署运行单独的 API 服务器池和队列工作副本、单个 Redis 容器及其自己的数据库实例：

|集装箱|专用S|专用M|专用L|
| - | - | - | - |
| API 服务器，每个副本 | 1 个 vCPU / 2 GiB | 2 个 vCPU / 4 GiB | 4 个 vCPU / 8 GiB |
| API 服务器副本 | 2 至 10 | 2 至 20 | 2 至 40 |
|每个副本的队列工作线程 | 1 个 vCPU / 2 GiB | 2 个 vCPU / 4 GiB | 4 个 vCPU / 8 GiB |
|队列工作副本 | 1 到 10 | 1 至 20 | 1 至 40 |
| **最低计费总运行时间** | **3 个 vCPU/6 GiB** | **6 个 vCPU/12 GiB** | **12 个 vCPU/24 GiB** |
|数据库实例 | 1 个 vCPU / 4 GiB | 2 个 vCPU / 8 GiB | 4 个 vCPU/16 GiB |
|数据库存储 |自动缩放磁盘 |自动缩放磁盘|自动缩放磁盘|最低计费运行时总数包括 2 个 API 服务器副本和 1 个队列工作线程。数据库容量单独计费，不包含在这些总计中。 [Autoscaling](#scaling) 按列出的每个副本大小添加运行时副本。

在专用部署中，计算大小和数据库大小可以独立于**缩放**对话框进行设置。大小更改将作为新修订版推出，并保留部署的线程、检查点和 API URL。

有关每种尺寸的价格，请参阅[pricing page](https://www.langchain.com/pricing)，其中包含部署成本计算器。有关无服务器和专用部署的计费方式，请参阅[Manage billing](/langsmith/billing#langsmith-deployment-billing)。

### 在一个部署上运行多个代理

部署是[billed on the resources they consume](/langsmith/billing#langsmith-deployment-billing)，而不是他们所服务的代理数量。要在一个部署的资源上运行多个代理，请在一个 `langgraph.json` 中运行[define multiple graphs](/langsmith/application-structure#define-multiple-graphs-in-one-deployment)。这对于专用来说效果很好：一个拥有自己数据库的始终在线实例可以托管多个生产代理。

部署中的所有图表共享其计算、数据库、自动缩放和部署类型。它们也作为一个修订版一起发布。当代理需要不同的大小、延迟配置文件或与其他代理隔离时，为代理提供自己的部署。

## 数据库配置控制平面和 [data plane](/langsmith/data-plane) 侦听器应用程序协调起来，为每个云部署自动创建一个 Postgres 数据库。该数据库充当部署的[persistence layer](/oss/python/langgraph/persistence#memory-store)。

实现LangGraph应用时，不需要配置[checkpointer](/oss/python/langgraph/persistence#checkpointer-libraries)。会自动为图表配置检查点。为图表配置的任何检查点都将替换为自动配置的检查点。

无法直接访问数据库。对数据库的所有访问都通过[Agent Server](/langsmith/agent-server) 进行。

在删除部署本身之前，数据库永远不会被删除。

对于自托管部署，请参阅[custom PostgreSQL configuration](/langsmith/self-hosted-platform-features#custom-postgresql)。

## 缩放

云部署自动扩展。您不直接配置队列工作线程、副本或池大小。

[Serverless](#serverless) 在零到一个副本之间缩放。

专用部署添加和删除最多[maximum for its size](#sizes)的副本。 [API servers](/langsmith/agent-server#runtime-architecture) 和 [queue workers](/langsmith/agent-server#runtime-architecture) 是独立扩展的独立池，因此读取流量不会减慢运行提交速度，反之亦然：* **API 服务器** 在 CPU 上扩展。目标是 CPU 限制的 50%，这是 [sizes table](#sizes) 中请求的 vCPU 的两倍。最少有 2 个副本。
* **队列工作线程** 根据 CPU 或运行积压进行扩展，以需要更多副本的为准。 CPU 目标是相同的。待办事项目标按 [⟦T13⟧](/langsmith/env-var-cloud#n_jobs_per_worker) 的 75% 计算待处理和正在运行的运行（向下舍入）。默认值为 10，目标是每个副本 7 次运行； 30 次运行需要 5 名工人。最小值为 1 个副本。

内存不会触发缩放。 Redis 和数据库计算不会自动缩放。为了避免快速的扩展变化，缩减会等待 15 分钟，然后每 2 分钟删除最多 10% 的副本（至少一个）。它在修订版推出期间暂停。副本保持[billable](/langsmith/billing#langsmith-deployment-billing)，直到缩小规模。

自动缩放会更改副本数量，但每个副本可用的 CPU 和内存由部署的 [size](#sizes) 固定。如果部署面临持续的 CPU 压力，或其容器内存不足，请将其升级到更大的大小。尺寸更改会作为新版本推出，无需停机；部署类型无法更改。应用程序级扩展杠杆（持久性模式、异步模式、避免同步阻塞、使用`/join`而不是轮询）适用于云，与自托管相同。基本概念参见[Scaling on self-hosted](/langsmith/agent-server-scale)；其中的 Helm 和资源配置不适用于 Cloud。

## 后续步骤

* [Create a deployment](/langsmith/deploy-to-cloud)：从 GitHub 存储库或使用 `langgraph deploy` CLI 进行部署。
* [Manage billing](/langsmith/billing#langsmith-deployment-billing)：查看部署计算和数据库如何计费。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud-platform-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。