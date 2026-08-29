<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to BYOC | https://docs.langchain.com/langsmith/byoc-migration -->

# 迁移到 BYOC

[LangSmith data migration tool](https://github.com/langchain-ai/langsmith-data-migration-tool) 将数据从现有 LangSmith 云组织或 [self-hosted](/langsmith/self-hosted) 实例复制到 BYOC 数据平面。该工具复制数据（而不是移动数据），因此源实例在移动过程中保持不变并保持可用。

在数据平面为 [active and reachable](/langsmith/byoc-onboarding) 后运行迁移。跟踪数据不会迁移，因此请与该工具一起规划 [manual steps](#move-data-the-tool-does-not-migrate)。

## 支持的资源

该工具在源实例和目标数据平面之间迁移以下资源：|资源 |详情 |
|----------|---------|
|用户和角色 |自定义角色、组织成员和工作区成员资格。 |
|数据集 |数据集及其示例和文件附件。 |
|实验|实验、实验运行和反馈随数据集一起迁移。 |
|注释队列 |队列配置和设置。迁移的队列开始为空。 |
|自动化规则|映射到目标项目的项目自动化规则。 |
|提示|提示完整的提交历史记录。 |
|图表|监控图表和仪表板。 |
|定制型号定价|工作区-自定义模型价格条目。 |
|舰队|代理、共享技能、MCP 服务器、集成、身份验证提供程序、计划、触发器、Webhooks、使用限制、沙箱策略和工作区机密。 |
|上下文中心 | Context Hub 代理和技能，包括文件、存储库元数据、提交历史记录和提交标签。 |

每种资源类型都有自己的命令、标志和警告。命令参考参见[tool README](https://github.com/langchain-ai/langsmith-data-migration-tool/blob/main/README.md)。

<Note>
属于 BYOC 尚不支持的功能的资源（例如[Engine](/langsmith/engine-overview)）无法迁移。参见[Available features](/langsmith/byoc#available-features)。
</Note>

## 使用工具迁移

<Steps><Step title="Install the tool">
使用 `uv`、`uvx` 或 `pip` 安装最新版本。对于当前的安装命令，请参阅[Installation](https://github.com/langchain-ai/langsmith-data-migration-tool#installation)。

验证安装：

```bash
langsmith-migrator --help
```
</Step>

<Step title="Create the destination workspaces">
实例之间的工作空间 ID 不同，因此首先在数据平面中创建目标工作空间。请参阅 [BYOC onboarding docs](/langsmith/byoc-onboarding) 的 `Create workspaces` 部分。

迁移命令针对每个工作区对运行。对每一对重复这些操作。
</Step>

<Step title="Create the destination tracing projects">
该工具不会创建跟踪项目。在迁移自动化规则或图表之前，在目标工作区中创建所需的项目，否则这些映射没有目标。
</Step>

<Step title="Configure the connection details">
设置源和目标凭据以及端点：

```bash
export LANGSMITH_OLD_API_KEY="<source_instance_key>"
export LANGSMITH_NEW_API_KEY="<data_plane_key>"
export LANGSMITH_OLD_BASE_URL="<source_instance_api_url>"
export LANGSMITH_NEW_BASE_URL="https://<data_plane_host>"
export LANGSMITH_VERIFY_SSL=true
```

在 **设置 > 数据平面** 下找到数据平面 API URL。

<Warning>
目标键的范围必须限于目标数据平面中的工作区。组织范围的密钥不起作用。

要迁移具有所有者的舰队代理，请使用个人访问令牌 (`lsv2_pt_*`) 作为目标密钥。 Workspace API 密钥不携带用户身份，因此使用它们创建的代理没有所有者。
</Warning>
</Step>

<Step title="Test both connections">
```bash
langsmith-migrator test
```
</Step>

<Step title="Run the migration">
使用交互式向导浏览每种资源类型：

```bash
langsmith-migrator migrate-all
```要一次迁移一种资源类型，请运行其命令，例如 `datasets`、`prompts` 或 `fleet`。添加 `--dry-run` 以预览步骤而无需编写，并添加 `-v` 以进行详细输出。使用 `langsmith-migrator resume` 重试上一个会话中待处理或失败的项目。

有关每个命令标志、工作区映射和项目映射，请参阅 [tool README](https://github.com/langchain-ai/langsmith-data-migration-tool/blob/main/README.md)。
</Step>

</Steps>

## 完成舰队手动步骤

[Fleet](/langsmith/fleet/index)资源通过`fleet`命令迁移，但某些值不能跨实例。迁移后在目标工作区中完成以下操作：- **重新输入秘密值**：Fleet API 不返回秘密值。该工具将工作区机密和身份验证提供程序客户端机密创建为空占位符。
- **重新验证 OAuth 连接**：每用户代理连接（例如 Gmail、Slack 和 GitHub）与各个用户令牌绑定。每个用户都必须重新连接。
- **重新共享代理**：每用户访问列表仅保留目标上存在的用户 ID。该工具报告它删除了哪些用户。
- **检查代理模型**：当目标目录不提供源模型时，该工具会替换模型。它记录每次替换。
- **配置基础设施级设置**：OAuth 提供程序、GitHub 应用程序和 Slack 应用程序在部署配置中设置，而不是通过 API 设置。请联系 LangChain 团队在您的数据平面中配置它们。

队列迁移器绝不会覆盖目的地上已存在的资源，因此重新运行 `fleet` 是安全的。

## 移动工具不迁移的数据

### 痕迹

该工具不会迁移痕迹。为了在旧实例的生命周期之外保留历史跟踪，[bulk export](/langsmith/data-export) 将它们保存到与 S3 兼容的存储桶。要移动跟踪应用程序，请创建作用域为数据平面中的工作区的 API 密钥，然后重新指向应用程序：

- **切换**：将 `LANGSMITH_ENDPOINT` 设置为数据平面端点，并将 `LANGSMITH_API_KEY` 设置为新密钥。参见[Trace to a data plane](/langsmith/byoc-usage#trace-to-a-data-plane)。
- **双跟踪**：在转换期间写入旧实例和数据平面。参见[Trace to multiple endpoints](/langsmith/byoc-usage#trace-to-multiple-endpoints)。

### 已部署代理

将在现有实例上运行的代理重新部署到数据平面中的工作区中。使用 LangSmith UI 或 API。您可能还需要在数据平面集群中重新创建服务帐户、映像拉取机密和其他资源。

对于代理数据库和缓存，选择以下选项之一：

- 在数据平面中创建新实例并将重新部署的代理指向它们。从空开始，或从旧实例的备份恢复。
- 将重新部署的代理指向您的现有数据库实例，并通过 PrivateLink 或 VPC 对等互连从数据平面集群访问它们。

有关更多信息，请参阅[LangSmith Deployment](/langsmith/deployment)。

### 见解报告

[Insights](/langsmith/insights) 报告不会跨实例迁移。要保留报告，请在 LangSmith UI 中打开其详细信息，然后选择 **下载**。

## 另请参阅

- [BYOC onboarding](/langsmith/byoc-onboarding)
- [BYOC usage](/langsmith/byoc-usage)
- [Bulk export trace data](/langsmith/data-export)

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>