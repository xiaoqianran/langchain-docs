<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-azure-troubleshooting -->

# Azure Terraform 故障排除

本页面记录了使用 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

<Tip>
升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 的重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前运行 `az aks get-credentials --name <cluster> --resource-group <rg>`。
</Tip>

有关本页中使用的 `kubectl`、`helm` 和 `az` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 基础设施阶段

### `K8sVersionNotSupported`：版本仅限 LTS

**症状**

```
Error: creating Kubernetes Cluster ... unexpected status 400
"code": "K8sVersionNotSupported"
"message": "Managed cluster ... is on version 1.32.x, which is only available for Long-Term Support (LTS).
If you intend to onboard to LTS, please ensure the cluster is in Premium tier ..."
```

**原因：** Azure 定期从标准层支持中淘汰次要版本，并将其移至仅限 LTS。截至 2026 年 4 月，1.32 及以下版本仅在 `eastus` 中支持 LTS。标准层集群必须使用 1.33+。

**修复：** 将`kubernetes_version`更新为支持`KubernetesOfficial`的版本：

```bash
az aks get-versions --location eastus -o table
# Versions with KubernetesOfficial in SupportPlan column work on Standard tier
```

删除或更新 `terraform.tfvars` 中的任何 `kubernetes_version` 引脚，然后删除或更新 `make apply`。 1.32 上的现有集群继续运行；这只会阻止新集群的创建。

### 超出 vCPU 配额

**症状（自动缩放器退避，Pod 待处理）：**

```
Warning  FailedScheduling     pod/langsmith-backend-xxx  0/1 nodes are available: 1 Too many pods.
Normal   NotTriggerScaleUp    pod/langsmith-backend-xxx  pod didn't trigger scale-up: 2 in backoff after failed scale-up
```

**症状（节点池轮换）：**

```
Error: creating temporary Agent Pool ... "code": "ErrCode_InsufficientVCPUQuota",
"message": "Insufficient vcpu quota requested 8, remaining 2 for family standardDSv3Family for region eastus."
```

**原因：** 每个 VM 系列的每个区域 vCPU 配额。 `eastus` 中的`standardDSv3Family` 默认通常为 10 个核心。 1个`Standard_D8s_v3`节点使用8个；只剩下2个了。**为什么 `max_pods = 30` 触发它：** AKS 默认为每个节点 30 个 pod。仅基础 LangSmith 安装就部署了约 37 个 Pod。自动缩放程序尝试添加第二个节点，达到配额，进入退避。修复：`terraform.tfvars` 中的`default_node_pool_max_pods = 60`，以便所有 pod 都适合一个节点。

**多数据平面（3 个数据平面）的建议配额**：32 个核心。

**请求增加配额：**

```bash
# Azure portal usually auto-approves within minutes:
# Portal → Subscriptions → <sub> → Usage + Quotas → search "DSv3" → eastus → Request increase → 32

# Or via CLI
az quota update \
  --resource-name "standardDSv3Family" \
  --scope /subscriptions/<sub-id>/providers/Microsoft.Compute/locations/eastus \
  --limit-object value=32 limit-type=Independent \
  --resource-type dedicated

az vm list-usage --location eastus --query "[?contains(name.value,'DSv3')]" -o table
```

**或者，如果 DSv3 配额耗尽，则切换 VM 系列：** 使用 `Standard_DS4_v2`（基线）+ `Standard_DS5_v2`（大）。相同的 vCPU，略少的 RAM。已验证完整的LangSmith安装以及所有附加组件。

<Note>
`max_pods` 在现有节点池上是不可变的。将其设置在第一个`terraform apply`之前。
</Note>

### 不支持 Istio 插件修订版

**症状：** `terraform apply` 拒绝 Istio 修订版 (`Revision asm-1-XX is not supported`)。 Azure 定期停用旧的 ASM 修订版。

**修复：** 检查当前可用的修订并更新 `istio_addon_revision`：

```bash
az aks mesh get-revisions --location eastus -o table
```

设置`terraform.tfvars`中的值并重新应用。

### Key Vault 清除保护启用后无法禁用

**症状**

```
Error: updating Key Vault "langsmith-kv-dz":
once Purge Protection has been Enabled it's not possible to disable it
```

**原因：** 通过 `terraform destroy` 删除 Key Vault 时，Azure 会对其进行软删除 90 天。下一个同名的`terraform apply`会默默地恢复旧的Key Vault，包括其原始的`purge_protection_enabled = true`。清除保护是单向的（启用 → 无法禁用）。**修复（接受净化保护，测试环境）：**

```hcl
keyvault_purge_protection = true
```

**修复（需要`purge_protection = false`）：**

```bash
# 1. Remove KV from Terraform state (does not delete from Azure)
terraform -chdir=infra state rm module.keyvault.azurerm_key_vault.langsmith

# 2. Permanently purge the soft-deleted KV (irreversible)
az keyvault purge --name langsmith-kv<identifier> --location eastus

# 3. Re-apply
make apply
```

### Key Vault 机密已存在，但不处于 Terraform 状态

**症状**

```
Error: a resource with the ID "https://langsmith-kv-<id>.vault.azure.net/secrets/.../..."
already exists - to be managed via Terraform this resource needs to be imported into the State.
```

**原因：** 较旧的 `setup-env.sh` 版本将 Fernet 密钥直接写入 Key Vault。当前 `setup-env.sh` 对于 Key Vault 是只读的； Terraform 是唯一的作者。

**修复：** 导入冲突的秘密：

```bash
terraform import \
  'module.keyvault.azurerm_key_vault_secret.deployments_encryption_key[0]' \
  "$(az keyvault secret show --vault-name langsmith-kv<id> --name langsmith-deployments-encryption-key --query id -o tsv)"

terraform import \
  'module.keyvault.azurerm_key_vault_secret.agent_builder_encryption_key[0]' \
  "$(az keyvault secret show --vault-name langsmith-kv<id> --name langsmith-agent-builder-encryption-key --query id -o tsv)"

terraform import \
  'module.keyvault.azurerm_key_vault_secret.insights_encryption_key[0]' \
  "$(az keyvault secret show --vault-name langsmith-kv<id> --name langsmith-insights-encryption-key --query id -o tsv)"

terraform apply
```

## 申请阶段

### `dns_label` 子域无法解析：TLS 证书卡在待处理状态

**症状：** `nslookup langsmith-demo.eastus.cloudapp.azure.com` 返回 NXDOMAIN。证书管理器 ACME 挑战无法完成； TLS 证书仍为 `READY: False`。

**原因：** 必须在 NGINX LoadBalancer 服务上设置 `service.beta.kubernetes.io/azure-dns-label-name` 注释，以便 Azure 将 DNS 标签分配给公共 IP。 `make deploy` 通过`deploy.sh` 自动设置。如果您直接运行 `helm upgrade`，则永远不会设置注释。

**修复**

```bash
kubectl annotate svc ingress-nginx-controller -n ingress-nginx \
  service.beta.kubernetes.io/azure-dns-label-name=<dns_label> \
  --overwrite

# Wait 1-2 minutes, verify DNS resolves
nslookup <dns_label>.eastus.cloudapp.azure.com

# Delete the stuck cert to trigger re-issue
kubectl delete certificate langsmith-tls -n langsmith
```

### `istio-addon`：端口 80/443 超时，TLS 握手重置

**症状：** 在`make deploy`和`ingress_controller = "istio-addon"`之后无法访问站点。 80端口超时，443端口复位。 ACME 挑战仍然是`pending`。

**原因（三个复合问题）：**1. **网关标签错误。** 具有 `ingressClassName: istio` 的 Kubernetes Ingress 目标是具有标签 `istio: ingressgateway` 的 pod。 AKS 托管外部网关使用 `istio: aks-istio-ingressgateway-external`。
2. **使用 `class: nginx` 创建`ClusterIssuer`。** ACME HTTP-01 求解器入口获取类 `nginx`，而不是 `istio`。
3. **TLS 密钥位于错误的命名空间中。** Istio SDS 从网关 pod 命名空间 (`aks-istio-ingress`) 读取，而不是应用程序命名空间 (`langsmith`)。

**修复：** `make deploy` 在当前脚本中自动处理所有三个。如果手动部署，请创建一个针对 `istio: aks-istio-ingressgateway-external` 的 Istio `Gateway`，将 `ClusterIssuer` 求解器修补到 `ingressClassName: istio`，将 `langsmith-tls` 同步到 `aks-istio-ingress` 命名空间，并创建到 LangSmith 前端的 `VirtualService` 路由。有关完整的 YAML，请参阅 [TROUBLESHOOTING.md source](https://github.com/langchain-ai/terraform/blob/main/modules/azure/TROUBLESHOOTING.md)。

### `letsencrypt-prod` ClusterIssuer 缺失

**症状：** `kubectl describe certificate langsmith-tls -n langsmith` 显示`clusterissuers.cert-manager.io "letsencrypt-prod" not found`。

**原因：** 对于 `tls_certificate_source = "letsencrypt"` (HTTP-01)，`letsencrypt-prod` ClusterIssuer 由 `apply-cluster-issuers.sh` 创建，`make deploy` 通过 `kubectl apply` 运行。 Terraform `k8s-bootstrap` 模块不会创建 HTTP-01 颁发者；它仅为 `dns01` 创建发行人。直接运行 `helm upgrade` 而不是 `make deploy` 会跳过发行者。

**手动修复：**

```bash
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: you@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          ingressClassName: nginx   # use "istio" with istio-addon or istio
EOF

kubectl delete certificate langsmith-tls -n langsmith
```

### `database "langsmith" does not exist`：后端 Pod 崩溃循环

**症状：** 后端 Pod 立即崩溃：`FATAL: database "langsmith" does not exist`。**原因：** Azure DB for PostgreSQL 灵活服务器不会自动创建应用程序数据库。 Terraform `postgres` 模块现在通过 `azurerm_postgresql_flexible_server_database` 创建数据库。此错误意味着您使用的是缺少该资源的旧模块版本。

**修复**

```bash
terraform apply
kubectl rollout restart deployment -n langsmith
```

### `langsmith-backend-auth-bootstrap` 卡在 `CreateContainerConfigError`

**原因：** 作业使用密钥 `initial_org_admin_password` 读取管理员密码。如果 Secret 是使用不同的密钥名称（例如 `admin_password`）创建的，则容器无法启动。

**修复**

```bash
kubectl delete secret langsmith-config-secret -n langsmith
make k8s-secrets   # recreates with correct key names
make deploy
```

### 无法回滚到较旧的图表版本

**原因：** LangSmith 数据库迁移是仅向前的。降级图表会使数据库处于旧应用程序映像无法找到的修订版本。

**修复：** 前滚到您所在的版本（或更高版本）。将`langsmith_helm_chart_version`设置为`terraform.tfvars`并重新部署。在升级生产之前，始终在单独的环境中测试新的图表版本。

### Helm 安装超时

**原因：** `langsmith-backend-auth-bootstrap` 在每个 `helm upgrade` 上运行数据库迁移；首次安装最多需要 5 分钟。如果没有 `--timeout 20m`，即使安装最终成功，Helm 也会报告失败。

**修复：** `make deploy` 已使用 `--timeout 20m`。手动运行 Helm，始终包含 `--timeout 20m`。

## 附加组件

### Pod 停留在 `DEPLOYING`，永远不会到达 `HEALTHY`**原因：** 启用 TLS 时，`config.deployment.url` 为空或 `config.deployment.tlsEnabled` 为 `false`。操作员根据这些值构建代理端点 URL。

**修复：** `init-values.sh` 从示例复制后自动注入 `url` 和 `tlsEnabled`。如果手动部署：

```yaml
config:
  deployment:
    enabled: true
    url: "https://langsmith-demo.eastus.cloudapp.azure.com"   # must include https://
    tlsEnabled: true   # must be true when tls_certificate_source = letsencrypt or dns01
```

### 见解附加组件：`CreateContainerConfigError` 中的`backend-ch-migrations`

**症状：** 启用 `enable_insights = true` 后，多个 Pod 失败并显示 `CreateContainerConfigError`。日志：`secret "langsmith-clickhouse" not found`。

**原因：** 示例`langsmith-values-insights.yaml`将`clickhouse.external.enabled: true`设置为`existingSecretName: langsmith-clickhouse`。这会覆盖集群内的 ClickHouse 配置，并需要一个不存在的外部密钥。

**修复：** `init-values.sh` 现在在 `clickhouse_source = "in-cluster"` 时生成最小的见解文件。对于存在此问题的现有部署：

```bash
cat > helm/values/langsmith-values-insights.yaml << 'EOF'
insights:
  enabled: true
EOF
make deploy
```

### Polly 显示“无法连接到 LangGraph 服务器”

**症状：** Polly 聊天小部件显示连接错误。浏览器控制台：`POST http://localhost:8123/threads net::ERR_FAILED` 和 CORS 错误。

**原因 A，前端在创建 `langsmith-polly-config` 之前启动。** 引导作业在 Polly 注册后使用 `VITE_POLLY_DEPLOYMENT_URL` 创建 ConfigMap。 ConfigMap 中的环境变量在 pod 启动时加载，而不是动态加载。

**修复**

```bash
kubectl rollout restart deployment langsmith-frontend -n langsmith
kubectl exec -n langsmith deploy/langsmith-frontend -- env | grep POLLY
# expect: VITE_POLLY_DEPLOYMENT_URL=https://<hostname>/lgp/smith-polly-<hash>
```

**原因 B，`LANGCHAIN_ENDPOINT` 设置于 `polly.agent.extraEnv`。** `LANGCHAIN_ENDPOINT` 被保留。设置它会导致引导作业失败并显示`400 Bad Request: 'LANGCHAIN_ENDPOINT' is reserved`。波莉从未被创造出来。**修复：**完全删除`polly.agent.extraEnv`块。操作员自动注入`LANGCHAIN_ENDPOINT`。

### 启用 LangSmith 部署后，`listener` 和 `operator` Pod 永远不会出现

**原因：** 设置了`config.deployment.url`，但省略了`config.deployment.enabled: true`。当 `enabled` 为 false（默认值）时，图表会默默地跳过创建 `listener` 和 `operator`。

**修复：** 在 `deployment` 块内添加 `enabled: true`：

```yaml
config:
  deployment:
    enabled: true          # required; url alone is not enough
    url: "https://<your-hostname>"
```

### 重复顶级 `config:` 键会默默地删除值

**原因：** YAML 不允许重复的顶级键。第二个`config:`块默默地掉落其中一个。

**修复：** 始终在现有 `config:` 键内添加新的配置块。使用`helm get values langsmith -n langsmith`进行验证。

### 首次部署后加密密钥不得更改

首次使用后更改 `deployments_encryption_key`、`agent_builder_encryption_key` 或 `insights_encryption_key` 会永久损坏其保护的数据。没有恢复。

- 请勿旋转这些钥匙。
- 不要将`config.agentBuilder.encryptionKey`或`config.insights.encryptionKey`内联设置在`values-overrides.yaml`中。该图表从 `langsmith-config-secret` 到 `existingSecretName` 读取它们。设置内联会覆盖秘密引用。

CrashLoopBackOff 中的 ### `agent-builder-tool-server` 或 `polly`

**症状：** Pod 无限期地重新启动。没有回溯。日志反复显示“子进程死亡”。**原因：** `lc_config.settings.SharedSettings` 在 uvicorn Worker 内的模块导入时实例化。在那里升起的 pydantic `ValidationError` 退出了工人，代码为 0； uvicorn 的父进程打印“子进程死亡”，但吞掉了回溯。常见触发器：`BASIC_AUTH_ENABLED = true` 但`BASIC_AUTH_JWT_SECRET` 为空，或者`langsmith-config` 中缺少所需的功能标记键。

通过在调试 Pod 中运行服务器并使用 `envFrom` 指向 `langsmith-config` 和 `PYTHONUNBUFFERED=1` 来进行**诊断**。 **修复：** 将丢失的密钥添加到 Key Vault，重新运行 `make k8s-secrets`，重新启动部署。

## 工作负载身份

### Pod 恐慌：`AADSTS700213: No matching federated identity record found`

**症状**

```
panic: blob-storage health-check failed: get container properties failed:
DefaultAzureCredential: failed to acquire a token.
WorkloadIdentityCredential authentication failed.
  AADSTS700213: No matching federated identity record found for presented assertion subject
  'system:serviceaccount:langsmith:langsmith-<service>'
```

**原因：** Pod 的 Kubernetes ServiceAccount 在 Azure 托管标识上没有联合凭据。每个访问 Blob 存储的 pod 都需要一个。

**修复：** 将缺少的ServiceAccount添加到`modules/k8s-cluster/main.tf`中的`service_accounts_for_workload_identity`：

```hcl
service_accounts_for_workload_identity = [
  "${var.langsmith_release_name}-backend",
  "${var.langsmith_release_name}-platform-backend",
  "${var.langsmith_release_name}-queue",
  "${var.langsmith_release_name}-ingest-queue",
  "${var.langsmith_release_name}-host-backend",                 # LangSmith Deployment add-on
  "${var.langsmith_release_name}-listener",                     # LangSmith Deployment add-on
  "${var.langsmith_release_name}-agent-builder-tool-server",    # Agent Builder add-on
  "${var.langsmith_release_name}-agent-builder-trigger-server", # Agent Builder add-on
]
```

```bash
terraform apply -target=module.aks
kubectl rollout restart deployment/langsmith-<service> -n langsmith
```

请参阅 [architecture page](/langsmith/self-host-terraform-azure-architecture#workload-identity) 了解完整的 Pod 到 WI 映射。

## 拆卸和清理

### `make clean` 在 `make destroy` 孤儿基础设施之前

**症状：** `make clean` 失败后，`make destroy` 出现 `No state file was found!`。 Azure 资源仍在运行，但 Terraform 失去了跟踪。

**原因：** `make clean` 删除了 `terraform.tfvars` 和 `secrets.auto.tfvars`。没有它们，Terraform 无法初始化后端。

**正确的拆卸顺序**

```txt
1. make uninstall   ← Helm + namespace
2. make destroy     ← Azure infra (needs tfstate + tfvars)
3. make clean       ← local secrets and generated files (LAST)
```

**tfstate消失后恢复**

```bash
az group delete --name langsmith-rg<identifier> --yes --no-wait
az group show --name langsmith-rg<identifier> 2>&1 | grep -E "provisioningState|ResourceGroupNotFound"
```如果您之后重复使用相同的 `identifier`，Azure 可能会在下一个 `terraform apply` 上恢复软删除的 Key Vault。使用`keyvault_purge_protection = false`，首先清除：`az keyvault purge --name langsmith-kv<identifier> --location <region>`。

### `terraform destroy` 在 VNet/子网删除时停止

**原因：** Terraform 不跟踪由 `ingress-nginx-controller` 预配的 Azure 负载均衡器。当 LB 保留子网引用时，Azure 会阻止 VNet 删除。

**修复：** 首先运行`make uninstall`。

```bash
make uninstall
kubectl delete namespace langsmith --timeout=60s
make destroy
```

### `langsmith-agent-bootstrap` 挂钩超时

**症状：** Helm 升级后挂钩超时 (`context deadline exceeded`)。特工在 20 分钟内完成了`QUEUED → AWAITING_DEPLOY → DEPLOYING`，但没有到达`HEALTHY`。

**原因：** 在冷集群上，三个 LGP 代理（`agent-builder`、`clio`、`smith-polly`）首次拉取映像可能需要 20 分钟以上的时间。 Helm hook 同步等待。

**修复：**实际上并不是失败。资源得到应用；特工继续部署。等待 pod 稳定，然后重新运行 `make deploy`。

### `listener` pod OOMKilled

**原因：** 侦听器内存限制由`listener.deployment.resources`下的大小调整覆盖设置。在 `dev` 配置文件上，该限制为 `2Gi`，持续部署负载可能会超出该限制。**修复：** 通过移动到更大的尺寸配置文件或将覆盖添加到在尺寸调整覆盖后加载的值文件中，提高`listener.deployment.resources`（图表读取的键）下的限制，然后重新运行`make init-values`和`make deploy`。

<Note>
该图表显示集装箱限制为`listener.deployment.resources`，而不是统一的`listener.resources`。 `langsmith-values-agent-deploys.yaml` 示例设置了 `listener.resources`，图表会默默地忽略它，因此该值不会更改限制。
</Note>

### 过时的 HPA 将 `listener` 或 `host-backend` 扩展到最大副本数

**原因：** 之前的 Helm 版本创建了 HPA。 Helm 不会清理失败的钩子。使用 `enabled: false` 重新部署时，过时的 HPA 会保留并覆盖 `replicas`。

**修复**

```bash
kubectl delete hpa langsmith-listener langsmith-host-backend -n langsmith 2>/dev/null || true
kubectl scale deployment langsmith-listener -n langsmith --replicas=1
kubectl scale deployment langsmith-host-backend -n langsmith --replicas=1
make deploy
```

## AGIC（应用程序网关入口控制器）

### AGIC pod CrashLoopBackOff：AGW GET 上的 403

**症状：** `ingress-appgw-deployment` 是 CrashLoopBackOff。日志：`ErrorApplicationGatewayForbidden: does not have authorization to perform action Microsoft.Network/applicationGateways/read`。

**原因：** AKS 为 AGIC 加载项（`MC_` 资源组中的`ingressapplicationgateway-<cluster>`）创建托管标识。该标识是在群集预配期间创建的，但在角色分配生效之前需要大约 5 分钟的时间在 Azure AD 中注册。**修复：** `k8s-cluster` 模块在集群创建 (`time_sleep.agic_identity_propagation`) 后等待 300 秒，并自动创建三个所需的角色分配。如果`make apply`之后AGIC仍然是403：

```bash
az aks update --name <CLUSTER> --resource-group <RG> --yes
kubectl delete pod -n kube-system -l app=ingress-azure
```

有关手动角色分配（RG 上的读者、AGW 上的贡献者、VNet 上的网络贡献者），请参阅 [TROUBLESHOOTING.md source](https://github.com/langchain-ai/terraform/blob/main/modules/azure/TROUBLESHOOTING.md#agic-pod-crashloopbackoff--403-on-agw-get)。

### 汉德：`ApplicationGatewayInsufficientPermissionOnSubnet`

**原因：** AGIC 附加标识在 VNet 上缺少网络贡献者。

**修复**

```bash
AGIC_OID=$(az aks show -g <RG> -n <CLUSTER> \
  --query "addonProfiles.ingressApplicationGateway.identity.objectId" -o tsv)
VNET_ID=$(az network vnet show -g <RG> -n <VNET> --query id -o tsv)

az role assignment create --role "Network Contributor" --scope "$VNET_ID" \
  --assignee-object-id "$AGIC_OID" --assignee-principal-type ServicePrincipal

kubectl rollout restart deployment/ingress-appgw-deployment -n kube-system
```

### AGIC：`SecretNotFound` 用于 TLS 机密

**原因：** AGIC 在证书管理器颁发 TLS 证书之前看到了 Ingress。

**修复：** 触摸 Ingress 触发重新同步：

```bash
kubectl get certificate langsmith-tls -n langsmith   # verify cert is ready
kubectl annotate ingress langsmith-ingress -n langsmith touch="$(date +%s)" --overwrite
```

### 汉德拒绝`ingressClassName: azure/application-gateway`

**原因：** 旧注释 `kubernetes.io/ingress.class: azure/application-gateway`（带斜杠）不是有效的 `ingressClassName`。 AKS 将 `IngressClass` 创建为 `azure-application-gateway`（连字符）。

**修复：** 使用`ingressClassName: azure-application-gateway`。 `make init-values` 自动设置。

## Istio（自我管理的 Helm）

### Istio 站点返回连接被拒绝/无路由

**症状：** 连接被拒绝。 `pilot-agent request GET config_dump` 显示`LDS: PUSH resources:0`。

**根本原因（必须解决所有三个问题）：**

1. `meshConfig.ingressControllerMode`未设置。默认为 `DEFAULT`，它会忽略 `ingressClassName`。必须是`STRICT`。
2. `istio` IngressClass 资源丢失。
3. `meshConfig.ingressClass` 未设置为`istio`。**修复：** 所有三个都是自动化的。 `meshConfig` 在 istiod Helm 版本 (Terraform) 中设置，`deploy.sh` 创建 IngressClass。手动修复：创建 IngressClass 并重新启动 istiod。

### Istio HTTPS 返回“没有可用的对等证书”

**原因：** istiod 通过 SDS 读取 TLS 机密 (`kubernetes://langsmith-tls`)。该密钥必须存在于`istio-system`（网关 Pod 命名空间）中。 cert-manager 将其发布到 `langsmith` 命名空间；它不会自动复制。

**修复：** `deploy.sh` 同步秘密部署后。手动修复：将密钥复制到`istio-system`。

### 来自 `istio-addon` 的剩余 CRD 阻止自我管理的 Helm 安装

**症状：** `terraform apply` 失败：`CustomResourceDefinition "wasmplugins.extensions.istio.io" exists and cannot be imported into the current release: invalid ownership metadata`。

**修复**

```bash
kubectl get crd | grep "istio.io" | awk '{print $1}' | xargs kubectl delete crd
terraform apply
```

## 诊断命令

### 集群访问

```bash
az aks get-credentials --name <cluster> --resource-group <rg>
kubectl config current-context
kubectl get nodes -o wide
```

### Pod

```bash
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50
```

### 入口和 TLS

```bash
kubectl get ingress -n langsmith
kubectl get svc ingress-nginx-controller -n ingress-nginx
kubectl get certificate -n langsmith
kubectl get challenges -n langsmith
kubectl get clusterissuer
```

### 工作负载身份

```bash
kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.azure\.workload\.identity/client-id}'

kubectl get pod <pod> -n langsmith \
  -o jsonpath='{.metadata.labels.azure\.workload\.identity/use}'
```

### 头盔

```bash
helm status langsmith -n langsmith
helm history langsmith -n langsmith
helm get values langsmith -n langsmith
```

### LangSmith 部署

```bash
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
```

### Key Vault 和 Kubernetes 秘密

```bash
./infra/scripts/manage-keyvault.sh list
./infra/scripts/manage-keyvault.sh validate
./infra/scripts/manage-keyvault.sh diff

kubectl get secrets -n langsmith
kubectl get secret langsmith-config-secret -n langsmith -o jsonpath='{.data}' | jq 'keys'
```

### 快速健康检查

```bash
make status         # 10-section automated check
make status-quick   # skip Key Vault + K8s secret queries
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>