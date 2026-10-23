<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform troubleshooting | https://docs.langchain.com/langsmith/self-host-terraform-aws-troubleshooting -->

# AWS Terraform 故障排除

在使用 LangChain Terraform 模块部署的 AWS EKS 上自托管的 LangSmith 的常见问题、修复和诊断命令。

本页面记录了使用 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 配置的 LangSmith 部署的常见问题、修复和诊断命令。

> [!提示]
>
> 升级之前，请查看 [LangSmith self-hosted changelog](/langsmith/self-hosted-changelog) 以了解重大更改和所需的变量更新。在运行任何 `kubectl` 命令之前，从 `modules/aws/` 或 `aws eks update-kubeconfig --region <region> --name <cluster-name>` 运行 `source infra/scripts/set-kubeconfig.sh`。

有关本页中使用的 `kubectl`、`helm` 和 `aws` 调用的复制粘贴参考，请跳至 [Diagnostic commands](#diagnostic-commands)。

## 自动诊断

在运行单独的命令之前，请尝试捆绑的脚本：

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

**原因：** 当节点组创建开始时，EKS 控制平面尚未完全激活。中断应用后常见。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks wait cluster-active --name <cluster-name> --region <region>

aws eks describe-nodegroup \
  --cluster-name <cluster-name> \
  --nodegroup-name <nodegroup-name> \
  --region <region> \
  --query "nodegroup.health"

make apply
```

### kubectl 失败：“您必须登录到服务器”

**症状：** 所有 `kubectl` 命令均失败并显示 `error: You must be logged in to the server (Unauthorized)`。

**原因：** kubeconfig 已过时，AWS 凭证与创建集群的凭证不同，或者令牌已过期。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks update-kubeconfig --region <region> --name <cluster-name>
kubectl cluster-info

aws sts get-caller-identity
```如果集群是使用不同的 IAM 主体创建的，请通过 EKS 访问条目授予访问权限，这就是模块管理集群访问的方式。让集群创建者或其他集群管理员运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws eks create-access-entry \
  --cluster-name <cluster-name> \
  --principal-arn <iam-role-or-user-arn> \
  --region <region>

aws eks associate-access-policy \
  --cluster-name <cluster-name> \
  --principal-arn <iam-role-or-user-arn> \
  --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
  --access-scope type=cluster \
  --region <region>
```

### 安装 Helm 后未创建 ALB

此条目适用于经典 ALB 入口模式（`enable_envoy_gateway = false`，没有其他网关）。在默认的 Envoy 网关模式下，预计会有一个空的 `kubectl get ingress`：Terraform 管理的 ALB 通过 `TargetGroupBinding` 转发到 Envoy。请检查 `make status` 和 `kubectl get gateway,httproute -n langsmith`。

**症状：** 几分钟后`kubectl get ingress -n langsmith` 显示无地址。

**原因：** AWS 负载均衡器控制器未运行或缺少 IRSA 权限，或设置了`alb_scheme = "internal"`（内部 ALB 没有公共地址；请参阅[ALB has no public address](#alb-has-no-public-address-internal-scheme)）。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n kube-system | grep aws-load-balancer
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail=50
kubectl get sa -n kube-system aws-load-balancer-controller -o yaml | grep eks.amazonaws.com

kubectl get ingress -n langsmith \
  -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'
aws elbv2 describe-load-balancers --query "LoadBalancers[?DNSName=='<alb-dns-name>'].State"
```

### EKS Pod 拒绝 RDS 连接

**症状：** 后端日志显示 RDS 端点的 `connection refused` 或 `timeout`。

**原因：** RDS 安全组不允许来自 VPC CIDR 的入站 TCP 5432。模块的安全组允许VPC CIDR。设置 `postgres_existing_security_group_id` 后，Terraform 不会管理规则，因此您的安全组必须允许它。

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
make apply ARGS="-target=module.postgres"
```### pod 拒绝 S3 访问（未配置 IRSA）

**症状：** 读取或写入 S3 时，后端日志显示`AccessDenied`。

**原因：** 组件服务帐户中缺少 IRSA 注释，或者 S3 VPC 网关端点未正确路由。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get sa -n langsmith -o yaml | grep eks.amazonaws.com

aws ec2 describe-vpc-endpoints \
  --filters "Name=service-name,Values=com.amazonaws.<region>.s3" \
  --query "VpcEndpoints[].State"

# Run the test pod as an annotated service account; other service accounts have no AWS credentials
kubectl run s3-test --rm -it --image=amazon/aws-cli -n langsmith \
  --overrides='{"spec":{"serviceAccountName":"<annotated-service-account>"}}' -- \
  s3 ls s3://<bucket-name>
```

`make init-values` 注释每个组件的服务帐户（后端、平台后端、队列、摄取队列、游乐场和 LangSmith 部署服务）。如果注释缺失，请验证`terraform.tfvars`中的`create_langsmith_irsa_role = true`，然后运行`make init-values && make deploy`。

### ElastiCache Redis 连接超时

**症状：** Pod 无法连接到 Redis。日志显示`dial tcp: i/o timeout`。

**原因：** ElastiCache 安全组不允许来自 VPC CIDR 的入站 TCP 6379。模块的安全组允许VPC CIDR；设置 `redis_existing_security_group_id` 后，您的安全组必须允许它。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws elasticache describe-cache-clusters \
  --cache-cluster-id <cluster-id> \
  --query "CacheClusters[0].SecurityGroups"

kubectl run redis-test --rm -it --image=redis:7 -n langsmith -- \
  redis-cli --tls -h <elasticache-endpoint> -a <auth-token> ping
```

ElastiCache 已启用传输加密，因此`redis-cli` 需要`--tls`。

### 图像在没有互联网出口的 VPC 中拉出超时

**症状：** Pod 停留在 `ImagePullBackOff` 或 `ErrImagePull`。从 `<account-id>.dkr.ecr.<region>.amazonaws.com` 拉出时，`kubectl describe pod` 显示 `dial tcp <ip>:443: i/o timeout`。**原因：** 该模块仅在 VPC 中创建 S3 网关终端节点，没有 ECR 接口终端节点。该模块创建的VPC通过NAT网关发送出口。没有 NAT 网关的自带 VPC (`create_vpc = false`) 不会为节点提供通往 ECR API 和注册表的路由。

**修复：** 在启用了私有 DNS 的私有子网中创建 `ecr.api` 和 `ecr.dkr` 接口终端节点，位于允许来自 VPC CIDR 的 TCP 443 的安全组后面。通过现有网关端点从 S3 下载图像层。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws ec2 create-security-group --group-name <name>-ecr-endpoints \
  --description "ECR interface endpoints" --vpc-id <vpc-id> --region <region>
aws ec2 authorize-security-group-ingress --group-id <endpoint-sg-id> \
  --protocol tcp --port 443 --cidr <vpc-cidr> --region <region>
aws ec2 create-vpc-endpoint --vpc-id <vpc-id> --vpc-endpoint-type Interface \
  --service-name com.amazonaws.<region>.ecr.api --subnet-ids <private-subnet-ids> \
  --security-group-ids <endpoint-sg-id> --private-dns-enabled --region <region>
aws ec2 create-vpc-endpoint --vpc-id <vpc-id> --vpc-endpoint-type Interface \
  --service-name com.amazonaws.<region>.ecr.dkr --subnet-ids <private-subnet-ids> \
  --security-group-ids <endpoint-sg-id> --private-dns-enabled --region <region>
```

在 ECR 外部托管的映像仍然需要出口或私有 ECR 存储库中的副本。

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
```**修复：** 在`terraform.tfvars`中禁用删除保护，应用，然后销毁：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
postgres_deletion_protection          = false
smithdb_metastore_deletion_protection = false   # only if SmithDB is enabled
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/setup-env.sh
make apply
make destroy
make purge-secrets
make clean
```

如果您尚未卸载LangSmith，请先运行`make uninstall`，然后再运行`make destroy`。有关完整序列，请参阅[Teardown](/langsmith/self-host-terraform-aws-quick-reference#teardown)。

RDS 拍摄名为 `<identifier>-final` 的最终快照，除非 `postgres_skip_final_snapshot = true`。启用 SmithDB 后，元存储 RDS 还会获取 `-final` 快照，除非 `smithdb_metastore_skip_final_snapshot = true`。当该快照存在时，重复销毁失败并显示`DBSnapshotAlreadyExists`；删除旧快照或设置`postgres_skip_final_snapshot = true`。

### ESO 无法同步：langsmith-config 密钥丢失

**症状：** Pod 卡在 `CreateContainerConfigError` 中。 `kubectl get secret langsmith-config -n langsmith` 返回`NotFound`。

**原因：** ESO 同步要么全有要么全无。如果 `ExternalSecret` 引用的任何单个 SSM 参数丢失，ESO 将拒绝创建 Kubernetes Secret。所有 pod 都会失败，包括那些与缺失参数无关的 pod。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get externalsecret langsmith-config -n langsmith
kubectl describe externalsecret langsmith-config -n langsmith

./infra/scripts/manage-ssm.sh validate
./infra/scripts/manage-ssm.sh list

source ./infra/scripts/setup-env.sh
make apply-eso
```

`validate` 不检查 `langsmith-admin-email`，而 `ExternalSecret` 总是需要它，并且将 `sandbox-callback-signing-jwk` 视为可选，尽管在 `enable_sandboxes = true` 时它是必需的。确认 `list` 输出中的两个密钥。

`describe` 输出显示哪个 `remoteRef.key` 失败。将其与 SSM 前缀 `/langsmith/{name_prefix}-{environment}/` 进行匹配。

### SSM 参数前缀不匹配

**症状：** `manage-ssm.sh validate` 通过，但 ESO 仍然无法同步。或者 `setup-env.sh` 使用与 ESO 预期不同的前缀写入参数。**原因：** SSM前缀源自`terraform.tfvars`中的`name_prefix`和`environment`。如果这些在初始设置后发生更改，旧参数将保留在旧前缀下，而 ESO 将在新前缀下查找。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get externalsecret langsmith-config -n langsmith -o yaml | grep 'key:'

./infra/scripts/manage-ssm.sh list

# Preview the copy, then re-run without --dry-run (add --delete-old to remove the old parameters)
./infra/scripts/migrate-ssm.sh --old-prefix /langsmith/<old-name-prefix>-<old-environment> --dry-run
```

在 `v0.17.0` 和 `v0.16.*` 模块版本中，`migrate-ssm.sh` 中的 Live Copy 失败：其 `put-parameter` 调用会传递 `--output none`，而 AWS CLI 会拒绝该`--output none`，因此每个参数都会报告 `FAILED`。在 bash 4.1 或更高版本上，脚本也可以在第一个参数后退出。使用 `--dry-run` 列出密钥，然后使用 AWS CLI 复制每个密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OLD=/langsmith/<old-name-prefix>-<old-environment>
NEW=/langsmith/<name_prefix>-<environment>
for key in <key-1> <key-2>; do
  aws ssm put-parameter --region <region> --type SecureString --overwrite \
    --name "$NEW/$key" \
    --value "$(aws ssm get-parameter --region <region> --name "$OLD/$key" \
      --with-decryption --query Parameter.Value --output text)" >/dev/null
done
```

> [!警告]
>
> 切勿更改现有部署上的 `name_prefix` 或 `environment`。

### Postgres 密码被 Terraform 验证拒绝

**症状**

```
Error: Invalid value for variable "postgres_password"
RDS master password must be 8-128 characters and must not contain '/', '@', '"', single quotes, or spaces.
```

**原因：** 密码短于 8 个字符或长于 128 个字符，或包含 RDS 主密码中不允许的字符。

**修复：** 生成不带限制字符的密码。 `setup-env.sh` 自动生成合规密码。要替换无效值，请首先取消设置导出的变量，因为 `setup-env.sh` 保留已设置的 `TF_VAR_postgres_password`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./infra/scripts/manage-ssm.sh set postgres-password "$(openssl rand -hex 32)"
unset TF_VAR_postgres_password
source ./infra/scripts/setup-env.sh
make apply
kubectl rollout restart deployment -n langsmith
```Run a full `make apply`, not `-target=module.postgres`: the target skips the `langsmith-postgres` Secret, so RDS and LangSmith would hold different passwords. Skip the restart on a new deployment that has no running pods.

### Private EKS cluster unreachable (bastion required)

**现象：** 当`enable_public_eks_cluster = false`时，`kubectl`和`terraform apply`超时。

**原因：** EKS API 端点是私有的。 Commands must run from within the VPC, either via the bastion host or a VPN connection.

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# If the bastion was provisioned (create_bastion = true)
aws ssm start-session --target <bastion-instance-id>

# From the bastion
aws eks update-kubeconfig --region <region> --name <cluster-name>
kubectl get nodes
```

If no bastion was provisioned, set `create_bastion = true` and re-apply, or temporarily set `enable_public_eks_cluster = true`.

### ALB没有公共地址（内部方案）

**症状：** `make status` 或 `make tf ARGS="output alb_dns_name"` 中的 ALB 主机名以 `internal-` 开头，并且仅在 VPC 内解析。

**原因：** `alb_scheme = "internal"` 设置为 `terraform.tfvars`。内部 ALB 只能从 VPC 内部访问（VPN、对等互连或 PrivateLink）。

**修复：** 专用于私有部署。要使 ALB 可供公众访问：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
alb_scheme = "internet-facing"
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values
make deploy
```

With `create_vpc = false`, an internet-facing ALB also needs `public_subnets`.

### ALB hostname changed after ingress recreation

此条目适用于经典 ALB 入口模式，其中 ALB 控制器拥有 ALB。在该模式下，`alb_dns_name`指的是未使用的 Terraform 管理的 ALB。**症状：** LangSmith URL 停止工作。代理部署陷入`DEPLOYING`。 DNS 记录或书签指向不再解析的旧 ALB 主机名。

**原因：** 删除 Kubernetes 入口（通过 `helm uninstall`、`kubectl delete ingress` 或命名空间删除）会取消配置 ALB。重新创建入口时，会发出具有不同主机名的新 ALB。 Helm 值中的 `config.deployment.url` 仍然指向旧主机名，因此操作员的运行状况检查失败并且部署陷入困境。

**预防**

* 保留`init-values.sh`在入口处设置的`group.name`注释。
* 除非您计划更新所有与主机名相关的配置，否则不要删除入口。
* 在 Helm 4 上，避免使用 `helm rollback`，而不使用 `--server-side=false`。入口 SSA 冲突可能会触发删除/重新创建周期。

**修复**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Check what hostname the ingress currently has
kubectl get ingress langsmith-ingress -n langsmith \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# 2. Redeploy: deploy detects the live hostname, updates the values file, and re-upgrades
make deploy
```

当`langsmith_domain`设置时，`make deploy`不会重写主机名；将 DNS 记录更新为新的 ALB。

### Chart v16 沙箱值被拒绝

**症状：** `make deploy` 退出并显示 `ERROR: langsmith-values-overrides.yaml carries sandboxes.juicefs.csi, the chart 0.16 sandbox schema.`

**原因：** 值文件是由 `v0.16.*` 模块版本生成的。 Chart v17 没有 JuiceFS CSI 驱动程序并忽略 `sandboxes.juicefs.csi` 块。

**修复：** 重新生成图表 v17 架构中的值，然后重新部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

### 部署在图表 v16 JuiceFS 卷上停止**症状：** `make deploy` 退出时，先执行 `ERROR: namespace langsmith still mounts sandbox volumes through the chart 0.16 JuiceFS CSI driver.`，然后执行 `kubectl delete` 命令。

**原因：** Chart v17 删除了 JuiceFS CSI 驱动程序。在仍然安装图表 v16 沙箱卷的情况下进行升级会使旧的 `sandbox-host` Pod 陷入`Terminating`，因此 `deploy.sh` 在升级之前停止。

**修复：** 在驱动程序仍在运行时运行打印的 `kubectl delete` 命令。等到只剩下 `juicefs-csi-*` Pod，然后重新部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep juicefs
make deploy
```

正在运行的沙箱在排水期间停止。他们的数据保留在 S3 和 Redis 中，chart v17 挂载相同的 JuiceFS 卷。

### Chart v15 值文件被拒绝

**症状：** `make deploy` 退出，并显示 `ERROR: these values files use the chart 0.15 schema, which chart 0.16 rejects:`，后跟文件列表。

**原因：** Chart v16 删除了 `config.insights`、`config.polly` 和 `backend.agentBootstrap`。 `make init-values` 仅在附加值文件丢失时才创建这些文件，因此图表 v15 上生成的文件在升级后仍然存在。

**修复：** 从`helm/values/`删除列出的文件，然后重新生成并重新部署：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

### setup-env.sh 在没有 AWS 凭证的情况下运行

**现象：** 获取`setup-env.sh`后，`make secrets`各参数显示为`✗ MISSING`，`aws sts get-caller-identity`失败。

**原因：** 没有有效的 AWS 凭证。该脚本仍然导出 `TF_VAR_*` 并仅打印警告。**修复：** 登录，然后在同一 shell 中重新获取脚本。它将导出的值回填到 SSM，而不会再次提示。首先运行 `make preflight` 来捕获它。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws sso login --profile <profile>
export AWS_PROFILE=<profile>
aws sts get-caller-identity
source infra/scripts/setup-env.sh
```

如果没有 SSM 访问权限，该脚本还会在 `infra/` 中写入明文后备文件：`.pg_password`、`.api_key_salt`、`.jwt_secret`、`.license_key` 和 `.admin_password`。一旦`make secrets`显示SSM中的每个参数，就删除它们。

### Terraform 未应用节点组缩放更改

**症状：** 在 `terraform.tfvars` 中更改 `min_size` 或 `max_size` 在 `terraform plan` 上显示“无更改”。

**原因：** ASG 已在带外更改（AWS CLI、控制台或集群自动缩放程序），并且 Terraform 状态已反映新值。社区 EKS 模块忽略 `desired_size` 更改，以便自动缩放器可以对其进行管理； `min_size` 和 `max_size` 应正常传播。

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
# Default Envoy Gateway mode
kubectl get gateway,httproute -n langsmith
kubectl get targetgroupbinding -A

# Classic ALB Ingress mode
kubectl get ingress -n langsmith
kubectl describe ingress -n langsmith
aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(LoadBalancerName, '<name_prefix>-<environment>')]"
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
kubectl get sa -n langsmith -o yaml | grep eks.amazonaws.com
make tf ARGS="output langsmith_irsa_role_arn"
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
echo "=== Routes ===" && kubectl get gateway,httproute,ingress -n langsmith
echo "=== Helm ===" && helm status langsmith -n langsmith 2>/dev/null | grep -E "STATUS|LAST DEPLOYED"
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。