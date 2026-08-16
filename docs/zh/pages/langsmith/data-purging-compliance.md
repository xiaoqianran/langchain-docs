<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Data purging for compliance | https://docs.langchain.com/langsmith/data-purging-compliance -->

# 数据清除以确保合规性

本指南涵盖了数据到达LangSmith云服务器后可用的各种功能，以帮助您实现隐私目标。

## 数据保留

LangSmith 提供自动数据保留功能，以帮助合规性和存储管理。数据保留策略可以在两个级别进行配置：

- **工作区级别**：具有所需权限的企业客户可以将延长保留设置为工作区默认值，并自定义保留期限（最长 400 天）。参见[Customize extended retention policy](#customize-extended-retention-policy)。
- **项目级别**：具有所需权限的客户可以为每个跟踪项目设置默认保留层，在基本保留（14 天）或延长保留（400 天）之间进行选择。参见[Change project-level default retention](/langsmith/billing#change-project-level-default-retention)。

有关数据保留配置和管理的详细信息，请参阅[Data Retention concepts](/langsmith/usage-and-billing#data-retention)文档。

## 自定义延长保留策略

<Note>
此功能适用于[Enterprise](/langsmith/pricing-plans)计划客户。对于[self-hosted](/langsmith/self-hosted)企业客户，请参阅[workspace-level configuration section](#workspace-level-extended-retention-for-self-hosted)。
</Note>[Enterprise](/langsmith/pricing-plans) 客户可以自定义[workspace](/langsmith/administration-overview#workspaces) 级别跟踪的延长数据保留期限，以满足特定的合规性要求。默认情况下，延长保留时间设置为 400 天，但您可以根据组织的需求进行调整。对保留期的更改仅适用于新跟踪。

<Note>
对保留期的更改仅适用于新跟踪。现有痕迹不受影响。
</Note>

### 配置延长保留

组织管理员和操作员 (`organization:manage`) 可以为任何工作区配置保留。工作区管理员可以配置自己的工作区 (`workspaces:manage`)。有关完整权限参考，请参阅[Organization and workspace operations](/langsmith/organization-workspace-operations)。

<Tabs>
  <Tab title="UI">
    在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-data-purging-compliance)中：1. 导航至页面底部的**设置**。
    1. 从左侧菜单中选择**使用配置**。
    1. 在列表中找到您要配置的工作区。
    1. 单击该工作区的 **数据保留策略** 列下的值。
    1. 在 **工作空间使用配置** 模式中，使用 **扩展 - 保留所有跟踪** 选项的下拉菜单自定义扩展策略。可用的持续时间有：30d、60d、90d、120d、150d、180d、240d、300d、365d 和 400d。
    1. 选择**保存**。
  </Tab>
  <Tab title="API">
    要读取当前设置：

    **组织级别** (`organization:manage`)

    ```bash
    curl -X GET "https://api.smith.langchain.com/api/v1/orgs/ttl-settings" \
      -H "x-api-key: YOUR_API_KEY"
    ```

    **工作区级别** (`workspaces:manage`)

    ```bash
    curl -X GET "https://api.smith.langchain.com/api/v1/ttl-settings" \
      -H "x-api-key: YOUR_API_KEY"
    ```

    要更新保留期，请将跟踪的 `resource_type` 设置为 `"run"`，并将 `ttl_days` 设置为所需的持续时间。可用的持续时间为：30、60、90、120、150、180、240、300、365 和 400 天。

    **组织级别** (`organization:manage`)

    ```bash
    curl -X PUT "https://api.smith.langchain.com/api/v1/orgs/ttl-settings" \
      -H "x-api-key: YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"resource_type": "run", "ttl_days": 90}'
    ```

    **工作区级别** (`workspaces:manage`)

    ```bash
    curl -X PUT "https://api.smith.langchain.com/api/v1/ttl-settings" \
      -H "x-api-key: YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"resource_type": "run", "ttl_days": 90}'
    ```
  </Tab>
</Tabs>

### 自托管的工作区级别延长保留自托管 [Enterprise](/langsmith/pricing-plans) 客户还可以使用工作区级别的扩展保留配置，而不是系统范围的 TTL 设置。这可以对不同工作区的数据保留进行更精细的控制，而无需更改环境变量。

<Warning>
如果您使用 Blob 存储，则**必须**为您配置的每个自定义保留期添加生命周期规则。例如，将工作区设置为 90 天保留意味着 Blob 数据将写入 `ttl_90d/` 前缀，这需要自动清理匹配的生命周期规则。有关详细信息和示例，请参阅[blob storage TTL configuration](/langsmith/self-host-blob-storage#custom-workspace-level-retention-prefixes)。
</Warning>

要为自托管部署配置此功能，请参阅[self-hosted TTL documentation](/langsmith/self-host-ttl)了解旧系统范围的方法或联系[support](https://support.langchain.com)。

## 跟踪删除

您可以使用API完成跟踪删除。 API支持两种删除痕迹的方法：

1. **通过跟踪 ID 和会话 ID**：通过提供跟踪 ID 及其相应会话 ID 的列表来删除特定跟踪（每个请求最多 1000 个跟踪）
2. **按元数据**：删除工作区中与任何指定元数据键值对匹配的跟踪

更多详情请参阅[API spec](/langsmith/smith-api/run/delete-runs)。<Warning>
所有跟踪删除都将删除所有数据存储中的相关实体，例如反馈、聚合和统计信息。
</Warning>

### 删除时间线

跟踪删除是在非高峰使用时间进行的，并且不是即时的。 LangChain 在周末运行删除作业。没有删除确认 - 您需要再次查询数据以验证它是否已被删除。

### 删除特定痕迹

要根据跟踪 ID 从单个会话中删除特定跟踪：

<Note>
`session_id` 是您尝试删除的跟踪的项目 ID。您可以在LangSmith UI 的跟踪项目页面上找到它。
</Note>

```bash
curl -X POST "https://api.smith.langchain.com/api/v1/runs/delete" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "trace_ids": ["trace-id-1", "trace-id-2", "trace-id-3"],
    "session_id": "session-id-1"
  }'
```

## 删除示例

您可以通过我们的 API 自助删除数据集示例，该 API 根据您的数据保留需求支持软删除和硬删除方法。

<Warning>
硬删除将从整个数据集历史记录中指定示例的所有版本中永久删除输入、输出和元数据。
</Warning>

### 删除示例分为两步

对于批量操作，示例删除遵循两步过程：

#### 1. 通过元数据搜索示例

查找工作区中所有数据集具有匹配元数据的所有示例。

[GET /examples](/langsmith/smith-api/examples/read-examples)- `as_of` 必须明确指定为时间戳。仅返回 `as_of` 日期之前创建的示例

```bash
curl -X GET "https://api.smith.langchain.com/api/v1/examples?as_of=2024-01-01T00:00:00Z" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "user_id": "user123",
      "environment": "staging"
    }
  }'
```

这将返回工作区中所有数据集的元数据中具有 `user_id: "user123"` **或** `environment: "staging"` 的示例。

#### 2. 硬删除示例

获得示例 ID 后，发送删除请求。这将使该示例的所有版本的数据集的输入、输出和元数据清零。

[POST /v1/platform/datasets/examples/delete/](/langsmith/smith-api/examples/hard-delete-examples)

- 在请求正文中指定 `example_ids`（示例 ID 列表）和 `hard_delete`（布尔值）

```bash
curl -X POST "https://api.smith.langchain.com/v1/platform/datasets/examples/delete/" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "example_ids": ["example-id-1", "example-id-2", "example-id-3"],
    "hard_delete": true
  }'
```

### 删除类型

#### 软删除（默认）

- 在数据集中创建具有 NULL 输入/输出的逻辑删除条目
- 保留历史数据并维护数据集版本控制
- 仅影响数据集的当前版本

#### 硬删除

- 永久删除所有数据集版本中的输入、输出和元数据
- 当合规性要求所有版本均清零时，完成数据删除
- 在请求体中设置`"hard_delete": true`

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-purging-compliance.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>