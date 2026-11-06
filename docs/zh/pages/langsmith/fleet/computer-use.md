<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Computer use | https://docs.langchain.com/langsmith/fleet/computer-use -->

# 电脑使用

从连接到您的舰队代理的持久虚拟计算机运行代码、管理文件并调用经过身份验证的 API。

计算机使用使您的舰队代理可以访问隔离的虚拟计算机。代理可以编写和执行代码、管理文件、安装包以及调用经过身份验证的外部 API，而无需向语言模型公开凭据。

> [!注意]
>
> [Plus and Enterprise plans](https://www.langchain.com/pricing) 可以使用计算机。

## 计算机模式

选择如何在代理的对话线程之间共享虚拟计算机：

|模式|描述 |
| - | - |
| **共享电脑** |所有线程共享一台计算机。文件系统、已安装的包和正在运行的进程跨线程持续存在。当您希望文件、依赖项或环境设置在对话中累积时，请选择此模式。共享计算机不会自动删除。 |
| **每线程计算机** |每个线程都有自己独立的计算机，该计算机重新启动并在空闲时存档。对于软件工程代理和其他运行许多并行、写入密集型任务的工作负载，或者线程不应看到彼此状态的任何情况，请选择此模式。 |

## 配置计算机使用> [!警告]
>
> 计算机模式在创建代理时设置，之后无法更改。要切换模式，请创建新代理。

**1.打开创建代理对话框**

在 [Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-computer-use) 左侧导航中的 **我的代理** 下，单击并选择 **使用 AI 创建** 或 **空白代理**。输入您的代理的名称。

**2.启用计算机使用**

在 **您的代理是否应该使用计算机？**下，选择 **是**，然后选择 **共享计算机** 或 **每线程计算机**。如果您选择**否**（默认值），则创建代理时不具有计算机访问权限。

**3.设置基本快照（可选）**

展开**高级**为新计算机选择**快照**。

**4.创建代理**

单击“**创建代理**”。

## 访问配置文件

使用访问配置文件让您的代理调用经过身份验证的外部 API，而无需将凭据放入提示中或将其暴露给语言模型。到匹配主机的出站 HTTP 请求通过代理进行路由，该代理在转发之前注入配置的标头。

配置文件包含一个或多个**自定义规则**。每条规则指定：* **匹配主机**：规则适用的目标主机名。使用 `*` 作为通配符（例如，`*.example.com` 匹配 `api.example.com`）。
* **来源类型和提供者**：凭证来源。为用户委托的 OAuth 选择 **连接**，或为静态 API 密钥选择 **工作区密钥**。
* **注入标头**：代理添加到匹配请求的 HTTP 标头。使用 `{access_token}` 等模板值来引用凭据（例如，`Authorization: Bearer {access_token}`）。

配置文件还具有**网络范围**，用于控制代理计算机的出站流量。默认值为**无（允许所有流量）**。

### 添加访问配置文件

**1.创建访问配置文件**

转到 [Fleet Integrations tab](https://smith.langchain.com/agents/tools) 并导航到 **计算机** 部分。单击 **+ 创建配置文件** 并按照提示配置主机模式和凭据。

**2.将个人资料附加到代理**

在代理编辑器中，单击 **计算机** 节点。单击 **访问配置文件** 旁边的 **+ 添加**，然后选择您创建的配置文件。

**3.保存更改**

单击**保存更改**。

## 计算机生命周期

每个代理都有两个生命周期设置，用于控制计算机保持活动状态的时间以及停止后保持状态的时间。 [Configure both in the settings popover](#configure-lifecycle-and-snapshot)。* **空闲超时**：当计算机在这段时间内没有收到任何命令时，它会暂停并对磁盘进行归档。代理可以稍后恢复同一台计算机而不会丢失数据。默认值：**15 分钟**。
* **停止计算机清理**：计算机停止运行一段时间后，它将与所有磁盘数据一起永久删除。默认值：**14 天**。

> [!注意]
>
> **停止计算机清理**仅适用于**每线程计算机**模式。共享计算机不会自动删除。

## 选择一个基础快照

快照是用于启动计算机的磁盘映像。当未选择快照时，Fleet 使用平台默认值`system/default:latest`。当前默认从`ubuntu:26.04`开始，包括Python 3、Node.js 24、Go、Git、Docker、浏览器和文档处理库。有关完整的工具列表和其他系统快照，请参阅[Understand system snapshots](/langsmith/sandbox-snapshots#understand-system-snapshots)。

要更改现有代理的快照，请在设置弹出窗口中设置 **快照**，如 [Configure lifecycle and snapshot](#configure-lifecycle-and-snapshot) 中所述。要构建或捕获您自己的快照，请参阅[Sandbox snapshots](/langsmith/sandbox-snapshots)，并包含[Prepare a custom image for Fleet](#prepare-a-custom-image-for-fleet)中列出的组件。> [!注意]
>
> 快照更改仅适用于代理的新计算机。 **共享计算机**模式下的单个共享计算机在其生命周期内保留其原始快照。

## 配置生命周期和快照

代理的快照、空闲超时和停止的计算机清理均在设置弹出窗口的“计算机生命周期”部分中设置。

**1.打开设置弹出窗口**

在[Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-computer-use)中，打开代理并单击代理编辑器中的设置图标。

**2.设置生命周期字段**

滚动到 **计算机生命周期** 部分。设置 **快照**、**空闲超时**，并且对于 **计算机每线程** 模式，设置 **停止计算机清理**。

**3.保存更改**

单击**保存更改**。

## 为 Fleet 准备自定义镜像

自定义快照取代默认文件系统；它不继承默认工具。包括代理使用的队列功能的依赖项，即使是从最小的 Linux 映像启动也是如此。|能力|组件|
| - | - |
|命令执行 | `/bin/bash` 的狂欢。 Fleet 使用它运行每个命令，因此如果没有它，命令就会失败。 |
|运行安装和文件工具 |命令必须以 `root` 或可以在 `/` 下创建目录的用户身份运行。 Python 3、`tar`、`grep` 以及核心实用程序，例如`mkdir`、`rm` 和 `ln`。 |
| [Access profiles](#access-profiles) |位于 `/etc/ssl/certs/ca-certificates.crt` 的系统 CA 捆绑包。启动时，沙箱将代理的 CA 附加到该文件，并将公共 CA 捆绑包环境变量指向该文件。 Debian、Ubuntu、Alpine 和 Wolfi 使用此路径。 RHEL 系列映像将其捆绑包保存在其他位置，因此在此路径中提供一个映像，否则来自沙箱的 HTTPS 请求可能会导致证书验证失败。 |
| PowerPoint 文件 (`fleet-pptx`) | Python 3 和 `python-pptx`。 |
| Word 文件 (`fleet-docx`) | Python 3 和 `python-docx`。 |
| Excel 文件 (`fleet-xlsx`) | Python 3、`openpyxl`、`defusedxml` 和 `lxml`。该技能要求在打开文件之前`openpyxl.xml.DEFUSEDXML`为`True`。 |
|旧文档转换 (`fleet-document-converter`) | Node.js 20 或更高版本以及来自 `@firecrawl/anydoc` 的 `anydoc` 可执行文件，包括其特定于平台的本机包。 |如果缺少 `python-pptx` 或 `python-docx`，该技能会将固定版本安装到 `/tmp` 下的虚拟环境中，这需要 Python 的 `venv` 模块并访问 PyPI。如果缺少 `anydoc`，转换器将使用 `npx` 运行它，这需要 npm 并访问 npm 注册表。 Excel 技能没有安装后备方案。预安装无需程序包注册表访问权限即可运行的映像中的每个组件。

要查看默认映像包含在您的版本中的版本，请从 `system/default:latest` 启动沙箱并运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python3 -m pip list 2>/dev/null | grep -iE '^(python-docx|python-pptx|openpyxl|defusedxml|lxml|pillow|xlsxwriter) '
anydoc --version
```

在从自定义快照启动的沙箱中运行相同的命令，以确认它已准备好用于队列。还要检查文档库导入以及强化的 XML 解析器是否处于活动状态：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python3 -c "import docx, pptx, openpyxl.xml; assert openpyxl.xml.DEFUSEDXML"
```

您的映像不需要使用 Ubuntu 或包含默认映像中的所有开发工具。如果您使用其他发行版，请提供兼容的包及其本机依赖项。

`system/default:latest` 是快照引用，而不是 Dockerfile `FROM` 指令的容器映像 URI。构建您自己的容器镜像，然后[create a snapshot from it](/langsmith/sandbox-snapshots#build-a-snapshot-from-a-container-image)。要审核默认或命名系统快照，请使用已部署的 `sandbox-host` 映像按照 [Inspect the default snapshot filesystem in self-hosted deployments](/langsmith/sandbox-snapshots#inspect-the-default-snapshot-filesystem-in-self-hosted-deployments) 进行操作。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/computer-use.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。