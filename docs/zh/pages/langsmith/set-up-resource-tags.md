<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up resource tags | https://docs.langchain.com/langsmith/set-up-resource-tags -->

# 设置资源标签

创建和管理资源标签以组织 LangSmith 工作区中的项目、数据集、提示和其他资源。

<Info>
  资源标签可用于[Plus and Enterprise plans](/langsmith/pricing-plans)。
</Info>

[workspaces](/langsmith/administration-overview#workspaces) 有助于分隔信任边界和访问控制，而标签可帮助您组织工作区中的资源。标签是可以附加到资源的键值对。

<Note>
  **不要与提交标签混淆**：资源标签是用于组织和过滤工作区资源（项目、数据集、提示等）的键值对。 [Commit tags](/langsmith/manage-prompts#commit-tags) 是引用提示提交历史记录中特定版本的标签。虽然两种类型的标签都可以使用类似的术语（例如 `prod` 或 `staging`），但资源标签可帮助您在工作区中*组织资源*，而提交标签则控制代码中使用提示的*哪个版本*。
</Note>

您可以通过 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-set-up-resource-tags) 或通过 [REST API](/langsmith/smith-api-ref) 以编程方式管理资源标签：

<Tabs>
  <Tab title="UI" icon="browser">
    ## 创建标签<Note>
      要创建资源标签，您必须具有 [⟦T11⟧ permission](/langsmith/organization-workspace-operations)（默认授予 [workspace admin](/langsmith/rbac#workspace-admin) 角色）。编辑者可以将**应用程序**标签应用到他们具有更新访问权限的资源，但创建标签键或应用其他标签类型需要此权限。有关将标签应用于资源的更多信息，请参阅工作区操作[Tags section](/langsmith/organization-workspace-operations#tags)。
    </Note>

    要创建标签：

    1. 导航到工作区 **设置** 页面，然后单击左侧边栏中的 **资源标签**。
    2. 在这里，您将找到按键分组的现有标签值。 LangSmith 默认创建 **Application** 和 **Environment** 键。您可以使用 **Application** 键来过滤 UI 中显示的资源。
    3. 选择页面顶部的<Icon icon="tag" /> **新标签**。系统将提示您输入标签的键和值。请注意，您可以使用现有密钥或创建新密钥。

       <img alt="Create resource tag modal accessed from the Settings menu in the LangSmith UI." />

       <img alt="Create resource tag modal accessed from the Settings menu in the LangSmith UI." />

    ## 为资源分配标签

    在用于创建新标签的同一侧面板中，您还可以将资源分配给标签。在**分配资源**部分中搜索相应的资源，然后选择要标记的资源。<Note>
      您只能使用资源标签来标记工作区范围的资源。这包括跟踪项目、注释队列、部署、实验、数据集和提示。
    </Note>

    要从资源取消分配标签，请在标签面板和资源标签面板中单击标签旁边的 <Icon icon="trash" /> 垃圾桶图标。

    ## 删除标签

    您可以从 [**Settings** page > **Resource tags** page](https://smith.langchain.com/settings/workspaces/resource_tags) 中删除标签的键或值。要删除某个密钥，请单击该密钥旁边的 <Icon icon="trash" /> 垃圾桶图标。要删除某个值，请单击该值旁边的 <Icon icon="trash" /> 垃圾桶图标。

    如果删除某个键，LangSmith 将删除与该键关联的所有值。当您删除某个值时，您将丢失该值与资源之间的所有关联。
  </Tab>

  <Tab title="API" icon="terminal">
    ## 通过API管理标签

    您可以使用 LangSmith REST API 以编程方式创建、分配和查询资源标签。所有标签端点都位于`/api/v1/workspaces/current/`下，并且需要[API key](/langsmith/create-account-api-key)。

    ### 设置

    导入 `requests` 库并配置您的 API 密钥和标头。以下所有示例均假设这些变量在范围内：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os
    import requests

    LANGSMITH_API_URL = "https://api.smith.langchain.com"
    LANGSMITH_API_KEY = os.environ["LANGSMITH_API_KEY"]
    headers = {"x-api-key": LANGSMITH_API_KEY, "Content-Type": "application/json"}
    ```

    ### 创建标签键<Note>
      创建标签键需要[⟦T14⟧](/langsmith/organization-workspace-operations)权限。
      如果您想应用默认的 **Application** 密钥，请跳过此步骤并列出现有密钥。
    </Note>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    response = requests.post(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tag-keys",
        headers=headers,
        json={"key": "Environment", "description": "Deployment environment"},
    )
    response.raise_for_status()
    tag_key = response.json()
    tag_key_id = tag_key["id"]
    ```

    ### 创建标签值

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    response = requests.post(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tag-keys/{tag_key_id}/tag-values",
        headers=headers,
        json={"value": "production"},
    )
    response.raise_for_status()
    tag_value = response.json()
    tag_value_id = tag_value["id"]
    ```

    ### 为资源分配标签

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    response = requests.post(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/taggings",
        headers=headers,
        json={
            "tag_value_id": tag_value_id,
            "resource_type": "project",
            "resource_id": "<project-uuid>",
        },
    )
    response.raise_for_status()
    tagging_id = response.json()["id"]
    ```

    有效 `resource_type` 值：`project`、`dataset`、`prompt`、`experiment`、`queue`、
    `deployment`、`dashboard`、`evaluator`、`mcp_server`、`fleet_integration`。

    <Note>
      **权限**：分配**Application**标签仅需要对目标资源的更新访问权限，
      因此编辑者无需使用 `workspaces:manage` 即可完成此操作。分配任何其他标签键需要`workspaces:manage`。
    </Note>

    **应用现有标签**：如果键和值已经存在（例如默认的 **Application** 键），请先检索它们的 ID，然后直接进入分配步骤：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    tags = requests.get(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tags",
        headers=headers,
    ).json()
    # tags is a list of {id, key, values: [{id, value}, ...]}
    ```

    ### 在创建时标记资源

    您可以在创建项目、数据集或提示（包括分叉和克隆操作）时提供`tag_value_ids`。标签在与资源创建相同的事务中以原子方式应用，因此资源永远不会短暂地取消标记——这在强制执行 [ABAC policies](/langsmith/abac) 时很重要。

    标签值必须已经存在。将其 UUID 作为列表传递（最多 100 个）：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Look up the tag value IDs you want to apply
    tags = requests.get(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tags",
        headers=headers,
    ).json()
    # tags is a list of {id, key, values: [{id, value}, ...]}
    env_tag_value_id = next(
        v["id"]
        for t in tags if t["key"] == "Environment"
        for v in t["values"] if v["value"] == "production"
    )

    # Create a project and tag it immediately
    response = requests.post(
        f"{LANGSMITH_API_URL}/api/v1/sessions",
        headers=headers,
        json={
            "name": "my-project",
            "tag_value_ids": [env_tag_value_id],
        },
    )
    response.raise_for_status()
    project = response.json()
    ```相同的 `tag_value_ids` 字段被接受：

    |端点|描述 |
    | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
    | `POST /api/v1/sessions` |创建跟踪项目 |
    | `POST /api/v1/datasets` |创建数据集（也接受 CSV 上传和实验上传变体）|
    | `POST /api/v1/datasets/{dataset_id}/clone` |克隆数据集 |
    | `POST /api/v1/repos` |创建提示 |
    | `POST /api/v1/repos/{repo_id}/fork` |分叉提示 |

    <Note>
      **权限**：在创建时应用 **Application** 标记仅需要更新对资源类型的访问权限。应用任何其他标签密钥需要[⟦T35⟧](/langsmith/organization-workspace-operations)权限。
    </Note><Tip>
      如果您使用 LangSmith SDK 跟踪并且项目是在跟踪提取期间自动创建的，则 `tag_value_ids` 参数在该自动创建路径上不可用。为了确保从一开始就执行 ABAC 策略，请在开始跟踪会话之前通过 `POST /api/v1/sessions` 使用所需的 `tag_value_ids` 预先创建项目。
    </Tip>

    ### 查询标签

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # All tag keys and values in the workspace
    tags = requests.get(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tags",
        headers=headers,
    ).json()

    # Tags on a specific resource
    resource_tags = requests.get(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tags/resource",
        headers=headers,
        params={"resource_type": "project", "resource_id": "<project-uuid>"},
    ).json()

    # All resources tagged with a specific value
    taggings = requests.get(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/taggings",
        headers=headers,
        params={"tag_value_id": tag_value_id},
    ).json()
    ```

    ### 从资源中删除标签

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    requests.delete(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/taggings/{tagging_id}",
        headers=headers,
    )
    ```

    ### 删除标签键或值

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Delete a value (removes all resource assignments for that value)
    requests.delete(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tag-keys/{tag_key_id}/tag-values/{tag_value_id}",
        headers=headers,
    )

    # Delete a key (also deletes all its values)
    requests.delete(
        f"{LANGSMITH_API_URL}/api/v1/workspaces/current/tag-keys/{tag_key_id}",
        headers=headers,
    )
    ```

    有关请求/响应字段的完整列表，请参阅[API reference](/langsmith/smith-api-ref)。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-resource-tags.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>