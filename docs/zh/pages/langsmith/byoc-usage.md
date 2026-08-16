<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC usage | https://docs.langchain.com/langsmith/byoc-usage -->

# 自带设备使用

一旦数据平面处于活动状态，其工作区的所有 API 流量都会进入数据平面端点，而不是LangSmith 云后端。本页说明如何将请求路由到正确的服务。

LangSmith UI 会自动处理此问题：它根据您选择的工作空间路由到正确的数据平面。以下指南适用于您自己的客户端应用程序和直接 API 调用。

## 组织、数据平面和工作空间

BYOC 部署分为三个级别：

- **组织**：顶层。用户、角色、计费、SSO 配置和 API 密钥属于组织并位于控制平面中。
- **数据平面**：属于一个组织，代表数据的物理分离。一个组织可以拥有多个数据平面，每个数据平面都位于自己的 AWS 账户和区域中。
- **工作空间**：仅属于一个数据平面，您在创建工作空间时选择该数据平面。跟踪、数据集、实验和其他应用程序数据位于工作区中，与云或自托管相同。

<img
  src="/langsmith/images/byoc-org-structure.png"
  alt="Nesting diagram of a BYOC deployment. An organization contains two data planes, each labeled as physical separation. The first is in us-east-1 and holds three workspaces named Production, Staging, and Dev. The second is in eu-west-1 and holds two workspaces named Production and Dev. Every workspace is labeled as logical separation within its data plane."
/>

使用数据平面进行数据的物理分离，使用工作空间进行数据平面内的逻辑分离。常见的组合有：|数据平面|工作空间 |
|-------------|------------|
|每个区域，例如 `us-east-1` 和 `us-west-2` |每个环境，例如开发、登台和生产 |
|每个环境和区域，例如 prod `us-east-1`、staging `us-east-1` 和 dev `us-east-1` |每队|
|每个业务部门|每队|

## 找到您的数据平面端点

每个数据平面都有一个基本 URL。导航到 **设置 > 数据平面** 以查看每个数据平面、其状态及其 API URL。

<Warning>
默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能到达基本 URL，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。
</Warning>

## 跟踪数据平面

要将跟踪发送到位于数据平面中的工作区，请将 LangSmith SDK 指向数据平面端点，并使用作用域为该数据平面中的工作区的 API 密钥进行身份验证：

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-api-key>"
export LANGSMITH_ENDPOINT="https://<data_plane_host>"
```

<Warning>
从目标数据平面内的工作空间创建`LANGSMITH_API_KEY`。跟踪是租户范围的，因此来自不同数据平面上的工作区（包括云工作区）的 API 密钥会被拒绝。
</Warning>

对于完整的、可运行的示例，请遵循 [Observability quickstart](/langsmith/observability-quickstart) 并替换上面的环境变量。

## 路由 API 请求基本 URL 根据路径前缀路由到不同的服务：

|服务 |路径前缀 |示例|
|---------|-------------|---------|
| LangSmith | `/api` | `https://<data_plane_host>/api/v1/sessions` |
| LangSmith 部署| `/api-host` | `https://<data_plane_host>/api-host/v2/deployments` |
|法学硕士网关| `/gateway` | `https://<data_plane_host>/gateway/v1/chat/completions` |

## 跟踪多个端点

使用这些模式可以跟踪云和数据平面，或多个数据平面。

### 双写入两个端点

设置 `LANGSMITH_RUNS_ENDPOINTS` 写入多个端点：

```bash
export LANGSMITH_RUNS_ENDPOINTS='[
  {"api_url": "https://aws.api.smith.langchain.com", "api_key": "ls__key1", "project_name": "project-cloud"},
  {"api_url": "https://<data_plane_host>", "api_key": "ls__key2", "project_name": "project-byoc"}
]'
```

### 在应用程序逻辑中选择目的地

要决定在运行时跟踪何处，请为每个端点创建一个客户端并在它们之间进行选择：

```python
import os

from langsmith import Client, traceable, tracing_context

CLOUD_ENDPOINT = "https://aws.api.smith.langchain.com"
BYOC_ENDPOINT = "https://<data_plane_host>"


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


cloud_client = Client(
    api_key=require_env("LANGSMITH_CLOUD_API_KEY"),
    api_url=CLOUD_ENDPOINT,
    workspace_id=os.getenv("LANGSMITH_CLOUD_WORKSPACE_ID"),
)

byoc_client = Client(
    api_key=require_env("LANGSMITH_BYOC_API_KEY"),
    api_url=BYOC_ENDPOINT,
    workspace_id=os.getenv("LANGSMITH_BYOC_WORKSPACE_ID"),
)


def get_workspace_routing(tenant_id: str):
    """Determine the tracing destination based on application routing logic."""
    if tenant_id.startswith("byoc_"):
        return byoc_client, os.getenv("LANGSMITH_BYOC_PROJECT", "byoc-customer-project")
    return cloud_client, os.getenv("LANGSMITH_CLOUD_PROJECT", "cloud-customer-project")


@traceable
def run_agent_workflow(query: str):
    return f"Processed: {query}"


def handle_request(tenant_id: str, query: str):
    client, project_name = get_workspace_routing(tenant_id)

    with tracing_context(enabled=True, client=client, project_name=project_name):
        return run_agent_workflow(query)
```

## 另请参阅

- [BYOC onboarding](/langsmith/byoc-onboarding)
- [BYOC architecture](/langsmith/byoc-architecture)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-usage.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>