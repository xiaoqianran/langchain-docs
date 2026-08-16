<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use remote sandboxes | https://docs.langchain.com/oss/deepagents/code/remote-sandboxes -->

# 使用远程沙箱

Deep Agents 代码使用 [sandbox as tool](/oss/python/deepagents/sandboxes#sandbox-as-tool-pattern) 模式：`dcode` 进程（LLM 循环、内存、工具调度）在您的计算机上运行，但代理工具调用（`read_file`、`write_file`、`execute` 等）针对远程沙箱，而不是您的本地文件系统。要将文件放入沙箱，请使用 [setup script](#setup-scripts) 或提供商的文件传输 API（请参阅 [Working with files](/oss/python/deepagents/sandboxes#working-with-files)）。

要深入了解沙箱架构、集成模式和安全最佳实践，请参阅[Sandboxes](/oss/python/deepagents/sandboxes)。

<Steps>
    <Step title="Install provider dependency" icon="download">
        每个内置提供程序均作为可选附加项提供。使用 `/install` 从会话中安装一个，或者使用 `dcode --install` 从 shell 中安装。第三方提供商（例如 E2B）安装为带有 `--package` 标志的软件包：

        <Tabs>
            <Tab title="LangSmith">
                安装`deepagents-code`时默认包含。无需额外安装。
            </Tab>
            <Tab title="AgentCore">
                <CodeGroup>
                    ```txt In session
                    /install agentcore
                    ```

                    ```bash Shell
                    dcode --install agentcore
                    ```
                </CodeGroup>
            </Tab>
            <Tab title="Daytona">
                <CodeGroup>
                    ```txt In session
                    /install daytona
                    ```

                    ```bash Shell
                    dcode --install daytona
                    ```
                </CodeGroup>
            </Tab>
            <Tab title="Modal">
                <CodeGroup>
                    ```txt In session
                    /install modal
                    ``````bash Shell
                    dcode --install modal
                    ```
                </CodeGroup>
            </Tab>
            <Tab title="Runloop">
                <CodeGroup>
                    ```txt In session
                    /install runloop
                    ```

                    ```bash Shell
                    dcode --install runloop
                    ```
                </CodeGroup>
            </Tab>
            <Tab title="Vercel">
                <CodeGroup>
                    ```txt In session
                    /install vercel
                    ```

                    ```bash Shell
                    dcode --install vercel
                    ```
                </CodeGroup>
            </Tab>
            <Tab title="E2B">
                E2B 是由 `langchain-e2b` 包发布的 [third-party provider](#third-party-providers)。将其作为包安装，而不是`deepagents-code`额外的：

                <CodeGroup>
                    ```txt In session
                    /install langchain-e2b --package
                    ```

                    ```bash Shell
                    dcode --install langchain-e2b --package
                    ```
                </CodeGroup>
            </Tab>
        </Tabs>

        要立即安装对每个内置提供程序的支持，请在会话中使用 `all-sandboxes` 额外功能：`/install all-sandboxes`，或从 shell 中使用 `dcode --install all-sandboxes`。 `all-sandboxes` extra 不包括 E2B 等第三方提供商。
    </Step>

    <Step title="Set provider credentials" icon="key">
        <Tabs>
            <Tab title="LangSmith">
                ```bash
                export LANGSMITH_API_KEY="your-key"
                ```
            </Tab>
            <Tab title="AgentCore">
                ```bash
                export AWS_ACCESS_KEY_ID="your-key"
                export AWS_SECRET_ACCESS_KEY="your-secret"
                export AWS_REGION="us-west-2"

                # Only when using temporary/STS credentials:
                export AWS_SESSION_TOKEN="session-token"
                ```
            </Tab>
            <Tab title="Daytona">
                ```bash
                export DAYTONA_API_KEY="your-key"
                ```
            </Tab>
            <Tab title="Modal">
                ```bash
                modal setup
                ```
            </Tab>
            <Tab title="Runloop">
                ```bash
                export RUNLOOP_API_KEY="your-key"
                ```
            </Tab>
            <Tab title="Vercel">
                ```bash
                export VERCEL_TOKEN="your-token"
                export VERCEL_PROJECT_ID="your-project-id"
                export VERCEL_TEAM_ID="your-team-id"
                ```在 Vercel 上运行时，会自动使用 [OIDC](https://vercel.com/docs/oidc) 凭据。
            </Tab>
            <Tab title="E2B">
                ```bash
                export E2B_API_KEY="your-key"
                ```
            </Tab>
        </Tabs>
    </Step>

    <Step title="Run Deep Agents Code with a sandbox" icon="player-play">
        <Tabs>
            <Tab title="LangSmith">
                ```bash
                dcode --sandbox langsmith
                ```
            </Tab>
            <Tab title="AgentCore">
                ```bash
                dcode --sandbox agentcore
                ```
            </Tab>
            <Tab title="Daytona">
                ```bash
                dcode --sandbox daytona
                ```
            </Tab>
            <Tab title="Modal">
                ```bash
                dcode --sandbox modal
                ```
            </Tab>
            <Tab title="Runloop">
                ```bash
                dcode --sandbox runloop
                ```
            </Tab>
            <Tab title="Vercel">
                ```bash
                dcode --sandbox vercel
                ```
            </Tab>
            <Tab title="E2B">
                ```bash
                dcode --sandbox e2b
                ```
            </Tab>
        </Tabs>
    </Step>
</Steps>

## 沙箱标志和示例|旗帜|描述 |
|------|-------------|
| `--sandbox TYPE` |要使用的沙箱提供程序。内置：`langsmith`、`agentcore`、`daytona`、`modal`、`runloop`、`vercel`（默认：`none`）。也接受[Third-party](#third-party-providers) 和[config-declared](#config-declared-providers) 提供商。传递 `--sandbox` ，但没有值可以从您的配置中使用 `[sandboxes].default` |
| `--sandbox-id ID` |按 ID 重用现有沙箱，而不是创建新沙箱。跳过创建和清理。仅适用于支持通过 ID 重新连接的提供商。有关更多信息，请参阅您的沙箱文档 |
| `--sandbox-snapshot-name NAME` |使用或创建沙箱快照。由 `langsmith` 和 `runloop`（以及宣传快照支持的任何第三方提供商）支持。不能与`--sandbox-id`组合使用 |
| `--sandbox-setup PATH` |创建后在沙箱内运行的安装脚本的路径 |

每个提供程序都会在沙箱内公开一个默认工作目录。安装脚本和`execute`命令从此目录运行，除非被覆盖：

|供应商|工作目录 |
|----------|--------------------|
| LangSmith | `/root` |
|代理核心 | `/tmp` |
|代托纳 | `/home/daytona` |
|莫代尔 | `/workspace` |
|运行循环| `/home/user` |
|韦尔塞尔 | `/vercel/sandbox` |
|电子商务 | `/home/user` |

示例：

```bash
# Create a new LangSmith sandbox
dcode --sandbox langsmith

# Reuse an existing sandbox (skips creation and cleanup)
dcode --sandbox runloop --sandbox-id dbx_abc123

# Run a setup script after sandbox creation
dcode --sandbox modal --sandbox-setup ./setup.sh

# Use the provider set as [sandboxes].default in config
dcode --sandbox
```<Note>
    由于 `--sandbox` 接受可选值，因此请在命令行上保留裸形式**最后**。否则，以下参数（例如`dcode --sandbox agents`）将被用作标志的值。传递明确的提供者名称以避免歧义。
</Note>

## 可插入的提供者

内置提供程序并不是唯一的选择。 Deep Agents 代码从三个来源发现沙箱提供程序，因此您可以使用其他包附带的提供程序或声明自己的提供程序，而无需更改 Deep Agents 代码：

1. **内置提供程序** — LangSmith、AgentCore、Daytona、Modal、Runloop 和 Vercel，随 `deepagents-code` 一起提供（LangSmith 默认情况下，其他为附加项）。
2. **[Third-party providers](#third-party-providers)** — 由其他已安装的包通过 Python 入口点发布。
3. **[Config-declared providers](#config-declared-providers)** — 在您的 `~/.deepagents/config.toml` 中定义。

当两个源定义相同的提供程序名称时，**config 胜过第三方入口点，第三方入口点胜过内置**，因此您的配置文件始终可以覆盖发现。

### 第三方提供商

包可以在`deepagents_code.sandbox_providers`[entry-point group](https://packaging.python.org/en/latest/specifications/entry-points/)下发布沙箱提供程序。一旦你安装了这样的包，它的提供者就可以自动供`--sandbox`使用——无需配置：

```bash
# Install the package that publishes the provider, then use it
dcode --sandbox acme
```例如，`langchain-e2b`包发布了`e2b`提供程序（请参阅[sandbox integrations](/oss/python/integrations/sandboxes)）。将其作为包安装，设置您的凭据，然后选择它：

```bash
dcode --install langchain-e2b --package
export E2B_API_KEY="..."
dcode --sandbox e2b
```

如果您传递未安装或声明的 `--sandbox` 名称，Deep Agents 代码会列出可用的提供程序并解释如何安装或配置缺少的提供程序。

<Accordion title="Publishing a sandbox provider" icon="package">
    要分发提供程序以便用户可以在安装软件包后运行 `dcode --sandbox <name>`，请实现 `SandboxProvider` 子类并将其注册到 `deepagents_code.sandbox_providers` 入口点组下。

    覆盖 `metadata` 属性，以便 Deep Agents 代码可以显示您的工作目录和功能标志，而无需实例化提供程序：

    ```python
    from deepagents_code.integrations.sandbox_provider import (
        SandboxInstallHint,
        SandboxProvider,
        SandboxProviderMetadata,
    )


    class AcmeProvider(SandboxProvider):
        @property
        def metadata(self) -> SandboxProviderMetadata:
            return SandboxProviderMetadata(
                name="acme",
                working_dir="/workspace",
                install=SandboxInstallHint(kind="package", name="acme-dcode-sandbox"),
                supports_sandbox_id=True,
                supports_snapshot_name=False,
            )

        def get_or_create(self, *, sandbox_id=None, **kwargs):
            ...  # return a SandboxBackendProtocol

        def delete(self, *, sandbox_id, **kwargs):
            ...
    ```

    实施`get_or_create`和`delete`；异步调用者由基类处理。然后在你的包的`pyproject.toml`中注册入口点：

    ```toml
    [project.entry-points."deepagents_code.sandbox_providers"]
    acme = "acme_sandbox.provider:AcmeProvider"
    ```

    如果省略 `metadata` 属性，则使用通用默认值（`/workspace`，不支持快照）。
</Accordion>

### 配置声明的提供者

对于您不想打包的内部或本地提供商，请在 `~/.deepagents/config.toml` 中的 `[sandboxes.providers]` 下声明。这与 [arbitrary model providers](/oss/deepagents/code/config-file#arbitrary-providers) 相似，并使用相同的 `class_path` 信任模型。

```toml
[sandboxes]
# Used when you run `dcode --sandbox` with no value.
default = "acme"

[sandboxes.providers.acme]
# Required: the provider class to import, in module.path:ClassName format.
class_path = "acme_sandbox.provider:AcmeProvider"
# Default working directory inside the sandbox.
working_dir = "/workspace"
# Package suggested when the provider's dependencies are missing.
package = "acme-dcode-sandbox"
# Capability flags (defaults: supports_sandbox_id = true, supports_snapshot_name = false).
supports_sandbox_id = true
supports_snapshot_name = false

# Extra keyword arguments forwarded to the provider's get_or_create().
[sandboxes.providers.acme.params]
region = "us-east-1"
```

<ResponseField name="class_path" type="string" post={["required"]}>
    `module.path:ClassName` 格式的完全限定提供程序类。 Deep Agents 代码为提供者导入并实例化此类。
</ResponseField><ResponseField name="working_dir" type="string" post={["optional"]}>
    沙箱内的默认工作目录。默认为`/workspace`。
</ResponseField>

<ResponseField name="package" type="string" post={["optional"]}>
    当提供程序的依赖项缺失时，错误消息中建议的包名称。
</ResponseField>

<ResponseField name="supports_sandbox_id" type="boolean" post={["optional"]}>
    该提供程序是否允许`--sandbox-id`重新附加。默认为 `true`。
</ResponseField>

<ResponseField name="supports_snapshot_name" type="boolean" post={["optional"]}>
    该提供商是否允许使用`--sandbox-snapshot-name`。默认为`false`。
</ResponseField>

<ResponseField name="params" type="object" post={["optional"]}>
    额外的关键字参数转发到提供商的`get_or_create()`。
</ResponseField>

重用内置提供程序名称的配置条目**覆盖**内置提供程序，同时保持其依赖项运行前检查。格式错误的条目会被跳过并发出警告，而不是导致启动崩溃。

<Warning>
    设置 `class_path` 会导致 Deep Agents 代码从指定模块导入并运行任意 Python — 模块级代码在导入时执行。这与模型[⟦T100⟧](/oss/deepagents/code/config-file#arbitrary-providers)相同的信任模型：您控制自己的机器和自己的配置文件。
</Warning>

## 设置脚本

创建后，使用 `--sandbox-setup` 在沙箱内运行 shell 脚本。这对于克隆存储库、安装依赖项和配置环境变量非常有用。

```bash title="setup.sh"
#!/bin/bash
set -e

# Clone repository using GitHub token
git clone https://x-access-token:${GITHUB_TOKEN}@github.com/username/repo.git $HOME/workspace
cd $HOME/workspace

# Make environment variables persistent
cat >> ~/.bashrc <<'EOF'
export GITHUB_TOKEN="${GITHUB_TOKEN}"
export OPENAI_API_KEY="${OPENAI_API_KEY}"
cd $HOME/workspace
EOF
source ~/.bashrc
```Deep Agents 代码使用本地环境变量扩展设置脚本中的 `${VAR}` 引用。将机密存储在本地 `.env` 文件中，以供安装脚本访问。

<Warning>
    沙箱隔离代码执行，但代理仍然容易受到不可信输入的提示注入。仅使用人工参与批准、短期秘密和可信设置脚本。详情请参阅[Security considerations](/oss/python/deepagents/sandboxes#security-considerations)。
</Warning>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/remote-sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>