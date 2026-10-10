<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Scale self-hosted Sandboxes | https://docs.langchain.com/langsmith/self-host-sandbox-scaling -->

# 扩展自托管沙箱

通过主机自动扩展、Kubernetes 节点扩展、内存空间和共享文件系统缓存来规划自托管沙盒容量。

自托管沙箱可在两层中扩展：LangSmith调整主机部署，节点自动缩放器提供Kubernetes节点。将两个层一起规划，以便新主机在现有池容量耗尽之前准备就绪。

本指南基于 [Sandbox architecture](/langsmith/self-host-sandbox-architecture) 构建。有关特定于云的基础架构设置，请参阅[Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)。

## 了解两个缩放层

内置主机自动缩放器在选定的 `sandbox-host` 上运行。主机通过 Kubernetes 租赁发布其承诺的 vCPU 和沙箱数量。领导者使用该信息来调整部署的副本数量。

<Frame>
  <SandboxDiagram name="autoscaling" />
</Frame>

主机自动缩放程序不使用 HPA、KEDA 或 Prometheus 适配器。不要配置另一个控制器来管理同一部署的副本计数。

新的主机 Pod 需要一个合格的节点，而不需要另一个主机 Pod。当没有可用的时，它会保持`Pending`，直到节点自动缩放器增加容量。为支持 KVM 的专用节点池配置自动缩放程序，包括兼容标签、污点和实例要求。在正常缩减期间，主机自动缩放器保留稳定窗口的最近峰值目标。然后，它会为每个窗口最多删除一台主机。 Pod 删除成本有利于负载较少的主机。删除正在运行的主机[drains its sandboxes](/langsmith/self-host-sandbox-operations#follow-a-host-drain)；这不是一个无干扰的操作。

## 计算主机目标

承诺的 vCPU 是在就绪主机上运行沙箱所请求的 CPU，而不是测量的 CPU 使用率。对于同等大小的主机池，基于负载的目标是：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
desired hosts = ceil(committed vCPU / (host vCPU × target fraction)) + headroom hosts
```

自动定标器将结果限制为 `minReplicas` 和 `maxReplicas`。如果没有主机容量信号，则从最小值开始。使用同构池：计算假设每个主机的 CPU 容量相同。

例如，对于 16 个 vCPU 主机、70% 目标和一台余量主机：

* **每主机目标**：`16 × 0.70 = 11.2` 已提交的 vCPU。
* **工作负载**：60 个沙箱请求 0.5 个 vCPU，每个沙箱提交 30 个 vCPU。
* **池目标**：`ceil(30 / 11.2) + 1 = 4` 主机，受配置的限制限制。

70% 目标不是每个主机的容量限制。当池扩展或达到最大值时，放置位置可能会超过它。

### 爆发计划副本目标可以在节点和主机准备就绪之前上升。动态余量可以弥补部分延迟；它不会使节点配置即时进行。

<Frame>
  <SandboxDiagram name="scaling-behavior" />
</Frame>

为节点启动时需要吸收的突发选择`minReplicas`和`headroomHosts`。为池保留至少两台主机，这些主机必须在一台主机推出期间继续接受工作。测量代表性负载下的节点启动、主机就绪情况和沙箱创建延迟。

如果池达到最大值，请调查需求和基础设施限制，而不是假设利用率目标可以防止过载。如果没有准备好的主机，创建沙箱的请求就会失败。客户端需要针对瞬时容量故障进行有限的重试和退避。

## 配置主机自动缩放器

下面的 Helm 值位于 `sandboxes.sandboxHost.autoscaling` 下。检查您的图表版本附带的值；现有覆盖可以更改有效设置。|价值|图表默认 |运营指导|
| - | - | - |
| `enabled` | `false` |当您的节点池可以随主机自动扩展时启用主机自动扩展。 |
| `minReplicas` | `1` |至少使用 `2` 以避免在正常部署期间出现零就绪主机。 |
| `maxReplicas` | `10` |与合格的节点容量和基础设施配额保持一致。 |
| `targetUtilizationPercent` | `70` |较低的值会留下更多的 CPU 空间。这衡量的是承诺，而不是实际使用情况。 |
| `headroomHosts` | `1` |将备用容量添加到基于负载的目标之上。 |
| `scaleDownStabilizationSeconds` | `300` |增加以减少短期需求下降期间的重复消耗。 |

启用自动缩放后，图表将部署的副本计数留给主机自动缩放程序。否则，`sandboxes.sandboxHost.deployment.replicas` 设置固定的主机计数。

以 `sandbox-host.smith.langchain.com/autoscale-` 为前缀的部署注释可以覆盖基线设置，而无需重新启动主机。当 Helm 值和观察到的缩放比例不一致时，检查现有覆盖。更喜欢耐用的 Helm 配置以实现正常操作。

对齐三个单独的限制：1. 设置峰值工作负载的主机副本最大值。
2. 允许节点池和基础设施配额提供足够数量的合格节点。
3. 为预期的并发 CPU、内存和沙箱计数设置工作区沙箱配额。

工作空间配额控制用户可以请求的内容。它们不提供节点或保证物理容量。

## 调整 CPU 和内存的大小

以下示例将相同的 70% 目标和一台净空主机应用于 500 个正在运行的沙箱。它显示了`maxReplicas`钳制之前基于CPU的目标，而不是性能保证。

|每个沙箱的 vCPU |已提交的 vCPU 总数 | 16-vCPU 主机 | 32-vCPU 主机 | 64-vCPU 主机 |
| - | - | - | - | - |
| 0.5 | 0.5 250 | 250 24 | 13 | 7 |
| 1 | 500 | 500 46 | 46 24 | 13 |
| 2 | 1,000 | 91 | 91 46 | 46 24 |

单独检查内存。例如，500 个配置了 2 GiB 的沙箱，每个沙箱请求 1,000 GiB 的来宾内存（不包括主机和文件系统开销）。

<Warning>
  主机自动缩放使用已提交的 CPU，而不是内存压力。 CPU 大小的池仍然可能会耗尽内存。来宾内存、主机守护进程、JuiceFS、缓存和 Kubernetes 开销的预算。
</Warning>主机 Pod 的内存请求必须反映其包含的工作负载。仅对守护进程的一个小请求不会为其 microVM 保留内存。对照节点可分配内存和测量的峰值使用情况查看`sandboxes.sandboxHost.deployment.resources`。

## 平衡节点大小和缓存容量

更大的节点让更多的沙箱共享本地 JuiceFS 缓存并分摊主机开销。但是，每个主机故障或耗尽都会影响更多沙箱，并且可能需要更长的时间来保存内存。

根据这些约束选择节点：

* **虚拟化**：在支持的 Linux 节点配置上公开 `/dev/kvm`。
* **CPU 兼容性**：在整个池中保持一致的 CPU 模型。参见[Plan machine changes](/langsmith/self-host-sandbox-operations#plan-machine-changes)。
* **内存**：为主机和文件系统开销留下容量，而不仅仅是请求的来宾内存。
* **本地存储**：为工作集提供缓存空间并监控磁盘压力。
* **故障影响**：保留足够的主机和备用容量，以承受丢失或耗尽主机的情况。

对于主机拥有的 JuiceFS 挂载，`sandboxes.juicefs.hostMount.cacheDirs` 选择节点本地缓存路径。 `sandboxes.juicefs.hostMount.mountOptions` 控制缓存选项。该图表的默认缓存预算是跨配置目录的 50 GiB；安装更大的磁盘不会自动增加预算。缓存可以在同一节点上更换 Pod 后继续存在，但在更换该节点后却无法继续存在。将缓存预热视为容量测试的一部分，而不是持久存储恢复。

## 另请参阅

* [Sandbox architecture and lifecycle](/langsmith/self-host-sandbox-architecture)
* [Upgrade and operate Sandboxes](/langsmith/self-host-sandbox-operations)
* [Configure self-hosted resource usage](/langsmith/self-host-usage)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sandbox-scaling.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>