<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run support queries against ClickHouse | https://docs.langchain.com/langsmith/script-running-ch-support-queries -->

# 针对 ClickHouse 运行支持查询

此 Helm 存储库包含用于生成 LangSmith UI 当前不直接支持的输出的查询（例如，从 Clickhouse 获取查询异常日志）。

此命令采用包含嵌入式名称和密码（可以从对机密管理器的调用中传递）的 clickhouse 连接字符串，并从输入文件执行查询。在下面的示例中，我们使用 `support_queries/clickhouse` 目录中的 `ch_get_query_exceptions.sql` 输入文件。

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

3. 从将运行迁移脚本的计算机连接到 Clickhouse 数据库。

   * 如果您使用的是捆绑版本，您可能需要将 clickhouse 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-clickhouse 8123:8123` 将 clickhouse 服务端口转发到您的本地计算机。

4. 运行支持查询的脚本

   * 下载[ClickHouse support query script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/run_support_query_ch.sh)### 运行查询脚本

运行以下命令来运行所需的查询：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_ch.sh <clickhouse_url> --input path/to/query.sql
```

例如，如果您使用带有端口转发的捆绑版本，则命令可能如下所示：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_ch.sh "clickhouse://default:password@localhost:8123/default" --input support_queries/clickhouse/ch_get_query_exceptions.sql
```

它将输出过去 7 天内在 Clickhouse 中抛出异常的所有查询的查询日志。要将其提取到文件中，请添加标志 `--output path/to/file.csv`

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-running-ch-support-queries.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>