<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How SmithDB handles data | https://docs.langchain.com/langsmith/self-host-smithdb-data-paths -->

# SmithDB 如何处理数据

SmithDB 如何在自托管 LangSmith 上编写运行、回答查询、应用反馈和删除以及压缩存储的数据。

SmithDB 在固定路径上写入运行、回答查询、应用反馈和删除以及压缩存储的数据。了解这些路径有助于您在监控 SmithDB 时判断延迟或故障发生在何处。有关此页面上的组件和术语，请参阅[SmithDB architecture](/langsmith/self-host-smithdb-architecture)。

## 写入路径

写入路径是 SDK 中的新运行如何到达 SmithDB 中的持久存储的方式。

![The platform backend adds a task to Redis. An ingest queue worker writes the runs to SmithDB ingestion, which writes segments to object storage and segment rows to the metastore, then acknowledges the write.](https://mintcdn.com/langchain-5e9cc07a/Dyw7UArGNhicMzqy/images/langsmith/smithdb/write-path.svg?fit=max\&auto=format\&n=Dyw7UArGNhicMzqy\&q=85\&s=f44b3328a1562c24b0d8821ca61389a1)

1. 平台后端从 SDK 接收运行，并将一个*任务*（一批运行）添加到 Redis 中的摄取队列中。
2. 摄取队列工作线程接受任务。
3. 工作线程将运行发送到 SmithDB 摄取。摄取会将行在内存中保留很短的时间。
4. 摄取将行作为“段”写入对象存储，这是一个数据文件，SmithDB 在写入后永远不会更改。
5. 摄取将片段记录在*元存储*中。当段位于对象存储和元存储中时，数据是持久的。
6. 摄取确认对工作线程的写入，并且工作线程从 Redis 中删除该任务。如果写入失败，任务将保留在 Redis 中，工作人员稍后会再次尝试。在固定次数的失败尝试后，工作人员会放弃，并且任务的运行会丢失。 Redis 中的运行数据也会在固定时间后过期。由于任务会保留在 Redis 中，直到摄取确认写入为止，因此缓慢或失败的写入首先会在 Redis 中显示为较大的队列。

写入后，摄取将新段的副本保留在其“磁盘缓存”上，以便查询可以从中读取最新数据。随后，摄取将小片段合并为大片段，而压缩则在后台继续这项工作。磁盘缓存从不保存数据的唯一副本。

## 读取路径

读取路径是 SmithDB 如何回答来自 LangSmith 的查询，例如跟踪、运行列表和运行统计信息。

![The platform backend queries SmithDB query, which reads the segment list from the metastore and segments from its disk cache, object storage, or the ingestion pod that wrote them.](https://mintcdn.com/langchain-5e9cc07a/Dyw7UArGNhicMzqy/images/langsmith/smithdb/read-path.svg?fit=max\&auto=format\&n=Dyw7UArGNhicMzqy\&q=85\&s=a29cb9bd427390c2fd1d5a22f6109fd0)1. 平台后端将UI和API查询发送到SmithDB查询。
2. 查询询问元存储哪些段包含租户、项目和时间范围的数据。
3. 对于每个段，查询使用拥有该段的最快源。它从写入它们的摄取 Pod 中读取最新的段，并从其*磁盘缓存*中读取所有其他段。
4. 如果该段不在磁盘缓存中，或者摄取 Pod 不可用，查询将从对象存储中读取它。它在磁盘缓存上保留一个副本以供下一个查询使用。
5. 查询将所有段合并为一个结果，删除已删除和过期的行，并将结果发送到平台后端。

查询必须读取的段越多，速度就越慢。 *压缩*将小段合并为大段以保持较低的数量。如果压缩晚了，查询就会变慢，并且查询会拒绝必须读取太多段的查询。

## 反馈并删除路径

反馈和删除路径是 SmithDB 更改其已存储的运行的方式：它将反馈添加到运行并删除已删除的运行。

![The platform backend adds feedback and delete tasks to Redis. An ingest queue worker sends them to the SmithDB mutations pool, which records feedback rows and deletion vectors in the metastore. Compaction later writes feedback files and rewrites segments in object storage.](https://mintcdn.com/langchain-5e9cc07a/Dyw7UArGNhicMzqy/images/langsmith/smithdb/feedback-delete-path.svg?fit=max\&auto=format\&n=Dyw7UArGNhicMzqy\&q=85\&s=98724af644e6b9935d7c73d598db94f9)

由于 SmithDB 永远不会更改段，因此反馈和删除会遵循自己的路径并进入同一个 SmithDB 池。1.平台后台收到反馈并删除。它将任务添加到 Redis 中的队列：反馈进入*反馈队列*，删除则进入另一个任务队列。
2. 摄取队列工作线程接受任务。
3. 工作线程将任务发送到 SmithDB 突变池，如果突变池未启用，则发送到查询池。
4. SmithDB 将反馈作为行存储在元存储中。对于删除，SmithDB 会找到要删除的行并将它们作为*删除向量*记录在元存储中。
5. SmithDB向worker确认更改，worker从Redis中删除任务。从那时起，查询将显示新的反馈并隐藏已删除的行。
6. 随后，压缩作业读取新的反馈和删除向量。
7. 在对象存储中，压缩作业将反馈写入运行段旁边的文件中，并重写受影响的段而不删除已删除的行。

## 压缩路径

压缩路径是 SmithDB 保持存储数据快速查询的方式：它合并小段，将反馈写入文件，并删除过期和删除的数据。1. 压缩调度程序监视元存储中的新段和更改段，并为它们计划“压缩作业”。它将作业保留在内存中的队列中。
2. 压缩工作线程接受作业，从对象存储中读取其输入段，并将新段写入对象存储。例如，它将小段合并为一个大段，将反馈写入文件，或者重写一个段而不删除已删除和过期的行。
3. 第一步，worker 将元存储中的旧段替换为新段。如果另一个作业首先更改了其中一个旧段，则不会发生任何变化并且作业会失败。这种类型的单一故障是正常的。

旧段在对象存储中保留至少一小时，以便较早启动的查询仍然可以读取它们。然后压缩调度程序删除它们。如果调度程序重新启动，它将再次从元存储构建其队列。工作人员在重新启动期间完成的工作将被保留。

## 另请参阅

* [SmithDB architecture](/langsmith/self-host-smithdb-architecture)
* [Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-data-paths.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。