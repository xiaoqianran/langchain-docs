<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom Apps | https://docs.langchain.com/langsmith/custom-apps -->

# 自定义应用程序

<Note>
[**Plus** and **Enterprise** plans](https://www.langchain.com/pricing) 上提供自定义应用程序。
</Note>

自定义应用程序是您构建的 UI，它在 LangSmith 内运行并调用 [LangSmith API](/langsmith/smith-api-ref)。将其用于内置 UI 未涵盖的工作流程，例如专门构建的注释表面、实验比较视图或范围为您自己的跟踪的仪表板。

已部署的应用程序显示在侧边栏中的 **自定义应用程序** 下，供工作区中具有 `custom-apps:read` 权限的每个人使用。您不托管单独的服务或管理单独的登录。

应用程序在沙箱中运行，没有自己的网络访问权限。主机将其 LangSmith API 请求与查看者的凭据一起转发，因此每个人只能看到其 [permissions](/langsmith/organization-workspace-operations) 允许的数据。主机不转发任何其他内容，并且它会阻止 API 密钥、成员、用户、身份、角色、权限、SCIM 和服务帐户的端点。

## 构建一个应用程序

通过浏览器中的[chatting with LangSmith Chat](#build-with-chat)或[locally with the CLI](#build-locally-with-the-cli)和您自己的编码代理构建应用程序。两条路径都会生成相同的应用程序并存储相同的源代码，因此任何一个都可以[edit](#edit-an-app)另一个构建的内容。

### 通过聊天进行构建

在浏览器中构建有两个要求：- **沙箱**：每个会话都在 [sandbox](/langsmith/sandboxes) 中运行。在自托管部署中，首先是[enable sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)。
- **权限**：`custom-apps:create`、`custom-apps:update`、`custom-apps:delete`和`custom-apps:download`权限，加上[sandbox permissions](#permissions)。

如果没有两者，**App** 操作将打开 CLI 指令。 Chat 还需要 [model API key set for the workspace](/langsmith/chat#get-started) 才能发送消息。

要构建带有聊天功能的应用程序：

<Steps>
<Step title="Start a new app">
转到 **自定义应用程序** 并选择 **应用程序** 以打开聊天。在还没有应用程序的工作区中，页面直接打开聊天。
</Step>
<Step title="Describe what you want to build">
在 Composer 中输入应用程序应执行的操作，然后从 Composer 的模型菜单中选择要构建的模型。作曲家在其背后的沙箱仍在启动时接受提示。当聊天开始写入文件时，LangSmith 保存草稿并打开聊天旁边的 **预览** 和 **代码** 选项卡。
</Step>
<Step title="Review what Chat built">
**预览**选项卡呈现您的更改的实时构建。 **代码** 选项卡包含文件树、源代码以及会话中的更改。标头中的徽章对已更改的文件进行计数。
</Step>
<Step title="Deploy the app">
选择**部署**。第一次部署要求输入名称、构建应用程序并将其发布到工作区。如果您在首次部署之前离开页面，LangSmith 会丢弃该应用程序。一旦 Chat 开始编辑，LangSmith 会在丢弃之前询问。
</Step>
</Steps>

### 使用 CLI 本地构建

本地构建使用 [LangSmith CLI](/langsmith/langsmith-cli)，它搭建了一个启动器，在您计算机上的真实沙箱中运行它，并在您准备好时上传它。要在本地构建应用程序：

<Steps>
<Step title="Install the CLI">
```bash
curl -fsSL https://cli.langsmith.com/install.sh | sh
```

对于 Windows、Homebrew 和其他选项，请参阅 [Install](/langsmith/langsmith-cli#install)。
</Step>
<Step title="Authenticate">
```bash
langsmith auth login
```

要改用 API 密钥，请为自托管实例设置 `LANGSMITH_API_KEY`，再加上 `LANGSMITH_ENDPOINT`。有关配置文件和其他选项，请参阅[Authenticate](/langsmith/langsmith-cli#authenticate)。
</Step>
<Step title="Scaffold an app">
```bash
langsmith apps init --name my-annotation-view --template annotation-queue
```

`init` 创建一个以应用程序命名的目录，如果 `npm` 在您的 `PATH` 上，则安装其依赖项。它还编写了一个 `AGENTS.md` ，为编码代理提供了在第一次传递时生成工作应用程序所需的约定和 API 界面。对于空白的单文件启动器，省略 `--template`。
</Step>
<Step title="Iterate locally">
```bash
cd my-annotation-view
langsmith apps dev
```该应用程序在与 LangSmith 内部相同类型的沙箱中运行，并通过您自己的凭据代理 API 调用。失败的调用和未捕获的错误会流到终端，因此大多数调试不需要浏览器开发工具。为每个成功的调用和所有控制台输出添加 `--verbose` ，或添加 `--quiet` 以使应用程序静音。
</Step>
<Step title="Push it live">
```bash
langsmith apps push
```

第一次推送创建应用程序并将其 ID 记录在 `.langsmith/app.json` 中，该 ID 将目录链接到它。稍后推送更新同一应用程序。提交该文件，以便队友推送到同一个应用程序。
</Step>
</Steps>

#### 入门模板

将其中之一传递给`langsmith apps init --template`：

|模板|它的脚手架是什么？
|----------|--------------------|
| `annotation-queue` |队列审核 UI：运行和线程项目、特定于类型的查看器和反馈规则。 |
| `annotation-queue-grid` |与可编辑电子表格相同的审核工作流程。 |
| `experiment-comparison` |评估实验与基线的并排比较。 |
| `coding-agent-dashboard` |编码代理运行的图表：随时间变化的使用情况、成本、错误和活动。 |

## 编辑应用程序

通过聊天在浏览器中编辑应用程序，或提取其源代码并在本地进行编辑。

### 通过聊天编辑从 **自定义应用程序** 打开应用程序并选择 **编辑**。已发布的应用程序被编辑工作区取代：左侧聊天，右侧相同的**预览**和**代码**选项卡。

在聊天中请求更改，或直接在 **Code** 中编辑文件并使用 `Cmd+S`（在 Windows 和 Linux 上为`Ctrl+S`）保存。无论哪种方式，预览都会重建，并且标题中的徽章会更新其已更改文件的计数。

两个操作结束会话：

- **部署**：构建应用程序并将其发布为工作区的新版本。
- **取消**：离开而不部署。未部署的更改保留在编辑沙箱中。

编辑在沙箱中运行，在一段时间不活动后会停止。重新打开应用程序会唤醒沙箱，并保持未部署的更改完好无损。如果沙箱已被删除，请选择 **从保存的源重新创建** 以从上次部署的源重建会话。未部署的更改将会丢失。

要重命名应用程序、复制其 ID 或更改共享对象，请从应用程序列表的行菜单中选择“**编辑**”。

### 使用 CLI 进行本地编辑

从浏览器进行的部署会存储应用程序的源代码，`langsmith apps push` 也是如此。要在本地编辑应用程序，请将其下拉：

```bash
langsmith apps pull my-app
npm install --prefix my-app
```使用您自己的编码代理编辑源代码，然后运行 ​​`langsmith apps push` 进行发布。

脚手架 `AGENTS.md` 要求代理在应用程序根目录中保存 `context.md` 作为应用程序的内存：应用程序做什么、哪些文件重要以及它们背后的决策。任何根文件都会随源一起传输，因此拉取应用程序的团队成员会从您学到的内容开始，而不是从头开始。

## 与您的组织共享应用程序

自定义应用程序属于创建它的工作区。要与组织共享自定义应用程序，请打开应用程序列表中的行菜单，选择“**编辑**”，然后选择“**与组织共享**”。组织中的每个工作区都可以查看、更新和删除它。

要将共享应用程序移回单个工作区，请从该工作区选择“**拉入此工作区**”。如果工作区已有同名应用程序，LangSmith 会要求您重命名它。

当 CLI 按名称解析应用程序时，工作区应用程序会胜过同名的组织应用程序。

## CLI 参考|命令 |它有什么作用 |
|---------|-------------|
| `langsmith apps init --name NAME [--template TEMPLATE]` |在以应用程序命名的新目录中搭建一个入门应用程序，并安装其依赖项。 |
| `langsmith apps dev` |在真实的沙箱中本地运行当前目录的应用程序。 |
| `langsmith apps push` |将当前目录上传为自定义应用程序，并在第一次推送时创建它。通过`--no-build`按原样上传当前文件。 |
| `langsmith apps pull APP_ID_OR_NAME` |将应用程序的源下载到新目录中。 |
| `langsmith apps list` |列出自定义应用程序。 |
| `langsmith apps delete APP_ID_OR_NAME` |按 ID 或名称删除应用程序。通过`--yes`跳过确认。 |

`dev`和`push`作用于当前目录，所以先切换到应用程序的目录。

## 权限

`custom-apps:*` 权限控制对自定义应用程序的访问。完整表格请参见[Custom apps](/langsmith/organization-workspace-operations#custom-apps)。

在浏览器中进行编辑还需要 `sandboxes:create`、`sandboxes:read`、`sandboxes:update`、`sandboxes:delete` 和 `sandboxes:exec` 权限，因为每个会话都在沙箱中运行。 **编辑** 操作仅对具有 `custom-apps:update`、`custom-apps:download` 和沙箱权限的用户显示。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-apps.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>