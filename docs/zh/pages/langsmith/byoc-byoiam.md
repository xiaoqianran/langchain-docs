<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring your own IAM roles (AWS) | https://docs.langchain.com/langsmith/byoc-byoiam -->

# 引入您自己的 IAM 角色 (AWS)

为 LangSmith BYOC 创建客户管理的 IAM 角色，从预配角色中删除 IAM 管理权限，并使用现有角色进行部署。

自带 IAM (BYOIAM) 可让您创建和管理 LangSmith BYOC 数据平面使用的 AWS IAM 资源。您可以控制角色、策略和权限边界，而 LangChain 使用这些资源配置和操作数据平面。

如果您希望LangChain管理IAM资源，请遵循标准[BYOC onboarding guide](/langsmith/byoc-onboarding)。

## 开始之前

完成 [BYOC prerequisites](/langsmith/byoc#prerequisites) 以拥有 LangSmith 组织，并启用 BYOC。

## 创建 IAM 资源

[⟦T3⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byoiam) 创建共享数据平面角色、策略和 Karpenter 实例配置文件。对于使用这些角色的所有区域和数据平面，每个 AWS 账户应用一次。

要创建 IAM 资源：1. 为您计划部署数据平面的账户配置 AWS 提供商。
2. 将模块添加到您的 Terraform 配置中。将`regions`设置为角色需要操作的[supported AWS regions](/langsmith/byoc#regions-and-cloud-providers)。
3. （可选）将 `permissions_boundary_arn` 设置为 IAM 权限边界策略的 ARN。该模块将其应用于它创建的所有角色，服务相关角色除外。
4. 使用 `service_linked_roles_to_create` 创建缺失的服务相关角色。默认情况下不会创建任何内容。忽略现有角色，或先将它们导入 Terraform。
5. 初始化 Terraform，查看计划并将其应用到您的帐户中。

以下配置为两个区域创建共享 IAM 资源：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
module "byoiam" {
  source = "github.com/langchain-ai/terraform//modules/byoc/aws/byoiam?ref=main"

  regions = ["us-east-1", "us-west-1"]
}
```

### 使用自定义 IAM 名称

默认情况下，模块使用 `byoc-smith-` 前缀命名其资源。如果您的组织强制实施 IAM 命名约定（例如强制前缀），请使用以下输入覆盖名称：

* **`role_names`**：自定义角色名称的映射，按角色用途键入。键与模块的 `role_names` 输出相匹配，例如 `eks-cluster-role` 或 `workload-iam-role`。您省略的角色保留其默认名称。
* **`karpenter_instance_profile_name`**：Karpenter 节点实例配置文件的自定义名称。
* **`karpenter_controller_policy_name`**：Karpenter 控制器策略的自定义名称。每个角色名称必须是唯一的，且最多 64 个字符。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
module "byoiam" {
  source = "github.com/langchain-ai/terraform//modules/byoc/aws/byoiam?ref=main"

  regions                  = ["us-east-1"]
  permissions_boundary_arn = "arn:aws:iam::<account-id>:policy/<boundary>"
  role_names = {
    eks-cluster-role                  = "ACME-langsmith-eks-cluster"
    eks-node-role                     = "ACME-langsmith-eks-node"
    ebs-csi-role                      = "ACME-langsmith-ebs-csi"
    karpenter-node-role               = "ACME-langsmith-karpenter-node"
    karpenter-controller-role         = "ACME-langsmith-karpenter-controller"
    postgres-monitoring-role          = "ACME-langsmith-postgres-monitoring"
    smithdb-metastore-monitoring-role = "ACME-langsmith-smithdb-metastore-monitoring"
    workload-iam-role                 = "ACME-langsmith-workload"
    postgres-setup-iam-role           = "ACME-langsmith-postgres-setup"
    smithdb-iam-role                  = "ACME-langsmith-smithdb"
    smithdb-setup-iam-role            = "ACME-langsmith-smithdb-setup"
    external-secrets-iam-role         = "ACME-langsmith-external-secrets"
    lbc-role                          = "ACME-langsmith-lbc"
    clickhouse-backup-iam-role        = "ACME-langsmith-clickhouse-backup"
    privatelink-lambda-role           = "ACME-langsmith-privatelink-lambda"
    juicefs-csi-iam-role              = "ACME-langsmith-juicefs-csi"
  }
  karpenter_instance_profile_name  = "ACME-langsmith-karpenter-node"
  karpenter_controller_policy_name = "ACME-langsmith-karpenter-controller"
}
```

保留 `module.byoiam.role_names` 和 `module.byoiam.karpenter_instance_profile_name` 输出。当您[create the data plane](#deploy-the-data-plane-with-existing-roles)时，您可以将它们粘贴到数据平面表单中。您不要将 Karpenter 控制器策略名称粘贴到 LangSmith 中。

## 从配置角色中删除 IAM 管理权限

[⟦T16⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 创建跨账户角色 LangChain 负责管理您的数据平面。

创建 IAM 资源后，配置预配角色：

1. 使用 **设置 > 数据平面** 中 **数据平面** 标题旁边的按钮复制外部 ID。将其作为 `external_id` 传递给角色模块。角色的信任策略必须在其 `ExternalId` 条件下使用此值。

2. 在 `langsmith-byoc-role` 模块配置中设置 `allow_iam_management_permissions = false`。

3. 将您在 [Create the IAM resources](#create-the-iam-resources) 中应用的 `byoiam` 模块的输出传递到角色模块：

   ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   module "langsmith_byoc_role" {
     # ... other inputs ...

     # Outputs from the byoiam module
     byoiam_role_arns                       = values(module.byoiam.role_arns)
     byoiam_instance_profile_name           = module.byoiam.karpenter_instance_profile_name
     byoiam_karpenter_controller_policy_arn = module.byoiam.karpenter_controller_policy_arn
   }
   ```

4. 检查并应用 Terraform 更改。保留用于数据平面创建的`crossplane_role_arn`输出。

配置角色的默认权限仅与默认的 `byoc-smith-` 名称匹配。对于 [custom IAM names](#use-custom-iam-names)，需要这些输入。它们授予对确切 ARN 的读取和`iam:PassRole` 访问权限。使用默认名称，它们是多余的但无害的。
设置 `allow_iam_management_permissions = false` 会更改角色的权限：* **删除**：IAM 创建、修改和删除权限，包括服务相关角色创建。
* **保留**：IAM 读取权限，范围为 `iam:PassRole` 和 `iam:SimulatePrincipalPolicy`，以使用和验证您的现有资源。

启用 `allow_delete_permissions` 不会恢复 IAM 管理权限。

如果您还想要 [bring your own VPC](/langsmith/byoc-byovpc)，请设置 `allow_vpc_creation_permissions = false` 并在 `vpc_ids` 中提供 VPC ID。

## 使用现有角色部署数据平面

> [!警告]
>
> 您必须使用 [⟦T31⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byoiam) 创建 LangSmith 所需的确切 IAM 角色。 LangSmith 在部署数据平面之前对这些 IAM 资源执行广泛的验证。

**使用现有 IAM 角色** 复选框将数据平面配置为使用您创建的 IAM 资源。

部署数据平面：

1. 转到 **设置 > 数据平面** 并创建数据平面。
2. 提供[BYOC onboarding](/langsmith/byoc-onboarding) 中所述的名称、AWS 区域、网络配置和负载均衡器访问权限。选择模块的 `regions` 输入中包含的区域。
3. 使用 **AWS IAM 角色 ARN** 的预配角色的 `crossplane_role_arn` 输出。
4. 选择**使用现有 IAM 角色**。
5. 如果设置 [custom IAM names](#use-custom-iam-names)，请将 `module.byoiam.role_names` 和 `module.byoiam.karpenter_instance_profile_name` 的值粘贴到数据平面表单中。
6. 提交请求。继续在入门指南中进行配置和专用连接。

## 另请参阅

* [BYOC onboarding](/langsmith/byoc-onboarding)
* [Bring your own VPC on AWS](/langsmith/byoc-byovpc)
* [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-byoiam.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。