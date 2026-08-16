<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generate ClickHouse stats | https://docs.langchain.com/langsmith/script-generate-clickhouse-stats -->

# 生成 ClickHouse 统计数据

作为对 LangSmith 自托管实例进行故障排除的一部分，LangChain 团队可能会要求您生成 Clickhouse 统计信息，这将帮助我们了解内存和 CPU 消耗以及连接并发性。

此命令将生成一个可与 LangChain 团队共享的 CSV。

### 先决条件

确保您准备好以下工具/物品。

1.kubectl

   * [https://kubernetes.io/docs/tasks/tools/](https://kubernetes.io/docs/tasks/tools/)

2.Clickhouse数据库凭证

   * 主持人
   * 端口
   * 用户名
     * 如果使用捆绑版本，则为`default`
   * 密码
     * 如果使用捆绑版本，则为`password`
   * 数据库名称
     * 如果使用捆绑版本，则为`default`

3. 从将运行 `get_clickhouse_stats` 脚本的计算机连接到 Clickhouse 数据库。

   * 如果您使用的是捆绑版本，您可能需要将 clickhouse 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-clickhouse 8123:8123` 将 clickhouse 服务端口转发到本地计算机。

4.生成ClickHouse统计数据的脚本

   * 下载[ClickHouse stats script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/get_clickhouse_stats.sh)

### 运行 clickhouse 统计数据生成脚本

运行以下命令来运行统计数据生成脚本：

```bash
sh get_clickhouse_stats.sh <clickhouse_url> --output path/to/file.csv
```例如，如果您使用带有端口转发的捆绑版本，则命令将如下所示：

```bash
sh get_clickhouse_stats.sh "clickhouse://default:password@localhost:8123/default" --output clickhouse_stats.csv
```

运行此命令后，您应该会看到已使用 Clickhouse 统计信息创建了一个文件 clickhouse\_stats.csv。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-generate-clickhouse-stats.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>