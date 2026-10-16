<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Control plane API reference for LangSmith Deployment | https://docs.langchain.com/langsmith/api-ref-control-plane -->

# LangSmith部署的控制平面API参考

使用控制平面 API 在 LangSmith 部署中以编程方式创建、管理和自动化代理服务器部署。

控制平面 API 是 [LangSmith Deployment](/langsmith/deployment) 的一部分。借助控制平面 API，您可以以编程方式创建、管理和自动化您的 [Agent Server](/langsmith/agent-server) 部署，例如，作为自定义 CI/CD 工作流程的一部分。

在侧边栏的 **控制平面 API** 部分中浏览完整的 API 参考，或参阅端点组：

* [Integrations (v1)](/api-reference/integrations-v1/list-github-integrations)：GitHub 集成和存储库列表
* [Deployments (v2)](/api-reference/deployments-v2)：创建、管理和更新代理服务器部署
* [Listeners (v2)](/api-reference/listeners-v2)：自托管企业组织的监听器资源
* [Auth Service (v2)](/api-reference/auth-service-v2)：OAuth 提供者配置和身份验证流程

## 主持人

云数据区域的控制平面托管：

<table>
  <thead>
    <tr>
      <th>地区</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>GCP 美国</td>
    </tr>

    <tr>
      <td>GCP 欧盟</td>
    </tr>

    <tr>
      <td>GCP 亚太地区</td>
    </tr>

    <tr>
      <td>AWS 美国</td>
    </tr>
  </tbody>
</table>**注意**：LangSmith的自托管部署将为控制平面提供一个自定义主机。控制平面API可以通过路径`/api-host`访问。例如，`http(s)://<host>/api-host/v2/deployments`。更多详情请参见[the self-host usage guide](/langsmith/self-host-usage#configuring-the-application-you-want-to-use-with-langsmith)。

## 身份验证

要使用控制平面 API 进行身份验证，请将 `X-Api-Key` 标头设置为有效的 LangSmith API 密钥，并将 `X-Tenant-Id` 标头设置为要定位的有效工作区 ID。

`curl` 命令示例：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request GET \
  --url http://localhost:8124/v2/deployments \
  --header 'X-Api-Key: LANGSMITH_API_KEY'
  --header 'X-Tenant-Id': WORKSPACE_ID'
```

## 版本控制

每个端点路径都以版本为前缀（例如`v1`、`v2`）。

## 快速开始

1. 调用`POST /v2/deployments`创建一个新的Deployment。响应正文包含部署 ID (`id`) 和最新（也是第一个）修订版的 ID (`latest_revision_id`)。
2. 调用`GET /v2/deployments/{deployment_id}`检索Deployment。将 URL 中的 `deployment_id` 设置为部署 ID (`id`) 的值。
3. 通过调用 `GET /v2/deployments/{deployment_id}/revisions/{latest_revision_id}` 轮询修订版 `status`，直到 `status` 为 `DEPLOYED`。
4. 调用`PATCH /v2/deployments/{deployment_id}`更新部署。

## 资源规范

`resource_spec` 对象设置部署的 API 服务器、队列工作线程、Redis 和 PostgreSQL 的 CPU、内存和副本计数。 [Deployments (v2)](/api-reference/deployments-v2)参考文献中的字段描述列出了每个字段。以下行为适用于跨领域：* **`PATCH` 替换整个对象**：包含 `resource_spec` 的 `PATCH` 替换存储的 `resource_spec` 并且不与其合并。您省略的字段将回退到部署类型的默认值，而不是之前的值。每个 `PATCH` 发送完整的 `resource_spec`。
* **默认限制为请求的 2 倍**：如果您设置 CPU 或内存请求并忽略其限制，则限制默认为请求的 2 倍。 Redis 内存限制是例外：`redis_memory_limit_mb` 默认为 `redis_memory_mb`。在自托管数据平面上，CPU 限制还设置 [autoscaling target](/langsmith/data-plane#autoscaling)。
* **CPU 值四舍五入到小数点后 1 位**：舍入使用浮点运算，因此某些值会向下舍入。例如，`0.25` 存储为`0.2`。
* **Redis 内存有自己的范围**：`redis_memory_mb` 和 `redis_memory_limit_mb` 接受 512 到 16384（128 的倍数）。API 在验证器中强制执行此范围，因此它不会出现在 OpenAPI 架构中。

对于自托管部署，数据平面中的侦听器使用其自己版本的规则再次验证`resource_spec`。返回 `200` 的 `PATCH` 仍然可能在旧侦听器上部署时失败。参见[Listener version requirements](/langsmith/self-hosted-platform-features#listener-version-requirements)。

## 示例代码下面是示例 Python 代码，演示如何编排控制平面 API 来创建部署、更新部署和删除部署。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/api-ref-control-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>