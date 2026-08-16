<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage prompts | https://docs.langchain.com/langsmith/manage-prompts -->

# 管理提示

LangSmith提供了多种工具来帮助您有效管理您的[_prompts_](/langsmith/prompt-engineering-concepts)。本页描述了以下功能：

- [Environments](#environments) 用于通过 **Staging** 和 **Production** 促进提交。
- [Commit tags](#commit-tags) 用于版本控制和环境管理。
- [Prompt owners](#prompt-owners) 用于控制谁可以提升提交和删除提示。
- [Webhook triggers](#trigger-a-webhook-on-prompt-commit) 用于在提示更新时自动化工作流程。
- [Public prompt hub](#public-prompt-hub) 用于发现和使用社区创建的提示。

## 提示详情页面

从 [**Prompts** table](/langsmith/create-a-prompt#view-your-prompts) 选择一个提示打开其详细信息页面，该页面使用两窗格布局：提交历史记录和环境显示在左侧，提交详细信息显示在右侧。

您可以通过切换右上角的 **Diff** 将提交与其之前的版本进行比较。

## 环境

环境代表命名的部署目标、**暂存**和**生产**，您可以将其分配给特定提交。它们使您可以跟踪每个环境中哪个版本的提示处于活动状态并促进它们之间的提交。

环境由保留的 [commit tags](#commit-tags)（`staging` 和 `production`）定义，这些环境通过促销 UI 而不是自由格式标签选择器进行管理。

### 促进提交提升提交会将其分配给环境。您可以促进对登台或生产的任何承诺。

促进提交：

1. 将鼠标悬停在左侧窗格中的提交上以显示**升级**，或单击页面右上角的**升级**。从下拉列表中选择 **暂存** 或 **生产**。
2. 将打开一个部署模式，显示当前已分配给该环境并将被替换的提交。
3. 确认促销。环境指针立即更新。

<Note>
将提交提升到生产并不会将其从暂存中删除。如果提交处于暂存状态并且您将其提升到生产环境，那么它也会保留在暂存状态。
</Note>

### 回滚环境

每个环境都维护一个有序的历史记录，其中记录了分配给它的提交以及何时分配的提交。要回滚到之前的提交：

1. 在左侧窗格中，找到要回滚的环境。
2. 单击该环境的回滚图标。
3. 从显示的**回滚历史**中，选择要回滚到的提交。环境指针将更新到该提交。

## 提交标签[_Commit tags_](/langsmith/prompt-engineering-concepts#tags) 是引用提示版本历史记录中特定 [_commit_](/langsmith/prompt-engineering-concepts#commits) 的标签。它们帮助您标记重要版本并控制哪些版本在不同环境中运行。通过在代码中引用标签而不是提交 ID，您可以更新正在使用的版本，而无需修改代码本身。

尽管您可以重新分配标签以指向不同的提交，但每个标签仅引用一次提交。

<Note>
**保留标签：** `staging` 和 `production` 标签保留用于环境管理，并且在自由格式标签选择器中未启用。使用 [promotion flow](#promote-a-commit) 将提交分配给这些环境。
</Note>

<Note>
**不要与资源标签混淆**：提交标签特定于提示版本控制并引用提示历史记录中的各个提交。 [Resource tags](/langsmith/set-up-resource-tags) 是用于组织工作区资源（例如项目、数据集和提示）的键值对。虽然两者都可以使用类似的命名约定（如`prod`或`staging`），但提交标签控制提示运行的**哪个版本**，而资源标签帮助您**组织和过滤**工作区中的资源。
</Note>

### 创建标签要创建标签，请在提示详细信息页面的左侧窗格中选择要标记的提交。单击右窗格右上角的**标签**。在下拉列表中，单击“**提交标签**”并输入名称。

### 移动标签

要将标签指向不同的提交，请在提示详细信息页面的左侧窗格中选择目标提交。单击右窗格右上角的**标签**。在下拉列表中，选择您要移动的标签。这会自动更新标签以指向新的提交。

### 删除标签

要删除标签，请单击右窗格右上角的“**标签**”。 （选择哪个提交并不重要）。在下拉列表中，单击要删除的标签旁边的删除图标。这将完全删除该标签，并且它将不再与任何提交关联。

### 在代码中使用标签

标签提供了一种稳定的方式来引用代码中提示的特定版本。您可以引用无需更改代码即可更新的标签，而不是直接使用提交哈希。

以下是在 Python 中通过标签拉取提示的示例：

```python
prompt = client.pull_prompt("joke-generator:production")
# If production tag points to commit a1b2c3d4, this is equivalent to:
prompt = client.pull_prompt("joke-generator:a1b2c3d4")
```

有关如何在代码中使用提示的更多信息，请参阅[Managing prompts programmatically](/langsmith/manage-prompts-programmatically)。

## 提示业主提示所有者功能使您可以精细控制谁可以标记提交并删除特定提示。这对于您想要通过分配或移动标签来限制哪些团队成员可以提升对环境的提交的生产升级流程非常有用。

### 访问模式

每个提示有两种访问模式，在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-manage-prompts)中的**访问和权限**下配置：

- **工作区授权用户**（默认）：任何具有[⟦T7⟧](/langsmith/organization-workspace-operations#prompts)权限的工作区用户都可以创建、更新、删除标签以及删除提示。
- **仅限所有者**：只有作为提示所有者添加的用户才能创建或更新提交标签、提升对环境的提交以及删除提示。

LangSmith 自动将提示创建者添加为所有者。

### 配置访问和权限

1. 在LangSmith UI 中打开提示。
2. 单击右上角的<Icon icon="dots-vertical"/> **更多**图标，然后选择**访问和权限**。
3. 选择**仅限所有者**模式。
4. 在所有者组中添加或删除用户。

<Warning>
如果您保存的更改将您自己删除为所有者，您将无法管理所有者或将提示切换回工作区授权用户模式。只有其他所有者才能恢复您的访问权限。
</Warning>当**仅限所有者**模式处于活动状态时，只有所有者可以禁用它或添加或删除其他所有者。

## 在提示提交时触发 webhook

您可以将 Webhook 配置为在提交提示时触发。

一些常见的用例包括：

* 更新提示时触发 CI/CD 管道。
* 将提示与 GitHub 存储库同步。
* 通知团队成员及时修改。

### 配置网络钩子

导航至左侧边栏或应用程序主页中的 **提示** 部分。单击右上角的`+ Webhook`按钮。

添加 Webhook URL 和任何必需的标头。

<Note>
每个工作区只能配置一个 Webhook。如果您想为每个工作区配置多个或为每个提示设置不同的 Webhook，请在 [LangChain Forum](https://forum.langchain.com/) 中告知我们。
</Note>

要测试您的 Webhook，请单击 **发送测试通知** 按钮。这会将测试通知发送到您随示例负载提供的 Webhook URL。

示例有效负载是一个包含以下字段的 JSON 对象：- `prompt_id`：已提交的提示的ID。
- `prompt_name`：已提交的提示的名称。
- `commit_hash`：提示的提交哈希。
- `created_at`：提交日期。
- `created_by`：提交的作者。
- `manifest`：提示的清单。

### 触发 webhook

提交提示以触发您已配置的 Webhook。

#### 使用游乐场

如果您在 Playground 中执行此操作，系统会提示您取消选择您想要避免触发的 Webhooks。

![Commit Playground](/langsmith/images/commit-playground.png)

#### 使用 API

如果您通过 API 提交，则可以通过将 `skip_webhooks` 参数设置为 `true` 或要忽略的 Webhook id 数组来指定跳过触发 Webhook。请参阅[API docs](/langsmith/smith-api/commits/create-a-commit)了解更多信息。

## 公共提示中心

LangSmith的公共提示中心是由LangChain社区创建的提示集合，您可以参考使用。

<Note>
请注意，提示是用户生成的且未经验证。 LangChain 不审查或认可公共提示，使用这些提示需您自担风险。使用 Prompt Hub 须遵守我们的 [Terms of Service](https://www.langchain.com/terms-of-service)。
</Note>

导航到左侧边栏的 **提示** 部分，然后单击 **浏览 LangChain 中心中的所有公共提示**。在这里，您可以找到 LangChain 中心中公开列出的所有提示。您可以按名称、句柄、用例、描述或模型搜索提示。您可以将提示分叉到您的个人组织、查看提示的详细信息并在 Playground 中运行提示。您可以使用 SDK [pull any public prompt into your code](/langsmith/manage-prompts-programmatically)。

要查看与工作区相关的提示，请导航至侧边栏中的 **提示**。

![Prompts tab](/langsmith/images/prompts-tab.png)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-prompts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>