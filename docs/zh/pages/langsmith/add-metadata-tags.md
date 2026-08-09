<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add metadata and tags to traces | https://docs.langchain.com/langsmith/add-metadata-tags -->

# 将元数据和标签添加到跟踪中

LangSmith 支持发送任意元数据和标签以及跟踪。

标签是可用于对跟踪进行分类或标记的字符串。元数据是键值对的字典，可用于存储有关跟踪的附加信息。

两者对于将附加信息与跟踪关联起来都很有用，例如执行跟踪的环境、启动跟踪的用户或内部关联 ID。有关标签和元数据的更多信息，请参阅[Concepts](/langsmith/observability-concepts#tags)页面。有关如何按元数据和标签查询跟踪和运行的信息，请参阅 [Filter traces in the application](/langsmith/filter-traces-in-application) 页面。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import openai
  import langsmith as ls
  from langsmith.wrappers import wrap_openai

  client = openai.Client()
  messages = [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
  ]

      # You can set metadata & tags **statically** when decorating a function
      # Use the @traceable decorator with tags and metadata
      # Ensure that the LANGSMITH_TRACING environment variables are set for @traceable to work
      @ls.traceable(
          run_type="llm",
          name="OpenAI Call Decorator",
          tags=["my-tag"],
          metadata={"my-key": "my-value"}
      )
      def call_openai(
          messages: list[dict], model: str = "gpt-5.4-mini"
      ) -> str:
          # You can also dynamically set metadata on the parent run:
          rt = ls.get_current_run_tree()
          rt.metadata["some-conditional-key"] = "some-val"
          rt.tags.extend(["another-tag"])
          return client.chat.completions.create(
              model=model,
              messages=messages,
          ).choices[0].message.content

      call_openai(
          messages,
          # To add at **invocation time**, when calling the function.
          # via the langsmith_extra parameter
          langsmith_extra={"tags": ["my-other-tag"], "metadata": {"my-other-key": "my-value"}}
      )

      # or you can dynamically set default metadata for runs in the given scope
      # tracing_context doesn't create a span itself, but it does initialize the
      # context for child spans that are created.
      with ls.tracing_context(metadata={"default-key": "default-value"}):
          call_openai(messages)

      # Alternatively, you can use the trace context manager
      # This creates a new span with the given metadata and tags
      with ls.trace(
          name="OpenAI Call Trace",
          run_type="llm",
          inputs={"messages": messages},
          tags=["my-tag"],
          metadata={"my-key": "my-value"},
      ) as rt:
          chat_completion = client.chat.completions.create(
              model="gpt-5.4-mini",
              messages=messages,
          )
          rt.metadata["some-conditional-key"] = "some-val"
          rt.end(outputs={"output": chat_completion})

  # You can use the same techniques with the wrapped client
  patched_client = wrap_openai(
      client, tracing_extra={"metadata": {"my-key": "my-value"}, "tags": ["a-tag"]}
  )
  chat_completion = patched_client.chat.completions.create(
      model="gpt-5.4-mini",
      messages=messages,
      langsmith_extra={
          "tags": ["my-other-tag"],
          "metadata": {"my-other-key": "my-value"},
      },
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { traceable, getCurrentRunTree } from "langsmith/traceable";
  import { wrapOpenAI } from "langsmith/wrappers";

      const client = wrapOpenAI(new OpenAI());
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello!" },
      ];

      const traceableCallOpenAI = traceable(
          async (messages: OpenAI.Chat.ChatCompletionMessageParam[]) => {
              const completion = await client.chat.completions.create({
                  model: "gpt-5.4-mini",
                  messages,
              });
              const runTree = getCurrentRunTree();
              runTree.extra.metadata = {
                  ...runTree.extra.metadata,
                  someKey: "someValue",
              };
              runTree.tags = [...(runTree.tags ?? []), "runtime-tag"];
              return completion.choices[0].message.content;
          },
          {
              run_type: "llm",
              name: "OpenAI Call Traceable",
              tags: ["my-tag"],
              metadata: { "my-key": "my-value" },
          }
      );

  // Call the traceable function
  await traceableCallOpenAI(messages);
  ```
</CodeGroup>

<Tip>
  **LangSmith 部署**：要在代理服务器部署中每次调用动态添加元数据，我们建议在 [factory function](/langsmith/graph-rebuild) 中使用 `tracing_context`。示例请参见[Customize tracing in deployed agents](/langsmith/conditional-tracing#customize-tracing-in-deployed-agents)。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/add-metadata-tags.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>