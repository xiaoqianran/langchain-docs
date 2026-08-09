<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generate query stats | https://docs.langchain.com/langsmith/script-generate-query-stats -->

# 生成查询统计信息

作为对 LangSmith 自托管实例进行故障排除的一部分，LangChain 团队可能会要求您生成 LangSmith 查询统计信息，这将帮助我们了解推动 LangSmith 产品体验的各种查询的性能。

该命令将生成一个可以与LangChain团队共享的CSV。

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

3. 从将运行 `get_query_stats` 脚本的计算机连接到 Clickhouse 数据库。

   * 如果您使用的是捆绑版本，您可能需要将 clickhouse 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-clickhouse 8123:8123` 将 clickhouse 服务端口转发到本地计算机。

4. 生成查询统计信息的脚本

   * 下载[query stats script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/get_query_stats.sh)

### 运行查询统计生成脚本

运行以下命令来运行统计数据生成脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh get_query_stats.sh <clickhouse_url> --output path/to/file.csv
```例如，如果您使用带有端口转发的捆绑版本，则命令将如下所示：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh get_query_stats.sh "clickhouse://default:password@localhost:8123/default" --output query_stats.csv
```

运行此命令后，您应该会看到已使用 LangSmith 查询统计信息创建了一个文件 query\_stats.csv。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-generate-query-stats.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>