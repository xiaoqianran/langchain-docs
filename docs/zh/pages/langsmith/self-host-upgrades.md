<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upgrade an installation | https://docs.langchain.com/langsmith/self-host-upgrades -->

# 升级安装

> [!警告]
>
> 官方不支持降级。 LangSmith 升级可能包括数据库迁移和其他不向后兼容的更改。如果您需要回滚到之前的版本，请通过[Support Portal](https://support.langchain.com)联系技术支持以获取指导。

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

> [!注意]
>
> 如果您使用的命名空间不是默认命名空间，则需要使用 `-n <namespace` 标志在 `helm` 和 `kubectl` 命令中指定命名空间。

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

选择您要升级到的版本（一般建议使用最新版本）并记下版本号：> [!注意]
>
> 如果您的安装有多个主要版本落后于最新图表，请一次升级一个主要版本。不要跳过主要版本。在升级到最新支持的版本之前，对每个中间主要版本重复此升级过程。
>
> 例如，要从0.15升级到0.17，请先升级到最新的0.16图表，然后再升级到最新的0.17图表。

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

   ![LangSmith UI](https://mintcdn.com/langchain-5e9cc07a/4kN8yiLrZX_amfFn/langsmith/images/langsmith-ui.png?fit=max\&auto=format\&n=4kN8yiLrZX_amfFn\&q=85\&s=5310f686e7b9eebaaee4fe2a152a8675)

## 升级单独的沙箱集群

当沙箱在 [separate cluster](/langsmith/self-host-sandbox-separate-cluster) 中运行时，每次升级都会涉及两个 Helm 版本：LangSmith 集群中的 `langsmith` 和沙箱集群中的 `langsmith-sandbox`。将两者保留在同一 LangSmith 版本上：* **订单**：先升级`langsmith`，然后在几天内升级`langsmith-sandbox`。不要在比控制平面更新的版本上运行沙箱主机，除非运行时升级推出。如果版本的发行说明给出了不同的顺序，请遵循它们。 LangSmith [warns in the UI](/langsmith/self-host-sandbox-separate-cluster#watch-for-a-release-mismatch) 当运行时间落后超过 72 小时或超前运行超过 30 分钟时。
* **版本**：使用最新的 `langsmith-sandbox` 图表，其 appVersion 等于您的 `langsmith` 图表的 appVersion。这两个图表按应用程序版本配对，而不是按图表版本配对。参见[Release policy](/langsmith/release-versions#pair-the-sandbox-runtime-chart)。
* **固定**：将两个版本固定到确切的图表版本。切勿使用版本范围。

要查找与您的 `langsmith` 版本匹配的运行时图表版本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo update
APP=$(helm get metadata langsmith --kube-context <langsmith-context> -n <langsmith-namespace> -o json | jq -r .appVersion)
helm search repo langchain/langsmith-sandbox --versions --devel -o json \
  | jq -r --arg a "$APP" '[.[] | select(.name == "langchain/langsmith-sandbox" and .app_version == $a)][0].version // error("no langsmith-sandbox chart for appVersion \($a)")'
```

每次主机升级都会一次重新启动一台主机，并且每次重新启动都会暂停该主机上运行的沙箱。参见[Understand a rolling upgrade](/langsmith/self-host-sandbox-operations#understand-a-rolling-upgrade)。

### 使用 Helm CLI 升级

运行两个命令，每个命令针对自己的集群，首先运行 `langsmith`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade langsmith langchain/langsmith \
  --kube-context <langsmith-context> \
  --namespace <langsmith-namespace> \
  --version <langsmith-chart-version> \
  --values langsmith_config.yaml \
  --wait

helm upgrade langsmith-sandbox langchain/langsmith-sandbox \
  --kube-context <sandbox-context> \
  --namespace langsmith-sandbox \
  --version <matching-sandbox-chart-version> \
  --values langsmith_sandbox_config.yaml \
  --wait \
  --timeout <timeout>
```* **运行时无自动回滚**：不要将 `--atomic` 或 `--rollback-on-failure` 传递给 `langsmith-sandbox` 升级。主机一次耗尽一台主机，因此缓慢的推出可能会超过 `--wait` 超时而不会失败，并且回滚会再次重新启动每台主机。
* **超时**：将`--timeout`设置为大约主机数量乘以`sandboxHost.deployment.terminationGracePeriodSeconds`（默认为300秒），加上主机启动所需的时间。要跟踪部署，请以类似的超时运行 `kubectl rollout status`。
* **重用值**：如果您重用以前版本的值，请优先选择 `--reset-then-reuse-values` 而不是 `--reuse-values`。 `--reuse-values` 保留之前图表的默认设置，包括其图像标签。

### 使用 Argo CD 或 Flux 升级

* **两项更改**：在一项 Git 更改中增加 `langsmith`。同步成功且应用程序运行正常后（Flux：HelmRelease 为 `Ready`），在第二次更改中将 `langsmith-sandbox` 提升到完全匹配的版本。
* **无合并更改**：一项更改会同时影响两个图表同步它们。如果 `langsmith` 升级随后被阻止（例如，由于预升级挂钩失败），主机将在控制平面之前运行，直到它通过。
* **无浮动版本**：切勿让运行时图表浮动。不要在 Flux HelmRelease 中使用范围、`*` 或 `*-0`，也不要省略 `version`。### 使用您自己的基础设施即代码进行升级

将两个图表建模为具有显式依赖关系的两个 Helm 版本，例如 Terraform 中的 `depends_on`，因此 `langsmith` 在 `langsmith-sandbox` 之前应用。将两者固定到精确的图表版本。

### 检查升级情况

两次升级后：

1. 检查两个版本是否报告相同的`APP VERSION`。 Argo CD 不会更新 Helm 发布记录，因此请跳过此步骤；步骤 3 检查同样的事情：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   helm list --kube-context <langsmith-context> -n <langsmith-namespace> --filter '^langsmith$'
   helm list --kube-context <sandbox-context> -n langsmith-sandbox --filter '^langsmith-sandbox$'
   ```

2. 检查 `platform-backend` 和 `sandbox-host` 部署是否已完成：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl --context <langsmith-context> -n <langsmith-namespace> rollout status deployment/langsmith-platform-backend
   kubectl --context <sandbox-context> -n langsmith-sandbox rollout status deployment/langsmith-sandbox-sandbox-host --timeout=<timeout>
   ```

3. 检查每个集群运行的镜像标签是否与 `APP VERSION` 匹配：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl --context <langsmith-context> -n <langsmith-namespace> get deployment langsmith-platform-backend \
     -o jsonpath='{.spec.template.spec.containers[?(@.name=="platform-backend")].image}{"\n"}'
   kubectl --context <sandbox-context> -n langsmith-sandbox get deployment langsmith-sandbox-sandbox-host \
     -o jsonpath='{.spec.template.spec.containers[?(@.name=="sandbox-host")].image}{"\n"}'
   ```

这些命令假定版本名称为 `langsmith` 和 `langsmith-sandbox`。

### 回滚运行时

仅回滚 `langsmith-sandbox` 版本，使用 `helm rollback` 或恢复其 Git 更改。不要回滚 `langsmith` 版本：它的数据库迁移只会向前移动，因此请改为向前修复。主机回滚会重新启动每个主机，就像升级一样。它并不总是安全的：如果较新的主机已经以较旧的主机无法读取的格式写入沙箱数据，则前滚。如果您不确定，请在回滚主机之前联系支持人员。

### 更改拓扑或卸载* **从嵌入式运行时移动**：首先在 `langsmith` 版本上设置 `sandboxes.external.enabled: true`，然后针对相同的 JuiceFS 元数据存储和存储桶安装 `langsmith-sandbox`。参见[Move an existing installation to a separate cluster](/langsmith/self-host-sandbox-separate-cluster#move-an-existing-installation-to-a-separate-cluster)。
* **卸载**：先卸载`langsmith-sandbox`，然后卸载或重新配置`langsmith`。参见[Uninstall](/langsmith/self-host-sandbox-separate-cluster#uninstall)。

## 从 v16 升级到 v17

Chart v17 更改了 SmithDB、沙箱和引擎的值。在运行 `helm upgrade` 之前更新您的值文件。 Chart v17 无法渲染下面的 SmithDB、沙箱和引擎值，除非您更改它们。如果使用 Terraform 模块进行部署，请按照 [AWS](/langsmith/self-host-terraform-aws-deploy#upgrade-from-chart-v16-to-v17)、[GCP](/langsmith/self-host-terraform-gcp-deploy) 或 [Azure](/langsmith/self-host-terraform-azure-deploy) 部署指南中的升级步骤进行操作，这些步骤会将这些更改应用到模块的值文件。

> [!警告]
>
> 不支持从图表 v17 降级到 v16。升级前备份数据库。* **SmithDB**：将`smithdb.migration.deployment`移动到`smithdb.migration.job`。使用 `smithdb.enabled: true`，将平面自动缩放键（`enabled`、`minReplicas`、`maxReplicas` 等）移动到`query`、`ingestion`、`mutations`、`runRules`、`statsQuery` 和`compactionWorker`位于`autoscaling.hpa.*`之下。对于`compactionWorker`，您可以使用`autoscaling.keda.*`代替，但只能启用一个缩放器。缓存卷变化请参见[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。
* **沙箱**：Chart v17 删除了捆绑的 JuiceFS CSI 驱动程序，并且 `sandbox-host` 安装了 JuiceFS 本身。 Chart v17 忽略剩余的 `sandboxes.juicefs.csi` 块，然后其验证失败并显示 `sandboxes.juicefs.redis.metaURL is required when sandboxes.enabled is true and sandboxes.juicefs.existingSecretName is not set.` 移动设置：* `sandboxes.juicefs.csi.existingSecretName` 变为 `sandboxes.juicefs.existingSecretName`。秘密保留着它的钥匙。
  * `sandboxes.juicefs.csi.mountPodPatch`中的缓存选项移至`sandboxes.juicefs.hostMount`。 `cacheDirs` 设置 JuiceFS 缓存的主机路径，默认为 `/var/cache/juicefs`。如果您覆盖它，请至少列出一个绝对路径。在`--flag=value`形式的`mountOptions`中设置其他JuiceFS选项，并且不要在那里设置`--cache-dir`。默认缓存大小从 300 GiB (`cache-size=307200`) 降至 50 GiB (`--cache-size=51200`)。
  * 将 IRSA 或工作负载身份注释从 `sandboxes.juicefs.csi.node.serviceAccount.annotations` 移至 `sandboxes.sandboxHost.serviceAccount.annotations`。在 GKE 上，`sandbox-host` 在主机网络上运行，并且 GKE 不会向主机网络 Pod 提供工作负载身份，因此注释仅服务于 `juicefs-format` 作业。还要在存储桶上授予沙盒节点池的服务帐户`roles/storage.objectAdmin`，受 IAM 条件限制为 JuiceFS 前缀。如果没有该授权，挂载将从 Cloud Storage 获取 403。

  升级之前，请在 CSI 驱动程序仍在运行时清空 JuiceFS 卷。否则，旧的 `sandbox-host` Pod 会保留在 `Terminating` 中。使用默认版本名称：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  kubectl delete -n langsmith deployment.apps/langsmith-sandbox-host
  kubectl delete -n langsmith persistentvolumeclaim/smithbox-juicefs-csi
  kubectl delete -n langsmith persistentvolumeclaim/smithbox-juicefs-csi-host
  kubectl get pods -n langsmith | grep juicefs   # wait until only juicefs-csi-* pods remain
  ```正在运行的沙箱停止。它们的数据保留在对象存储和 Redis 中，因为两个 Chart v16 PersistentVolume 都使用 `Retain` 回收策略。
* **引擎**：启用引擎后，将 `engine.usageSigningSecret` 设置为至少 32 个字符的值（使用 `openssl rand -hex 32` 生成一个值），或者，当您使用 `config.existingSecretName` 时，向该 Secret 添加一个 `engine_usage_signing_secret` 密钥。默认的`engine.intelligenceBaseUrl`更改为`https://beacon.langchain.com/intelligence`，仅记录使用情况。要继续在 LangSmith Intelligence 模型上运行引擎，如图表 v16 所示，请保留 `https://beacon.aws.langchain.com/intelligence` 并在 **设置** > **引擎** > **模型提供商**下选择 LangSmith Intelligence。详情请参见[LangSmith Engine on Self-hosted](/langsmith/engine-self-hosted)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-upgrades.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。