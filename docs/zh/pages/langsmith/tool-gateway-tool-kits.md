<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create tool kits | https://docs.langchain.com/langsmith/tool-gateway-tool-kits -->

# 创建工具包

创建、更新和删除工具网关工具包，这些工具包为一个 MCP URL 上的任意数量的 MCP 服务器提供一组选定的工具。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

工具包是一组选定的工具，[Tool Gateway](/langsmith/tool-gateway) 在一个 MCP URL 上提供服务。这些工具可以来自任意数量的 MCP 服务器和内置服务器。为每个代理提供一个仅包含其所需工具的工具包，可以使其工具列表简短且工具选择准确。

工具包管理端点公开哪些工具。它不控制调用者可以调用哪些工具：同一个调用者可以通过[me kit](#use-the-me-kit)访问它可以使用的每个工具。要限制调用者可以执行的操作，请使用权限和[policies](/langsmith/tool-gateway-policies)。参见[Tool kits curate, policies enforce](/langsmith/tool-gateway-how-it-works#tool-kits-curate-policies-enforce)。

## 创建工具包

工具包从已经[added](/langsmith/tool-gateway-servers)的服务器中选择工具。管理套件需要用户凭据，例如个人访问令牌。服务密钥可以调用套件的工具，但不能创建、更改或删除套件。

### 选择范围

每个套件都有一个范围。您在创建套件时选择它，以后无法更改它：* **工作区**：工作区中的每个人都可以查看和使用该套件。它可以包括工作区服务器和内置服务器，但不包括个人服务器。工作区管理员可以创建工作区套件。
* **个人**：只有您可以查看、使用、更改或删除该套件。它还可以包括您的个人服务器。工作区管理员和工作区编辑者可以创建个人工具包。

包含个人服务器工具的工作区工具包返回`400`。要结合个人和工作区工具，请创建个人工具包。

### 选择工具

> [选项卡] 用户界面
>
> 1. 转到**工具** > **工具包**，然后单击**创建工具包**。
> 2. 输入**工具包名称**，以及可选的说明。
> 3. 选择“**工作空间**”或“**个人**”来确定哪些人可以使用该套件。
> 4. 在工具选择器中，选择要包含的工具。按服务器过滤以更快地找到工具。
> 5. 单击**查看工具选择**。 （可选）为任何工具输入 **自定义标签**，或删除您错误选择的工具。
> 6. 单击**创建工具包**。
>
> 该套件的面板在代理调用的名称下列出了其工具，并显示了该套件的 MCP URL。> [选项卡] API
>
> 发送 `POST /v1/managed-tools/kits` 以及 `name` 和 `tools` 数组。每个条目命名一台服务器上的一个工具。为您添加的服务器设置 `server_id`，或为内置服务器设置 `builtin_server_key`。将 `tool_name` 设置为该服务器上的工具名称。本页上的 API 示例使用 [quickstart](/langsmith/tool-gateway-quickstart) 中的环境变量。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{
>     "name": "Support agent tools",
>     "description": "Tools for the support agent",
>     "scope": "workspace",
>     "tools": [
>       {"server_id": "<server-id>", "tool_name": "<tool-name>"},
>       {"builtin_server_key": "<built-in-key>", "tool_name": "<tool-name>"}
>     ]
>   }'
> ```
>
> 响应包含套件的 `id`、`mcp_path` 以及每个工具的 `mcp_name`（代理名称）。 `scope` 默认为 `workspace`。要为工具提供显示标签，请将 `exposed_name` 添加到其条目中。
>
> LangSmith 检查每个服务器是否存在，但不检查服务器上是否存在每个工具名称。完全按照服务器列出的方式复制工具名称。

套件名称在工作区中必须是唯一的。您创建一个包含 1 到 10,000 个工具的套件。更新可以将其留空。

要将代理或 MCP 客户端连接到套件的 URL，请参阅 [Connect an MCP client](/langsmith/tool-gateway-clients)。

## 套件工具如何命名

工具网关使用前缀命名套件中的每个工具，因此来自不同服务器的工具不会发生冲突：* **您添加的服务器**：`<server>_<tool>`，其中`<server>` 是小写的服务器名称，除字母和数字之外的每一串字符都替换为一个下划线。例如，名为 `Linear` 的服务器上的 `list_issues` 变为 `linear_list_issues`。
* **内置服务器**：`langsmith_<key>_<tool>`，其中`<key>`是内置服务器的密钥。

工具网关在您首次将工具添加到套件时设置工具的名称。稍后重命名服务器不会更改名称，因此已经调用该工具的代理将继续工作。

套件中的两个工具可能会具有相同的名称，例如，当两个服务器的名称仅标点符号不同时。创建或保存这样的套件将返回`400`。重命名其中一台服务器，然后重试。

自定义标签（API 中的`exposed_name`）更改客户端为工具显示的标题。它不会更改代理所调用的名称。

## 呼叫者在连接前看到的内容

工具包向每个调用者列出了其所有工具，包括调用者尚未连接的服务器上的工具。调用这些工具之一会要求调用者连接服务器，然后调用者重试调用。使用代理身份或配置文件的呼叫者无法连接，因此在管理员连接凭据之前其呼叫会失败。参见[Call tools](/langsmith/tool-gateway-call-tools)。工具网关可以向尚未连接服务器的调用者列出服务器的工具。当某人保存或刷新工具包时，工具网关会存储通过该人的连接获取的工具列表。如果保存或刷新该工具包的人没有连接到服务器，则该工具包会列出该服务器的一个占位符工具，名为 `connect_<server>`。调用占位符会要求调用者进行连接。

## 刷新套件的工具

工具网关将每个服务器的工具列表缓存两个小时。当服务器添加、删除或更改工具时，刷新工具包以更快地获取更改。刷新还会更新未连接的呼叫者可以看到的已存储工具列表。

刷新需要获得更新套件的权限。

* **UI**：在 **工具** > **工具包** 上，打开工具包，然后单击 **刷新工具**。
* **API**：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/tool-refresh" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
  ```

  响应的 `missing_credentials` 列出了您尚未连接的服务器。他们的工具列表不会刷新。连接这些服务器，然后再次刷新。

服务器不再列出的工具仍保留在工具包的选择中，但不再向调用者列出。要删除它，[update the kit](#update-a-tool-kit)。

## 使用我的工具包me 套件位于 `/v1/managed-tools/kits/me/mcp`，提供调用者可以使用的所有工具。这包括调用者可以调用的工作区服务器、调用者的个人服务器以及每个启用的内置服务器。你不创造它。工具网关根据每个请求构建它并且从不保存它。

使用 me 套件为您自己的 MCP 客户提供您拥有的所有工具，而无需策划套件。对于代理来说，更喜欢保存仅包含代理所需工具的工具包。

我的套件与保存的套件不同：

* 调用者未连接的服务器始终被列为一个 `connect_<server>` 工具，而不是其单独的工具。
* 当调用者的两个服务器具有相同名称时，它们的工具被命名为`<server>_<id>_<tool>`，其中`<id>`是服务器ID的末尾。
* 因为它可以为许多工具提供服务，所以请考虑搜索模式，它列出了三个工具，搜索并调用其余的工具。参见[Connect an MCP client](/langsmith/tool-gateway-clients)。

## 更新工具包

您可以更改套件的名称、描述和工具。您无法更改其范围。

* **UI**：在 **工具** > **工具包** 上，打开工具包，然后单击 **编辑**。更改详细信息或工具选择，然后单击 **保存更改**。
* **API**：发送 `PATCH /v1/managed-tools/kits/<kit-id>` 仅包含要更改的字段：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X PATCH "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "tools": [
        {"server_id": "<server-id>", "tool_name": "<tool-name>"}
      ]
    }'
  ````tools` 取代了套件的全部选择。包括套件应保留的所有工具。空数组会删除所有工具。

要查找套件的 ID，请从 UI 中套件的 MCP URL 复制它，或使用 `GET /v1/managed-tools/kits` 列出套件。添加 `?scope=workspace` 或 `?scope=personal` 仅列出一个范围。

## 删除工具包

删除套件会删除其 MCP URL。它使用的服务器和每个连接的帐户保持原样。使用该工具包 URL 的代理和客户端将停止工作。

* **UI**：在**工具** > **工具包**中，打开工具包，单击**删除**，然后确认。
* **API**：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
  ```

  该请求返回`204`，包括当套件已被删除时。

删除工作区工具包需要删除 MCP 服务器的权限。只有所有者才能删除个人套件。

## 另请参阅

* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)
* [Add MCP servers](/langsmith/tool-gateway-servers)
* [Connect an MCP client](/langsmith/tool-gateway-clients)
* [Call tools](/langsmith/tool-gateway-call-tools)
* [Set policies](/langsmith/tool-gateway-policies)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-tool-kits.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。