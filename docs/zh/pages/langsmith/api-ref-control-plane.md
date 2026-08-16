<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Control plane API reference for LangSmith Deployment | https://docs.langchain.com/langsmith/api-ref-control-plane -->

# LangSmith部署的控制平面API参考

控制平面 API 是 [LangSmith Deployment](/langsmith/deployment) 的一部分。借助控制平面 API，您可以以编程方式创建、管理和自动化您的 [Agent Server](/langsmith/agent-server) 部署，例如，作为自定义 CI/CD 工作流程的一部分。

浏览侧边栏 **控制平面 API** 部分中的完整 API 参考，或参阅端点组：

- [Integrations (v1)](/api-reference/integrations-v1/list-github-integrations)：GitHub 集成和存储库列表
- [Deployments (v2)](/api-reference/deployments-v2)：创建、管理和更新代理服务器部署
- [Listeners (v2)](/api-reference/listeners-v2)：自托管企业组织的监听器资源
- [Auth Service (v2)](/api-reference/auth-service-v2)：OAuth 提供者配置和身份验证流程

## 主持人

云数据区域的控制平面托管：

{/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

**注意**：LangSmith 的自托管部署将为控制平面提供一个自定义主机。控制平面API可以通过路径`/api-host`访问。例如，`http(s)://<host>/api-host/v2/deployments`。更多详情请参见[the self-host usage guide](/langsmith/self-host-usage#configuring-the-application-you-want-to-use-with-langsmith)。

## 身份验证

要使用控制平面 API 进行身份验证，请将 `X-Api-Key` 标头设置为有效的 LangSmith API 密钥，并将 `X-Tenant-Id` 标头设置为要定位的有效工作区 ID。

`curl` 命令示例：

```shell
curl --request GET \
  --url http://localhost:8124/v2/deployments \
  --header 'X-Api-Key: LANGSMITH_API_KEY'
  --header 'X-Tenant-Id': WORKSPACE_ID'
```

## 版本控制

每个端点路径都以版本为前缀（例如`v1`、`v2`）。

## 快速开始1. 调用`POST /v2/deployments`创建一个新的Deployment。响应正文包含部署 ID (`id`) 和最新（也是第一个）修订版的 ID (`latest_revision_id`)。
2. 调用`GET /v2/deployments/{deployment_id}`检索Deployment。将 URL 中的 `deployment_id` 设置为部署 ID (`id`) 的值。
3. 通过调用 `GET /v2/deployments/{deployment_id}/revisions/{latest_revision_id}` 轮询修订版 `status`，直到 `status` 为 `DEPLOYED`。
4. 调用`PATCH /v2/deployments/{deployment_id}`更新部署。

## 示例代码

下面是示例 Python 代码，演示了如何编排控制平面 API 来创建部署、更新部署和删除部署。

```python
import os
import time

import requests
from dotenv import load_dotenv


load_dotenv()

# required environment variables
CONTROL_PLANE_HOST = os.getenv("CONTROL_PLANE_HOST")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
WORKSPACE_ID = os.getenv("WORKSPACE_ID")
INTEGRATION_ID = os.getenv("INTEGRATION_ID")
MAX_WAIT_TIME = 1800  # 30 mins


def get_headers() -> dict:
    """Return common headers for requests to the control plane API."""
    return {
        "X-Api-Key": LANGSMITH_API_KEY,
        "X-Tenant-Id": WORKSPACE_ID,
    }


def create_deployment() -> str:
    """Create deployment. Return deployment ID."""
    headers = get_headers()
    headers["Content-Type"] = "application/json"

    deployment_name = "my_deployment"

    request_body = {
        "name": deployment_name,
        "source": "github",
        "source_config": {
            "integration_id": INTEGRATION_ID,
            "repo_url": "https://github.com/langchain-ai/langgraph-example",
            "deployment_type": "serverless",
            "build_on_push": False,
            "custom_url": None,
            "resource_spec": None,
        },
        "source_revision_config": {
            "repo_ref": "main",
            "langgraph_config_path": "langgraph.json",
            "image_uri": None,
        },
        "secrets": [
            {
                "name": "OPENAI_API_KEY",
                "value": "test_openai_api_key",
            },
            {
                "name": "ANTHROPIC_API_KEY",
                "value": "test_anthropic_api_key",
            },
            {
                "name": "TAVILY_API_KEY",
                "value": "test_tavily_api_key",
            },
        ],
    }

    response = requests.post(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments",
        headers=headers,
        json=request_body,
    )

    if response.status_code != 201:
        raise Exception(f"Failed to create deployment: {response.text}")

    deployment_id = response.json()["id"]
    print(f"Created deployment {deployment_name} ({deployment_id})")
    return deployment_id


def get_deployment(deployment_id: str) -> dict:
    """Get deployment."""
    response = requests.get(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments/{deployment_id}",
        headers=get_headers(),
    )

    if response.status_code != 200:
        raise Exception(f"Failed to get deployment ID {deployment_id}: {response.text}")

    return response.json()


def list_revisions(deployment_id: str) -> list[dict]:
    """List revisions.

    Return list is sorted by created_at in descending order (latest first).
    """
    response = requests.get(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments/{deployment_id}/revisions",
        headers=get_headers(),
    )

    if response.status_code != 200:
        raise Exception(
            f"Failed to list revisions for deployment ID {deployment_id}: {response.text}"
        )

    return response.json()


def get_revision(
    deployment_id: str,
    revision_id: str,
) -> dict:
    """Get revision."""
    response = requests.get(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments/{deployment_id}/revisions/{revision_id}",
        headers=get_headers(),
    )

    if response.status_code != 200:
        raise Exception(f"Failed to get revision ID {revision_id}: {response.text}")

    return response.json()


def patch_deployment(deployment_id: str) -> None:
    """Patch deployment."""
    headers = get_headers()
    headers["Content-Type"] = "application/json"

    # This creates a new revision because source_revision_config is included
    response = requests.patch(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments/{deployment_id}",
        headers=headers,
        json={
            "source_config": {
                "build_on_push": True,
            },
            "source_revision_config": {
                "repo_ref": "main",
                "langgraph_config_path": "langgraph.json",
            },
        },
    )

    if response.status_code != 200:
        raise Exception(f"Failed to patch deployment: {response.text}")

    print(f"Patched deployment ID {deployment_id}")


def wait_for_deployment(deployment_id: str, revision_id: str) -> None:
    """Wait for revision status to be DEPLOYED."""
    start_time = time.time()
    revision, status = None, None
    while time.time() - start_time < MAX_WAIT_TIME:
        revision = get_revision(deployment_id, revision_id)
        status = revision["status"]
        if status == "DEPLOYED":
            break
        elif "FAILED" in status:
            raise Exception(f"Revision ID {revision_id} failed: {revision}")

        print(f"Waiting for revision ID {revision_id} to be DEPLOYED...")
        time.sleep(60)

    if status != "DEPLOYED":
        raise Exception(
            f"Timeout waiting for revision ID {revision_id} to be DEPLOYED: {revision}"
        )


def delete_deployment(deployment_id: str) -> None:
    """Delete deployment."""
    response = requests.delete(
        url=f"{CONTROL_PLANE_HOST}/v2/deployments/{deployment_id}",
        headers=get_headers(),
    )

    if response.status_code != 204:
        raise Exception(
            f"Failed to delete deployment ID {deployment_id}: {response.text}"
        )

    print(f"Deployment ID {deployment_id} deleted")


if __name__ == "__main__":
    # create deployment and get the latest revision
    deployment_id = create_deployment()
    revisions = list_revisions(deployment_id)
    latest_revision = revisions["resources"][0]
    latest_revision_id = latest_revision["id"]

    # wait for latest revision to be DEPLOYED
    wait_for_deployment(deployment_id, latest_revision_id)

    # patch the deployment and get the latest revision
    patch_deployment(deployment_id)
    revisions = list_revisions(deployment_id)
    latest_revision = revisions["resources"][0]
    latest_revision_id = latest_revision["id"]

    # wait for latest revision to be DEPLOYED
    wait_for_deployment(deployment_id, latest_revision_id)

    # delete the deployment
    delete_deployment(deployment_id)
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/api-ref-control-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>