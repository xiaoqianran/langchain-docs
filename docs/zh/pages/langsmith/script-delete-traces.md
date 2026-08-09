<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete traces | https://docs.langchain.com/langsmith/script-delete-traces -->

# 删除痕迹

LangSmith UI 目前不支持删除单个跟踪。但是，这可以通过直接从 ClickHouse 中的所有物化视图（runs\_history 视图除外）以及运行和反馈表本身中删除跟踪来实现。

该命令可以使用跟踪 ID 作为参数来运行，也可以使用跟踪 ID 列表文件来运行。

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

3. 从将运行 `delete_trace_by_id` 脚本的计算机连接到 Clickhouse 数据库。

   * 如果您使用的是捆绑版本，您可能需要将 clickhouse 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-clickhouse 8123:8123` 将 clickhouse 服务端口转发到本地计算机。

4. 删除痕迹的脚本

   * 下载[trace script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/delete_trace_by_id.sh)

<Warning>
  **批量大小限制**此脚本针对每批多个 ClickHouse 表发出 `DELETE` 突变。大量删除可能会导致服务中断。

  * **每次运行最多 10,000 个跟踪**：分割较大的文件并按顺序处理。
  * **在批次之间等待**：在开始下一批之前留出时间完成删除。
  * 使用 `--sync` 标志进行顺序（较慢但更安全）删除。
</Warning>

### 运行单个跟踪的删除脚本

运行以下命令以使用单个跟踪 ID 运行跟踪删除脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh delete_trace_by_id.sh <clickhouse_url> --trace_id <trace_id>
```

例如，如果您使用带有端口转发的捆绑版本，则命令将如下所示：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh delete_trace_by_id.sh "clickhouse://default:password@localhost:8123/default" --trace_id 4ec70ec7-0808-416a-b836-7100aeec934b
```

如果您访问 LangSmith UI，您现在应该会看到指定的跟踪 ID 不再存在，也不再反映在统计数据中。

### 从每行一个跟踪 ID 的文件中运行多个跟踪的删除脚本

运行以下命令以使用跟踪 ID 列表运行跟踪删除脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh delete_trace_by_id.sh <clickhouse_url> --file <path/to/foo.txt>
```

例如，如果您使用带有端口转发的捆绑版本，则命令将如下所示：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh delete_trace_by_id.sh "clickhouse://default:password@localhost:8123/default" --file path/to/traces.txt
```

如果您访问 LangSmith UI，您现在应该看到所有指定的跟踪都已被删除。

## 故障排除### “找不到跟踪 ID”错误

如果您收到一条错误消息，指出无法找到跟踪 ID，请将 `--ssl` 标志添加到您的命令中。如果没有此标志，脚本可能无法正确连接到 ClickHouse，从而导致错误的“未找到跟踪 ID”错误。

带 SSL 标志的示例：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh delete_trace_by_id.sh "clickhouse://default:password@localhost:8123/default" --file path/to/traces.txt --ssl
```

您还可以通过使用 `clickhouse-cli` 直接连接到 ClickHouse 并在运行删除脚本之前查询跟踪 ID 来验证跟踪是否存在。

### 大数据删除后服务中断

如果服务在删除许多跟踪后变得无响应，则删除队列可能会被淹没。

**预防：** 将每次运行的删除限制为 10,000 条跟踪，并在批次之间等待几分钟以处理删除。

如果您在大量删除后遇到问题，请联系[support](https://support.langchain.com/)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-delete-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>