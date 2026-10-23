<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-gcp-troubleshooting -->

# GCP Terraform 故障排除

在使用 LangChain Terraform 模块部署的 GKE 上自托管的 LangSmith 的常见问题、修复和诊断命令。

本页面记录了使用 [GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

> [!提示]
>
> 升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 以了解重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前运行 `gcloud container clusters get-credentials <cluster-name> --region <region> --project <project-id>`。

有关本页中使用的 `kubectl`、`helm` 和 `gcloud` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 自动诊断

在运行单独的命令之前，请尝试捆绑的脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Full deployment health check + next-step guidance
make status

# Check that all required secrets exist in Secret Manager
./infra/scripts/manage-secrets.sh validate

# Interactive Secret Manager tool (list, get, set, validate, delete)
make secrets
```

## 已知问题

### terraform 应用失败：GCP API 未启用

**症状**

```
Error 403: ... has not been used in project <project-id> before or it is disabled.
```

**原因：** 未启用所需的 GCP API。 Terraform 通过 `google_project_service` 启用它们，但必须先启用 `cloudresourcemanager.googleapis.com`，Terraform 才能启用其他功能。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud services enable cloudresourcemanager.googleapis.com --project <project-id>
cd modules/gcp/infra
terraform apply
```

### 应用后无法访问 GKE 集群 API 服务器

**症状**

```
Error: Get "https://<cluster-endpoint>/api/v1/namespaces": dial tcp: connection refused
```

**原因：** GKE 控制平面需要 10 到 15 分钟才能完全运行。 Terraform 等待 `RUNNING` 然后添加 90 秒的缓冲区。缓慢项目上的冷启动 API 激活可能会超出窗口。

**修复：** 等待`RUNNING`，然后重新运行：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud container clusters describe <cluster-name> \
  --region <region> --project <project-id> --format="value(status)"

terraform apply
```

### GKE 节点未加入（NotReady）

**症状：** `kubectl get nodes` 显示没有节点或节点卡在 `NotReady` 中。

**原因：** 节点池服务帐户缺少 `roles/container.nodeServiceAccount`，或 VPC 防火墙规则阻止节点到控制平面的通信。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud container node-pools describe <pool-name> \
  --cluster <cluster-name> --region <region> \
  --format="value(config.serviceAccount)"

gcloud projects add-iam-policy-binding <project-id> \
  --member="serviceAccount:<node-sa-email>" \
  --role="roles/container.nodeServiceAccount"

gcloud compute firewall-rules list --filter="network:<vpc-name>"
```

### GKE Pod 拒绝 Cloud SQL 连接

**症状：** 后端日志显示 Cloud SQL 私有 IP 的 `connection refused` 或 `no route to host`。

**原因：** 私有服务连接（VPC对等）未建立，或分配的IP范围太小。经常发生在网络模块运行之前未启用`servicenetworking.googleapis.com`时。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud services vpc-peerings list --network <vpc-name> --project <project-id>
gcloud sql instances describe <instance-name> --format="value(ipAddresses)"
gcloud compute networks peerings list --network <vpc-name>
```

当 `postgres_source = "external"`、`redis_source = "external"`、`enable_sandboxes = true` 或 SmithDB 创建自己的元存储时，Terraform 会创建私有服务连接。如果对等互连丢失，请确认这些设置之一位于 `terraform.tfvars` 中并重新应用：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -target=module.networking
terraform apply
```

### Memorystore Redis 连接超时

**症状：** Pod 无法连接到 Redis。日志显示 `dial tcp: connection timed out` 或 `redis: connection refused`。

**原因：** Memorystore `authorized_network` 与 GKE VPC 不匹配，或者 Redis 私有 IP 位于无法从 GKE 子网路由的范围内。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud redis instances describe <instance-name> --region <region> \
  --format="value(host,authorizedNetwork)"

kubectl run redis-test --rm -it --image=redis:7 -n langsmith -- \
  redis-cli -h <redis-private-ip> ping
# Expected: PONG
```

### cert-manager 无法颁发 Let's Encrypt 证书

**症状：** `kubectl get certificate -n langsmith` 显示`READY=False`。 HTTP01 挑战失败。**原因：** DNS A 记录未指向 Envoy 网关 IP，或者端口 80 在负载均衡器上被阻止。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get gateway -n envoy-gateway-system \
  -o jsonpath='{.items[0].status.addresses[0].value}'

kubectl describe certificate <cert-name> -n langsmith
kubectl get challenges -n langsmith
kubectl describe challenge -n langsmith

dig +short <your-langsmith-domain>
```

DNS A 记录必须解析为网关 IP，然后才能颁发证书。 cert-manager 的 HTTP01 求解器需要端口 80 才能从互联网访问。

### GCS 存储桶访问被 LangSmith pod 拒绝

**症状：** 写入 GCS 时后端日志显示 `AccessDeniedException: 403 Insufficient Permission` 或 `403 Forbidden`。

**原因：** 在原生 GCS 模式（出厂默认）下，通过 Workload Identity 绑定的 GCP 服务帐户在存储桶上缺少 `roles/storage.objectAdmin`，或者 pod 的 Kubernetes ServiceAccount 缺少 `iam.gke.io/gcp-service-account` 注解。在可选的 S3 兼容模式下，传递给 Helm 的 HMAC 凭据不正确或其服务帐户缺少 `roles/storage.objectAdmin`。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Confirm the bucket and its IAM bindings
helm get values langsmith -n langsmith | grep bucketName
gcloud storage buckets get-iam-policy gs://<bucket-name>

# Native GCS mode: verify the Workload Identity annotation on the pod ServiceAccount
kubectl get serviceaccount langsmith-backend -n langsmith \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}'
```

GCP 服务帐号的存储桶上必须有 `roles/storage.objectAdmin`。如果注释本身丢失，请应用下面的“工作负载身份”部分中的修复。对于 S3 兼容模式，请在 **云存储** > **设置** > **互操作性** 下创建 HMAC 密钥；它的服务帐户还需要存储桶上的`roles/storage.objectAdmin`。

### Envoy Gateway Webhook 阻止 GKE 操作

**症状**

```
Error from server (InternalError): failed calling webhook "validate.gateway.envoyproxy.io"
```**原因：** Envoy Gateway 准入 Webhook 尚未准备好或其 `caBundle` 已过时。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n envoy-gateway-system

kubectl rollout restart deployment/envoy-gateway -n envoy-gateway-system
kubectl rollout status deployment/envoy-gateway -n envoy-gateway-system
```

### Envoy Gateway 重新申请后外部IP发生变化

**症状：** Terraform 重新应用后，DNS 不再解析为正确的 IP，或者现有的防火墙白名单停止工作。

**原因：** Envoy Gateway 外部 IP 与 Terraform 管理的 `Gateway` Kubernetes 资源绑定。如果资源被删除并重新创建（`terraform taint`，强制替换的模块更改，或`terraform destroy` + 重新应用），GCP 会发布新的 IP。如果不预先分配静态区域地址，则无法保留原始 IP。

**预防**

* 不要`terraform taint`或手动删除`Gateway`资源。
* 仅使用`make destroy` + `make apply` 进行完全拆卸和重建。
* 在执行任何可能重新创建网关的操作之前，请记下当前 IP。

**恢复：** 将您的 DNS A 记录更新为新 IP：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get gateway -n envoy-gateway-system -o jsonpath='{.items[0].status.addresses[0].value}'

gcloud dns record-sets update <your-domain>. \
  --type=A --ttl=300 \
  --rrdatas=<new-ip> \
  --zone=<zone-name> \
  --project=<project-id>
```

### terraform 销毁失败：已启用删除保护

**症状**

```
Error: googleapi: Error 409: The instance is protected from deletion.
```

**原因：** `gke_deletion_protection`、`postgres_deletion_protection` 或 `smithdb_metastore_deletion_protection` 是 `true`。 Cloud SQL 在 API 级别以及 Terraform 中强制执行删除保护，因此在应用更改之前，更改 `terraform.tfvars` 不会产生任何影响。

**修复**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# terraform.tfvars
gke_deletion_protection      = false
postgres_deletion_protection = false

# Only when enable_smithdb = true and smithdb_metastore_source = "create"
smithdb_metastore_deletion_protection = false
smithdb_bucket_force_destroy          = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/setup-env.sh

terraform -chdir=infra apply \
  -target=module.gke_cluster -target=module.cloudsql \
  -target=module.smithdb -target=module.networking

make destroy
```如果您从未启用过 SmithDB，请删除 `module.smithdb` 目标。有针对性的应用避免协调完整的`make apply`将重新创建的集群内附加组件。

### Workload Identity 不起作用（GCS 权限被拒绝）

**症状**

```
AccessDeniedException: 403 <pod-sa>@<project>.iam.gserviceaccount.com
  does not have storage.objects.create access to the Google Cloud Storage bucket.
```

**原因：** LangSmith Pod 使用的 Kubernetes ServiceAccount 缺少 Workload Identity 注释，或者 GCP SA 缺少 GCS IAM 绑定。

**诊断**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-backend -n langsmith \
  -o jsonpath='{.metadata.annotations}' | python3 -m json.tool

BUCKET=$(terraform -chdir=infra output -raw storage_bucket_name)
gsutil iam get gs://$BUCKET | grep -A3 "serviceAccount"

GSA=$(terraform -chdir=infra output -raw workload_identity_service_account_email)
gcloud projects get-iam-policy <project-id> \
  --flatten="bindings[].members" --filter="bindings.members:$GSA"
```

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform -chdir=infra apply -target=module.iam
make init-values
make deploy
```

### `langsmith-ksa` 缺少 Workload Identity 注释

**症状：** 操作员生成的代理 Pod 无法启动或卡在 `Pending` 中。日志显示权限错误。

**原因：** Terraform 在 `k8s-bootstrap` 模块中创建 `langsmith-ksa`，并且仅在 `enable_gcp_iam_module = true` 时对其进行注释。 `deploy.sh` 在每次部署后重新应用注释。如果 IAM 模块关闭、命名空间被带外删除或先前的部署被中断，则注释会丢失。

**诊断**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}'
```

**修复**

如果是`enable_gcp_iam_module = false`，则将`terraform.tfvars`中的`true`设置为`true`，然后运行`make apply`。对于其他原因，请重新运行部署或手动注释 ServiceAccount：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Re-run deploy; idempotently creates and annotates langsmith-ksa
make deploy

# Or annotate manually
WI=$(terraform -chdir=infra output -raw workload_identity_annotation)
kubectl create serviceaccount langsmith-ksa -n langsmith --dry-run=client -o yaml \
  | kubectl apply -f -
kubectl annotate serviceaccount langsmith-ksa -n langsmith \
  iam.gke.io/gcp-service-account="$WI" --overwrite
```

### Deploy 拒绝图表 0.16 沙箱值

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ERROR: values-overrides.yaml carries sandboxes.juicefs.csi, the chart 0.16 sandbox schema.
```

**原因：** `values-overrides.yaml` 是为图表 0.16 生成的。图 0.17 没有 JuiceFS CSI 驱动程序，并且忽略了`sandboxes.juicefs.csi` 块。**修复：**运行`make apply`，然后运行`make init-values`重新生成文件，然后运行`make deploy`。

### 部署拒绝，而 JuiceFS CSI 卷仍然存在

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ERROR: namespace langsmith still mounts sandbox volumes through the chart 0.16 JuiceFS CSI driver.
```

**原因：** Chart 0.17 删除了 JuiceFS CSI 驱动程序。在 PersistentVolumeClaims 或挂载 Pod 仍在使用时进行升级，会使旧的沙箱主机 Pod 陷入`Terminating`。

**修复：** 运行 `kubectl delete` 命令，在驱动程序仍在运行时打印错误。等到 `kubectl get pods -n langsmith | grep juicefs` 仅列出 `juicefs-csi-*` Pod，然后再次运行 `make deploy`。正在运行的沙箱停止。他们的数据保留在对象存储和 Redis 中，图 0.17 挂载相同的 JuiceFS 卷。

### 部署拒绝图表 0.16 SmithDB 覆盖

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ERROR: langsmith-values-smithdb.yaml has chart 0.16 SmithDB values that chart 0.17 rejects:
```

**原因：** `init-values.sh` 仅复制 SmithDB 覆盖一次，因此图表 0.16 副本保留在 `helm/values/` 中。它设置 `local-ssd-storage` 音量或 `smithdb.migration.deployment`，图表 0.17 所替换。

**修复：** 保存您的副本并从 0.17 示例开始：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp helm/values/langsmith-values-smithdb.yaml helm/values/langsmith-values-smithdb-0.16.yaml
cp helm/values/examples/langsmith-values-smithdb.yaml helm/values/langsmith-values-smithdb.yaml
```

仅添加回未设置 `nodeSelector`、`tolerations`、`volumes`、`volumeMounts` 或 `resources` 的编辑。生成的 `langsmith-values-smithdb-sizing.yaml` 现在设置这些。

### `init-values.sh` 失败并缺少 SmithDB 输出

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ERROR: enable_smithdb = true but smithdb_helm_values or the resolved metastore TLS
       outputs are missing. The state is older than this module. Run 'make apply'.
```

**原因：** Terraform 状态早于图表 0.17 模块，该模块添加了 SmithDB 大小调整和元存储输出。**Fix:** Run `make apply`, then `make init-values`.

### 部署拒绝，因为 SmithDB 回填作业已更改

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ERROR: the existing <job-name> Job does not match what this deploy renders,
       and a Job's pod template cannot be changed in place:
```

**原因：** 图表升级或大小更改会为回填作业呈现不同的 pod 模板，并且 Kubernetes 不允许更改作业的 pod 模板。

**修复：** 使用错误打印的命令删除作业，然后再次运行`make deploy`。回填将其进度保留在任务数据库中，因此新作业将继续而不是重新开始。

### JuiceFS format Job fails

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
✗ The JuiceFS format Job for release langsmith failed (<reason>).
```

**原因：** `juicefs-format` 作业通过 `langsmith-sandbox-host` Workload Identity 绑定格式化 GCS 存储桶中的沙盒卷。当原因为`DeadlineExceeded`时，作业没有在300秒内完成，通常是因为pod无法调度或镜像拉取速度慢。由于任何其他原因，绑定通常会丢失或过时。

**修复：**

1、查找原因。对于 `DeadlineExceeded`，查找 `FailedScheduling` 事件或缓慢的图像拉取：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl describe job -n langsmith -l app.kubernetes.io/component=juicefs-format
   ```

   出于任何其他原因，请阅读作业日志，然后运行 `make apply` 来恢复 Workload Identity 绑定：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl logs -n langsmith -l app.kubernetes.io/component=juicefs-format
   ```

2. Delete the failed Job and deploy again.当清单未更改时，Helm 不会重新运行失败的作业，因此必须首先删除该作业：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl delete job -n langsmith -l app.kubernetes.io/component=juicefs-format
   make deploy
   ```

### 头盔释放卡在`pending-upgrade`

**症状**

```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

**Cause:** A previous `helm upgrade` was interrupted (Ctrl+C during `--wait`). Helm 将释放锁定。

**Fix:** `deploy.sh` detects and auto-recovers this state. If running manually:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm rollback langsmith -n langsmith --wait --timeout 5m
make deploy
```

### 秘密管理器访问被拒绝

**症状**

```
ERROR: PERMISSION_DENIED: Permission 'secretmanager.versions.access'
  denied on resource 'projects/.../secrets/...'
```

**Cause:** Either `secretmanager.googleapis.com` is not enabled, or the operator account lacks `roles/secretmanager.admin`.

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud services enable secretmanager.googleapis.com --project <project-id>

gcloud projects add-iam-policy-binding <project-id> \
  --member="user:$(gcloud config get account)" \
  --role="roles/secretmanager.admin"
```

您添加的将 Secret Manager 读取为 LangSmith 服务帐户的工作负载在升级到 `main` 或 `v0.17.x` 标签后将失去访问权限，因为项目范围的 `roles/secretmanager.secretAccessor` 授权现已选择加入。 Grant access on the specific secrets, or set `grant_project_secret_accessor = true` and run `make apply`.

### `langsmith-postgres-credentials` 或 `langsmith-redis-credentials` 秘密缺失

**Symptom:** Pods crash with database connection errors immediately after deploy, or `kubectl get secrets -n langsmith` does not list `langsmith-postgres-credentials` / `langsmith-redis-credentials`.

**Cause:** The `k8s-bootstrap` module creates these Secrets when `postgres_source` or `redis_source` is `external`. They are absent if `terraform apply` was not run, failed partway through, or the namespace was deleted out-of-band.

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform -chdir=infra apply -target=module.k8s_bootstrap

kubectl get secret langsmith-postgres-credentials -n langsmith
kubectl get secret langsmith-redis-credentials -n langsmith
```

## 诊断命令

### 集群访问

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud container clusters get-credentials <cluster-name> --region <region> --project <project-id>
kubectl config current-context
kubectl get nodes -o wide
```

### Pod

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=50
kubectl logs <pod-name> -n langsmith --previous --tail=50
kubectl logs -n langsmith deploy/langsmith-backend --tail=100 -f
```

### TLS 和证书

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get certificate -n langsmith
kubectl describe certificate <cert-name> -n langsmith
kubectl get challenges -n langsmith
kubectl get clusterissuer
```

### 网关和负载均衡器

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get gateway -n envoy-gateway-system
kubectl get httproute -n langsmith
kubectl get svc -n envoy-gateway-system -o wide
kubectl get pods -n envoy-gateway-system
```

### 头盔

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm status langsmith -n langsmith
helm history langsmith -n langsmith
helm get values langsmith -n langsmith
```

### LangSmith 部署```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
```

### Workload Identity and IAM

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-backend -n langsmith \
  -o jsonpath='{.metadata.annotations}' | python3 -m json.tool

kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}'

BUCKET=$(terraform -chdir=infra output -raw storage_bucket_name 2>/dev/null)
gsutil iam get gs://$BUCKET

gcloud iam service-accounts list --project <project-id> --filter="displayName:langsmith"
```

### Secrets and bootstrap

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get secrets -n langsmith
kubectl get secret langsmith-postgres-credentials -n langsmith
kubectl get secret langsmith-redis-credentials -n langsmith

kubectl get secret langsmith-postgres-credentials -n langsmith \
  -o jsonpath='{.data.connection_url}' | base64 --decode

gcloud secrets list --project <project-id> --filter="name:langsmith"

gcloud secrets versions access latest \
  --secret=langsmith-<prefix>-<env>-postgres-password \
  --project <project-id>

./infra/scripts/manage-secrets.sh validate
```

### 快速健康检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo "=== Context ===" && kubectl config current-context
echo "=== Nodes ===" && kubectl get nodes
echo "=== Pods ===" && kubectl get pods -n langsmith
echo "=== Certificate ===" && kubectl get certificate -n langsmith
echo "=== Gateway ===" && kubectl get gateway -n envoy-gateway-system
echo "=== Secrets ===" && kubectl get secrets -n langsmith | grep -E "langsmith-postgres-credentials|langsmith-redis-credentials"
echo "=== Helm ===" && helm status langsmith -n langsmith 2>/dev/null | grep -E "STATUS|LAST DEPLOYED"
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-troubleshooting.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).