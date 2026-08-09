<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable blob storage | https://docs.langchain.com/langsmith/self-host-blob-storage -->

# 启用 blob 存储

默认情况下，LangSmith 在 ClickHouse 中存储运行输入、输出、错误、清单、额外内容和事件。如果您选择这样做，则可以将此信息存储在 Blob 存储中，这有几个显着的好处。为了在生产部署中获得最佳结果，我们**强烈**建议使用 blob 存储，它具有以下优点：

1. 在高跟踪环境中，输入、输出、错误、清单、额外内容和事件可能会使数据库的大小膨胀。
2. 如果使用 LangSmith Managed ClickHouse，您可能需要驻留在您环境中的 Blob 存储中的敏感信息。为了缓解这一问题，LangSmith 支持在外部 Blob 存储系统中存储运行输入、输出、错误、清单、额外内容、事件和附件。

<Tip>
  **对于特定于云的设置**，选择您的平台：

  * [Amazon S3 (AWS)](#amazon-s3)
  * [Google Cloud Storage (GCP)](#google-cloud-storage)
  * [Azure Blob Storage](#azure-blob-storage)

  有关完整的特定于云的设置和架构指南，请参阅 [AWS](/langsmith/aws-self-hosted)、[GCP](/langsmith/gcp-self-hosted) 或 [Azure](/langsmith/azure-self-hosted)。
</Tip>

## 要求

<Note>
  Azure Blob 存储在 Helm 图表版本 0.8.9 及更高版本中可用。从 Helm 图表版本 0.10.43 开始，Azure 支持[Deleting trace projects](/langsmith/observability-concepts#data-retention)。Helm 图表版本 0.13.29 及更高版本中提供了本机 GCS Blob 存储引擎支持（使用 `engine: "GCS"`）。对于早期版本，通过使用 HMAC 凭据设置 `engine: "S3"`，通过 S3 兼容 API 支持 GCS。
</Note>

* 访问有效的blob存储服务

  * [Amazon S3](https://aws.amazon.com/s3/)
  * [Google Cloud Storage (GCS)](https://cloud.google.com/storage?hl=en)
  * [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)

* Blob 存储中用于存储数据的存储桶/目录。我们强烈建议为 LangSmith 数据创建单独的存储桶/目录。
  * **如果您使用 TTL**，您将需要设置生命周期策略来删除旧数据。欲了解更多信息，请参阅[configuring TTLs](/langsmith/self-host-ttl)。这些策略应反映您在 LangSmith 配置中设置的 TTL，否则您可能会遇到数据丢失的情况。如何设置生命周期规则请参见[TTL configuration for blob storage](#ttl-configuration)。

* 允许 LangSmith 服务访问存储桶/目录的凭据
  * 您需要向 LangSmith 实例提供访问存储桶/目录所需的凭据。请阅读下面的认证[section](#authentication)以了解更多信息。

* 如果使用 S3 或 GCS，则为 Blob 存储服务的 API URL* 这将是 LangSmith 用于访问您的 blob 存储系统的 URL
  * 对于 Amazon S3，这将是 S3 终端节点的 URL。例如：`https://s3.amazonaws.com` 或 `https://s3.us-west-1.amazonaws.com`（如果使用区域端点）。
  * 对于 Google Cloud Storage，这将是 GCS 端点的 URL。类似于：`https://storage.googleapis.com`

## 身份验证

<Tabs>
  <Tab title="AWS">
    ### 亚马逊 S3

    要对 [Amazon S3](https://aws.amazon.com/s3/) 进行身份验证，您需要创建一个 IAM 策略，授予您的存储桶以下权限。

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket"
          ],
          "Resource": [
            "arn:aws:s3:::your-bucket-name",
            "arn:aws:s3:::your-bucket-name/*"
          ]
        }
      ]
    }
    ```

    一旦您拥有正确的策略，可以通过三种方式使用 Amazon S3 进行身份验证：1. [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)（推荐）：您可以为 LangSmith 实例创建 IAM 角色并将策略附加到该角色。这是在生产环境中使用 Amazon S3 进行身份验证的推荐方法。
       1. 您需要创建一个 IAM 角色并附加策略。
       2. 您需要允许 LangSmith 服务帐户承担该角色。 `langsmith-queue`、`langsmith-backend`、`langsmith-platform-backend` 和 `langsmith-ingest-queue` 服务帐户需要能够承担该角色。
          <Warning>
            如果您使用自定义版本名称，服务帐户名称将会有所不同。您可以通过在集群中运行 `kubectl get serviceaccounts` 来查找服务帐户名称。
          </Warning>
       3. 您需要向 LangSmith 提供角色 ARN。您可以通过将 `eks.amazonaws.com/role-arn: "<role_arn>"` 注释添加到 Helm Chart 安装中的 `queue`、`backend`、`platform-backend` 和 `ingest-queue` 服务来完成此操作。

    2. [Access Key and Secret Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)：您可以向LangSmith提供访问密钥和秘密密钥。这是使用 Amazon S3 进行身份验证的最简单方法。但是，不建议将其用于生产用途，因为它的安全性较低。
       1. 您需要创建一个附加策略的用户。然后您可以为该用户提供访问密钥和秘密密钥。3. [VPC Endpoint Access](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)：您可以通过 VPC 终端节点启用对 S3 存储桶的访问，这允许流量安全地从 VPC 流向 S3 存储桶。
       1. 您需要配置 VPC 终端节点并将其配置为允许访问您的 S3 存储桶。
       2. 您可以参考我们的[public Terraform modules](https://github.com/langchain-ai/terraform/blob/main/modules/aws/s3/main.tf#L12)获取指导和配置示例。

    ### KMS 加密标头支持

    从 LangSmith Helm 图表版本 **0.11.24** 开始，您可以传递 KMS 加密密钥标头，并通过提供其 ARN 强制执行特定的 KMS 密钥进行写入。要启用此功能，请在 Helm 图表中设置以下值：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      blobStorage:
        kmsEncryptionEnabled: true
        kmsKeyArn: <your_kms_key_arn>
    ```
  </Tab>

  <Tab title="GCP">
    ### 谷歌云存储

    要使用 [Google Cloud Storage](https://cloud.google.com/storage?hl=en) 进行身份验证，您需要创建一个具有访问存储桶所需权限的 [⟦T24⟧](https://cloud.google.com/iam/docs/service-account-overview)。

    您的服务帐户将需要 `Storage Admin` 角色或具有同等权限的自定义角色。其范围可以限定为 LangSmith 将使用的存储桶。

    拥有配置的服务帐户后，您将需要为该服务帐户生成 [⟦T26⟧](https://cloud.google.com/storage/docs/authentication/hmackeys)。此密钥和秘密将用于通过 Google Cloud Storage 进行身份验证。<Note>
      从Helm图表版本**0.13.29**开始，您可以直接将blob存储引擎设置为`"GCS"`。这支持两种身份验证方法：

      1. **GCP 工作负载身份（推荐）**：将 `accessKey` 和 `accessKeySecret` 留空。 LangSmith 将使用[Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)。您需要将工作负载身份注释添加到 `backend`、`platform-backend`、`queue` 和 `ingest-queue` 服务帐户。
      2. **HMAC 密钥**：将 `accessKey` 和 `accessKeySecret` 设置为您的 GCS [HMAC credentials](https://cloud.google.com/storage/docs/authentication/hmackeys)。

      对于这两种方法，请将 `apiURL` 设置为 `https://storage.googleapis.com`，并将 `bucketName` 设置为您的 GCS 存储桶名称。

      对于 0.13.29 之前的 Helm 图表版本，通过使用 HMAC 凭据设置 `engine: "S3"`，通过 S3 兼容 API 支持 GCS。
    </Note>
  </Tab>

  <Tab title="Azure">
    ### Azure Blob 存储

    要使用 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 进行身份验证，您需要使用以下方法之一来授予 LangSmith 工作负载访问您的 [container](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction#containers) 的权限（按优先顺序列出）：1.[Storage account and access key](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)
    2.[Connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)
    3. [Workload identity](https://azure.github.io/azure-workload-identity/docs/introduction.html)（推荐）、托管身份或[⟦T40⟧](https://learn.microsoft.com/en-us/azure/developer/go/azure-sdk-authentication?tabs=bash#2-authenticate-with-azure)支持的环境变量。当上述任一选项的配置不存在时，这是默认身份验证方法。
       1. 要使用工作负载身份，请将标签 `azure.workload.identity/use: true` 添加到 `queue`、`backend`、`platform-backend` 和 `ingest-queue` 部署。此外，将 `azure.workload.identity/client-id` 注释添加到相应的服务帐户，该帐户应该是现有 Azure AD 应用程序的客户端 ID 或用户分配的托管标识的客户端 ID。有关更多详细信息，请参阅[Azure's documentation](https://azure.github.io/azure-workload-identity/docs/topics/service-account-labels-and-annotations.html)。

    <Note>
      某些部署可能需要使用服务 URL 覆盖而不是默认服务 URL (`https://<storage_account_name>.blob.core.windows.net/`) 进一步自定义连接配置。例如，为了使用不同的 blob 存储域（例如政府或中国），此覆盖是必要的。
    </Note>
  </Tab>
</Tabs>

## 频道搜索

默认情况下，LangSmith 仍会存储用于在 ClickHouse 中搜索的令牌。如果您使用 LangSmith Managed Clickhouse，您可能需要禁用此功能，以避免向 ClickHouse 发送潜在的敏感信息。您可以在 Blob 存储配置中执行此操作。

＃＃ 配置创建存储桶并获取必要的凭据后，您可以将 LangSmith 配置为使用您的 Blob 存储系统。

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  blobStorage:
    enabled: true
    engine: "S3" # Or "GCS" or "Azure". This is case-sensitive.
    chSearchEnabled: true # Set to false if you want to disable CH search (Recommended for LangSmith Managed Clickhouse)
    bucketName: "your-bucket-name"
    apiURL: "Your connection url"
    accessKey: "Your access key" # Optional. Only required if using S3 access key and secret key
    accessKeySecret: "Your access key secret" # Optional. Only required if using access key and secret key
    # The following blob storage configuration values are for Azure and require blobStorage.engine = "Azure". Omit otherwise.
    azureStorageAccountName: "Your storage account name" # Optional. Only required if using storage account and access key.
    azureStorageAccountKey: "Your storage account access key" # Optional. Only required if using storage account and access key.
    azureStorageContainerName: "your-container-name" # Required
    azureStorageConnectionString: "" # Optional.
    azureStorageServiceUrlOverride: "" # Optional
  backend: # Optional, only required if using IAM role for service account on AWS, workload identity on GKE, or workload identity on AKS
    deployment: # Azure only
      labels:
        azure.workload.identity/use: true
    serviceAccount:
      annotations:
        azure.workload.identity/client-id: "<client_id>" # Azure only
        eks.amazonaws.com/role-arn: "<role_arn>" # AWS only
        iam.gke.io/gcp-service-account: "<gsa_name>@<project_id>.iam.gserviceaccount.com" # GCP only
  platformBackend: # Optional, only required if using IAM role for service account on AWS, workload identity on GKE, or workload identity on AKS
    deployment: # Azure only
      labels:
        azure.workload.identity/use: true
    serviceAccount:
      annotations:
        azure.workload.identity/client-id: "<client_id>" # Azure only
        eks.amazonaws.com/role-arn: "<role_arn>" # AWS only
        iam.gke.io/gcp-service-account: "<gsa_name>@<project_id>.iam.gserviceaccount.com" # GCP only
  queue: # Optional, only required if using IAM role for service account on AWS, workload identity on GKE, or workload identity on AKS
    deployment: # Azure only
      labels:
        azure.workload.identity/use: true
    serviceAccount:
      annotations:
        azure.workload.identity/client-id: "<client_id>" # Azure only
        eks.amazonaws.com/role-arn: "<role_arn>" # AWS only
        iam.gke.io/gcp-service-account: "<gsa_name>@<project_id>.iam.gserviceaccount.com" # GCP only
  ingestQueue: # Optional, only required if using IAM role for service account on AWS, workload identity on GKE, or workload identity on AKS
    deployment: # Azure only
      labels:
        azure.workload.identity/use: true
    serviceAccount:
      annotations:
        azure.workload.identity/client-id: "<client_id>" # Azure only
        eks.amazonaws.com/role-arn: "<role_arn>" # AWS only
        iam.gke.io/gcp-service-account: "<gsa_name>@<project_id>.iam.gserviceaccount.com" # GCP only
```

<Note>
  如果使用访问密钥和密钥，您还可以提供包含身份验证信息的现有 Kubernetes 密钥。建议这样做，而不是直接在配置中提供访问密钥和秘密密钥。请参阅 [generated secret template](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/templates/secrets.yaml) 了解预期的密钥。
</Note>

## TTL 配置

如果将 [TTL](/langsmith/self-host-ttl) 功能与 LangSmith 一起使用，您还必须为 Blob 存储配置 TTL 规则。存储在 Blob 存储上的跟踪信息存储在特定的前缀路径上，该路径决定数据的 TTL。当跟踪的保留期延长时，其相应的 blob 存储路径会发生变化，以确保它与新的延长保留期相匹配。

使用以下 TTL 前缀：

* `ttl_s/`：短期（基本）TTL，配置为 14 天。
* `ttl_l/`：长期（扩展）TTL，默认配置为 400 天。

### 自定义工作区级别保留前缀如果您使用 [workspace-level extended retention](/langsmith/data-purging-compliance#customize-extended-retention-policy)，LangSmith 会将 blob 数据写入`ttl_XXd/` 形式的前缀，其中 `XX` 是为该工作区配置的天数。例如，如果工作区配置了 90 天的延长保留期，则该工作区的 Blob 数据将写入 `ttl_90d/` 前缀。

您必须为工作区中配置的**每个**自定义保留期创建生命周期规则。常见示例：

* `ttl_90d/` — 90 天保留
* `ttl_180d/` — 180 天保留
* `ttl_365d/` — 365 天保留

<Warning>
  如果在配置的保留期内缺少生命周期规则，则该前缀下的 Blob 数据永远不会被自动删除。确保每当配置新的工作区保留期时都添加匹配的生命周期规则。
</Warning>

例如，如果您的工作区配置了 90 天和 180 天的延长保留期，则除了 ** [default ⟦T56⟧ and ⟦T57⟧ rules](#ttl-configuration) 之外，您还可以添加以下生命周期规则：

<Tabs>
  <Tab title="AWS">
    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    rule {
      id      = "ttl-90d"
      prefix  = "ttl_90d/"
      enabled = true
      expiration {
        days = 90
      }
    }
    rule {
      id      = "ttl-180d"
      prefix  = "ttl_180d/"
      enabled = true
      expiration {
        days = 180
      }
    }
    ```
  </Tab>

  <Tab title="GCP">
    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    lifecycle_rule {
      condition {
        age            = 90
        matches_prefix = ["ttl_90d"]
      }
      action {
        type = "Delete"
      }
    }
    lifecycle_rule {
      condition {
        age            = 180
        matches_prefix = ["ttl_180d"]
      }
      action {
        type = "Delete"
      }
    }
    ```
  </Tab>

  <Tab title="Azure">
    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    rule {
      name    = "ttl-90d"
      enabled = true
      type    = "Lifecycle"
      filters {
        prefix_match = ["my-container/ttl_90d"]
        blob_types   = ["blockBlob"]
      }
      actions {
        base_blob {
          delete_after_days_since_creation_greater_than = 90
        }
        snapshot {
          delete_after_days_since_creation_greater_than = 90
        }
        version {
          delete_after_days_since_creation_greater_than = 90
        }
      }
    }
    rule {
      name    = "ttl-180d"
      enabled = true
      type    = "Lifecycle"
      filters {
        prefix_match = ["my-container/ttl_180d"]
        blob_types   = ["blockBlob"]
      }
      actions {
        base_blob {
          delete_after_days_since_creation_greater_than = 180
        }
        snapshot {
          delete_after_days_since_creation_greater_than = 180
        }
        version {
          delete_after_days_since_creation_greater_than = 180
        }
      }
    }
    ```
  </Tab>
</Tabs>

如果您在 LangSmith 配置中自定义了 TTL，则需要调整 Blob 存储配置中的 TTL 以进行匹配。

<Tabs>
  <Tab title="AWS">
    ### Amazon S3 生命周期规则如果使用 S3 作为 Blob 存储，则需要设置与上述前缀匹配的过滤器生命周期配置。您可以找到有关此[in the Amazon Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html#intro-lifecycle-rules-filter)的信息。

    例如，如果您使用 Terraform 来管理您的 S3 存储桶，您将进行如下设置：

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    rule {
      id      = "short-term-ttl"
      prefix  = "ttl_s/"
      enabled = true
      expiration {
        days = 14
      }
    }
    rule {
      id      = "long-term-ttl"
      prefix  = "ttl_l/"
      enabled = true
      expiration {
        days = 400
      }
    }
    ```
  </Tab>

  <Tab title="GCP">
    ### Google Cloud Storage 生命周期规则

    您需要为您正在使用的 GCS 存储桶设置生命周期条件。您可以找到有关此 [in the Google Documentation](https://cloud.google.com/storage/docs/lifecycle#conditions) 的信息，特别是使用 matchesPrefix。

    例如，如果您使用 Terraform 来管理 GCS 存储桶，您将设置如下内容：

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    lifecycle_rule {
      condition {
        age            = 14
        matches_prefix = ["ttl_s"]
      }
      action {
        type = "Delete"
      }
    }
    lifecycle_rule {
      condition {
        age            = 400
        matches_prefix = ["ttl_l"]
      }
      action {
        type = "Delete"
      }
    }
    ```
  </Tab>

  <Tab title="Azure">
    ### Azure Blob 存储生命周期管理

    您需要在容器上配置 [lifecycle management policy](https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-configure) 以使与上述前缀匹配的对象过期。

    举个例子，如果你是[using Terraform to manage your blob storage container](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_management_policy)，你会设置如下：

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "azurerm_storage_management_policy" "example" {
      storage_account_id = "my-storage-account-id"
      rule {
        name = "base"
        enabled = true
        type = "Lifecycle"
        filters {
          prefix_match = ["my-container/ttl_s"]
          blob_types = ["blockBlob"]
        }
        actions {
          base_blob {
            delete_after_days_since_creation_greater_than = 14
          }
          snapshot {
            delete_after_days_since_creation_greater_than = 14
          }
          version {
            delete_after_days_since_creation_greater_than = 14
          }
        }
      }
      rule {
        name = "extended"
        enabled = true
        type = "Lifecycle"
        filters {
          prefix_match = ["my-container/ttl_l"]
          blob_types = ["blockBlob"]
        }
        actions {
          base_blob {
            delete_after_days_since_creation_greater_than = 400
          }
          snapshot {
            delete_after_days_since_creation_greater_than = 400
          }
          version {
            delete_after_days_since_creation_greater_than = 400
          }
        }
      }
    }
    ```
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-blob-storage.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>