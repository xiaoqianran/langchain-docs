<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: SmithDB architecture | https://docs.langchain.com/langsmith/self-host-smithdb-architecture -->

# SmithDB架构

SmithDB 和 LangSmith 组件如何在自托管 LangSmith 上相互依赖。

SmithDB 是LangSmith 的跟踪数据存储。 LangSmith 服务接收运行和反馈，并为 UI 和 API 提供服务。他们不直接写入 SmithDB。他们将新数据放入 Redis 的队列中，然后摄取队列工作程序将其写入 SmithDB。读取直接进入 SmithDB。 SmithDB 将所有数据保存在对象存储和它自己的 PostgreSQL 数据库（元存储）中。它的 Pod 仅保存数据副本和正在进行的工作。在后台，压缩将小数据文件合并为较大的文件，将反馈写入文件，并删除过期和已删除的数据，以便查询保持快速。

有关 SmithDB 如何写入、读取、更改和压缩数据，请参阅[How SmithDB handles data](/langsmith/self-host-smithdb-data-paths)。

![LangSmith services and SmithDB services, the dependencies between them, and their storage.](https://mintcdn.com/langchain-5e9cc07a/Dyw7UArGNhicMzqy/images/langsmith/smithdb/overview.svg?fit=max\&auto=format\&n=Dyw7UArGNhicMzqy\&q=85\&s=b11fd4d1b36658641bc9049251a6d0a2)

## 组件|组件|描述 |
| - | - |
|前端 |服务于LangSmith UI。 |
|后端 |为大部分LangSmith API 提供服务。 |
|平台后台|接收来自客户端的运行和反馈并将其排队等待写入。向 SmithDB 发送跟踪查询。 |
|队列|运行自动化规则，包括在线评估。 |
|摄取队列 |将排队运行、反馈和删除写入 SmithDB。 |
| SmithDB 集群管理器 |决定哪个 SmithDB pod 处理哪些请求，以便相关请求转到同一个 pod。 |
| SmithDB 查询 |回答查询、应用反馈和删除。可选的 [query pools](#query-pools) 可以减轻主查询 Pod 的繁重工作，从而使 UI 和 API 读取保持快速。 |
| SmithDB 摄取 |存储新的运行和运行更新。 |
| SmithDB 压缩调度程序 |计划压缩工作，包括删除过期数据。 |
| SmithDB 压实工 |运行压缩作业：合并并重写对象存储中的数据。 |
| SmithDB 元存储迁移 |在安装和升级期间准备元存储。 |
| SmithDB 迁移 |从 ClickHouse 复制历史数据。选修的。 |
| SmithDB 元存储 |保留每个 SmithDB 数据文件的记录，并存储新的反馈。 ||对象存储 |保存所有 SmithDB 数据文件。 |
| Redis、PostgreSQL | LangSmith 数据存储。 |

## 查询池

默认情况下，一个 SmithDB 查询池 `query` 负责所有查询工作。对于大型部署，启用[dedicated query services](/langsmith/self-host-smithdb-scale#dedicated-query-services)。每一个都从 `query` 池中带走一种类型的工作，因此重负载不会减慢 UI 和 API 读取速度。

|泳池|工作|请求来自 |
| - | - | - |
| `query` |跟踪读取 UI 和 API，例如运行列表和跟踪视图。未启用的可选池的所有工作。 |平台后台|
| `stats-query` |运行统计数据，例如项目和实验视图中的运行计数、延迟和错误率。选修的。 |平台后台|
| `run-rules` |查找自动化规则和在线评估适用的运行。队列组件自行运行规则和评估。选修的。 |队列|
| `mutations` |应用反馈并删除。选修的。 |摄取队列 |

## 条款|术语 |意义|
| - | - |
|运行|跟踪的一个步骤，例如 LLM 调用或工具调用。 |
|反馈 |来自用户、评估者或自动化规则的对运行的分数或评论。 |
|任务| Redis 队列中的一个工作单元，例如一批运行或反馈。每个摄取队列工作 Pod 同时处理多个任务。 |
|摄取队列、反馈队列 |摄取队列工作进程处理的 Redis 队列。摄取队列保存运行。反馈队列保存反馈。 |
|细分 |对象存储中的一个数据文件及其在元存储中的行。 SmithDB 在写入段后绝不会更改该段。 |
|元存储 | SmithDB 的 PostgreSQL 数据库。它保留每个细分的记录，并存储新的反馈。 |
|磁盘缓存| SmithDB Pod 的缓存卷，位于本地 SSD 或网络磁盘上。它仅保存数据的副本，而不是唯一的副本。 |
|查询池 |针对一种类型的请求的一组 SmithDB 查询 pod。参见[Query pools](#query-pools)。 |
|压实|将小段合并为大段、将反馈写入文件以及删除过期和已删除的数据的后台工作。 ||切片 |集群管理器提供给 SmithDB pod 的密钥空间范围。对于摄取来说，关键是租户和项目。对于查询，关键是租户。 |

## 另请参阅

* [How SmithDB handles data](/langsmith/self-host-smithdb-data-paths)
* [Enable SmithDB on self-hosted LangSmith](/langsmith/self-host-smithdb)
* [Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)
* [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)
* [Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。