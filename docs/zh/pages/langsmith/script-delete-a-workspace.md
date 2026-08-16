<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete workspaces | https://docs.langchain.com/langsmith/script-delete-a-workspace -->

# 删除工作区

<Note>
**LangSmith 自托管 v0.10** 原生支持删除工作区。查看[instructions for deleting a workspace](/langsmith/set-up-hierarchy#delete-a-workspace)。

对于 v0.10 之前的自托管版本，请遵循以下指南。
</Note>

LangSmith UI 目前不支持从组织中删除单个工作区。不过，这可以通过直接从 ClickHouse 中的所有物化视图（runs\_history 视图除外）以及运行和反馈表中删除所有跟踪，然后从 Postgres 租户表中删除工作区来实现。

该命令使用工作区 ID 作为参数。

### 先决条件

确保您准备好以下工具/物品。

1.kubectl

   * [https://kubernetes.io/docs/tasks/tools/](https://kubernetes.io/docs/tasks/tools/)

2.PostgreSQL客户端

   * [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

3.PostgreSQL数据库连接：

   * 主持人
   * 端口
   * 用户名
     * 如果使用捆绑版本，则为`postgres`
   * 密码
     * 如果使用捆绑版本，则为`postgres`
   * 数据库名称
     * 如果使用捆绑版本，则为`postgres`

4.Clickhouse数据库凭证* 主持人
   * 端口
   * 用户名
     * 如果使用捆绑版本，则为`default`
   * 密码
     * 如果使用捆绑版本，则为`password`
   * 数据库名称
     * 如果使用捆绑版本，则为`default`

5. 从将运行迁移脚本的计算机连接到 PostgreSQL 数据库。

   * 如果您使用捆绑版本，您可能需要将 postgresql 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-postgres 5432:5432` 将 postgresql 服务端口转发到本地计算机。

6. 从将运行迁移脚本的计算机连接到 Clickhouse 数据库。

   * 如果您使用的是捆绑版本，您可能需要将 clickhouse 服务端口转发到您的本地计算机。
     * 运行 `kubectl port-forward svc/langsmith-clickhouse 8123:8123` 将 clickhouse 服务端口转发到本地计算机。
   * 如果您使用 Clickhouse Cloud，您将需要指定 --ssl 标志并使用端口 `8443`

7.删除工作空间的脚本

   * 下载[workspace script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/delete_workspace.sh)

### 运行单个工作区的删除脚本

运行以下命令来运行工作区删除脚本：

```bash
sh delete_workspace.sh <postgres_url> <clickhouse_url> --workspace_id <workspace_id>
```例如，如果您使用带有端口转发的捆绑版本，则命令将如下所示：

```bash
sh delete_workspace.sh "postgres://postgres:postgres@localhost:5432/postgres" "clickhouse://default:password@localhost:8123/default" --workspace_id 4ec70ec7-0808-416a-b836-7100aeec934b
```

如果您访问 LangSmith UI，您现在应该看到工作区已删除。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-delete-a-workspace.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>