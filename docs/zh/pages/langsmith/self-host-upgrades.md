<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upgrade an installation | https://docs.langchain.com/langsmith/self-host-upgrades -->

# 升级安装

<Warning>
  官方不支持降级。 LangSmith 升级可能包括数据库迁移和其他不向后兼容的更改。如果您需要回滚到之前的版本，请通过[Support Portal](https://support.langchain.com)联系技术支持以获取指导。
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
langchain/langsmith              	0.15.13      	0.15.18    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.15.12      	0.15.17    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.15.11      	0.15.16    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.15.10      	0.15.15    	Helm chart to deploy the langsmith application ...
langchain/langsmith              	0.15.9       	0.15.13    	Helm chart to deploy the langsmith application ...
```

选择您要升级到的版本（一般建议使用最新版本）并记下版本号：<Note>
  如果您的安装有多个主要版本落后于最新图表，请一次升级一个主要版本。不要跳过主要版本。在升级到最新支持的版本之前，对每个中间主要版本重复此升级过程。

  例如，要从`0.13.43`升级到`0.15.13`，请先升级到`0.14.5`，然后再升级到`0.15.13`。
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

3. 在浏览器上访问`langsmith-frontend`服务的外部IP。 LangSmith UI 应该是可见且可操作的。

   <img alt="LangSmith UI" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-upgrades.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>