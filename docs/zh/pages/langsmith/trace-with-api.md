<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace with API | https://docs.langchain.com/langsmith/trace-with-api -->

# 使用 API 进行跟踪

了解如何直接使用 LangSmith REST API 跟踪 LLM 申请。

本指南介绍了使用 [REST API](/langsmith/smith-api-ref) 进行跟踪的两种方法：使用 `POST /runs` 和 `PATCH /runs` 端点进行基本跟踪，以及使用 `POST /runs/multipart` 进行批量摄取以获得更高的吞吐量。

有关端点和请求/响应模式的完整列表，请参阅[API reference](/langsmith/smith-api-ref)。

<Warning>
  我们强烈建议使用 [Python](/langsmith/smith-python-sdk) 或 [TypeScript](/langsmith/smith-js-ts-sdk) SDK 将跟踪发送到 LangSmith，而不是直接使用 REST API。 SDK 包括批处理和后台发送优化，可防止跟踪影响应用程序的性能。

  如果您无法使用 SDK，请注意同步发送跟踪可能会影响应用程序性能。
</Warning>

<Note>
  我们建议使用 **UUID v7** 作为运行 ID。 UUIDv7 嵌入了时间戳，可保留跟踪中运行的正确时间顺序。使用 LangSmith SDK 中的 `uuid7()` 生成它们，或参阅 [Specify a custom run ID](/langsmith/annotate-code#specify-a-custom-run-id) 了解更多详细信息。
</Note>

## 基本追踪

记录运行的最简单方法是通过 `POST /runs` 和 `PATCH /runs` 端点。此方法需要最少的信息来建立跟踪层次结构。

<Note>
  使用 LangSmith REST API 时，请在请求标头中提供 [API key](/langsmith/create-account-api-key) 作为 `"x-api-key"`。如果您的 API 密钥链接到多个工作区，请在标题中使用 `"x-tenant-id"` 指定工作区。

  在这种方法中，您不需要设置 `dotted_order` 或 `trace_id` 字段 - 系统会自动生成它们。虽然更简单，但与批量摄取相比，它速度较慢且受到较低的速率限制。
</Note>

以下示例跟踪父链运行和子 LLM 运行的聊天完成情况。在子运行上设置 [⟦T12⟧](/langsmith/run-data-format) 将其附加到其父运行：

```python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import openai
import os
import requests
from datetime import datetime, timezone
from langsmith import uuid7

# Send your API Key in the request headers
headers = {
    "x-api-key": os.environ["LANGSMITH_API_KEY"],
    "x-tenant-id": os.environ["LANGSMITH_WORKSPACE_ID"]
}

def post_run(run_id, name, run_type, inputs, parent_id=None):
    """Function to post a new run to the API."""
    data = {
        "id": run_id.hex,
        "name": name,
        "run_type": run_type,
        "inputs": inputs,
        "start_time": datetime.utcnow().isoformat(),
        # "session_name": "project-name",  # the name of the project to trace to
        # "session_id": "project-id",  # the ID of the project to trace to. specify one of session_name or session_id
    }
    if parent_id:
        data["parent_run_id"] = parent_id.hex

    requests.post(
        "https://api.smith.langchain.com/runs",  # Update for self-hosted, GCP EU (`eu.api...`), GCP APAC (`apac.api...`), or AWS US (`aws.api...`)
        json=data,
        headers=headers
    )

def patch_run(run_id, outputs):
    """Function to patch a run with outputs."""
    requests.patch(
        f"https://api.smith.langchain.com/runs/{run_id}",
        json={
            "outputs": outputs,
            "end_time": datetime.now(timezone.utc).isoformat(),
        },
        headers=headers,
    )

# This can be a user input to your app
question = "Can you summarize this morning's meetings?"

# This can be retrieved in a retrieval step
context = "During this morning's meeting, we solved all world conflict."

messages = [
    {"role": "system", "content": "You are a helpful assistant. Please respond to the user's request only based on the given context."},
    {"role": "user", "content": f"Question: {question}\nContext: {context}"}
]

# Create parent run
parent_run_id = uuid7()
post_run(parent_run_id, "Chat Pipeline", "chain", {"question": question})

# Create child run
child_run_id = uuid7()
post_run(child_run_id, "OpenAI Call", "llm", {"messages": messages}, parent_run_id)

# Generate a completion
client = openai.Client()
chat_completion = client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=messages
)

# End runs
patch_run(child_run_id, chat_completion.dict())
patch_run(parent_run_id, {"answer": chat_completion.choices[0].message.content})
```

欲了解更多信息，请参阅[Run (span) data format](/langsmith/run-data-format)。

## 批量摄取

为了更快的摄取和更高的速率限制，请使用 [⟦T13⟧](/langsmith/smith-api/runs/ingest-runs-multipart) 端点。这需要 [⟦T14⟧](https://pypi.org/project/requests-toolbelt/) 和 [⟦T15⟧](https://pypi.org/project/uuid-utils/) 软件包。

与基本跟踪不同，此端点需要您自己计算和设置 [⟦T16⟧](/langsmith/run-data-format#what-is-dotted_order) 和 [⟦T17⟧](/langsmith/run-data-format)。 `dotted_order` 使用点连接的父项和子项对每个运行的时间戳和 UUID 进行编码（例如，`20240101T000000Z<parent-uuid>.20240101T000001Z<child-uuid>`），告诉 LangSmith 运行如何关联以及它们发生的顺序。 `trace_id` 是根运行的 UUID。

以下示例创建父运行和子运行，在单个批处理请求中发送它们，然后使用它们的输出修补它们：

```python expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List
import requests
from requests_toolbelt import MultipartEncoder
from uuid_utils.compat import uuid7

def create_dotted_order(
    start_time: datetime | None = None,
    run_id: uuid.UUID | None = None
) -> str:
    """Create a dotted order string for run ordering and hierarchy.

    The dotted order is used to establish the sequence and relationships between runs.
    It combines a timestamp with a unique identifier to ensure proper ordering and tracing.
    """
    st = start_time or datetime.now(timezone.utc)
    id_ = run_id or uuid7()
    return f"{st.strftime('%Y%m%dT%H%M%S%fZ')}{id_}"

def create_run_base(
    name: str,
    run_type: str,
    inputs: dict,
    start_time: datetime
) -> dict:
    """Create the base structure for a run."""
    run_id = uuid7()
    return {
        "id": str(run_id),
        "trace_id": str(run_id),
        "name": name,
        "start_time": start_time.isoformat(),
        "inputs": inputs,
        "run_type": run_type,
    }

def construct_run(
    name: str,
    run_type: str,
    inputs: dict,
    parent_dotted_order: str | None = None,
) -> dict:
    """Construct a run dictionary with the given parameters.

    This function creates a run with a unique ID and dotted order, establishing its place
    in the trace hierarchy if it's a child run.
    """
    start_time = datetime.now(timezone.utc)
    run = create_run_base(name, run_type, inputs, start_time)
    current_dotted_order = create_dotted_order(start_time, uuid.UUID(run["id"]))

    if parent_dotted_order:
        current_dotted_order = f"{parent_dotted_order}.{current_dotted_order}"
        run["trace_id"] = parent_dotted_order.split(".")[0].split("Z")[1]
        run["parent_run_id"] = parent_dotted_order.split(".")[-1].split("Z")[1]

    run["dotted_order"] = current_dotted_order
    return run

def serialize_run(operation: str, run_data: dict) -> List[tuple]:
    """Serialize a run for the multipart request.

    This function separates the run data into parts for efficient transmission and storage.
    The main run data and optional fields (inputs, outputs, events) are serialized separately.
    """
    run_id = run_data.get("id", str(uuid7()))

    # Separate optional fields
    inputs = run_data.pop("inputs", None)
    outputs = run_data.pop("outputs", None)
    events = run_data.pop("events", None)

    parts = []

    # Serialize main run data
    run_data_json = json.dumps(run_data).encode("utf-8")
    parts.append(
        (
            f"{operation}.{run_id}",
            (
                None,
                run_data_json,
                "application/json",
                {"Content-Length": str(len(run_data_json))},
            ),
        )
    )

    # Serialize optional fields
    for key, value in [("inputs", inputs), ("outputs", outputs), ("events", events)]:
        if value:
            serialized_value = json.dumps(value).encode("utf-8")
            parts.append(
                (
                    f"{operation}.{run_id}.{key}",
                    (
                        None,
                        serialized_value,
                        "application/json",
                        {"Content-Length": str(len(serialized_value))},
                    ),
                )
            )

    return parts

def batch_ingest_runs(
    api_url: str,
    api_key: str,
    posts: list[dict] | None = None,
    patches: list[dict] | None = None,
) -> None:
    """Ingest multiple runs in a single batch request.

    This function handles both creating new runs (posts) and updating existing runs (patches).
    It's more efficient for ingesting multiple runs compared to individual API calls.
    """
    boundary = uuid.uuid4().hex
    all_parts = []

    for operation, runs in zip(("post", "patch"), (posts, patches)):
        if runs:
            all_parts.extend(
                [part for run in runs for part in serialize_run(operation, run)]
            )

    encoder = MultipartEncoder(fields=all_parts, boundary=boundary)
    headers = {"Content-Type": encoder.content_type, "x-api-key": api_key}

    try:
        response = requests.post(
            f"{api_url}/runs/multipart",
            data=encoder,
            headers=headers
        )
        response.raise_for_status()
        print("Successfully ingested runs.")
    except requests.RequestException as e:
        print(f"Error ingesting runs: {e}")
        # In a production environment, you might want to log this error or handle it more robustly

# Configure API URL and key
# For production use, consider using a configuration file or environment variables
api_url = "https://api.smith.langchain.com"  # GCP EU: eu.api...; GCP APAC: apac.api...; AWS US: aws.api... for regional SaaS
api_key = os.environ.get("LANGSMITH_API_KEY")

if not api_key:
    raise ValueError("LANGSMITH_API_KEY environment variable is not set")

# Create a parent run
parent_run = construct_run(
    name="Parent Run",
    run_type="chain",
    inputs={"main_question": "Tell me about France"},
)

# Create a child run, linked to the parent
child_run = construct_run(
    name="Child Run",
    run_type="llm",
    inputs={"question": "What is the capital of France?"},
    parent_dotted_order=parent_run["dotted_order"],
)

# First, post the runs to create them
posts = [parent_run, child_run]
batch_ingest_runs(api_url, api_key, posts=posts)

# Then, update the runs with their end times and any outputs
child_run_update = {
    **child_run,
    "end_time": datetime.now(timezone.utc).isoformat(),
    "outputs": {"answer": "Paris is the capital of France."},
}

parent_run_update = {
    **parent_run,
    "end_time": datetime.now(timezone.utc).isoformat(),
    "outputs": {"summary": "Discussion about France, including its capital."},
}

patches = [parent_run_update, child_run_update]
batch_ingest_runs(api_url, api_key, patches=patches)

# Note: This example requires the `requests` and `requests_toolbelt` libraries.
# You can install them using pip:
# pip install requests requests_toolbelt
```

## 相关

* [Run (span) data format](/langsmith/run-data-format)
* [Specify a custom run ID](/langsmith/annotate-code#specify-a-custom-run-id)
* [Custom instrumentation](/langsmith/annotate-code)

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-api.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>