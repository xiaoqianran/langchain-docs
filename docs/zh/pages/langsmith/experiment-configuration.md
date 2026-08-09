<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Experiment configuration | https://docs.langchain.com/langsmith/experiment-configuration -->

# 实验配置

LangSmith 支持多种实验配置选项：

* [Repetitions](#repetitions)
* [Concurrency](#concurrency)
* [Caching](#caching)

### 重复

*重复*多次运行实验以考虑 LLM 输出的可变性。由于 LLM 输出是不确定的，多次重复可以提供更准确的性能评估。

通过将 `num_repetitions` 参数传递给 `evaluate` / `aevaluate`（[Python](https://reference.langchain.com/python/langsmith/evaluation/_runner/evaluate)、[TypeScript](https://reference.langchain.com/javascript/langsmith/evaluation/EvaluateOptions#member-numRepetitions-9)）来配置重复。每次重复都会重新运行目标函数和所有评估器。

了解更多信息[repetitions how-to guide](/langsmith/repetition)。

### 并发

*并发*控制实验期间同时运行的示例数量。通过将 `max_concurrency` 参数传递给 `evaluate` / `aevaluate` 来配置它。这两个函数的语义不同：

#### `evaluate`

`max_concurrency` 参数指定运行目标函数和求值器的最大并发线程数。

#### `aevaluate`

`max_concurrency` 参数使用信号量来限制并发任务。 `aevaluate` 为每个示例创建一个任务，其中每个任务运行该示例的目标函数和所有评估器。 `max_concurrency` 参数指定要处理的并发示例的最大数量。

### 缓存*缓存* 将 API 调用结果存储到磁盘以加快未来的实验速度。将 `LANGSMITH_TEST_CACHE` 环境变量设置为具有写入权限的有效文件夹路径。未来进行相同 API 调用的实验将重用缓存结果，而不是发出新请求。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/experiment-configuration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>