<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool Gateway API reference | https://docs.langchain.com/langsmith/tool-gateway-api-ref -->

# 工具网关API参考

浏览 MCP 服务器、凭证、工具包、配置文件和 MCP 调用的工具网关 API。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

工具网关 API 配置 [Tool Gateway](/langsmith/tool-gateway) 并通过它发送 MCP 调用。每条路径都以`/v1/managed-tools`开始。

## 基本网址

主机取决于 LangSmith 运行的位置：[Cloud](#cloud)、[BYOC](#byoc) 或 [Self-hosted](#self-hosted)。

### 云

将请求发送到您所在区域的 API 主机。在每个端点 Playground 的服务器菜单中选择相同的区域。

<table>
  <thead>
    <tr>
      <th>地区</th>

      <th>
        网址
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>GCP 美国</td>

      <td>
        `https://api.smith.langchain.com`
      </td>
    </tr>

    <tr>
      <td>GCP 欧盟</td>

      <td>
        `https://eu.api.smith.langchain.com`
      </td>
    </tr>

    <tr>
      <td>GCP 亚太地区</td>

      <td>
        `https://apac.api.smith.langchain.com`
      </td>
    </tr>

    <tr>
      <td>AWS 美国</td>

      <td>
        `https://aws.api.smith.langchain.com`
      </td>
    </tr>
  </tbody>
</table>

工具网关在 Azure 美国区域不可用。

### 自带设备

向您的[data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint)发送请求，例如`https://<data_plane_host>/v1/managed-tools/servers`。数据平面必须运行 LangSmith v0.18 或更高版本。

### 自托管Send requests to your instance's API URL, `https://<host>/api`, for example `https://<host>/api/v1/managed-tools/servers`.如果设置`config.basePath`，请使用`https://<host>/<basePath>/api`。设置请参见[Enable the Tool Gateway](/langsmith/tool-gateway-self-hosted)。

## 端点

Browse the full API reference in the **Tool Gateway API** section in the sidebar.它有两种端点：

* **管理端点** 配置工具网关：`/servers` 添加并列出 MCP 服务器，`/servers/{id}/credential` 管理服务器凭证，`/kits` 管理工具包，`/profiles` 管理配置文件，`/oidc-connection` 链接您的身份提供商。
* **MCP 端点** 使用标准 MCP 方法（例如 `tools/list` 和 `tools/call`）列出和调用工具：`/servers/{id}/mcp` 公开一台服务器，`/kits/{kit_id}/mcp` 公开工具包。

## 身份验证

Send a LangSmith API key in the `X-Api-Key` header, or a token in the `Authorization: Bearer` header.在 `X-Tenant-Id` 标头中发送工作区 ID。 `X-Tenant-Id` 选择工作空间；它不会验证您的身份。

To call tools as an end user, an agent, or a profile, see [Act as users and agents](/langsmith/tool-gateway-identity).

Tool Gateway must be enabled for your organization. Each endpoint lists the workspace permissions it requires.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-api-ref.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。