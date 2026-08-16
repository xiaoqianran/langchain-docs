<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage bulk export destinations | https://docs.langchain.com/langsmith/data-export-destinations -->

# 管理批量导出目的地

<Note>
**对于自托管、GCP EU、GCP APAC 和 AWS US SaaS**

更新以下自托管安装、GCP EU (`eu.api.smith.langchain.com`)、GCP APAC (`apac.api.smith.langchain.com`) 或 AWS US (`aws.api.smith.langchain.com`) 请求中的 LangSmith URL。
</Note>

目标是一个命名配置，告诉 LangSmith 将导出的跟踪数据写入何处。你[create a destination](/langsmith/data-export#1-create-a-destination)一次，然后在[creating export jobs](/langsmith/data-export#2-create-an-export-job)时通过ID引用它。 LangSmith 目前支持 S3 和任何与 S3 兼容的存储桶（例如 GCS 或 MinIO）作为目标。导出的数据以 [Parquet](https://parquet.apache.org/docs/overview/) 柱状格式写入，并包含与 [Run data format](/langsmith/run-data-format) 等效的字段。

此页面涵盖：

- [configuration fields](#configuration-fields) 需要设置目的地。
- AWS S3 和 GCS 所需的存储桶 [permissions](#permissions-required)。
- 如何通过 API [create a destination](#create-a-destination)，包括特定于提供商的示例和凭证选项。
- 如何在不重新创建目的地的情况下实现[rotate destination credentials](#rotate-destination-credentials)。
- 如何[debug destination errors](#debug-destination-errors)。

## 配置字段

配置目标需要以下信息：- **存储桶名称**：数据将导出到的 S3 存储桶的名称。
- **前缀**：数据将导出到的存储桶内的根前缀。
- **S3 区域**：存储桶的区域 — AWS S3 存储桶必需的。
- **端点 URL**：S3 存储桶的端点 URL — 对于 S3 API 兼容存储桶是必需的。
- **访问密钥**：S3 存储桶的访问密钥。
- **密钥**：S3 存储桶的密钥。
- **在前缀中包含存储桶**（可选）：是否包含存储桶名称作为路径前缀的一部分。默认为`true`。当使用存储桶名称已存在于端点 URL 中的虚拟托管样式端点时，设置为 `false`。
- **S3 配置选项**（`config_kwargs_s3`，可选）：传递给 botocore 的高级 S3 寻址样式和请求设置。最常见的用途是为需要虚拟托管或路径式请求的 S3 兼容服务设置 `addressing_style`：
  - `"virtual"`：存储桶名称是主机名的一部分（例如`bucket.endpoint/key`）。对于某些 S3 兼容服务（例如 Volcengine TOS）是必需的。
  - `"path"`：存储桶名称是 URL 路径的一部分（例如 `endpoint/bucket/key`）。
  - `"auto"`（默认）：boto3 根据端点决定。我们支持任何 S3 兼容存储桶。对于非 AWS 存储桶（例如 GCS 或 MinIO），您需要提供终端节点 URL。

## 所需权限

`backend`和`queue`服务都需要对目标存储桶的写访问权限：

- 创建导出目标时，`backend` 服务尝试将测试文件写入目标存储桶。如果有权限，它将删除测试文件（删除访问权限是可选的）。
- `queue`服务负责批量导出执行并将文件上传到存储桶。

### AWS S3 权限

最低 AWS S3 权限策略依赖于以下权限：

- `s3:PutObject`（必需）：允许将 Parquet 文件写入存储桶。
- `s3:DeleteObject`（可选）：在目标创建期间清理测试文件。如果不存在此权限，则在创建目标后，该文件将保留在 `/tmp` 目录下。
- `s3:GetObject`（可选但推荐）：写入后验证文件大小。
- `s3:AbortMultipartUpload`（可选但推荐）：避免悬空分段上传。

最小 IAM 策略示例：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

具有附加权限的推荐 IAM 策略示例：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

### Google 云存储 (GCS) 权限将 GCS 与 S3 兼容的 XML API 结合使用时，需要以下 IAM 权限：

- `storage.objects.create`（必填）：允许将文件写入存储桶。
- `storage.objects.delete`（可选）：在目标创建期间清理测试文件。如果不存在此权限，则在创建目标后，该文件将保留在 `/tmp` 目录下。
- `storage.objects.get`（可选但推荐）：写入后验证文件大小。

这些权限可以通过“存储对象管理员”预定义角色或自定义角色授予。

## 创建目的地

以下示例演示如何使用 cURL 创建目标。将占位符值替换为您的实际配置详细信息。
请注意，凭据将以加密形式安全地存储在我们的系统中。

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My S3 Destination",
    "config": {
      "bucket_name": "your-s3-bucket-name",
      "prefix": "root_folder_prefix",
      "region": "your aws s3 region",
      "endpoint_url": "your endpoint url for s3 compatible buckets",
      "include_bucket_in_prefix": true // defaults to true, can be omitted
    },
    "credentials": {
      "access_key_id": "YOUR_S3_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_S3_SECRET_ACCESS_KEY"
    }
  }'
```

使用返回的 `id` 在后续批量导出操作中引用该目标。

**如果您在创建目标时收到错误，请参阅 [Debug destination errors](#debug-destination-errors) 了解如何调试此错误的详细信息。**

### 凭证配置

<Note>**需要 LangSmith Helm 版本 >= `0.10.34`（应用程序版本 >= `0.10.91`）**</Note>

除了静态 `access_key_id` 和 `secret_access_key` 之外，我们还支持以下其他凭证格式：- 要使用包含 AWS 会话令牌的[temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)，
  创建批量导出目标时另外提供`credentials.session_token`密钥。
-（仅限自托管）：使用基于环境的凭据，例如 [AWS IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) (IRSA)，
  创建批量导出目标时，省略请求中的 `credentials` 键。
  在这种情况下，将按照库定义的顺序检查[standard Boto3 credentials locations](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html#credentials)。

### AWS S3 存储桶

对于 AWS S3，您可以省略 `endpoint_url` 并提供与您的存储桶区域匹配的区域。

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My AWS S3 Destination",
    "config": {
      "bucket_name": "my_bucket",
      "prefix": "data_exports",
      "region": "us-east-1"
    },
    "credentials": {
      "access_key_id": "YOUR_S3_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_S3_SECRET_ACCESS_KEY"
    }
  }'
```

### Google GCS XML S3 兼容存储桶

使用 Google 的 GCS 存储桶时，您需要使用 XML S3 兼容 API，并提供 `endpoint_url`
通常为 `https://storage.googleapis.com`。
以下是使用与 S3 兼容的 GCS XML API 时的 API 请求示例：

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My GCS Destination",
    "config": {
      "bucket_name": "my_bucket",
      "prefix": "data_exports",
      "endpoint_url": "https://storage.googleapis.com"
      "include_bucket_in_prefix": true // defaults to true, can be omitted
    },
    "credentials": {
      "access_key_id": "YOUR_S3_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_S3_SECRET_ACCESS_KEY"
    }
  }'
```

请参阅[Google documentation](https://cloud.google.com/storage/docs/interoperability#xml_api)了解更多信息

### 具有虚拟托管样式寻址的 S3 兼容存储桶

某些 S3 兼容服务（例如 Volcengine TOS）需要虚拟托管样式寻址，其中存储桶名称是主机名的一部分，而不是 URL 路径。使用 `config_kwargs_s3` 和 `addressing_style: "virtual"` 来启用此功能：

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My Volcengine TOS Destination",
    "config": {
      "bucket_name": "my_bucket",
      "prefix": "data_exports",
      "endpoint_url": "https://tos-s3-cn-beijing.volces.com",
      "config_kwargs_s3": {
        "addressing_style": "virtual"
      }
    },
    "credentials": {
      "access_key_id": "YOUR_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_SECRET_ACCESS_KEY"
    }
  }'
```

### 具有虚拟托管样式端点的 S3 兼容存储桶如果您的终端节点 URL 已包含存储桶名称（虚拟托管样式），请将 `include_bucket_in_prefix` 设置为 `false` 以避免在路径中重复存储桶名称：

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My Virtual-Hosted Destination",
    "config": {
      "bucket_name": "my_bucket",
      "prefix": "data_exports",
      "endpoint_url": "https://my_bucket.s3.us-east-1.amazonaws.com",
      "include_bucket_in_prefix": false
    },
    "credentials": {
      "access_key_id": "YOUR_S3_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_S3_SECRET_ACCESS_KEY"
    }
  }'
```

## 轮换目标凭证

使用 `PATCH /api/v1/bulk-exports/destinations/{destination_id}` 更新现有目标上的凭据。这使您可以轮换或替换凭据，而无需重新创建目标或其关联的批量导出。目标配置（存储桶、前缀、区域、端点等）未更改 - 仅替换了凭证。

### 凭证轮换行为

转换不是瞬时的：

- **新的批量导出运行** 在 PATCH 完成后立即使用更新的凭据。
- **已经在运行批量导出运行**继续使用以前的凭据，直到完成。
- **在过渡期间，两组凭证同时有效**。此窗口持续到单次批量导出运行的最大运行时间。

相应地规划您的轮换：旧凭证必须保持有效，直到所有运行中的运行完成。

### 请求

```bash
curl --request PATCH \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations/{destination_id}' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "credentials": {
      "access_key_id": "YOUR_NEW_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_NEW_SECRET_ACCESS_KEY"
    }
  }'
```

`session_token` 字段是可选的，您可以为 [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) 添加该字段。

[**Required permission**](/langsmith/organization-workspace-operations)：`bulk-exports:manage`（或`workspaces:manage`，历史上授予此访问权限）。在存储新凭据之前，LangSmith 通过使用现有目标配置对存储桶执行测试写入来验证它们。如果凭据没有足够的写入权限，请求将失败并显示`400`。如果请求失败，请参考[Debug destination errors](#debug-destination-errors)。

### 回应

返回更新后的目标对象。凭证值永远不会返回 - 只有凭证字段名称包含在 `credentials_keys` 下的响应中。

```json
{
  "id": "destination-uuid",
  "tenant_id": "tenant-uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-06-01T00:00:00Z",
  "credentials_keys": ["access_key_id", "secret_access_key"]
}
```

### 轮换清单

1. 在您的云提供商中配置新凭据，并具有对目标存储桶和前缀的写入权限。
1. 使用新凭证调用 PATCH 端点。 LangSmith 在保存之前验证它们。
1. 保持旧凭证处于活动状态，直到所有正在进行的批量导出运行完成（直至[maximum run duration](/langsmith/data-export-monitor#automatic-retry-behavior)）。
1. 一旦没有运行使用旧凭据，则撤销旧凭据。

## 调试目标错误

目的地 API 端点将验证目的地和凭证是否有效以及写入访问权限
存在于桶中。如果您收到错误，并且想要调试此错误，您可以使用 [AWS CLI](https://aws.amazon.com/cli/)
测试与存储桶的连接。您应该能够使用相同的 CLI 编写文件
您提供给上述目的地 API 的数据。

**AWS S3：**

```bash
aws configure

# set the same access key credentials and region as you used for the destination
> AWS Access Key ID: <access_key_id>
> AWS Secret Access Key: <secret_access_key>
> Default region name [us-east-1]: <region>

# List buckets
aws s3 ls /

# test write permissions
touch ./test.txt
aws s3 cp ./test.txt s3://<bucket-name>/tmp/test.txt
```

**GCS 兼容铲斗：**

您需要提供带有 `--endpoint-url` 选项的端点_url。
对于 GCS，`endpoint_url` 通常为 `https://storage.googleapis.com`：

```bash
aws configure

# set the same access key credentials and region as you used for the destination
> AWS Access Key ID: <access_key_id>
> AWS Secret Access Key: <secret_access_key>
> Default region name [us-east-1]: <region>

# List buckets
aws s3 --endpoint-url=<endpoint_url> ls /

# test write permissions
touch ./test.txt
aws s3 --endpoint-url=<endpoint_url> cp ./test.txt s3://<bucket-name>/tmp/test.txt
```

### 常见错误

以下是一些常见错误：

|错误 |描述 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ||访问被拒绝 | Blob 存储凭据或存储桶无效。当提供的访问密钥和秘密密钥组合没有访问指定存储桶或执行所需操作的必要权限时，会发生此错误。                                                                |
|存储桶无效 |指定的 Blob 存储桶无效。当存储桶不存在或没有足够的访问权限来对存储桶执行写入操作时，会引发此错误。                                                                                                                                        |
|您提供的密钥 ID 不存在 |提供的 Blob 存储凭据无效。当用于身份验证的访问密钥 ID 不是有效密钥时，会发生此错误。                                                                                                                                                                ||无效端点 |提供的端点_url 无效。当指定的端点是无效端点时，会引发此错误。仅支持 S3 兼容端点，例如 GCS 的 `https://storage.googleapis.com`、minio 的 `https://play.min.io` 等。如果使用 AWS，则应省略 endpoint_url。 |
|无效的BucketName |由于寻址风格不匹配，S3 兼容服务拒绝了该请求。某些服务需要虚拟托管式寻址。在目标配置中设置 `config_kwargs_s3: {"addressing_style": "virtual"}` 来解决此问题。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-export-destinations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>