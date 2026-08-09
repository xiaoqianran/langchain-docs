<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-aws-troubleshooting -->

# AWS Terraform 故障排除

在使用 LangChain Terraform 模块部署的 AWS EKS 上自托管的 LangSmith 的常见问题、修复和诊断命令。

本页记录了使用 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

<Tip>
  升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 的重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前运行 `aws eks update-kubeconfig --region <region> --name <cluster-name>`。
</Tip>

有关本页中使用的 `kubectl`、`helm` 和 `aws` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 自动诊断

在运行单个命令之前，请尝试捆绑的脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Deployment status across all layers + next-step guidance
make status

# SSM parameter validation
./infra/scripts/manage-ssm.sh validate
```

## 已知问题

### EKS 节点组创建失败：CREATE\_FAILED

**症状**

```
Error: waiting for EKS Node Group creation: unexpected state 'CREATE_FAILED'
```

**原因：** 当节点组创建开始时，EKS 控制平面尚未完全活动。中断应用后常见。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks wait cluster-active --name <cluster-name> --region <region>

aws eks describe-nodegroup \
  --cluster-name <cluster-name> \
  --nodegroup-name <nodegroup-name> \
  --region <region> \
  --query "nodegroup.health"

terraform apply -var-file=terraform.tfvars
```

### kubectl 失败：“您必须登录到服务器”

**症状：** 所有 `kubectl` 命令均失败并显示 `error: You must be logged in to the server (Unauthorized)`。

**原因：** kubeconfig 已过时，AWS 凭证与创建集群的凭证不同，或者令牌已过期。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks update-kubeconfig --region <region> --name <cluster-name>
kubectl cluster-info

aws sts get-caller-identity
```如果集群是使用不同的 IAM 角色创建的，请通过 `aws-auth` ConfigMap 授予访问权限：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl edit configmap aws-auth -n kube-system
# Add your IAM user or role under mapUsers / mapRoles
```

### 安装 Helm 后未创建 ALB

**症状：** 几分钟后`kubectl get ingress -n langsmith` 显示无地址。

**原因：** AWS 负载均衡器控制器未运行或缺少 IRSA 权限、未正确引用 Terraform 预置的 ALB，或设置了 `alb_scheme = "internal"`（内部 ALB 没有公共地址；请参阅 [ALB has no public address](#alb-has-no-public-address-internal-scheme)）。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n kube-system | grep aws-load-balancer
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail=50
kubectl get sa -n kube-system aws-load-balancer-controller -o yaml | grep eks.amazonaws.com

terraform output alb_dns_name
aws elbv2 describe-load-balancers --query "LoadBalancers[?DNSName=='<alb-dns-name>'].State"
```

### EKS Pod 拒绝 RDS 连接

**症状：** 后端日志显示 RDS 端点的 `connection refused` 或 `timeout`。

**原因：** RDS 安全组不允许来自 EKS 节点或集群安全组的入站 TCP 5432。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks describe-cluster --name <cluster-name> \
  --query "cluster.resourcesVpcConfig.clusterSecurityGroupId"

aws rds describe-db-instances \
  --db-instance-identifier <db-id> \
  --query "DBInstances[0].VpcSecurityGroups"

aws ec2 describe-security-group-rules \
  --filter "Name=group-id,Values=<rds-sg-id>"
```

`postgres`模块自动设置安全组。如果规则缺失，请重新应用：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -var-file=terraform.tfvars -target=module.postgres
```

### pod 拒绝 S3 访问（未配置 IRSA）

**症状：** 读写 S3 时后端日志显示`AccessDenied`。

**原因：** LangSmith 服务帐户中缺少 IRSA 注释，或者 S3 VPC 网关端点未正确路由。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get sa langsmith -n langsmith -o yaml | grep eks.amazonaws.com

aws ec2 describe-vpc-endpoints \
  --filters "Name=service-name,Values=com.amazonaws.<region>.s3" \
  --query "VpcEndpoints[].State"

kubectl run s3-test --rm -it --image=amazon/aws-cli -n langsmith -- \
  s3 ls s3://<bucket-name>
```

如果缺少 IRSA 注释，请验证 `terraform.tfvars` 中的 `create_langsmith_irsa_role = true` 以及 Helm 值中的服务帐户名称是否与 `langsmith` 匹配。

### ElastiCache Redis 连接超时**症状：** Pod 无法连接到 Redis。日志显示`dial tcp: i/o timeout`。

**原因：** ElastiCache 安全组不允许来自 EKS 节点安全组的入站 TCP 6379。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws elasticache describe-cache-clusters \
  --cache-cluster-id <cluster-id> \
  --query "CacheClusters[0].SecurityGroups"

kubectl run redis-test --rm -it --image=redis:7 -n langsmith -- \
  redis-cli -h <elasticache-endpoint> -a <auth-token> ping
```

### EKS 节点不自动缩放

**症状：** Pod 仍为 `Pending`。节点数不会增加。

**原因：** Cluster Autoscaler 缺乏 IAM 权限、定位错误的 ASG 或节点组上的 `min_size = max_size`。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl logs -n kube-system -l app=cluster-autoscaler --tail=50

aws autoscaling describe-auto-scaling-groups \
  --query "AutoScalingGroups[?contains(Tags[].Key, 'k8s.io/cluster-autoscaler/<cluster-name>')].[AutoScalingGroupName]" \
  --output table
```

### cert-manager 无法颁发 Let's Encrypt 证书

**症状：** `kubectl get certificate -n langsmith` 显示`READY=False`。 HTTP01 挑战失败。

**原因：** ALB 未将端口 80 转发到 cert-manager 求解器 Pod，或者域的 DNS 记录未指向 ALB。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl describe certificate <cert-name> -n langsmith
kubectl get challenges -n langsmith

aws elbv2 describe-listeners --load-balancer-arn <alb-arn>

dig +short <your-langsmith-domain>
# Expected: CNAME to the ALB DNS name
```

### postgres\_deletion\_protection 阻止 terraform destroy

**症状**

```
Error: deleting RDS DB Instance: InvalidParameterCombination:
Cannot delete, DeletionProtection is enabled.
```

**修复：** 在`terraform.tfvars`中禁用删除保护，应用，然后销毁：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
postgres_deletion_protection = false
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -var-file=terraform.tfvars
terraform destroy
```

### ESO 无法同步：langsmith-config 密钥丢失

**症状：** Pod 卡在 `CreateContainerConfigError` 中。 `kubectl get secret langsmith-config -n langsmith` 返回 `NotFound`。

**原因：** ESO 同步要么全有要么全无。如果 `ExternalSecret` 引用的任何单个 SSM 参数丢失，ESO 将拒绝创建 Kubernetes Secret。所有 pod 都会失败，包括那些与缺失参数无关的 pod。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get externalsecret langsmith-config -n langsmith
kubectl describe externalsecret langsmith-config -n langsmith

./infra/scripts/manage-ssm.sh validate

source ./infra/scripts/setup-env.sh
./helm/scripts/apply-eso.sh
````describe` 输出显示哪个 `remoteRef.key` 失败。将其与 SSM 前缀 `/langsmith/{name_prefix}-{environment}/` 进行匹配。

### SSM 参数前缀不匹配

**症状：** `manage-ssm.sh validate` 通过，但 ESO 仍然无法同步。或者 `setup-env.sh` 使用与 ESO 预期不同的前缀写入参数。

**原因：** SSM前缀源自`terraform.tfvars`中的`name_prefix`和`environment`。如果这些在初始设置后发生更改，旧参数将保留在旧前缀下，而 ESO 将在新前缀下查找。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get externalsecret langsmith-config -n langsmith -o yaml | grep 'key:'

./infra/scripts/manage-ssm.sh list

./infra/scripts/migrate-ssm.sh
```

<Warning>
  切勿更改现有部署上的 `name_prefix` 或 `environment`。
</Warning>

### Postgres 密码被 Terraform 验证拒绝

**症状**

```
Error: Invalid value for variable "postgres_password"
RDS master password must not contain '/', '@', '"', single quotes, or spaces.
```

**原因：** 密码包含 RDS 主密码中不允许的字符。

**修复：** 重新生成无限制字符。 `setup-env.sh` 自动生成合规密码；手动更新：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./infra/scripts/manage-ssm.sh set postgres-password "$(openssl rand -base64 24 | tr -d '/+= ')"
source ./infra/scripts/setup-env.sh
terraform apply -var-file=terraform.tfvars
```

### 私有 EKS 集群无法访问（需要堡垒）

**症状：** `kubectl`和`terraform apply`在`enable_public_eks_cluster = false`时超时。

**原因：** EKS API 端点是私有的。命令必须在 VPC 内通过堡垒主机或 VPN 连接运行。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# If the bastion was provisioned (create_bastion = true)
aws ssm start-session --target <bastion-instance-id>

# From the bastion
aws eks update-kubeconfig --region <region> --name <cluster-name>
kubectl get nodes
```

如果没有配置堡垒，请设置`create_bastion = true`并重新申请，或暂时设置`enable_public_eks_cluster = true`。

### ALB没有公共地址（内部方案）**症状：** `kubectl get ingress -n langsmith` 显示地址，但仅在 VPC 内解析。

**原因：** `alb_scheme = "internal"` 设置于 `terraform.tfvars`。内部 ALB 只能从 VPC 内部访问（VPN、对等互连或 PrivateLink）。

**修复：** 专用于私有部署。要使 ALB 可供公众访问：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
alb_scheme = "internet-facing"
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform apply -var-file=terraform.tfvars
# Then redeploy Helm to pick up the new ALB
```

### ALB 主机名在入口重新创建后更改

**症状：** LangSmith URL 停止工作。代理部署陷入`DEPLOYING`。 DNS 记录或书签指向不再解析的旧 ALB 主机名。

**原因：** 删除 Kubernetes 入口（通过 `helm uninstall`、`kubectl delete ingress` 或命名空间删除）会取消配置 ALB。重新创建入口时，会发出具有不同主机名的新 ALB。 Helm 值中的 `config.deployment.url` 仍然指向旧主机名，因此操作员的运行状况检查失败并且部署陷入困境。

如果 ALB 控制器创建一个新的 ALB 而不是重用 Terraform 预配置的 ALB，也会发生这种情况。需要使用 `group.name` 注释和 `load-balancer-arn` 来防止这种情况发生。

**预防*** 确保`group.name`和`load-balancer-arn`注释均已设置。当存在预先配置的 ALB 时，`init-values.sh` 会自动执行此操作。
* 不要删除入口，除非您计划更新所有与主机名相关的配置。
* 避免使用 `helm rollback` 而不使用 `--server-side=false`。入口 SSA 冲突可能会触发删除/重新创建周期。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Check what hostname the ingress currently has
kubectl get ingress langsmith-ingress -n langsmith \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# 2. Check what Terraform expects
terraform output alb_dns_name

# 3. If they differ, re-run init-values.sh and redeploy
make init-values
make deploy
```

### Terraform 未应用节点组缩放更改

**症状：** 在 `terraform.tfvars` 中更改 `min_size` 或 `max_size` 在 `terraform plan` 上显示“无更改”。

**原因：** ASG 已在带外（AWS CLI、控制台或集群自动缩放程序）更改，并且 Terraform 状态已反映新值。社区 EKS 模块忽略 `desired_size` 更改，以便自动缩放器可以对其进行管理； `min_size` 和 `max_size` 应正常传播。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform refresh
terraform plan

# For an immediate change, use the AWS CLI directly
aws eks update-nodegroup-config \
  --cluster-name <cluster> \
  --nodegroup-name <nodegroup> \
  --scaling-config minSize=3,maxSize=8,desiredSize=5 \
  --region <region>
```

## 诊断命令

### 集群访问

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks update-kubeconfig --region <region> --name <cluster-name>
kubectl config current-context
kubectl get nodes -o wide
aws sts get-caller-identity
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

### ALB 和入口

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get ingress -n langsmith
kubectl describe ingress -n langsmith
aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(LoadBalancerName, 'langsmith')]"
```

### TLS 和证书

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get certificate -n langsmith
kubectl describe certificate <cert-name> -n langsmith
kubectl get challenges -n langsmith
kubectl get clusterissuer
```

### ESO 和秘密

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get externalsecret -n langsmith
kubectl describe externalsecret langsmith-config -n langsmith
kubectl get clustersecretstore langsmith-ssm
kubectl get secret langsmith-config -n langsmith -o jsonpath='{.data}' | jq 'keys'
./infra/scripts/manage-ssm.sh validate
./infra/scripts/manage-ssm.sh diff
```

### 头盔

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm status langsmith -n langsmith
helm history langsmith -n langsmith
helm get values langsmith -n langsmith
```

### IRSA 和 IAM

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get sa langsmith -n langsmith -o yaml | grep eks.amazonaws.com
terraform output langsmith_irsa_role_arn
aws iam get-role --role-name <irsa-role-name>
```

### LangSmith 部署

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
kubectl get pods -n keda
```

### 快速健康检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo "=== Context ===" && kubectl config current-context
echo "=== Nodes ===" && kubectl get nodes
echo "=== Pods ===" && kubectl get pods -n langsmith
echo "=== Ingress ===" && kubectl get ingress -n langsmith
echo "=== Helm ===" && helm status langsmith -n langsmith 2>/dev/null | grep -E "STATUS|LAST DEPLOYED"
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>