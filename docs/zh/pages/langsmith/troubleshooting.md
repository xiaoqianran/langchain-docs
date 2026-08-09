<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshooting | https://docs.langchain.com/langsmith/troubleshooting -->

# 故障排除

本指南将引导您解决运行自托管的 LangSmith 实例时可能遇到的常见问题。

运行 LangSmith 时，您可能会遇到意外的 500 错误、性能缓慢或其他问题。本指南将帮助您诊断和解决这些问题。

## 获取有用的信息

要诊断和解决问题，您首先需要检索一些相关信息。以下部分说明如何针对 Kubernetes 或 Docker 设置执行此操作，以及如何提取有用的浏览器信息。

一般来说，您想要分析的主要服务是：

* `langsmith-backend`：处理 CRUD API 请求、业务逻辑、来自前端和 SDK 的请求、摄取的跟踪准备以及集线器 API。
* `langsmith-platform-backend`：处理身份验证、运行摄取和其他大容量任务。
* `langsmith-queue`：处理传入跟踪和反馈、异步摄取和持久化到数据存储中、数据完整性检查以及数据库错误或连接问题期间的重试。

有关这些服务的更多详细信息，请参阅[self-hosted overview](/langsmith/self-hosted)。

#### 库伯内特斯故障排除的第一步是收集有关 LangSmith 部署的重要调试信息。服务日志、kubernetes 事件和容器的资源利用率可以帮助确定问题的根本原因。

您可以运行我们的[k8s troubleshooting script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/get_k8s_debugging_info.sh)，它将提取所有相关的 kubernetes 信息并将其输出到文件夹以进行调查。该脚本还会将此文件夹压缩为 zip 文件以供共享。以下是如何运行此脚本的示例，假设您的 langsmith 部署是在 `langsmith` 命名空间中启动的：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bash get_k8s_debugging_info.sh --namespace langsmith
```

然后，您可以检查生成的文件夹的内容是否有任何相关错误或信息。如果您希望 LangSmith 团队协助调试，请与团队共享此 zip 文件。

#### 码头工人

如果在 Docker 上运行，您可以通过运行以下命令来检查部署日志：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker compose logs >> logs.txt
```

#### 浏览器错误

如果您遇到的问题表现为浏览器错误，检查可能包含关键信息的 HAR 文件也可能会有所帮助。要获取 HAR 文件，您可以按照 [this guide](https://support.langchain.com/articles/9042697994-how-to-generate-a-har-file-for-troubleshooting) 进行操作，它解释了各种浏览器的简短过程。然后您可以使用[Google's HAR analyzer](https://toolbox.googleapps.com/apps/har_analyzer/)进行调查。您还可以将 HAR 文件发送给 LangSmith 团队以帮助调试。

## 常见问题

### *DB::Exception：无法保留 1.00 MiB，空间不足：执行 WaitForAsyncInsert 时。 （空间不够）*

当 ClickHouse 磁盘空间不足时，会出现此错误。您将需要增加 ClickHouse 可用的磁盘空间。

#### 库伯内特斯

在 Kubernetes 中，您需要增加 ClickHouse PVC 的大小。为此，您可以执行以下步骤：

1.获取PVC的存储类别：`kubectl get pvc data-langsmith-clickhouse-0 -n <namespace> -o jsonpath='{.spec.storageClassName}'`

2. 确保存储类别具有AllowVolumeExpansion: true: `kubectl get sc <storage-class-name> -o jsonpath='{.allowVolumeExpansion}'`

   * 如果为 false，则可以更新某些存储类以允许卷扩展。
   * 要更新存储类别，您可以运行`kubectl patch sc <storage-class-name> -p '{"allowVolumeExpansion": true}'`
   * 如果失败，您可能需要使用正确的设置创建新的存储类。

3. 编辑您的 pvc 以具有新尺寸：`kubectl edit pvc data-langsmith-clickhouse-0 -n <namespace>` 或 `kubectl patch pvc data-langsmith-clickhouse-0 '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}' -n <namespace>`

4. 将舵图`langsmith_config.yaml`更新为新尺寸（例如`100 Gi`）

5.删除clickhouse statefulset`kubectl delete statefulset langsmith-clickhouse --cascade=orphan -n <namespace>`

6.应用更新尺寸的helm图表（可以按照[upgrade guide](/langsmith/self-host-upgrades)）

7. 您的 PVC 现在应该具有新的尺寸。通过运行 `kubectl get pvc` 和 `kubectl exec langsmith-clickhouse-0 -- bash -c "df"` 进行验证

#### 码头工人在 Docker 中，您需要增加 ClickHouse 卷的大小。为此，您可以执行以下步骤：

1. 停止您的 LangSmith 实例。 `docker compose down`
2. 如果使用绑定挂载，则需要增加挂载点的大小。
3. 如果使用 docker `volume`，您将需要为卷/docker 分配更多空间。

### *错误：脏数据库版本“版本”。修复并强制版本*

当 ClickHouse 数据库与我们的迁移状态不一致时，就会出现此错误。您将需要重置到较早的数据库版本，然后重新运行升级/迁移。

#### 库伯内特斯

1. 强制迁移到早期版本，其中 version = dirty version - 1。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl exec -it deployments/langsmith-backend -- bash -c 'migrate -source "file://clickhouse/migrations" -database "clickhouse://$CLICKHOUSE_HOST:$CLICKHOUSE_NATIVE_PORT?username=$CLICKHOUSE_USER&password=$CLICKHOUSE_PASSWORD&database=$CLICKHOUSE_DB&x-multi-statement=true&x-migrations-table-engine=MergeTree&secure=$CLICKHOUSE_TLS" force <version>'
```

1. 重新运行升级/迁移。

#### 码头工人

1. 强制迁移到早期版本，其中 version = dirty version - 1。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker compose exec langchain-backend migrate -source "file://clickhouse/migrations" -database "clickhouse://$CLICKHOUSE_HOST:$CLICKHOUSE_NATIVE_PORT?username=$CLICKHOUSE_USER&password=$CLICKHOUSE_PASSWORD&database=$CLICKHOUSE_DB&x-multi-statement=true&x-migrations-table-engine=MergeTree&secure=$CLICKHOUSE_TLS" force <version>
```

1. 重新运行升级/迁移。

### *413 - 请求实体太大*

当请求大小超过允许的最大大小时，会发生此错误。您需要增加 Nginx 配置中的最大请求大小。

#### 库伯内特斯

1.编辑您的`langsmith_config.yaml`并增加`frontend.maxBodySize`[value](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml#L519)。这可能看起来像这样：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
frontend:
  maxBodySize: "100M"
```2. 将更改应用到集群。

### *详细信息：代码：497，消息：默认：权限不足。要执行此查询，需要授予 CREATE ROW POLICY ON default.feedbacks\_rmt*

当您的用户没有在 Clickhouse 中创建行策略的必要权限时，会出现此错误。在部署 Docker 部署时，还需要从 github 存储库复制 `users.xml` 文件。这会将 `<access_management>` 标签添加到 `users.xml` 文件中，从而允许用户创建行策略。下面是我们期望使用的默认 `users.xml` 文件。

```xml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
<clickhouse>
    <users>
        <default>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
            <show_named_collections>1</show_named_collections>
            <show_named_collections_secrets>1</show_named_collections_secrets>
            <profile>default</profile>
        </default>
    </users>
    <profiles>
        <default>
            <async_insert>1</async_insert>
            <async_insert_max_data_size>2000000</async_insert_max_data_size>
            <wait_for_async_insert>0</wait_for_async_insert>
            <parallel_view_processing>1</parallel_view_processing>
            <allow_simdjson>0</allow_simdjson>
            <lightweight_deletes_sync>0</lightweight_deletes_sync>
        </default>
    </profiles>
</clickhouse>
```

在某些环境中，容器可能无法写入您的挂载点。在这些情况下，我们建议构建包含 `users.xml` 文件的自定义映像。

示例`Dockerfile`：

```dockerfile theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
FROM clickhouse/clickhouse-server:24.8
COPY ./users.xml /etc/clickhouse-server/users.d/users.xml
```

然后执行以下步骤：

1. 构建您的自定义镜像。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker build -t <image-name> .
```

2. 更新您的`docker-compose.yaml`以使用自定义镜像。确保删除 users.xml 安装点。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langchain-clickhouse:
  image: <image-name>
```

3. 重新启动 LangSmith 实例。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker compose down --volumes
docker compose up
```

### *使用 AquaSec 运行集群时 ClickHouse 无法启动*在某些环境中，AquaSec 可能会阻止 ClickHouse 正确启动。这可能表现为 ClickHouse Pod 不发出任何日志并且无法标记为就绪。
一般来说，这是由于 AquaSec 设置了`LD_PRELOAD`，从而干扰了 ClickHouse。要解决此问题，您可以将以下环境变量添加到 ClickHouse 部署中：

#### 库伯内特斯

编辑 `langsmith_config.yaml` （或相应的配置文件）并设置 `AQUA_SKIP_LD_PRELOAD` 环境变量：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
clickhouse:
  statefulSet:
    extraEnv:
      - name: AQUA_SKIP_LD_PRELOAD
        value: "true"
```

#### 码头工人

编辑 `docker-compose.yaml` 并设置 `AQUA_SKIP_LD_PRELOAD` 环境变量：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langchain-clickhouse:
  environment:
    - AQUA_SKIP_LD_PRELOAD=true
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>