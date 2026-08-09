<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-gcp-troubleshooting -->

# GCP Terraform 故障排除

在使用 LangChain Terraform 模块部署的 GKE 上自托管的 LangSmith 的常见问题、修复和诊断命令。

本页记录了使用 [GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

<Tip>
  升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 的重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前运行 `gcloud container clusters get-credentials <cluster-name> --region <region> --project <project-id>`。
</Tip>

有关本页中使用的 `kubectl`、`helm` 和 `gcloud` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 自动诊断

在运行单个命令之前，请尝试捆绑的脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Full deployment health check + next-step guidance
make status

# Secret Manager validation
make secrets    # → manage-secrets.sh validate
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
terraform apply -var-file=terraform.tfvars
```

### 应用后无法访问 GKE 集群 API 服务器

**症状**

```
Error: Get "https://<cluster-endpoint>/api/v1/namespaces": dial tcp: connection refused
```

**原因：** GKE 控制平面需要 10 到 15 分钟才能完全运行。 Terraform 等待 `RUNNING` 然后添加 90 秒的缓冲区。缓慢项目上的冷启动 API 激活可能会超出窗口。**修复：** 等待`RUNNING`，然后重新运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud container clusters describe <cluster-name> \
  --region <region> --project <project-id> --format="value(status)"

terraform apply -var-file=terraform.tfvars
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

如果对等互连丢失，请确保`enable_private_service_connection = true`并重新申请：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -var-file=terraform.tfvars -target=module.networking
terraform apply -var-file=terraform.tfvars
```

### Memorystore Redis 连接超时

**症状：** Pod 无法连接到 Redis。日志显示`dial tcp: connection timed out`或`redis: connection refused`。

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

**症状：** `kubectl get certificate -n langsmith` 显示`READY=False`。 HTTP01 挑战失败。

**原因：** DNS A 记录未指向 Envoy 网关 IP，或者端口 80 在负载均衡器上被阻止。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get svc -n envoy-gateway-system \
  -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway \
  -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'

kubectl describe certificate <cert-name> -n langsmith
kubectl get challenges -n langsmith
kubectl describe challenge -n langsmith

dig +short <your-langsmith-domain>
```DNS A 记录必须解析为网关 IP，然后才能颁发证书。 cert-manager 的 HTTP01 求解器需要端口 80 才能从互联网访问。

### LangSmith Pod 拒绝 GCS 存储桶访问

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

GCP 服务帐号的存储桶上必须有 `roles/storage.objectAdmin`。如果注释本身丢失，请应用下面的“工作负载身份”部分中的修复。对于S3兼容模式，在云存储→设置→互操作性下创建HMAC密钥；它的服务帐户还需要存储桶上的`roles/storage.objectAdmin`。

### Envoy Gateway Webhook 阻止 GKE 操作

**症状**

```
Error from server (InternalError): failed calling webhook "validate.gateway.envoyproxy.io"
```

**原因：** Envoy Gateway 准入 Webhook 尚未准备好或其 `caBundle` 已过时。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n envoy-gateway-system

kubectl rollout restart deployment/envoy-gateway -n envoy-gateway-system
kubectl rollout status deployment/envoy-gateway -n envoy-gateway-system
```

### Envoy Gateway 重新申请后外部IP发生变化**症状：** Terraform 重新应用后，DNS 不再解析为正确的 IP，或者现有的防火墙白名单停止工作。

**原因：** Envoy Gateway 外部 IP 与 Terraform 管理的 `Gateway` Kubernetes 资源绑定。如果资源被删除并重新创建（`terraform taint`，强制替换的模块更改，或`terraform destroy` + 重新应用），GCP 会发布新的 IP。如果不预先分配静态区域地址，则无法保留原始 IP。

**预防**

* 不要`terraform taint`或手动删除`Gateway`资源。
* 仅使用 `make destroy` + `make apply` 进行完全拆卸和重建。
* 在执行任何可能重新创建网关的操作之前，请记下当前 IP。

**恢复：** 将您的 DNS A 记录更新为新 IP：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get gateway -n langsmith -o jsonpath='{.items[0].status.addresses[0].value}'

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

**原因：** `gke_deletion_protection = true`（默认）或`postgres_deletion_protection = true` 阻止 Terraform 破坏资源。

**修复**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# terraform.tfvars
gke_deletion_protection      = false
postgres_deletion_protection = false
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -var-file=terraform.tfvars
terraform destroy
```

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
```### `langsmith-ksa` 缺少 Workload Identity 注释

**症状：** 操作员生成的代理 Pod 无法启动或卡在 `Pending` 中。日志显示权限错误或代理引导作业挂起。

**原因：** `langsmith-ksa` 由 LangSmith 操作员（而不是 Helm）创建，并且无法在命名空间拆除或新的集群重建中幸存。 `deploy.sh` 在部署后重新注释它；如果先前的部署被中断，则注释可能会丢失。

**诊断**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}'
```

**修复**

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

### 头盔释放卡在`pending-upgrade`

**症状**

```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

**原因：** 之前的`helm upgrade`被中断（在`--wait`期间按Ctrl+C）。 Helm 将释放锁定。

**修复：** `deploy.sh` 检测并自动恢复此状态。如果手动运行：

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

**原因：** 要么`secretmanager.googleapis.com`未启用，要么操作员账户缺少`roles/secretmanager.admin`。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud services enable secretmanager.googleapis.com --project <project-id>

gcloud projects add-iam-policy-binding <project-id> \
  --member="user:$(gcloud config get account)" \
  --role="roles/secretmanager.admin"
```

### `langsmith-postgres-credentials` 或 `langsmith-redis-credentials` 秘密缺失

**症状：** Pod 在部署后立即崩溃并出现数据库连接错误，或者 `kubectl get secrets -n langsmith` 未列出 `langsmith-postgres-credentials` / `langsmith-redis-credentials`。

**原因：** `k8s-bootstrap` 模块创建了这些 Secret。如果 `terraform apply` 未运行、中途失败或命名空间被带外删除，则它们不存在。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform -chdir=infra apply -target=module.k8s_bootstrap

kubectl get secret langsmith-postgres-credentials -n langsmith
kubectl get secret langsmith-redis-credentials -n langsmith
```

## 诊断命令### 集群访问

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
kubectl get gateway -n langsmith
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

### LangSmith 部署

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
```

### 工作负载身份和 IAM

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-backend -n langsmith \
  -o jsonpath='{.metadata.annotations}' | python3 -m json.tool

kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.iam\.gke\.io/gcp-service-account}'

BUCKET=$(terraform -chdir=infra output -raw storage_bucket_name 2>/dev/null)
gsutil iam get gs://$BUCKET

gcloud iam service-accounts list --project <project-id> --filter="displayName:langsmith"
```

### 秘密和引导程序

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

make secrets
```

### 快速健康检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo "=== Context ===" && kubectl config current-context
echo "=== Nodes ===" && kubectl get nodes
echo "=== Pods ===" && kubectl get pods -n langsmith
echo "=== Certificate ===" && kubectl get certificate -n langsmith
echo "=== Gateway ===" && kubectl get gateway -n langsmith
echo "=== Secrets ===" && kubectl get secrets -n langsmith | grep -E "langsmith-postgres-credentials|langsmith-redis-credentials"
echo "=== Helm ===" && helm status langsmith -n langsmith 2>/dev/null | grep -E "STATUS|LAST DEPLOYED"
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>