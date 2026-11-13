<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring your own keys (CMK) | https://docs.langchain.com/langsmith/byoc-byok-aws -->

# 带上你自己的密钥 (CMK)

使用您自己的 AWS KMS 密钥对 AWS 上的新 LangSmith BYOC 数据平面进行加密，对每项服务使用一个密钥或对每个服务使用单独的密钥。

默认情况下，AWS 管理的密钥会对静态数据平面进行加密。您可以使用自己的对称 [AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#kms_keys)，在创建数据平面时设置：

|服务 |密钥加密什么 |
| - | - |
| `s3` |数据平面的 S3 存储桶。 |
| `ebs` |节点卷。 |
| `eks` | EKS 集群中的 Kubernetes 机密。 |
| `rds` | RDS 存储、RDS 主用户机密和 Performance Insights 数据。 |
| `elasticache` |静态 ElastiCache 数据。 |

> [!注意]
>
> 一把密钥可以加密每一项服务。在 UI 中，选择 **一键用于所有服务**。在 Terraform 中，为 `cmk_service_key_arns` 中的每个服务设置相同的密钥 ARN。您还可以为每个服务使用单独的密钥。

每项服务都是可选的：没有密钥的服务保留 AWS 管理的加密。密钥必须位于数据平面区域中。它们可以位于数据平面账户或另一个 AWS 账户中。

密钥无法添加到现有数据平面。创建后，`ebs`、`eks`、`rds`、`elasticache` 键不能更改。要更改 `s3` 密钥，请联系 LangChain 团队。

要设置按键：1. 在 [⟦T11⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys) 中，将 `cmk_service_key_arns` 设置为每个服务的密钥 ARN。对于 [BYOIAM](/langsmith/byoc-byoiam-aws)，也将其设置在 BYOIAM 模块中。
2. 按照[module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys)的描述更新关键策略。 `ebs` 密钥策略必须允许 Auto Scaling 服务相关角色。 LangSmith管理VPC时，`s3`密钥策略必须允许VPC流日志投递。
3. 创建数据平面时，打开 **配置** 下的 **加密密钥** 并输入密钥 ARN。通过 API，为每个服务设置 `customer_managed_keys.key_arn`，或为每个服务设置 `customer_managed_keys.service_key_arns`。

在创建数据平面之前，LangSmith 检查每个密钥是否存在并已启用，以及配置角色是否可以使用它。对于数据平面帐户中的密钥，LangSmith 还会检查 `ebs` 和 `s3` 密钥策略是否允许这些主体。

另一个 AWS 账户中的密钥还需要允许预配角色和每个 BYOIAM 角色的密钥策略声明。另一个账户中的 `ebs` 密钥还需要为 Auto Scaling 服务相关角色授予授权，该角色是从数据平面账户创建的，如 [module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys) 所描述。 LangSmith 无法读取另一个账户中密钥的策略，因此在创建数据平面之前请确保策略完整。> [!警告]
>
> 如果禁用或删除某个密钥，则使用该密钥的每个服务都会停止工作。使用已删除的密钥加密的数据无法恢复。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-byok-aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。