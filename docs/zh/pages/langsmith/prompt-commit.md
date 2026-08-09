<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to sync prompts with GitHub | https://docs.langchain.com/langsmith/prompt-commit -->

# 如何与 GitHub 同步提示

LangSmith 提供了一个协作界面来创建、测试和迭代提示。

虽然您可以在运行时将 [dynamically fetch prompts](/langsmith/manage-prompts-programmatically#pull-a-prompt) 从 LangSmith 导入到您的应用程序中，但您可能更喜欢将提示与您自己的数据库或版本控制系统同步。为了支持此工作流程，LangSmith 允许您通过 Webhooks 接收提示更新的通知。

**为什么要与 GitHub 同步提示？**

* **版本控制：** 在熟悉的系统中将提示与应用程序代码一起进行版本控制。
* **CI/CD 集成：** 当关键提示发生变化时触发自动暂存或生产部署。

<img alt="Prompt Webhook Diagram" />

## 先决条件

在开始之前，请确保您已进行以下设置：

1. **GitHub 帐户：** 标准 GitHub 帐户。

2. **GitHub 存储库：** 创建一个新的（或选择现有的）存储库，用于存储您的 LangSmith 提示清单。这可以是与您的应用程序代码相同的存储库，也可以是专门用于提示的存储库。

3. **GitHub 个人访问令牌 (PAT)：*** LangSmith Webhooks 不直接与 GitHub 交互——它们调用*您*创建的中间服务器。
   * 此服务器需要 GitHub PAT 来进行身份验证并向您的存储库提交。
   * 必须包含 `repo` 范围（`public_repo` 对于公共存储库就足够了）。
   * 转到 **GitHub > 设置 > 开发人员设置 > 个人访问令牌 > 令牌（经典）**。
   * 单击**生成新令牌（经典）**。
   * 为其命名（例如“LangSmith Prompt Sync”），设置到期时间，然后选择所需的范围。
   * 单击**生成令牌**并**立即复制它** - 它不会再次显示。
   * 安全地存储令牌并将其作为环境变量提供给您的服务器。

## 了解 LangSmith“提示提交”和 webhook

在 LangSmith 中，当您保存对提示的更改时，您实际上是在创建新版本或“提示提交”。这些提交可以触发 webhook。

Webhook 将发送包含新的 **提示清单** 的 JSON 负载。

<Accordion title="Sample Webhook Payload">
  ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  {
    "prompt_id": "f33dcb51-eb17-47a5-83ca-64ac8a027a29",
    "prompt_name": "My Prompt",
    "commit_hash": "commit_hash_1234567890",
    "created_at": "2021-01-01T00:00:00Z",
    "created_by": "Jane Doe",
    "manifest": {
      "lc": 1,
      "type": "constructor",
      "id": ["langchain", "schema", "runnable", "RunnableSequence"],
      "kwargs": {
        "first": {
          "lc": 1,
          "type": "constructor",
          "id": ["langchain", "prompts", "chat", "ChatPromptTemplate"],
          "kwargs": {
            "messages": [
              {
                "lc": 1,
                "type": "constructor",
                "id": [
                  "langchain_core",
                  "prompts",
                  "chat",
                  "SystemMessagePromptTemplate"
                ],
                "kwargs": {
                  "prompt": {
                    "lc": 1,
                    "type": "constructor",
                    "id": [
                      "langchain_core",
                      "prompts",
                      "prompt",
                      "PromptTemplate"
                    ],
                    "kwargs": {
                      "input_variables": [],
                      "template_format": "mustache",
                      "template": "You are a chatbot."
                    }
                  }
                }
              },
              {
                "lc": 1,
                "type": "constructor",
                "id": [
                  "langchain_core",
                  "prompts",
                  "chat",
                  "HumanMessagePromptTemplate"
                ],
                "kwargs": {
                  "prompt": {
                    "lc": 1,
                    "type": "constructor",
                    "id": [
                      "langchain_core",
                      "prompts",
                      "prompt",
                      "PromptTemplate"
                    ],
                    "kwargs": {
                      "input_variables": ["question"],
                      "template_format": "mustache",
                      "template": "{{question}}"
                    }
                  }
                }
              }
            ],
            "input_variables": ["question"]
          }
        },
        "last": {
          "lc": 1,
          "type": "constructor",
          "id": ["langchain", "schema", "runnable", "RunnableBinding"],
          "kwargs": {
            "bound": {
              "lc": 1,
              "type": "constructor",
              "id": ["langchain", "chat_models", "openai", "ChatOpenAI"],
              "kwargs": {
                "temperature": 1,
                "top_p": 1,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "model": "gpt-5.4-mini",
                "extra_headers": {},
                "openai_api_key": {
                  "id": ["OPENAI_API_KEY"],
                  "lc": 1,
                  "type": "secret"
                }
              }
            },
            "kwargs": {}
          }
        }
      }
    }
  }
  ```
</Accordion><Note>
  重要的是要了解用于提示提交的 LangSmith Webhooks 通常在 **工作区级别** 触发。这意味着，如果您的 LangSmith 工作区中的*任何*提示被修改并保存了“提示提交”，则 Webhook 将触发并发送提示的更新清单。有效负载可通过提示 ID 来识别。您的接收服务器在设计时应考虑到这一点。
</Note>

## 实现用于 webhook 接收的 FastAPI 服务器

为了在提示更新时有效处理来自 LangSmith 的 Webhook 通知，需要中间服务器应用程序。该服务器将充当 LangSmith 发送的 HTTP POST 请求的接收者。为了在本指南中进行演示，我们将概述如何创建一个简单的 FastAPI 应用程序来履行此角色。

该可公开访问的服务器将负责：1. **接收Webhook请求：**监听传入的HTTP POST请求。
2. **解析有效负载：** 从请求正文中提取并解释 JSON 格式的提示清单。
3. **提交到 GitHub：** 以编程方式在指定的 GitHub 存储库中创建新提交，其中包含更新的提示清单。这可确保您的提示保持版本控制并与 LangSmith 中所做的更改保持同步。

对于部署，可以利用[Render.com](https://render.com/)（提供合适的免费套餐）、Vercel、Fly.io 或其他云提供商（AWS、GCP、Azure）等平台来托管 FastAPI 应用程序并获取公共 URL。

服务器的核心功能将包括用于 webhook 接收的端点、用于解析清单的逻辑以及与 GitHub API 的集成（使用个人访问令牌进行身份验证）以管理提交。

<Accordion title="Minimal FastAPI Server Code ()">
  `main.py`

  该服务器将侦听来自 LangSmith 的传入 Webhook，并将收到的提示清单提交到您的 GitHub 存储库。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import base64
  import json
  import uuid
  from typing import Any, Dict
  import httpx
  from fastapi import FastAPI, HTTPException, Body
  from pydantic import BaseModel, Field
  from pydantic_settings import BaseSettings, SettingsConfigDict

  # --- Configuration ---
  class AppConfig(BaseSettings):
      """
      Application configuration model.
      Loads settings from environment variables.
      """
      GITHUB_TOKEN: str
      GITHUB_REPO_OWNER: str
      GITHUB_REPO_NAME: str
      GITHUB_FILE_PATH: str = "prompt_manifest.json"
      GITHUB_BRANCH: str = "main"
      model_config = SettingsConfigDict(
          env_file=".env",
          env_file_encoding='utf-8',
          extra='ignore'
      )

  settings = AppConfig()

  # --- Pydantic Models ---
  class WebhookPayload(BaseModel):
      """
      Defines the expected structure of the incoming webhook payload.
      """
      prompt_id: UUID = Field(
          ...,
          description="The unique identifier for the prompt."
      )
      prompt_name: str = Field(
          ...,
          description="The name/title of the prompt."
      )
      commit_hash: str = Field(
          ...,
          description="An identifier for the commit event that triggered the webhook."
      )
      created_at: str = Field(
          ...,
          description="Timestamp indicating when the event was created (ISO format preferred)."
      )
      created_by: str = Field(
          ...,
          description="The name of the user who created the event."
      )
      manifest: Dict[str, Any] = Field(
          ...,
          description="The main content or configuration data to be committed to GitHub."
      )

  # --- GitHub Helper Function ---
  async def commit_manifest_to_github(payload: WebhookPayload) -> Dict[str, Any]:
      """
      Helper function to commit the manifest directly to the configured branch.
      """
      github_api_base_url = "https://api.github.com"
      repo_file_url = (
          f"{github_api_base_url}/repos/{settings.GITHUB_REPO_OWNER}/"
          f"{settings.GITHUB_REPO_NAME}/contents/{settings.GITHUB_FILE_PATH}"
      )
      headers = {
          "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
          "Accept": "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
      }
      manifest_json_string = json.dumps(payload.manifest, indent=2)
      content_base64 = base64.b64encode(manifest_json_string.encode('utf-8')).decode('utf-8')
      commit_message = f"feat: Update {settings.GITHUB_FILE_PATH} via webhook - commit {payload.commit_hash}"
      data_to_commit = {
          "message": commit_message,
          "content": content_base64,
          "branch": settings.GITHUB_BRANCH,
      }
      async with httpx.AsyncClient() as client:
          current_file_sha = None
          try:
              params_get = {"ref": settings.GITHUB_BRANCH}
              response_get = await client.get(repo_file_url, headers=headers, params=params_get)
              if response_get.status_code == 200:
                  current_file_sha = response_get.json().get("sha")
              elif response_get.status_code != 404: # If not 404 (not found), it's an unexpected error
                  response_get.raise_for_status()
          except httpx.HTTPStatusError as e:
              error_detail = f"GitHub API error (GET file SHA): {e.response.status_code} - {e.response.text}"
              print(f"[ERROR] {error_detail}")
              raise HTTPException(status_code=e.response.status_code, detail=error_detail)
          except httpx.RequestError as e:
              error_detail = f"Network error connecting to GitHub (GET file SHA): {str(e)}"
              print(f"[ERROR] {error_detail}")
              raise HTTPException(status_code=503, detail=error_detail)
          if current_file_sha:
              data_to_commit["sha"] = current_file_sha
          try:
              response_put = await client.put(repo_file_url, headers=headers, json=data_to_commit)
              response_put.raise_for_status()
              return response_put.json()
          except httpx.HTTPStatusError as e:
              error_detail = f"GitHub API error (PUT content): {e.response.status_code} - {e.response.text}"
              if e.response.status_code == 409: # Conflict
                  error_detail = (
                      f"GitHub API conflict (PUT content): {e.response.text}. "
                      "This might be due to an outdated SHA or branch protection rules."
                  )
              elif e.response.status_code == 422: # Unprocessable Entity
                  error_detail = (
                      f"GitHub API Unprocessable Entity (PUT content): {e.response.text}. "
                      f"Ensure the branch '{settings.GITHUB_BRANCH}' exists and the payload is correctly formatted."
                  )
              print(f"[ERROR] {error_detail}")
              raise HTTPException(status_code=e.response.status_code, detail=error_detail)
          except httpx.RequestError as e:
              error_detail = f"Network error connecting to GitHub (PUT content): {str(e)}"
              print(f"[ERROR] {error_detail}")
              raise HTTPException(status_code=503, detail=error_detail)

  # --- FastAPI Application ---
  app = FastAPI(
      title="Minimal Webhook to GitHub Commit Service",
      description="Receives a webhook and commits its 'manifest' part directly to a GitHub repository.",
      version="0.1.0",
  )

  @app.post("/webhook/commit", status_code=201, tags=["GitHub Webhooks"])
  async def handle_webhook_direct_commit(payload: WebhookPayload = Body(...)):
      """
      Webhook endpoint to receive events and commit DIRECTLY to the configured branch.
      """
      try:
          github_response = await commit_manifest_to_github(payload)
          return {
              "message": "Webhook received and manifest committed directly to GitHub successfully.",
              "github_commit_details": github_response.get("commit", {}),
              "github_content_details": github_response.get("content", {})
          }
      except HTTPException:
          raise # Re-raise if it's an HTTPException from the helper
      except Exception as e:
          error_message = f"An unexpected error occurred: {str(e)}"
          print(f"[ERROR] {error_message}")
          raise HTTPException(status_code=500, detail="An internal server error occurred.")

  @app.get("/health", status_code=200, tags=["Health"])
  async def health_check():
      """
      A simple health check endpoint.
      """
      return {"status": "ok", "message": "Service is running."}

  # To run this server (save as main.py):
  # 1. Install dependencies: pip install fastapi uvicorn pydantic pydantic-settings httpx python-dotenv
  # 2. Create a .env file with your GitHub token and repo details.
  # 3. Run with Uvicorn: uvicorn main:app --reload
  # 4. Deploy to a public platform like Render.com.
  ```

  **该服务器的关键方面：*** **配置 (`.env`)：** 它需要一个包含 `GITHUB_TOKEN`、`GITHUB_REPO_OWNER` 和 `GITHUB_REPO_NAME` 的 `.env` 文件。您还可以自定义`GITHUB_FILE_PATH`（默认：`LangSmith_prompt_manifest.json`）和`GITHUB_BRANCH`（默认：`main`）。
  * **GitHub 交互：** `commit_manifest_to_github` 函数处理获取当前文件的 SHA（以更新它）然后提交新的清单内容的逻辑。
  * **Webhook 端点 (`/webhook/commit`)：** 这是您的 LangSmith Webhook 将定位的 URL 路径。
  * **错误处理：** 包含 GitHub API 交互的基本错误处理。

  **将此服务器部署到您选择的平台（例如，Render）并记下其公共 URL（例如，`https://prompt-commit-webhook.onrender.com`）。**
</Accordion>

## 在 LangSmith 中配置 webhook

部署 FastAPI 服务器并获得其公共 URL 后，您可以在 LangSmith 中配置 Webhook：

1. 导航至您的 LangSmith 工作区。

2. 转至 **提示** 部分。您将在此处看到提示列表。

   <img alt="LangSmith Prompts section" />

3. 在“提示”页面右上角，单击“**+ Webhook**”按钮。

4. 您将看到一个用于配置 Webhook 的表单：

   <img alt="LangSmith Webhook configuration modal" />* **Webhook URL：** 输入已部署的 FastAPI 服务器端点的完整公共 URL。对于我们的示例服务器，这将是`https://prompt-commit-webhook.onrender.com/webhook/commit`。
   * **标题（可选）：**
     * 您可以添加 LangSmith 将随每个 Webhook 请求发送的自定义标头。

5. **测试Webhook：** LangSmith 提供了“发送测试通知”按钮。使用它来将示例有效负载发送到您的服务器。检查您的服务器日志（例如，在渲染上）以确保它收到请求并成功处理它（或调试任何问题）。

6. **保存** webhook 配置。

## 实际工作流程

<img alt="Workflow Diagram showing: User saves prompt in LangSmith, LangSmith sends webhook to FastAPI Server, which interacts with GitHub to update files" />

现在，一切就绪后，将发生以下情况：

1. **提示修改：** 用户（开发人员或非技术团队成员）修改 LangSmith UI 中的提示并保存它，创建新的“提示提交”。

2. **Webhook 触发器：** LangSmith 检测到此新提示提交并触发配置的 Webhook。

3. **HTTP 请求：** LangSmith 向 FastAPI 服务器的公共 URL 发送 HTTP POST 请求（例如，`https://prompt-commit-webhook.onrender.com/webhook/commit`）。此请求的正文包含整个工作区的 JSON 提示清单。

4. **服务器接收有效负载：** FastAPI 服务器的端点接收请求。5. **GitHub Commit：** 服务器从请求正文中解析 JSON 清单。然后，它使用配置的 GitHub 个人访问令牌、存储库所有者、存储库名称、文件路径和分支来：

   * 检查指定分支的存储库中是否已存在清单文件以获取其 SHA（这是更新现有文件所必需的）。
   * 使用最新的提示清单创建新的提交，创建文件或更新文件（如果已存在）。提交消息将表明这是来自 LangSmith 的更新。

6. **确认：** 您应该会看到新的提交出现在您的 GitHub 存储库中。

   <img alt="Manifest committed to GitHub" />

您现在已成功将 LangSmith 提示与 GitHub 同步！

## 超越简单的提交

我们的示例 FastAPI 服务器执行整个提示清单的直接提交。然而，这只是起点。您可以扩展服务器的功能以执行更复杂的操作：* **粒度提交：** 如果您更喜欢存储库中更细粒度的结构，请解析清单并将更改提交到各个提示文件。
* **触发 CI/CD：** 让服务器触发 CI/CD 管道（例如 Jenkins、GitHub Actions、GitLab CI）来部署暂存环境、运行测试或构建新的应用程序版本，而不是（或除了）提交之外。
* **更新数据库/缓存：** 如果您的应用程序从数据库或缓存加载提示，请直接更新这些存储。
* **通知：** 向 Slack、电子邮件或其他通信渠道发送有关提示更改的通知。
* **选择性处理：** 基于 LangSmith 有效负载中的元数据（如果可用，例如，哪个特定提示更改或由谁更改），您可以应用不同的逻辑。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-commit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>