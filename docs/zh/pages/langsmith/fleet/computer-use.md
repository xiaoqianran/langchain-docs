<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Computer use | https://docs.langchain.com/langsmith/fleet/computer-use -->

# 电脑使用

从连接到您的舰队代理的持久虚拟计算机运行代码、管理文件并调用经过身份验证的 API。

计算机使用使您的舰队代理可以访问隔离的虚拟计算机。代理可以编写和执行代码、管理文件、安装包以及调用经过身份验证的外部 API，而无需向语言模型公开凭据。

<Note>
  [Plus and Enterprise plans](https://langchain.com/pricing) 可以使用计算机。
</Note>

## 计算机模式

选择如何在代理的对话线程之间共享虚拟计算机：|模式|描述 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **共享电脑** |所有线程共享一台计算机。文件系统、已安装的包和正在运行的进程跨线程持续存在。当您希望在对话中累积文件、依赖项或环境设置时，请选择此模式。共享计算机不会自动删除。 || **每线程计算机** |每个线程都有自己独立的计算机，该计算机重新启动并在空闲时存档。对于软件工程代理和其他运行许多并行、写入量大的任务的工作负载，或者线程不应看到彼此状态的任何情况，请选择此模式。    |

## 配置计算机使用

<Warning>
  计算机模式在创建代理时设置，之后无法更改。要切换模式，请创建新代理。
</Warning>

<Steps>
  <Step title="Open the Create agent dialog">
    在 [Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-computer-use) 左侧导航中的 **我的代理** 下，单击 <Icon icon="plus" /> 并选择 **使用 AI 创建** 或 **空白代理**。输入您的代理的名称。
  </Step>

  <Step title="Enable computer use">
    在 **您的代理是否应该使用计算机？**下，选择 **是**，然后选择 **共享计算机** 或 **每线程计算机**。如果您选择**否**（默认值），则创建代理时不具有计算机访问权限。
  </Step>

  <Step title="Set the base snapshot (optional)">
    展开**高级**为新计算机选择**快照**。
  </Step>

  <Step title="Create the agent">
    单击“**创建代理**”。
  </Step>
</Steps>

## 访问配置文件使用访问配置文件让您的代理调用经过身份验证的外部 API，而无需将凭据放入提示中或将其暴露给语言模型。到匹配主机的出站 HTTP 请求通过代理进行路由，该代理在转发之前注入配置的标头。

配置文件包含一个或多个**自定义规则**。每条规则指定：

* **匹配主机**：规则适用的目标主机名。使用 `*` 作为通配符（例如，`*.example.com` 匹配 `api.example.com`）。
* **来源类型和提供者**：凭证来源。为用户委托的 OAuth 选择 **连接**，或为静态 API 密钥选择 **工作区密钥**。
* **注入标头**：代理添加到匹配请求的 HTTP 标头。使用 `{access_token}` 等模板值来引用凭据（例如，`Authorization: Bearer {access_token}`）。

配置文件还具有**网络范围**，用于控制代理计算机的出站流量。默认值为**无（允许所有流量）**。

### 添加访问配置文件

<Steps>
  <Step title="Create the access profile">
    转到 [Fleet Integrations tab](https://smith.langchain.com/agents/tools) 并导航到 **计算机** 部分。单击 **+ 创建配置文件** 并按照提示配置主机模式和凭据。
  </Step><Step title="Attach the profile to an agent">
    在代理编辑器中，单击 **计算机** 节点。单击 **访问配置文件** 旁边的 **+ 添加**，然后选择您创建的配置文件。
  </Step>

  <Step title="Save changes">
    单击**保存更改**。
  </Step>
</Steps>

## 计算机生命周期

每个代理都有两个生命周期设置，用于控制计算机保持活动状态的时间以及停止后保持状态的时间。 [Configure both in the settings popover](#configure-lifecycle-and-snapshot)。

* **空闲超时**：当计算机在这段时间内没有收到任何命令时，它会暂停并对磁盘进行归档。代理可以稍后恢复同一台计算机而不会丢失数据。默认值：**15 分钟**。
* **停止计算机清理**：计算机停止运行一段时间后，它将与所有磁盘数据一起永久删除。默认值：**14 天**。

<Note>
  **停止计算机清理**仅适用于**每线程计算机**模式。共享计算机不会自动删除。
</Note>

## 基础快照

快照是用于启动计算机的磁盘映像。默认情况下，所有队列代理都使用工作区默认快照。要构建、捕获或配置自定义快照，请参阅 [Sandbox snapshots](/langsmith/sandbox-snapshots)。设置弹出窗口中的[Change the snapshot for an agent](#configure-lifecycle-and-snapshot)。<Note>
  快照更改仅适用于代理的新计算机。 **共享计算机**模式下的单个共享计算机在其生命周期内保留其原始快照。
</Note>

## 配置生命周期和快照

代理的快照、空闲超时和停止的计算机清理均在设置弹出窗口的“计算机生命周期”部分中设置。

<Steps>
  <Step title="Open the settings popover">
    在[Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-computer-use)中，打开代理并单击代理编辑器中的<Icon icon="settings" />设置图标。
  </Step>

  <Step title="Set the lifecycle fields">
    滚动到 **计算机生命周期** 部分。设置 **快照**、**空闲超时**，并且对于 **每线程计算机** 模式，设置 **停止计算机清理**。
  </Step>

  <Step title="Save changes">
    单击**保存更改**。
  </Step>
</Steps>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/computer-use.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>