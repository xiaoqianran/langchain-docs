<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool Gateway API reference | https://docs.langchain.com/langsmith/tool-gateway-api-ref -->

# 工具网关API参考

浏览 MCP 服务器、凭证、工具包、配置文件和 MCP 调用的工具网关 API。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

工具网关 API 配置 [Tool Gateway](/langsmith/tool-gateway) 并通过它发送 MCP 调用。每条路径都以`/v1/managed-tools`开始。

## 基本网址

向您的 LangSmith 区域的 API 主机发送请求：

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

在每个端点 Playground 的服务器菜单中选择您的区域。

在侧边栏的 **工具网关 API** 部分中浏览完整的 API 参考。它有两种端点：* **管理端点** 配置工具网关：`/servers` 添加并列出 MCP 服务器，`/servers/{id}/credential` 管理服务器凭证，`/kits` 管理工具包，`/profiles` 管理配置文件，`/oidc-connection` 链接您的身份提供商。
* **MCP 端点** 使用标准 MCP 方法（例如 `tools/list` 和 `tools/call`）列出和调用工具：`/servers/{id}/mcp` 公开一台服务器，`/kits/{kit_id}/mcp` 公开工具包。

## 身份验证

在 `X-Api-Key` 标头中发送 LangSmith API 密钥，或在 `Authorization: Bearer` 标头中发送令牌。在 `X-Tenant-Id` 标头中发送工作区 ID。 `X-Tenant-Id` 选择工作空间；它不会验证您的身份。

要以最终用户、代理或配置文件的身份调用工具，请参阅 [Act as users and agents](/langsmith/tool-gateway-identity)。

必须为您的组织启用工具网关。每个端点都会列出其所需的工作区权限。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-api-ref.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。