<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upgrade an installation | https://docs.langchain.com/langsmith/self-host-upgrades -->

# 升级安装

<Warning>
  官方不支持降级。 LangSmith 升级可能包括数据库迁移和其他不向后兼容的更改。如果您需要回退到之前的版本，请通过[Support Portal](https://support.langchain.com)联系技术支持指导。
</Warning>

如果您没有添加存储库，请运行以下命令来添加它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add langchain https://langchain-ai.github.io/helm/
```

更新您的本地 helm 存储库

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo update
```

使用新版本中所需的任何更新来更新您的 Helm Chart 配置文件。这些将在新版本的发行说明中详细说明。

运行以下命令升级图表（将`version`替换为您要升级到的版本）：

<Note>
  如果您使用的命名空间不是默认命名空间，则需要使用 `-n <namespace` 标志在 `helm` 和 `kubectl` 命令中指定命名空间。
</Note>

查找最新版本的图表。您可以在 [LangSmith Helm Chart GitHub repository](https://github.com/langchain-ai/helm/releases) 中找到它或通过运行以下命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm search repo langchain/langsmith --versions
```

您应该看到与此类似的输出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
NAME                             	CHART VERSION	APP VERSION	DESCRIPTION
langchain/langsmith              	0.17.2       	0.17.30    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.17.1       	0.17.30    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.17.0       	0.17.29    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.16.41      	0.16.70    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.16.40      	0.16.70    	Helm chart to deploy the langsmith application ...
```

选择您要升级到的版本（一般建议使用最新版本）并记下版本号：<Note>
  如果您的安装有多个主要版本落后于最新图表，请一次升级一个主要版本。不要跳过主要版本。在升级到最新支持的版本之前，对每个中间主要版本重复此升级过程。

  例如，要从0.15升级到0.17，请先升级到最新的0.16图表，然后再升级到最新的0.17图表。
</Note>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade <release-name> langchain/langsmith --version <version> --values <path-to-values-file> --wait --debug
```

验证升级是否成功：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm status <release-name>
```

所有 Pod 应处于 `Running` 状态。验证 ClickHouse 是否正在运行并且两个 `migrations` 作业均已完成。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods
NAME                                     READY   STATUS      RESTARTS   AGE
langsmith-backend-95b6d54f5-gz48b        1/1     Running     0          15h
langsmith-pg-migrations-d2z6k            0/1     Completed   0          5h48m
langsmith-ch-migrations-gasvk            0/1     Completed   0          5h48m
langsmith-clickhouse-0                   1/1     Running     0          26h
langsmith-frontend-84687d9d45-6cg4r      1/1     Running     0          15h
langsmith-hub-backend-66ffb75fb4-qg6kl   1/1     Running     0          15h
langsmith-playground-85b444d8f7-pl589    1/1     Running     0          15h
langsmith-queue-d58cb64f7-87d68          1/1     Running     0          15h
```

## 验证您的部署

1.运行`kubectl get services`

   输出将类似于：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                      AGE
   kubernetes                   ClusterIP      172.20.0.1       <none>          443/TCP                      27d
   langsmith-backend            ClusterIP      172.20.22.34     <none>          1984/TCP                     21d
   langsmith-clickhouse         ClusterIP      172.20.117.62    <none>          8123/TCP,9000/TCP            21d
   langsmith-frontend           LoadBalancer   172.20.218.30    <external ip>   80:30093/TCP,443:31130/TCP   21d
   langsmith-platform-backend   ClusterIP      172.20.232.183   <none>          1986/TCP                     21d
   langsmith-playground         ClusterIP      172.20.167.132   <none>          3001/TCP                     21d
   langsmith-postgres           ClusterIP      172.20.59.63     <none>          5432/TCP                     21d
   langsmith-redis              ClusterIP      172.20.229.98    <none>          6379/TCP                     20d
   ```

2、curl`langsmith-frontend`服务的外网ip：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl <external ip>/api/info
   {"version":"0.5.7","license_expiration_time":"2033-05-20T20:08:06","batch_ingest_config":{"scale_up_qsize_trigger":1000,"scale_up_nthreads_limit":16,"scale_down_nempty_trigger":4,"size_limit":100,"size_limit_bytes":20971520}}
   ```

   检查版本是否与您升级到的版本匹配。

3. 在浏览器上访问`langsmith-frontend`服务的外部IP。 LangSmith UI 应可见且可操作。

   <img alt="LangSmith UI" />

## 从 v16 升级到 v17Chart v17 更改了 SmithDB、沙箱和引擎的值。在运行 `helm upgrade` 之前更新您的值文件。 Chart v17 无法渲染下面的 SmithDB、沙箱和引擎值，除非您更改它们。如果使用 Terraform 模块进行部署，请按照 [AWS](/langsmith/self-host-terraform-aws-deploy#upgrade-from-chart-v16-to-v17)、[GCP](/langsmith/self-host-terraform-gcp-deploy) 或 [Azure](/langsmith/self-host-terraform-azure-deploy) 部署指南中的升级步骤操作，这些步骤会将这些更改应用到模块的值文件。

<Warning>
  不支持从图表 v17 降级到 v16。升级前备份数据库。
</Warning>

* **SmithDB**：将`smithdb.migration.deployment`移动到`smithdb.migration.job`。使用 `smithdb.enabled: true`，将平面自动缩放键（`enabled`、`minReplicas`、`maxReplicas` 等）移动到 `query`、`ingestion`、`mutations`、`runRules`、`statsQuery` 和`compactionWorker`位于`autoscaling.hpa.*`下。对于`compactionWorker`，您可以使用`autoscaling.keda.*`代替，但仅启用一个缩放器。缓存量变化请参见[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。
* **沙箱**：Chart v17 删除了捆绑的 JuiceFS CSI 驱动程序，并且 `sandbox-host` 安装了 JuiceFS 本身。 Chart v17 忽略剩余的 `sandboxes.juicefs.csi` 块，然后其验证失败并显示 `sandboxes.juicefs.redis.metaURL is required when sandboxes.enabled is true and sandboxes.juicefs.existingSecretName is not set.` 移动设置：* `sandboxes.juicefs.csi.existingSecretName` 变为 `sandboxes.juicefs.existingSecretName`。秘密保留着它的钥匙。
  * `sandboxes.juicefs.csi.mountPodPatch`中的缓存选项移至`sandboxes.juicefs.hostMount`。 `cacheDirs` 设置 JuiceFS 缓存的主机路径，默认为 `/var/cache/juicefs`。如果您覆盖它，请至少列出一个绝对路径。在`--flag=value`形式的`mountOptions`中设置其他JuiceFS选项，并且不要在那里设置`--cache-dir`。默认缓存大小从 300 GiB (`cache-size=307200`) 降至 50 GiB (`--cache-size=51200`)。
  * 将 IRSA 或工作负载身份注释从 `sandboxes.juicefs.csi.node.serviceAccount.annotations` 移至 `sandboxes.sandboxHost.serviceAccount.annotations`。在 GKE 上，`sandbox-host` 在主机网络上运行，并且 GKE 不会向主机网络 Pod 提供工作负载身份，因此注释仅服务于 `juicefs-format` 作业。还要在存储桶上授予沙箱节点池的服务帐户`roles/storage.objectAdmin`，受 IAM 条件限制为 JuiceFS 前缀。如果没有该授权，挂载将从 Cloud Storage 获取 403。

  升级之前，请在 CSI 驱动程序仍在运行时清空 JuiceFS 卷。否则，旧的 `sandbox-host` Pod 仍保留在 `Terminating` 中。使用默认版本名称：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  kubectl delete -n langsmith deployment.apps/langsmith-sandbox-host
  kubectl delete -n langsmith persistentvolumeclaim/smithbox-juicefs-csi
  kubectl delete -n langsmith persistentvolumeclaim/smithbox-juicefs-csi-host
  kubectl get pods -n langsmith | grep juicefs   # wait until only juicefs-csi-* pods remain
  ```正在运行的沙箱停止。它们的数据保留在对象存储和 Redis 中，因为这两个图表 v16 PersistentVolume 都使用 `Retain` 回收策略。
* **Engine**：启用引擎后，将 `engine.usageSigningSecret` 设置为至少 32 个字符的值（使用 `openssl rand -hex 32` 生成一个值），或者，当您使用 `config.existingSecretName` 时，向该 Secret 添加一个 `engine_usage_signing_secret` 密钥。默认的`engine.intelligenceBaseUrl`更改为`https://beacon.langchain.com/intelligence`，仅记录使用情况。要继续在 LangSmith Intelligence 模型上运行引擎，如图表 v16 所示，请保留 `https://beacon.aws.langchain.com/intelligence` 并在 **设置** > **引擎** > **模型提供程序**下选择 LangSmith Intelligence。详情请参见[LangSmith Engine on Self-hosted](/langsmith/engine-self-hosted)。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-upgrades.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>