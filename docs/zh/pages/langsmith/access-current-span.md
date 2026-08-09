<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Access the current run (span) within a traced function | https://docs.langchain.com/langsmith/access-current-span -->

# 访问跟踪函数中的当前运行（跨度）

在某些情况下，您需要访问跟踪函数中的当前运行（跨度）。这对于从当前运行中提取 UUID、标签或其他信息非常有用。

您可以通过分别调用Python或TypeScript SDK中的`get_current_run_tree`/`getCurrentRunTree`函数来访问当前运行。

有关 `RunTree` 对象的可用属性的完整列表，请参阅 [this reference](/langsmith/run-data-format)。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable
  from langsmith.run_helpers import get_current_run_tree
  from openai import Client

      openai = Client()

      @traceable
      def format_prompt(subject):
          run = get_current_run_tree()
          print(f"format_prompt Run Id: {run.id}")
          print(f"format_prompt Trace Id: {run.trace_id}")
          print(f"format_prompt Parent Run Id: {run.parent_run.id}")
          return [
              {
                  "role": "system",
                  "content": "You are a helpful assistant.",
              },
              {
                  "role": "user",
                  "content": f"What's a good name for a store that sells {subject}?"
              }
          ]

      @traceable(run_type="llm")
      def invoke_llm(messages):
          run = get_current_run_tree()
          print(f"invoke_llm Run Id: {run.id}")
          print(f"invoke_llm Trace Id: {run.trace_id}")
          print(f"invoke_llm Parent Run Id: {run.parent_run.id}")
          return openai.chat.completions.create(
              messages=messages, model="gpt-5.4-mini", temperature=0
          )

      @traceable
      def parse_output(response):
          run = get_current_run_tree()
          print(f"parse_output Run Id: {run.id}")
          print(f"parse_output Trace Id: {run.trace_id}")
          print(f"parse_output Parent Run Id: {run.parent_run.id}")
          return response.choices[0].message.content

      @traceable
      def run_pipeline():
          run = get_current_run_tree()
          print(f"run_pipeline Run Id: {run.id}")
          print(f"run_pipeline Trace Id: {run.trace_id}")
          messages = format_prompt("colorful socks")
          response = invoke_llm(messages)
          return parse_output(response)

  run_pipeline()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable, getCurrentRunTree } from "langsmith/traceable";
  import OpenAI from "openai";

      const openai = new OpenAI();

      const formatPrompt = traceable((subject: string) => {
          const run = getCurrentRunTree();
          console.log("formatPrompt Run ID", run.id)
          console.log("formatPrompt Trace ID", run.trace_id)
          console.log("formatPrompt Parent Run ID", run.parent_run.id)
          return [
              {
                  role: "system" as const,
                  content: "You are a helpful assistant.",
              },
              {
                  role: "user" as const,
                  content: `What's a good name for a store that sells ${subject}?`,
              },
          ];
      }, { name: "formatPrompt" });

      const invokeLLM = traceable(
          async (messages: { role: string; content: string }[]) => {
              const run = getCurrentRunTree();
              console.log("invokeLLM Run ID", run.id)
              console.log("invokeLLM Trace ID", run.trace_id)
              console.log("invokeLLM Parent Run ID", run.parent_run.id)
              return openai.chat.completions.create({
                  model: "gpt-5.4-mini",
                  messages: messages,
                  temperature: 0,
              });
          },
          { run_type: "llm", name: "invokeLLM" }
      );

      const parseOutput = traceable(
          (response: any) => {
              const run = getCurrentRunTree();
              console.log("parseOutput Run ID", run.id)
              console.log("parseOutput Trace ID", run.trace_id)
              console.log("parseOutput Parent Run ID", run.parent_run.id)
              return response.choices[0].message.content;
          },
          { name: "parseOutput" }
      );

      const runPipeline = traceable(
          async () => {
              const run = getCurrentRunTree();
              console.log("runPipline Run ID", run.id)
              console.log("runPipline Trace ID", run.trace_id)
              console.log("runPipline Parent Run ID", run.parent_run?.id)
              const messages = await formatPrompt("colorful socks");
              const response = await invokeLLM(messages);
              return parseOutput(response);
          },
          { name: "runPipeline" }
      );

  await runPipeline();
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/access-current-span.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>