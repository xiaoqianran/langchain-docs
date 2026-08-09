<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Import exported data | https://docs.langchain.com/langsmith/data-export-downstream -->

# 导入导出的数据

将 LangSmith 批量导出的 Parquet 数据导入 BigQuery、Snowflake、Redshift、Clickhouse 或 DuckDB。

大多数分析系统普遍支持从 S3 和 Parquet 格式导入数据。请参阅下面的文档链接：

## 大查询

要将数据导入 BigQuery，请参阅 [Loading Data from Parquet](https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-parquet) 以及
[Hive Partitioned loads](https://cloud.google.com/bigquery/docs/hive-partitioned-loads-gcs)。

## 雪花

您可以按照[Load from Cloud Document](https://docs.snowflake.com/en/user-guide/tutorials/load-from-cloud-tutorial)将数据从S3加载到Snowflake中。

## 红移

您可以按照 [AWS COPY command documentation](https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html) 将数据从 S3 或 Parquet 复制到 Amazon Redshift。

## 点击屋

您可以在Clickhouse中直接查询S3/Parquet格式的数据。例如，如果使用GCS，可以按如下方式查询数据：

```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
SELECT count(distinct id) FROM s3('https://storage.googleapis.com/<bucket>/<prefix>/export_id=<export_id>/**',
 'access_key_id', 'access_secret', 'Parquet')
```

请参阅[Clickhouse S3 Integration Documentation](https://clickhouse.com/docs/en/engines/table-engines/integrations/s3)了解更多信息。

## 鸭数据库

您可以使用 DuckDB 通过 SQL 从内存中的 S3 查询数据。参见[S3 import Documentation](https://duckdb.org/docs/guides/network_cloud_storage/s3_import.html)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-export-downstream.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>