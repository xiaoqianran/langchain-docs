<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring your own keys (CMK) | https://docs.langchain.com/langsmith/byoc-byok-aws -->

# 带上你自己的密钥 (CMK)

使用您自己的 AWS KMS 密钥对 AWS 上的新 LangSmith BYOC 数据平面进行加密，对每项服务使用一个密钥或对每个服务使用单独的密钥。

默认情况下，AWS 管理的密钥会静态加密 [BYOC](/langsmith/byoc) [data plane](/langsmith/byoc-architecture-aws#control-plane-and-data-plane-model)。您可以使用自己的对称[AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#kms_keys)对其进行加密，对每个服务使用一个密钥或每个服务使用单独的密钥：

|服务 |密钥加密什么 |
| - | - |
| `s3` |数据平面的 S3 存储桶。 |
| `ebs` |节点卷。 |
| `eks` | EKS 集群中的 Kubernetes 机密。 |
| `rds` | RDS 存储、RDS 主用户机密和 Performance Insights 数据。 |
| `elasticache` |静态 ElastiCache 数据。 |

## 要求和限制

* 每项服务都是可选的。没有密钥的服务可以保留 AWS 托管的加密。
* 密钥必须是数据平面区域中的对称加密密钥。它们可以位于数据平面账户或另一个 AWS 账户中。
* 您在创建数据平面时设置密钥。密钥无法添加到现有数据平面。
* 创建后，`ebs`、`eks`、`rds`、`elasticache`键不能更改。要更改 `s3` 密钥，请联系 LangChain 团队。> [!警告]
>
> 如果禁用或删除某个密钥，则使用该密钥的每个服务都会停止工作。使用已删除的密钥加密的数据无法恢复。

## 准备密钥

在创建数据平面之前，请准备好密钥：

1. 在 [⟦T13⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys) 中，将 `cmk_service_key_arns` 设置为每个服务的密钥 ARN。要为每项服务使用一个密钥，请为每项服务设置相同的密钥 ARN。对于 [BYOIAM](/langsmith/byoc-byoiam-aws)，也将其设置在 BYOIAM 模块中。
2. 按照[module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys)的描述更新关键策略。 `ebs` 密钥策略必须允许 Auto Scaling 服务相关角色。 LangSmith管理VPC时，`s3`密钥策略必须允许VPC流日志投递。

另一个 AWS 账户中的密钥还需要允许预配角色和每个 BYOIAM 角色的密钥策略声明。另一个账户中的 `ebs` 密钥也需要为 Auto Scaling 服务相关角色授予授权，该角色是从数据平面账户创建的，如 [module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role#customer-managed-kms-keys) 所描述。 LangSmith 无法读取另一个账户中密钥的策略，因此在创建数据平面之前请确保策略完整。

## 创建数据平面时设置键在 UI 中，创建数据平面时，打开 **配置** 下的 **加密密钥**。选择 **一个密钥用于所有服务** 或 **每个服务一个密钥**，然后输入密钥 ARN。

通过 API，将 `customer_managed_keys` 包含在 [create data plane request](/langsmith/smith-api/data_planes/create-a-new-data-plane) 的正文中，以及其他必填字段。它需要两个字段：

* **`key_arn`**：每个服务的关键 ARN。
* **`service_key_arns`**：一个对象，其键是服务名称，其值是键 ARN。

```json One key for all services theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "customer_managed_keys": {
    "key_arn": "arn:aws:kms:us-east-1:123456789012:key/mrk-aaaa1111bbbb2222cccc3333dddd4444"
  }
}
```

```json A key per service theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "customer_managed_keys": {
    "service_key_arns": {
      "s3": "arn:aws:kms:us-east-1:123456789012:key/mrk-aaaa1111bbbb2222cccc3333dddd4444",
      "ebs": "arn:aws:kms:us-east-1:123456789012:key/mrk-bbbb2222cccc3333dddd4444eeee5555",
      "eks": "arn:aws:kms:us-east-1:123456789012:key/mrk-cccc3333dddd4444eeee5555ffff6666",
      "rds": "arn:aws:kms:us-east-1:123456789012:key/mrk-dddd4444eeee5555ffff666677778888",
      "elasticache": "arn:aws:kms:us-east-1:123456789012:key/mrk-eeee5555ffff66667777888899990000"
    }
  }
}
```

```json A default key with an override theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "customer_managed_keys": {
    "key_arn": "arn:aws:kms:us-east-1:123456789012:key/mrk-aaaa1111bbbb2222cccc3333dddd4444",
    "service_key_arns": {
      "rds": "arn:aws:kms:us-east-1:123456789012:key/mrk-dddd4444eeee5555ffff666677778888"
    }
  }
}
```

设置 `key_arn`、`service_key_arns` 或两者。 `service_key_arns` 中的密钥会覆盖 `key_arn` 的服务。如果没有 `key_arn`，`service_key_arns` 未列出的服务将保留 AWS 托管加密。

## LangSmith 如何验证密钥

在创建数据平面之前，LangSmith 检查每个键：

* 该密钥存在并且已启用。
* 密钥是对称加密密钥。
* 配置角色可以使用密钥。

对于数据平面账户中的密钥，LangSmith还检查两个关键策略：

* `ebs` 密钥策略允许 Auto Scaling 服务相关角色。
* LangSmith管理VPC时，`s3`密钥策略允许VPC流日志投递。

LangSmith 不检查另一个帐户中密钥的策略。

## 另请参阅

* [BYOC onboarding](/langsmith/byoc-onboarding-aws)
* [BYOC architecture](/langsmith/byoc-architecture-aws)
* [Bring your own IAM roles](/langsmith/byoc-byoiam-aws)
* [Bring your own VPC](/langsmith/byoc-byovpc-aws)
* [Create a new data plane API reference](/langsmith/smith-api/data_planes/create-a-new-data-plane)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-byok-aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。