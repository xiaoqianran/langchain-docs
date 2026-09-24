<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring your own IAM roles (AWS) | https://docs.langchain.com/langsmith/byoc-byoiam -->

# 引入您自己的 IAM 角色 (AWS)

自带 IAM (BYOIAM) 可让您创建和管理 LangSmith BYOC 数据平面使用的 AWS IAM 资源。您可以控制角色、策略和权限边界，而 LangChain 使用这些资源配置和操作数据平面。

如果您希望LangChain管理IAM资源，请遵循标准[BYOC onboarding guide](/langsmith/byoc-onboarding)。

## 开始之前

完成 [BYOC prerequisites](/langsmith/byoc#prerequisites) 以拥有 LangSmith 组织，并启用 BYOC。

## 创建 IAM 资源

[⟦T1⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byoiam) 创建共享数据平面角色、策略和 Karpenter 实例配置文件。对于使用这些角色的所有区域和数据平面，每个 AWS 账户应用一次。

要创建 IAM 资源：1. 为您计划部署数据平面的账户配置 AWS 提供商。
2. 将模块添加到您的 Terraform 配置中。将`regions`设置为角色需要操作的[supported AWS regions](/langsmith/byoc#regions-and-cloud-providers)。
3. （可选）将 `permissions_boundary_arn` 设置为 IAM 权限边界策略的 ARN。该模块将其应用于它创建的所有角色，服务相关角色除外。
4. 使用 `service_linked_roles_to_create` 创建缺失的服务相关角色。默认情况下不会创建任何内容。忽略现有角色，或先将它们导入 Terraform。
5. 初始化 Terraform，查看计划并将其应用到您的帐户中。

以下配置为两个区域创建共享 IAM 资源：

```hcl
module "byoiam" {
  source = "github.com/langchain-ai/terraform//modules/byoc/aws/byoiam?ref=main"

  regions = ["us-east-1", "us-west-1"]
}
```

## 从配置角色中删除 IAM 管理权限

[⟦T5⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 创建跨账户角色 LangChain 负责管理您的数据平面。

创建 IAM 资源后，配置预配角色：1. 使用 **设置 > 数据平面** 中 **数据平面** 标题旁边的按钮复制外部 ID。将其作为 `external_id` 传递给角色模块。角色的信任策略必须在其 `ExternalId` 条件下使用此值。
2. 在 `langsmith-byoc-role` 模块配置中设置 `allow_iam_management_permissions = false`。
3. 检查并应用 Terraform 更改。保留 `crossplane_role_arn` 输出以用于数据平面创建。

设置 `allow_iam_management_permissions = false` 会更改角色的权限：

- **删除**：IAM 创建、修改和删除权限，包括服务相关角色创建。
- **保留**：IAM 读取权限，范围为 `iam:PassRole` 和 `iam:SimulatePrincipalPolicy`，以使用和验证您的现有资源。

启用 `allow_delete_permissions` 不会恢复 IAM 管理权限。

如果您还想要 [bring your own VPC](/langsmith/byoc-byovpc)，请设置 `allow_vpc_creation_permissions = false` 并在 `vpc_ids` 中提供 VPC ID。

## 使用现有角色部署数据平面

<Warning>
您必须使用 [⟦T17⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byoiam) 创建 LangSmith 所需的确切 IAM 角色。 LangSmith 在部署数据平面之前对这些 IAM 资源执行广泛的验证。
</Warning>

**使用现有 IAM 角色** 复选框将数据平面配置为使用您创建的 IAM 资源。

部署数据平面：1. 转到 **设置 > 数据平面** 并创建数据平面。
2. 提供[BYOC onboarding](/langsmith/byoc-onboarding) 中所述的名称、AWS 区域、网络配置和负载均衡器访问权限。选择模块的 `regions` 输入中包含的区域。
3. 使用 **AWS IAM 角色 ARN** 的预配角色的 `crossplane_role_arn` 输出。
4. 在提交请求之前选择**使用现有 IAM 角色**。

继续在入门指南中进行配置和专用连接。

## 另请参阅

- [BYOC onboarding](/langsmith/byoc-onboarding)
- [Bring your own VPC on AWS](/langsmith/byoc-byovpc)
- [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-byoiam.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>