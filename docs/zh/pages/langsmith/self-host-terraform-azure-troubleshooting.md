<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-azure-troubleshooting -->

# Azure Terraform 故障排除

在使用 LangChain Terraform 模块部署的 Azure AKS 上自托管的 LangSmith 的常见问题、修复和诊断命令。

本页面记录了使用 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

<Tip>
  升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 的重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前运行 `make kubeconfig`。它获取集群凭据，并在 Microsoft Entra ID 集群上将其转换为 `kubelogin`。
</Tip>

有关本页中使用的 `kubectl`、`helm` 和 `az` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 基础设施阶段

### 资源名称已被全局使用

**症状：** `terraform apply` 因 `The name 'langsmith-redis-dev' is not available`、`StorageAccountAlreadyTaken` 或 `VaultAlreadyExists` 失败。

**原因：** Postgres、Redis、存储和 Key Vault 名称在所有 Azure 租户中都是全局的。对于`unique_resource_names = false`（默认），名称仅源自`name_prefix`，因此具有相同`name_prefix`的另一个部署已经可以容纳它们。早期 `terraform destroy` 中的软删除 Key Vault 也会保留其名称，直到保留窗口结束。

**使固定：*** 新部署：在`terraform.tfvars`中设置`unique_resource_names = true`。这会将基本名称从 `langsmith` 切换到 `ls` 并将订阅 ID 和 `name_prefix` 的哈希值附加到四个全局名称。
* 现有部署：不要更改`unique_resource_names`，这会重命名并重新创建每个资源。仅固定具有 `postgres_name`、`redis_name`、`storage_account_name` 或 `keyvault_name` 的冲突名称。
* 第一次应用`unique_resource_names = true`失败：设置`name_suffix_salt = "2"`以轮换所有四个散列名称。在实时部署中，这会破坏并重新创建 Postgres、Redis、存储和 Key Vault。

申请前运行`make preflight`。它根据 Azure 可用性 API 检查 Postgres、存储和 Key Vault 名称以及 `dns_label`。 Redis 名称没有可用性检查。

### `K8sVersionNotSupported`：版本仅限 LTS

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Error: creating Kubernetes Cluster ... unexpected status 400
"code": "K8sVersionNotSupported"
"message": "Managed cluster ... is on version 1.32.x, which is only available for Long-Term Support (LTS).
If you intend to onboard to LTS, please ensure the cluster is in Premium tier ..."
```

**原因：** Azure 定期从标准层支持中淘汰次要版本，并将其移至仅限 LTS。截至 2026 年 4 月，1.32 及以下版本仅在 `eastus` 中支持 LTS。标准层集群必须使用 1.33 或更高版本。

**修复：** 将 `aks_kubernetes_version` 设置为支持 `KubernetesOfficial` 的版本。该模块默认为`1.35`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az aks get-versions --location eastus -o table
# Versions with KubernetesOfficial in SupportPlan column work on Standard tier
```

删除或更新 `terraform.tfvars` 中的任何 `aks_kubernetes_version` 引脚，然后删除或更新 `make apply`。 1.32 上的现有集群继续运行；这只会阻止新集群的创建。

### 超出 vCPU 配额**症状（自动缩放器退避，Pod 待处理）：**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Warning  FailedScheduling     pod/langsmith-backend-xxx  0/1 nodes are available: 1 Too many pods.
Normal   NotTriggerScaleUp    pod/langsmith-backend-xxx  pod didn't trigger scale-up: 2 in backoff after failed scale-up
```

**症状（节点池轮换）：**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Error: creating temporary Agent Pool ... "code": "ErrCode_InsufficientVCPUQuota",
"message": "Insufficient vcpu quota requested 8, remaining 2 for family standardDSv5Family for region eastus."
```

**原因：** 每个 VM 系列的每个区域 vCPU 配额。 `eastus` 中的`standardDSv5Family` 默认通常为 10 个核心。 1个`Standard_D8s_v5`节点，模块默认使用8个；只剩下2个了。

**为什么 `max_pods = 30` 触发它：** 基本安装运行 \~37 个 pod（\~17 LangSmith 加上 \~20 个系统），超过 AKS 默认值每个节点 30 个，因此自动缩放程序添加第二个节点，达到配额，然后退出。模块默认`default_node_pool_max_pods = 60`适合一个节点上的所有 Pod。检查`terraform.tfvars` 是否不会降低它。

**多数据平面（3 个数据平面）的建议配额**：32 个核心。

**请求增加配额：**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Azure portal usually auto-approves within minutes:
# Portal > Subscriptions > <sub> > Usage + Quotas > search "DSv5" > eastus > Request increase > 32

# Or via CLI
az quota update \
  --resource-name "standardDSv5Family" \
  --scope /subscriptions/<sub-id>/providers/Microsoft.Compute/locations/eastus \
  --limit-object value=32 limit-type=Independent \
  --resource-type dedicated

az vm list-usage --location eastus --query "[?contains(name.value,'DSv5')]" -o table
```

**或者，如果 DSv5 配额耗尽，则切换虚拟机系列：** 设置 `default_node_pool_vm_size = "Standard_D8s_v3"` 并将 `Standard_D16s_v3` 用于 `additional_node_pools` 中的 `large` 池。相同的 vCPU 和 RAM，不同的配额池。一旦配额到达，就返回到 v5。不要回退到 Azure 已停用的 DSv2（`Standard_DS4_v2`、`Standard_DS5_v2`）。

<Note>
  `max_pods` 在现有节点池上是不可变的。将其设置在第一个`terraform apply`之前。
</Note>

### `LocationIsOfferRestricted`：Postgres 灵活服务器在该区域被阻止

**症状：** AKS 创建成功，然后 Postgres 失败并显示 `Status: "LocationIsOfferRestricted"` 或 `ParameterOutOfRange: The value of the 'Version' should be in: []`。**原因：** Azure 阻止某些订阅优惠类型（免费试用、Visual Studio 和 MSDN 积分、Azure Pass、一些赞助订阅）在高需求区域预配 PostgreSQL 灵活服务器。决定结果的是订阅类型，而不是地区。 `make preflight` 在申请开始之前报告此情况。

**修复：** 按优先顺序使用以下选项之一：

1. 将订阅转换为按量付费。
2. 在[aka.ms/postgres-request-quota-increase](https://aka.ms/postgres-request-quota-increase)申请豁免。
3. 对于开发或演示部署，设置 `postgres_source = "in-cluster"`。不适合生产。
4. 将`terraform.tfvars`更改为`location`。 Postgres 必须与 VNet 位于同一区域，因此整个部署会移动。

### 数据库SKU系列在该地区没有配额

**症状：** 应用构建资源组、VNet 和 AKS，然后在灵活服务器上失败，并出现命名 vCPU 系列和区域的配额错误，例如 `eastus` 中的 `standardDDSv5Family`。

**原因：** Postgres 灵活服务器利用 `Microsoft.Compute` 每个系列 vCPU 配额。新订阅通常会以 0 的限制运送某些系列。`make preflight` 将 `postgres_sku_name` 映射到其系列，并在应用开始之前因零限制而失败。

**修复：** 请求增加 [aka.ms/postgres-request-quota-increase](https://aka.ms/postgres-request-quota-increase)，或将 `postgres_sku_name` 设置为具有配额的系列中的 SKU：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az vm list-usage -l eastus --only-show-errors --query "[?limit=='0'].name.value" -o tsv
```### `AuthorizationFailed` 于 `roleAssignments/write`

**症状：** 资源创建正常，然后角色分配失败并显示`does not have authorization to perform action 'Microsoft.Authorization/roleAssignments/write'`。

**原因：** 部署身份拥有贡献者，但没有角色分配角色。该模块为其自己的托管身份创建角色分配，这是 Contributor 无法做到的。如果该身份已拥有用户访问管理员，则订阅可能会在 `principalType` 上的 ABAC 条件后面控制该权限，这会返回相同的消息。

**修复：**

* 在订阅范围内授予`Role Based Access Control Administrator`，或`Owner`代替这两个角色。在应用之前运行`make preflight`检查部署身份的角色。
* 对于`principalType`条件，为交互式`az login`设置`terraform_principal_type = "User"`，或在CI中设置`"ServicePrincipal"`。如果条件只允许服务主体，则设置`keyvault_manage_terraform_admin_assignment = false`和`keyvault_manage_secrets = false`。让租户管理员授予您保管库上的 Key Vault 机密官员权限，然后使用 `make seed-secrets` 写入机密。

有关完整权限清单，请参阅[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/azure/PERMISSIONS.md)。

### `AuthorizationFailed` 在 `terraform plan` 期间阅读

**症状：** `terraform plan` 针对已应用的部署在刷新时失败，在 `read` 操作（例如 `Microsoft.Network/publicIPAddresses/read`）上出现 403。**原因：** 刷新会读取状态中的每个资源。当之前有效的读取开始失败时，通常的原因是特权身份管理 (PIM) 激活过期。再次运行 `az login` 并不能解决问题。

**修复：** 在 Azure 门户（PIM > 我的角色 > 激活）中重新激活角色，时间长于应用时间。 `make preflight` 打印活动 PIM 激活的剩余时间。

### `LinkedAuthorizationFailed` 创建专用端点

**症状：** 设置 `storage_private_dns_zone_id` 或 `keyvault_private_dns_zone_id` 时，`make apply` 无法使用 `LinkedAuthorizationFailed` 创建专用端点。

**原因：** 端点在您提供的区域中注册其记录，这需要该区域上的`Microsoft.Network/privateDnsZones/join/action`。模块未创建的子网中的端点也需要子网上的`Microsoft.Network/virtualNetworks/subnets/join/action`。新的授权可能需要 12 到 40 分钟才能生效，并且 Azure 会在生效之前使终结点失败。

**修复：** 在首次应用之前，在区域的资源组上授予 `Private DNS Zone Contributor`，并在端点子网上授予 `Network Contributor`。如果授权存在，请等待并再次运行`make apply`。参见[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/azure/PERMISSIONS.md#private-dns-zones-you-own)。

### 不支持 Istio 插件修订版

**症状：** `terraform apply` 拒绝 Istio 修订版 (`Revision asm-1-XX is not supported`)。 Azure 定期停用旧的 ASM 修订版。

**修复：** 检查当前可用的修订并更新`istio_addon_revision`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az aks mesh get-revisions --location eastus -o table
```设置`terraform.tfvars`中的值并重新应用。

### Key Vault 清除保护启用后无法禁用

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Error: updating Key Vault "langsmith-kv-dz":
once Purge Protection has been Enabled it's not possible to disable it
```

**原因：** 通过 `terraform destroy` 删除 Key Vault 时，Azure 会对其软删除 90 天。下一个同名的`terraform apply`会默默地恢复旧的Key Vault，包括其原始的`purge_protection_enabled = true`。清除保护是单向的（启用 → 无法禁用）。

**修复（接受净化保护，测试环境）：**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
keyvault_purge_protection = true
```

**修复（需要`purge_protection = false`）：** 清除保护还会阻止 `az keyvault purge`，直到保留窗口结束，因此无法清除已恢复的保管库以释放其名称。为部署指定一个新的保管库名称：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
keyvault_name = "<new-unique-name>"   # 24 characters or fewer
```

运行 `make apply`，然后运行 `make seed-secrets` 将 LangSmith 应用程序机密写入新保管库。

### Key Vault 机密已存在，但不处于 Terraform 状态

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Error: a resource with the ID "https://<vault>.vault.azure.net/secrets/langsmith-license-key/..."
already exists - to be managed via Terraform this resource needs to be imported into the State.
```**原因：** 有些东西将机密写入 Terraform 外部的 Key Vault，或者状态文件丢失了资源。 Terraform 仅管理两个秘密，`postgres-admin-password` 和 `langsmith-license-key`。对于 `keyvault_manage_secrets = false`，`make seed-secrets` 会同时写入两者，因此随后将标志设置回 `true` 会导致此冲突。现有的带有`create_keyvault = false`的保险库已经保存了其中一个秘密，也会导致这种情况。 LangSmith 应用程序机密没有 Terraform 资源，并且永远不会产生此错误。

**修复：** 导入有冲突的密钥，然后重新应用。从`make tf ARGS="output keyvault_name"`获取`<vault>`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform -chdir=infra import \
  'module.keyvault.azurerm_key_vault_secret.langsmith_license_key[0]' \
  "$(az keyvault secret show --vault-name <vault> --name langsmith-license-key --query id -o tsv)"

make apply
```

对于`postgres-admin-password`，导入到`module.keyvault.azurerm_key_vault_secret.postgres_admin_password[0]`。为了让 Terraform 完全远离金库的秘密，请设置 `keyvault_manage_secrets = false` 并让 `make seed-secrets` 写入所有内容。在已应用的部署中，首先从状态中删除这两个密钥，或者 Terraform 将从保管库中删除它们。

### 现有 Key Vault：应用创建角色分配，然后失败并显示机密 403

**症状：** 对于 `create_keyvault = false`，应用会超过 `azurerm_role_assignment`，并在第一个 `azurerm_key_vault_secret` 和 `StatusCode=403` 上失败。 `make seed-secrets` 同样失败。

**原因：** 三个原因之一：1. Vault 防火墙拒绝应用主机的 IP。消息名称`ForbiddenByFirewall`或客户端地址。
2. 部署身份在保管库上不持有 Key Vault Secrets Leader。 Terraform 不会为它未创建的保管库创建该授权。
3. 赠款已存在但尚未传播。

**修复：**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Check the firewall, then allowlist the apply host
az keyvault show --name <vault> --query "properties.networkAcls" -o json
az keyvault network-rule add --name <vault> --ip-address "<apply-host-ip>/32"

# 2. Check the deploying identity's roles on the vault
az role assignment list --assignee "$(az ad signed-in-user show --query id -o tsv)" \
  --scope "$(az keyvault show --name <vault> --query id -o tsv)" \
  --include-inherited --query "[].roleDefinitionName" -o tsv

# 3. Confirm data-plane access, then re-run make apply
az keyvault secret list --vault-name <vault> --query "length(@)"
```

对于原因 2，请让保管库所有者授予部署身份 Key Vault Secrets Leader。对于原因 3，请等待几分钟并重新运行 `make apply`。设置 `keyvault_manage_secrets = false` 将 Terraform 从保管库的数据平面中取出，然后 `make seed-secrets` 将机密写入您自己的凭据下，这也需要 Key Vault Secrets Office。

### `make plan` 或 `make apply` 停靠点：`ingress_controller is not set`

**症状：** `make plan`、`make apply` 或 `make tf ARGS="apply"` 在 Terraform 使用 `ingress_controller is not set, and this deployment runs ingress-nginx.` 运行之前退出

**原因：** `ingress_controller` 默认值从 `nginx` 更改为 `envoy-gateway`。从未设置变量的部署仍然运行 ingress-nginx，并且应用新的默认值将删除 ingress-nginx 及其负载均衡器，从而更改公共 IP。保护脚本会停止运行，直到您选择为止。

**修复：** 将 `ingress_controller` 设置为 `terraform.tfvars`：* 保留NGINX：`ingress_controller = "nginx"`。
* 要移动到 Envoy Gateway：`ingress_controller = "envoy-gateway"`，然后连续运行 `make apply`、`make init-values` 和 `make deploy`。在部署完成之前，无法从应用程序访问LangSmith。更新指向旧 IP 的所有 DNS A 记录。

## 申请阶段

### `Could not read aks_resource_group_name`

**症状：** 升级模块后，`make kubeconfig`、`make deploy`或`make uninstall`停止并显示`Could not read aks_resource_group_name. Run 'make apply' to record it.`

**原因：** 脚本从 `aks_resource_group_name` 输出中读取集群的资源组，而早期模块版本中的应用未记录该输出。

**修复：** 运行`make apply`，然后重新运行该命令。

### `dns_label` 子域无法解析：TLS 证书挂起待处理

**症状：** `nslookup langsmith-demo.eastus.cloudapp.azure.com` 返回 NXDOMAIN。证书管理器 ACME 挑战无法完成； TLS 证书仍为 `READY: False`。

**原因：** 仅当入口控制器的 LoadBalancer 服务带有 `service.beta.kubernetes.io/azure-dns-label-name` 注释时，Azure 才会将 DNS 标签分配给公共 IP。 `make deploy` 设置它；直接的`helm upgrade`则不然。

**使用 `ingress_controller = "envoy-gateway"`（默认）修复：** EnvoyProxy `langsmith-proxy` 携带注释，Envoy Gateway 将其复制到代理服务上。检查两者：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get envoyproxy langsmith-proxy -n envoy-gateway-system \
  -o jsonpath='{.spec.provider.kubernetes.envoyService.annotations}'
kubectl get svc -n envoy-gateway-system \
  -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway \
  -o jsonpath='{.items[0].metadata.annotations.service\.beta\.kubernetes\.io/azure-dns-label-name}'
```如果其中一个缺失，请在 `terraform.tfvars` 中设置 `dns_label`，然后运行 ​​`make init-values` 和 `make deploy`，这将重新应用 EnvoyProxy。 `make deploy` 停止，而 `terraform.tfvars` 和生成的值在 `dns_label` 上不一致。 DNS 解析后，按照 NGINX 修复中的方式删除卡住的证书。

**用`ingress_controller = "nginx"`修复：**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl annotate svc ingress-nginx-controller -n ingress-nginx \
  service.beta.kubernetes.io/azure-dns-label-name=<dns_label> \
  --overwrite

# Wait 1-2 minutes, verify DNS resolves
nslookup <dns_label>.eastus.cloudapp.azure.com

# Delete the stuck cert to trigger re-issue
kubectl delete certificate langsmith-tls -n langsmith
```

### `istio-addon`：端口 80/443 超时，TLS 握手重置

**症状：** 在 `make deploy` 和 `ingress_controller = "istio-addon"` 之后无法访问站点。 80端口超时，443端口复位。

`istio-addon` 不支持 `tls_certificate_source = "letsencrypt"`，因为该附加组件没有为 HTTP-01 求解器创建 IngressClass。将 `dns01` 与自定义域、`existing` 或 `none` 结合使用。

**原因（两个复合问题）：**

1. **网关标签错误。** 具有 `ingressClassName: istio` 的 Kubernetes Ingress 目标是具有标签 `istio: ingressgateway` 的 pod。 AKS 托管外部网关使用 `istio: aks-istio-ingressgateway-external`。
2. **TLS 密钥位于错误的命名空间中。** Istio SDS 从网关 pod 命名空间 (`aks-istio-ingress`) 读取，而不是应用程序命名空间 (`langsmith`)。

**修复：** `make deploy` 在当前脚本中自动处理两者。如果手动部署，请创建一个以 `istio: aks-istio-ingressgateway-external` 为目标的 Istio `Gateway`，将 `langsmith-tls` 同步到 `aks-istio-ingress` 命名空间，并创建到 LangSmith 前端的 `VirtualService` 路由。有关完整的 YAML，请参阅 [TROUBLESHOOTING.md source](https://github.com/langchain-ai/terraform/blob/main/modules/azure/TROUBLESHOOTING.md)。

### `letsencrypt-prod` ClusterIssuer 缺失**症状：** `kubectl describe certificate langsmith-tls -n langsmith` 显示`clusterissuers.cert-manager.io "letsencrypt-prod" not found`。

**原因：** 当 `tls_certificate_source` 为 `letsencrypt` 或 `dns01` 时，`deploy.sh` 应用`letsencrypt-prod` ClusterIssuer。 Terraform 永远不会创建它。当 `make deploy` 未运行时、当您直接运行 `helm upgrade` 时、或者当 `dns01` 分支由于 `langsmith_domain` 为空或 `cert_manager_identity_client_id` 输出丢失（`make deploy` 在这两种情况下都会打印警告）而跳过发行者时，您会遇到此问题。

**手动修复：** 对于 `ingress_controller = "envoy-gateway"`，将此命令中的 `ingress:` 求解器替换为其后面的 `gatewayHTTPRoute` 求解器。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
          ingressClassName: nginx   # use "istio" with self-managed istio
EOF

kubectl delete certificate langsmith-tls -n langsmith
```

`ingress_controller = "envoy-gateway"` 的求解器：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    solvers:
    - http01:
        gatewayHTTPRoute:
          parentRefs:
          - name: langsmith-gateway
            namespace: langsmith
            kind: Gateway
```

### `langsmith-backend-auth-bootstrap` 卡在`CreateContainerConfigError`

**原因：** 作业使用密钥 `initial_org_admin_password` 读取管理员密码。如果 Secret 是使用不同的密钥名称（例如 `admin_password`）创建的，则容器无法启动。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl delete secret langsmith-config-secret -n langsmith
make k8s-secrets   # recreates with correct key names
make deploy
```

### 无法回滚到较旧的图表版本

**原因：** LangSmith 数据库迁移是仅向前的。降级图表会使数据库处于旧应用程序映像无法找到的修订版本。**修复：** 前滚到您所在的版本（或更新版本）。将`langsmith_helm_chart_version`设置为`terraform.tfvars`并重新部署。在 `v0.17.*` 模块标签上，`make deploy` 仅接受图表 0.17 线。运行图表 0.17 的部署无法返回到 0.16。 `v0.16.*` 标签适用于从未离开过 0.16 的安装。在升级生产之前，始终在单独的环境中测试新的图表版本。

### `make deploy` 失败：`does not resolve to the chart 0.17 line`

**原因：** `CHART_VERSION` 环境变量或 `langsmith_helm_chart_version` 命名 0.17 线之外的图表，例如早期部署留下的 0.16 版本。 `v0.17.*` 模块标签仅部署图表 0.17。

**修复：** 清除两者以获取最新的 0.17 补丁 (`unset CHART_VERSION`)，或命名 0.17 补丁，例如 `0.17.0`。要停留在图表 0.16 上，请查看 `v0.16.*` 模块标签。

### `make init-values` 失败：`enable_sso_oidc = true but the following Key Vault secrets are missing`

**原因：** `enable_sso_oidc = true` 禁用基本身份验证，因此后端需要 OIDC 客户端 ID、客户端密钥和颁发者 URL。至少其中一个 `langsmith-oauth-*` 机密不在 Key Vault 中。

**修复：** 写入丢失的密钥，然后重新创建 Kubernetes 密钥并部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./infra/scripts/manage-keyvault.sh set langsmith-oauth-client-id '<client-id>'
./infra/scripts/manage-keyvault.sh set langsmith-oauth-issuer-url '<issuer-url>'
make keyvault   # set langsmith-oauth-client-secret; the prompt hides the value
make k8s-secrets
make init-values
make deploy
```

通过 `make keyvault` 设置客户端密码，而不是在命令行上，它显示在进程列表和 shell 历史记录中。

### Helm 安装超时**原因：** `langsmith-backend-auth-bootstrap` 在每个 `helm upgrade` 上运行数据库迁移；首次安装最多需要 5 分钟。如果没有 `--timeout 20m`，即使安装最终成功，Helm 也会报告失败。

**修复：** `make deploy` 已使用 `--timeout 20m`。手动运行 Helm，始终包含 `--timeout 20m`。

## 附加组件

### Pod 停留在 `DEPLOYING`，永远不会到达 `HEALTHY`

**原因：** 启用 TLS 时，`config.deployment.url` 为空或 `config.deployment.tlsEnabled` 为 `false`。操作员根据这些值构建代理端点 URL。

**修复：** `init-values.sh` 从示例复制后自动注入 `url` 和 `tlsEnabled`。如果手动部署：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  deployment:
    enabled: true
    url: "https://langsmith-demo.eastus.cloudapp.azure.com"   # must include https://
    tlsEnabled: true   # must be true when tls_certificate_source = letsencrypt, dns01, or existing
```

### 见解附加组件：`CreateContainerConfigError` 中的`backend-ch-migrations`

**症状：** 启用 `enable_insights = true` 后，多个 Pod 失败并显示 `CreateContainerConfigError`。日志：`secret "langsmith-clickhouse" not found`。

**原因：** 由较早的 `init-values.sh` 编写的 `langsmith-values-insights.yaml` 将 `clickhouse.external.enabled: true` 与 `existingSecretName: langsmith-clickhouse` 设置。这会覆盖集群内的 ClickHouse 配置，并需要一个不存在的外部密钥。

**修复：** `init-values.sh` 不再将任何 ClickHouse 配置放入 Insights 文件中。对于存在此问题的现有部署，请覆盖该文件并重新部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cat > helm/values/langsmith-values-insights.yaml << 'EOF'
insights:
  enabled: true
EOF
make deploy
```对于外部 ClickHouse，设置 `clickhouse_source = "external"` 并重新运行 `make init-values`，这会提示输入连接详细信息并创建 `langsmith-clickhouse` 密钥。当手工制作的秘密缺少钥匙时，也会出现相同的症状。该图表需要全部七个：`clickhouse_host`、`clickhouse_port`、`clickhouse_native_port`、`clickhouse_user`、`clickhouse_password`、`clickhouse_db` 和 `clickhouse_tls`。

### Polly 显示“无法连接到 LangGraph 服务器”

**症状：** Polly 聊天小部件显示连接错误。浏览器控制台：`POST http://localhost:8123/threads net::ERR_FAILED` 和 CORS 错误。

**原因A，前端在`langsmith-polly-config`创建之前启动。** 一旦Polly注册，携带`VITE_POLLY_DEPLOYMENT_URL`的ConfigMap就会被写入。 ConfigMap 中的环境变量在 pod 启动时加载，而不是动态加载。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout restart deployment langsmith-frontend -n langsmith
kubectl exec -n langsmith deploy/langsmith-frontend -- env | grep POLLY
# expect: VITE_POLLY_DEPLOYMENT_URL=https://<hostname>/lgp/smith-polly-<hash>
```

**原因 B，`LANGCHAIN_ENDPOINT` 设置于 `polly.agent.extraEnv`。** `LANGCHAIN_ENDPOINT` 被保留。设置它会使注册 Polly 失败并显示`400 Bad Request: 'LANGCHAIN_ENDPOINT' is reserved`。波莉从未被创造出来。

**修复：**完全删除`polly.agent.extraEnv`块。操作员自动注入`LANGCHAIN_ENDPOINT`。

### 启用 LangSmith 部署后，`listener` 和 `operator` Pod 永远不会出现

**原因：** 设置了`config.deployment.url`，但省略了`config.deployment.enabled: true`。当 `enabled` 为 false（默认值）时，图表会默默地跳过创建 `listener` 和 `operator`。

**修复：** 在 `deployment` 块内添加 `enabled: true`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  deployment:
    enabled: true          # required; url alone is not enough
    url: "https://<your-hostname>"
```

### 重复顶级`config:`键会默默地删除值**原因：** YAML 不允许重复的顶级键。第二个`config:`块默默地掉落其中一个。

**修复：** 始终在现有 `config:` 键内添加新的配置块。使用`helm get values langsmith -n langsmith`进行验证。

### 首次部署后加密密钥不得更改

首次使用后更改 `deployments_encryption_key`、`agent_builder_encryption_key`、`insights_encryption_key` 或 `polly_encryption_key` 会永久损坏其保护的数据。没有恢复。

* 请勿旋转这些钥匙。
* 不要在 `values-overrides.yaml` 中内联设置 `config.agentBuilder.encryptionKey`、`fleet.encryptionKey`、`insights.encryptionKey` 或 `polly.encryptionKey`。该图表从 `langsmith-config-secret` 到 `existingSecretName` 读取它们。设置内联会覆盖秘密引用。

CrashLoopBackOff 中的 ### `fleet-tool-server` 或 `polly`

**症状：** Pod 无限期地重新启动。没有回溯。日志反复显示“子进程死亡”。

**原因：** 导入时的设置验证错误会以代码 0 退出 uvicorn 工作线程，并且父进程吞掉回溯。常见触发器：`BASIC_AUTH_ENABLED = true`但`BASIC_AUTH_JWT_SECRET`为空，或者`langsmith-config`中缺少所需的功能标记键。

通过在调试 Pod 中运行服务器并使用 `envFrom` 指向 `langsmith-config` 和 `PYTHONUNBUFFERED=1` 来进行**诊断**。 **修复：** 将丢失的密钥添加到 Key Vault，重新运行 `make k8s-secrets`，重新启动部署。

## 工作负载身份

### Pod 恐慌：`AADSTS700213: No matching federated identity record found`

**症状**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
panic: blob-storage health-check failed: get container properties failed:
DefaultAzureCredential: failed to acquire a token.
WorkloadIdentityCredential authentication failed.
  AADSTS700213: No matching federated identity record found for presented assertion subject
  'system:serviceaccount:langsmith:langsmith-<service>'
```**原因：** Pod 的 Kubernetes ServiceAccount 在 Azure 托管标识上没有联合凭据。每个访问 Blob 存储的 pod 都需要一个。

**修复：** 将缺少的ServiceAccount添加到`infra/modules/k8s-cluster/main.tf`中的`service_accounts_for_workload_identity`。该模块将图表全名传递为`var.langsmith_release_name`：当包含`langsmith`时为发布名称，否则为`<release>-langsmith`。 `v0.17.*`模块标签列表：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
service_accounts_for_workload_identity = [
  "${var.langsmith_release_name}-backend",
  "${var.langsmith_release_name}-platform-backend",
  "${var.langsmith_release_name}-queue",
  "${var.langsmith_release_name}-ingest-queue",
  "${var.langsmith_release_name}-host-backend",          # LangSmith Deployment add-on
  "${var.langsmith_release_name}-listener",              # LangSmith Deployment add-on
  "${var.langsmith_release_name}-fleet-tool-server",     # Fleet add-on
  "${var.langsmith_release_name}-fleet-trigger-server",  # Fleet add-on
  "${var.langsmith_release_name}-agent-gateway",         # LLM Gateway add-on
  "${var.langsmith_release_name}-presidio-analyzer",     # LLM Gateway PII redaction
]
```

`v0.16.*` 模块标签列出了除两个 LLM 网关条目之外的所有模块标签。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
kubectl rollout restart deployment/langsmith-<service> -n langsmith
```

请参阅 [architecture page](/langsmith/self-host-terraform-azure-architecture#workload-identity) 了解完整的 Pod 到 WI 映射。

## 拆卸和清理

### `make clean` 在 `make destroy` 孤儿基础设施之前

**症状：** `make clean` 失败后，`make destroy` 出现 `No state file was found!`。 Azure 资源仍在运行，但 Terraform 已丢失跟踪。

**原因：** `make clean` 删除了 `terraform.tfvars`、`secrets.auto.tfvars` 以及本地 `terraform.tfstate` 及其备份。当状态仍然跟踪资源时它会发出警告，但一旦您确认就会继续。 `make clean-force` 为您提供确认。

**正确的拆卸顺序**

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
1. make uninstall   ← Helm release, then the namespace if you confirm
2. make destroy     ← Azure infra (needs tfstate + tfvars)
3. make clean       ← local secrets and generated files (LAST)
```

`make uninstall` 在删除命名空间之前会询问，默认答案是“否”。回答 `y` 将删除命名空间及其中剩余的所有内容。

**tfstate消失后恢复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az group delete --name langsmith-rg-<name_prefix> --yes --no-wait
az group show --name langsmith-rg-<name_prefix> 2>&1 | grep -E "provisioningState|ResourceGroupNotFound"
```对于 `unique_resource_names = true`，资源组为 `ls-rg-<name_prefix>`。不要在`create_resource_group = false`时删除该组，因为该模块没有创建它。

如果您之后重复使用相同的 `name_prefix`，Azure 可能会在下一个 `terraform apply` 上恢复软删除的 Key Vault。使用`keyvault_purge_protection = false`，先将其清除。找到它的名称`az keyvault list-deleted -o table`，然后运行`az keyvault purge --name <vault> --location <region>`。

### `terraform destroy` 在 VNet/子网删除时停止

**原因：** Terraform 不跟踪入口控制器的 LoadBalancer 服务的 Azure 负载均衡器（`envoy-gateway` 的 Envoy 代理服务、`nginx` 的 `ingress-nginx-controller`）。当 LB 保留子网引用时，Azure 会阻止 VNet 删除。

**修复：** 首先运行`make uninstall`。使用`envoy-gateway`，它会删除网关，从而删除代理服务及其负载均衡器。使用`nginx`，还要卸载 ingress-nginx。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make uninstall
helm uninstall ingress-nginx -n ingress-nginx --wait   # only with ingress_controller = "nginx"
kubectl delete namespace langsmith --timeout=60s
make destroy
```

### 升级到图表 0.16 后孤立的`langsmith-agent-bootstrap` 工作

**症状：** 从图表 0.15 升级后，已完成的 `langsmith-agent-bootstrap` 作业仍保留在命名空间中，而 `helm uninstall` 将其留在后面。

**原因：** Chart 0.16 删除了捆绑的代理引导作业，因此 Helm 不再拥有 0.15 版本创建的对象。 Azure `deploy.sh` 不会删除它。

**修复：** 作业不会阻止任何内容。删除它以保持命名空间干净：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl delete job langsmith-agent-bootstrap -n langsmith --ignore-not-found
```

### `listener` pod OOMKilled**原因：** `make deploy` 在附加叠加层之后加载大小调整文件，因此其侦听器限制胜过 `langsmith-values-agent-deploys.yaml` 叠加层。 `dev` 和 `production` 配置文件将侦听器上限设置为 `2Gi`，而 `minimum` 将其上限设置为 `1536Mi`。持续部署负载可能会超过该限制。

**修复：** 在`terraform.tfvars`中设置`sizing_profile = "production-large"`，这会为侦听器提供`4Gi`，然后运行`make init-values`和`make deploy`。要保留您的个人资料，请在 `helm/values/langsmith-values-sizing-<profile>.yaml` 中加注 `listener.deployment.resources.limits.memory` 并运行 `make deploy`。 `make init-values` 再次复制大小文件，因此每次运行后重复编辑。

<Note>
  该图表显示集装箱限制为`listener.deployment.resources`，而不是统一的`listener.resources`。任何覆盖文件中的 `listener.resources` 值都会被静默忽略。
</Note>

### 过时的 HPA 将 `listener` 或 `host-backend` 扩展到最大副本数

**原因：** 之前的 Helm 版本创建了 HPA。 Helm 不会清理失败的钩子。使用 `enabled: false` 重新部署时，过时的 HPA 仍然存在并覆盖 `replicas`。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl delete hpa langsmith-listener langsmith-host-backend -n langsmith 2>/dev/null || true
kubectl scale deployment langsmith-listener -n langsmith --replicas=1
kubectl scale deployment langsmith-host-backend -n langsmith --replicas=1
make deploy
```

## AGIC（应用程序网关入口控制器）

### AGIC pod CrashLoopBackOff：AGW GET 上的 403

**症状：** `ingress-appgw-deployment` 是 CrashLoopBackOff。日志：`ErrorApplicationGatewayForbidden: does not have authorization to perform action Microsoft.Network/applicationGateways/read`。

**原因：** AGIC 加载项的托管标识（`MC_` 资源组中的`ingressapplicationgateway-<cluster>`）需要大约 5 分钟的时间在 Microsoft Entra ID 中注册，然后其角色分配才会生效。**修复：** `k8s-cluster` 模块在集群创建 (`time_sleep.agic_identity_propagation`) 后等待 300 秒，并自动创建三个所需的角色分配。如果`make apply`之后AGIC仍然是403：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az aks update --name <CLUSTER> --resource-group <RG> --yes
kubectl delete pod -n kube-system -l app=ingress-azure
```

有关手动角色分配（RG 上的读者、AGW 上的贡献者、VNet 上的网络贡献者），请参阅 [TROUBLESHOOTING.md source](https://github.com/langchain-ai/terraform/blob/main/modules/azure/TROUBLESHOOTING.md#agic-pod-crashloopbackoff--403-on-agw-get)。

### 汉德：`ApplicationGatewayInsufficientPermissionOnSubnet`

**原因：** AGIC 附加标识在 VNet 上缺少网络贡献者。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get certificate langsmith-tls -n langsmith   # verify cert is ready
kubectl annotate ingress langsmith-ingress -n langsmith touch="$(date +%s)" --overwrite
```

### AGIC拒绝`ingressClassName: azure/application-gateway`

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

**症状：** `make apply` 失败：`CustomResourceDefinition "wasmplugins.extensions.istio.io" exists and cannot be imported into the current release: invalid ownership metadata`。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get crd | grep "istio.io" | awk '{print $1}' | xargs kubectl delete crd
make apply
```

## 诊断命令

### 集群访问

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make kubeconfig
kubectl config current-context
kubectl get nodes -o wide
```

### Pod

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50
```

### 入口和 TLS

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get gateway,httproute -n langsmith                     # envoy-gateway
kubectl get svc -n envoy-gateway-system \
  -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway  # envoy-gateway
kubectl get ingress -n langsmith                                # nginx, istio, agic
kubectl get svc ingress-nginx-controller -n ingress-nginx       # nginx
kubectl get certificate -n langsmith
kubectl get challenges -n langsmith
kubectl get clusterissuer
```

### 工作负载身份

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get serviceaccount langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations.azure\.workload\.identity/client-id}'

kubectl get pod <pod> -n langsmith \
  -o jsonpath='{.metadata.labels.azure\.workload\.identity/use}'
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

### Key Vault 和 Kubernetes 秘密

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./infra/scripts/manage-keyvault.sh list
./infra/scripts/manage-keyvault.sh validate
./infra/scripts/manage-keyvault.sh diff

kubectl get secrets -n langsmith
kubectl get secret langsmith-config-secret -n langsmith -o jsonpath='{.data}' | jq 'keys'
```

### 快速健康检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make status         # full automated check
make status-quick   # skip the Key Vault, kubeconfig, Kubernetes, and Helm checks
```

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-troubleshooting.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>