<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure webhook notifications for rules | https://docs.langchain.com/langsmith/webhooks -->

# 为规则配置 webhook 通知

配置 Webhook 通知以在自动化规则与 LangSmith 中的新运行匹配时接收 POST 请求。

当您在自动化操作上添加 Webhook URL 时，只要您定义的规则与任何新运行匹配，LangSmith 就会向您的 Webhook 端点发出 POST 请求。

<img alt="Webhook" />

## Webhook 负载

LangSmith 发送到您的 webhook 端点的负载包含：

* `"rule_id"`：这是发送此有效负载的自动化的 ID。
* `"start_time"` 和 `"end_time"`：这些是 LangSmith 找到匹配运行的时间边界。
* `"runs"`：这是一个运行数组，其中每个运行都是一个字典。如果您需要有关每次运行的更多信息，请使用端点中的 SDK 从 API 获取它。
* `"feedback_stats"`：这是一本包含运行反馈统计数据的字典。以下代码块显示了此字段的示例有效负载。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
"feedback_stats": {
    "about_langchain": {
        "n": 1,
        "avg": 0.0,
        "show_feedback_arrow": true,
        "values": {}
    },
    "category": {
        "n": 0,
        "avg": null,
        "show_feedback_arrow": true,
        "values": {
            "CONCEPTUAL": 1
        }
    },
    "user_score": {
        "n": 2,
        "avg": 0.0,
        "show_feedback_arrow": false,
        "values": {}
    },
    "vagueness": {
        "n": 1,
        "avg": 0.0,
        "show_feedback_arrow": true,
        "values": {}
    }
}
```

<Note>
  **从 S3 URL 获取**

  根据您运行的最新情况，`inputs_s3_urls` 和 `outputs_s3_urls` 字段可能包含实际数据的 S3 URL，而不是数据本身。

  `inputs`和`outputs`可以分别通过`inputs_s3_urls`和`outputs_s3_urls`中提供的`ROOT.presigned_url`来获取。
</Note>这是 LangSmith 发送到您的 webhook 端点的整个有效负载的示例：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "rule_id": "d75d7417-0c57-4655-88fe-1db3cda3a47a",
  "start_time": "2024-04-05T01:28:54.734491+00:00",
  "end_time": "2024-04-05T01:28:56.492563+00:00",
  "runs": [
    {
      "status": "success",
      "is_root": true,
      "trace_id": "6ab80f10-d79c-4fa2-b441-922ed6feb630",
      "dotted_order": "20230505T051324571809Z6ab80f10-d79c-4fa2-b441-922ed6feb630",
      "run_type": "tool",
      "modified_at": "2024-04-05T01:28:54.145062",
      "tenant_id": "2ebda79f-2946-4491-a9ad-d642f49e0815",
      "end_time": "2024-04-05T01:28:54.085649",
      "name": "Search",
      "start_time": "2024-04-05T01:28:54.085646",
      "id": "6ab80f10-d79c-4fa2-b441-922ed6feb630",
      "session_id": "6a3be6a2-9a8c-4fc8-b4c6-a8983b286cc5",
      "parent_run_ids": [],
      "child_run_ids": null,
      "direct_child_run_ids": null,
      "total_tokens": 0,
      "completion_tokens": 0,
      "prompt_tokens": 0,
      "total_cost": null,
      "completion_cost": null,
      "prompt_cost": null,
      "first_token_time": null,
      "app_path": "/o/2ebda79f-2946-4491-a9ad-d642f49e0815/projects/p/6a3be6a2-9a8c-4fc8-b4c6-a8983b286cc5/r/6ab80f10-d79c-4fa2-b441-922ed6feb630?trace_id=6ab80f10-d79c-4fa2-b441-922ed6feb630&start_time=2023-05-05T05:13:24.571809",
      "in_dataset": false,
      "last_queued_at": null,
      "inputs": null,
      "inputs_s3_urls": null,
      "outputs": null,
      "outputs_s3_urls": null,
      "extra": null,
      "events": null,
      "feedback_stats": null,
      "serialized": null,
      "share_token": null
    }
  ]
}
```

## 安全

将秘密查询字符串参数添加到 Webhook URL 并在每个传入请求上验证它。这可确保如果有人发现您的 Webhook URL，您可以将这些调用与真实的 Webhook 通知区分开来。

一个例子是

```
https://api.example.com/langsmith_webhook?secret=38ee77617c3a489ab6e871fbeb2ec87d
```

### Webhook 自定义 HTTP 标头

如果您想使用 Webhook 发送任何特定标头，可以根据 URL 进行配置。要进行设置，请单击 URL 字段旁边的 `Headers` 选项并添加标头。

<Note>
  标头以加密格式存储。
</Note>

<img alt="Webhook headers" />

### Webhook 传递

将事件传送到 Webhook 端点时，LangSmith 遵循以下准则：* 如果 LangSmith 无法连接到您的端点，LangSmith 会在声明传送失败之前重试传输连接最多 2 次。
* 如果您的端点回复时间超过 5 秒，LangSmith 将声明传送失败并且不会重试。
* 如果您的端点在 5 秒内返回 5xx 状态代码，LangSmith 将使用指数退避重试最多 2 次。
* 如果您的端点返回 4xx 状态代码，则 LangSmith 声明传送失败并且不会重试。
* 您的端点在正文中返回的任何内容都将被忽略。

## 确保评估在 webhook 触发之前完成

默认情况下，自动化规则按独立的计划运行。扫描同一项目的 Webhook 规则和在线评估器规则可以在不同时间获取相同的运行，因此 Webhook 可能会在评估器有机会对运行进行评分之前触发。

推荐的解决方案是向您的 Webhook 规则添加*反馈过滤器*。这告诉 LangSmith 仅当运行已达到预期分数时才将运行发送到您的 webhook，无论何时评估。例如，您有一个生成 `answer_usefulness` 分数的在线评估器，以及一个仅在该分数出现后才触发的 Webhook 规则。

1. 在跟踪项目的 **Automations** 选项卡中打开 Webhook 自动化规则。

2. 编辑规则的过滤器以需要反馈密钥。在过滤器构建器中，添加条件：

   ```
   has(feedback_key, "answer_usefulness")
   ```

3. 保存规则。

现在，webhook 规则将跳过任何尚未获得 `answer_usefulness` 分数的运行。当评估器规则运行并附加分数时，Webhook 规则的下一个轮询周期将获取这些运行并将它们发送到您的端点。

<Tip>
  您还可以过滤分数值本身，而不仅仅是它的存在。例如，仅将有用性分数较低的运行发送到您的端点：

  ```
  has(feedback_key, "answer_usefulness") and feedback_score < 0.5
  ```

  有关完整的过滤器语法，请参阅[Filter traces](/langsmith/filter-traces-in-application)。
</Tip><Note>
  在单个自动化规则中，操作按固定顺序执行：注释队列 → 数据集 → Webhook → 评估。这意味着，如果您的 Webhook 和评估器在 **相同​​* 规则上配置，则 Webhook 将始终在该规则运行的评估完成之前触发。为了确保 Webhook 收到评估分数，请将 Webhook 和评估器保留为**单独的规则**，并在 Webhook 规则上使用反馈过滤器，如示例中所述。
</Note>

## 模态示例

### 设置

有关如何设置的示例，本指南使用 [Modal](https://modal.com/)。 Modal 提供用于推理和微调的自动缩放 GPU、代码代理的安全容器化以及无服务器 Python Web 端点。本指南重点介绍 Web 端点。

首先，创建一个模态帐户。然后，本地安装 Modal SDK：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install modal
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add modal
  ```
</CodeGroup>

要完成帐户设置，请运行以下命令：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
modal setup
```

按照说明完成帐户设置。

### 秘密

接下来，您需要在 Modal 中设置一些秘密。首先，LangSmith 需要通过传递秘密来向 Modal 进行身份验证。
最简单的方法是在查询参数中传递一个秘密。
要验证此机密，请在 *Modal* 中添加一个机密来验证它。
按 [creating a Modal secret](https://modal.com/docs/guide/secrets) 执行此操作。
将密钥命名为 `ls-webhook` 并设置一个名为 `LS_WEBHOOK` 的环境变量。

您还可以设置 LangSmith 秘密 - 幸运的是已经有一个集成模板！

<img alt="LangSmith Modal Template" />

### 服务

之后，您可以创建一个 Python 文件作为端点。
以下代码块显示了一个示例，并带有注释解释了发生的情况：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastapi import HTTPException, status, Request, Query
from modal import Secret, Stub, web_endpoint, Image

stub = Stub("auth-example", image=Image.debian_slim().pip_install("langsmith"))


@stub.function(
    secrets=[Secret.from_name("ls-webhook"), Secret.from_name("my-langsmith-secret")]
)
# We want this to be a `POST` endpoint since we will post data here
@web_endpoint(method="POST")
# We set up a `secret` query parameter
def f(data: dict, secret: str = Query(...)):
    # You can import dependencies you don't have locally inside Modal functions
    from langsmith import Client

    # First, we validate the secret key we pass
    import os

    if secret != os.environ["LS_WEBHOOK"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # This is where we put the logic for what should happen inside this webhook
    ls_client = Client()
    runs = data["runs"]
    ids = [r["id"] for r in runs]
    feedback = list(ls_client.list_feedback(run_ids=ids))
    for r, f in zip(runs, feedback):
        try:
            ls_client.create_example(
                inputs=r["inputs"],
                outputs={"output": f.correction},
                dataset_name="classifier-github-issues",
            )
        except Exception:
            raise ValueError(f"{r} and {f}")
    # Function body
    return "success!"
```

使用 `modal deploy ...` 进行部署（请参阅[managing Modal deployments](https://modal.com/docs/guide/managing-deployments)）。

你现在应该得到类似的东西：

```
✓ Created objects.
├── 🔨 Created mount /Users/harrisonchase/workplace/langsmith-docs/example-webhook.py
├── 🔨 Created mount PythonPackage:langsmith
└── 🔨 Created f => https://hwchase17--auth-example-f.modal.run
✓ App deployed! 🎉

View Deployment: https://modal.com/apps/hwchase17/auth-example
```

请注意函数 URL：`https://hwchase17--auth-example-f.modal.run`。
注意：这不是最终的部署 URL，请确保不要意外使用它。

### 连接起来

获取您之前创建的函数 URL 并将其添加为 Webhook。
请记住还要传入密钥作为查询参数。
把它们放在一起，它应该看起来像这样：

```
https://hwchase17--auth-example-f-dev.modal.run?secret={SECRET}
```

将 `{SECRET}` 替换为您创建的用于访问 Modal 服务的密钥。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/webhooks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>