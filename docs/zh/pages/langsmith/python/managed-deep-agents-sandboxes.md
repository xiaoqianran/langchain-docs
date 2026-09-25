<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add a sandbox to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-sandboxes -->

# 将沙箱添加到托管Deep Agents

沙箱为托管深度代理提供了一个隔离的文件系统和 shell，用于处理文件、运行代码和执行命令。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将沙箱声明放在`sandbox/`下。仅当您想要配置快照时才添加 `sandbox/setup.sh`：

```text
my-agent/
  agent.py
  sandbox/
    __init__.py
    setup.sh   # optional
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 配置沙箱

当代理需要写入文件、运行代码或执行 shell 命令时，请使用沙箱。

`mda init` 搭建沙箱声明。托管 Deep Agents 仅在 `sandbox/` 目录存在时启用沙箱。

`mda init` 不会创建 `setup.sh`。如果快照要安装包、克隆树或以其他方式更改映像，请自行添加该文件。

托管 Deep Agents 为此后端使用 [LangSmith Sandboxes](/langsmith/sandboxes)。重用始终是每个耐用线程一个沙箱。

使用 `define_sandbox` 声明沙箱：

```python sandbox/__init__.py
from managed_deepagents import define_sandbox

sandbox = define_sandbox(
    idle_ttl_seconds=600,
    default_timeout=600,
)
```

|选项 |默认 |描述 |
| ---| ---| ---|
| `idle_ttl_seconds` | `600` |沙箱及其内容被删除之前不活动的秒数。删除是不可恢复的。 |
| `default_timeout` | `600` |每个命令允许的秒数。 |




## 配置沙箱代理沙箱代理将标头注入匹配的出站请求并控制沙箱可以到达的目的地。代理在沙箱外部运行，因此沙箱代码可以调用经过身份验证的 API，而无需处理凭据。

例如，要从沙箱调用 OpenAI API，请将 `OPENAI_API_KEY` 存储在 LangSmith 工作区密钥中并配置此代理规则：

```python sandbox/__init__.py
from managed_deepagents import define_sandbox

sandbox = define_sandbox(
    proxy_config={
        "rules": [
            {
                "name": "openai-api",
                "match_hosts": ["api.openai.com"],
                "headers": [
                    {
                        "name": "Authorization",
                        "type": "workspace_secret",
                        "value": "Bearer {OPENAI_API_KEY}",
                    },
                ],
            },
        ],
    },
)
```




有关配置选项和网络限制，请参阅[Sandbox auth proxy](/langsmith/sandbox-auth-proxy)。

### 在代理标头中使用连接

在沙箱中使用[Connections](/langsmith/python/managed-deep-agents-connections)来验证CLI命令和API请求。

例如，要以当前用户身份从沙箱调用 GitHub API，请先创建 `github` 连接，然后配置代理：

```python sandbox/__init__.py
from managed_deepagents import bearer, connections, define_sandbox

github = connections.get("github", {"type": "user"})

sandbox = define_sandbox(
    proxy_config={
        "rules": [
            {
                "name": "github-api",
                "match_hosts": ["api.github.com"],
                "headers": [{"name": "Authorization", "value": bearer(github)}],
            },
        ],
        "access_control": {"allow_list": ["api.github.com"]},
    },
)
```




使用连接引用作为标头值，或使用 `bearer(ref)` 或 `basic(username, ref)` 对其进行格式化。对于连接值，省略标头的 `type`。托管 Deep Agents 将其设置为 `opaque`。

## 配置快照如果 `sandbox/setup.sh` 存在，`mda deploy` 和 `mda dev` 运行脚本一次并将生成的环境保存为快照。该运行的修改（例如克隆的存储库和安装的包）会保留在快照中。新线程克隆该快照而不是运行`setup.sh`。快照将被重复使用，直到 `setup.sh` 发生变化，此时它会被重建。

该脚本使用 `bash -e` 运行。非零退出会使快照和部署或`mda dev`会话失败。 LangSmith 不会将实时部署更新到失败的快照。任何先前成功的快照都将继续提供服务。

```bash sandbox/setup.sh
#!/usr/bin/env bash
set -euo pipefail

apt-get update && apt-get install -y jq
mkdir -p /workspace
```

当 `setup.sh` 运行时，向前部署的项目 `.env` 值可用作环境变量，例如用于克隆私有存储库的令牌。克隆快照的线程沙箱不会继承这些变量。 `setup.sh` 运行时不要将机密写入文件系统；磁盘上的任何内容都是每个线程映像的一部分。

编辑 `setup.sh` 并重新部署不会擦除活动线程上的 `/workspace`。这些盒子保存着他们已有的文件。新线程克隆新快照。

## 选择烘焙底料在没有烘焙基础的情况下，LangSmith的默认沙箱模板是起点。要从其他内容开始，请准确设置其中之一：

|选项 |使用 |
| ---| ---|
| `snapshot_name` | LangSmith 快照名称。允许使用标签。 |
| `snapshot_id` | LangSmith 快照 ID。 |
| `docker_image` |发布的 Docker 镜像。 |

```python sandbox/__init__.py
from managed_deepagents import define_sandbox

sandbox = define_sandbox(
    idle_ttl_seconds=600,
    docker_image="python:3.12-slim",
)
```




对于私有图像，传递图像和`registry`。托管 Deep Agents 在烘焙时创建或更新部署拥有的主机注册表。仅编译变量名；凭证值不会进入构建或快照。

在`password_env`中命名密码：

```python sandbox/__init__.py
from managed_deepagents import define_sandbox

sandbox = define_sandbox(
    docker_image="ghcr.io/acme/agent-base:1",
    registry={
        "url": "ghcr.io",
        "username": "octocat",
        "password_env": "GHCR_TOKEN",
    },
)
```




将`GHCR_TOKEN`放入项目`.env`或流程环境中。烘焙后，托管 Deep Agents 不会将该值转发到正在运行的代理服务器。

## 代理如何使用沙箱

该代理使用内置文件系统工具，例如[⟦T46⟧](/oss/python/deepagents/tools#built-in-harness-tools)、[⟦T47⟧](/oss/python/deepagents/tools#built-in-harness-tools)、[⟦T48⟧](/oss/python/deepagents/tools#built-in-harness-tools)、[⟦T49⟧](/oss/python/deepagents/tools#built-in-harness-tools)、[⟦T50⟧](/oss/python/deepagents/tools#built-in-harness-tools)、[⟦T51⟧](/oss/python/deepagents/tools#built-in-harness-tools)和[⟦T52⟧](/oss/python/deepagents/tools#built-in-harness-tools)，并使用[⟦T53⟧](/oss/python/deepagents/tools#built-in-harness-tools)运行shell命令。使用[instructions](/langsmith/python/managed-deep-agents-instructions)指定代理应该在哪里工作以及不能修改什么。

## 从代码中读取和写入沙箱文件

[Authored tools](/langsmith/python/managed-deep-agents-tools)和[middleware](/langsmith/python/managed-deep-agents-middleware)通过`runtime.backend`到达沙箱文件系统。当您自己的代码需要文件时使用它，而不是提示代理为您获取文件。<Note>
`runtime.backend` 需要 `managed-deepagents>=0.8.0`。
</Note>

注释 `runtime` 参数以接收类型表面：

```python tools/report.py
from langchain.tools import tool
from managed_deepagents import ManagedDeepAgentRuntime


@tool(parse_docstring=True)
def write_report(summary: str, runtime: ManagedDeepAgentRuntime) -> str:
    """Write a summary to the sandbox and return its path.

    Args:
        summary: Report body to store.
    """
    if runtime.backend is None:
        raise RuntimeError("write_report requires a sandbox")
    result = runtime.backend.write("/workspace/report.txt", summary)
    if result.error:
        raise RuntimeError(result.error)
    return "/workspace/report.txt"
```




每个操作都绑定到处理当前运行的线程的沙箱，因此读取 `/workspace/report.txt` 的两个线程会看到自己的副本。后端会延迟解析，并且从不接触后端的工具永远不会提供沙箱。

### 可用操作

|方法|目的|
| ---| ---|
| `ls(path)` |列出一个目录。 |
| `read(file_path, offset, limit)` |读取文本，默认2000行。 |
| `write(file_path, content)` |写入文本，替换任何现有文件。 |
| `edit(file_path, old_string, new_string, replace_all)` |就地替换子字符串。 |
| `delete(file_path)` |删除一个文件。 |
| `grep(pattern, path, glob, max_count)` |搜索文件内容。 |
| `glob(pattern, path)` |匹配路径。 |
| `execute(command, timeout)` |运行外壳命令。 |
| `upload_files(files)` |从 `(path, bytes)` 对写入原始字节。 |
| `download_files(paths)` |读取给定路径的原始字节。 |

每个方法都有一个以 `a` 为前缀的异步对应方法，例如 `aread`、`awrite` 和 `adownload_files`。




参数和返回类型来自 Deep Agents 后端合约。参见[Backends](/oss/python/deepagents/backends)。

### 传输二进制文件

`upload_files` 和 `download_files` 移动原始字节，因此它们适合图像、档案以及文本操作可能损坏的任何其他文件。下载返回每个请求路径的字节：

```python tools/checksum.py
import hashlib

from langchain.tools import tool
from managed_deepagents import ManagedDeepAgentRuntime


@tool(parse_docstring=True)
def checksum_file(file_path: str, runtime: ManagedDeepAgentRuntime) -> str:
    """Return the SHA-256 checksum of a sandbox file.

    Args:
        file_path: Absolute path inside the sandbox.
    """
    if runtime.backend is None:
        raise RuntimeError("checksum_file requires a sandbox")
    result = runtime.backend.download_files([file_path])[0]
    if result.error or result.content is None:
        raise RuntimeError(result.error or "file_not_found")
    return hashlib.sha256(result.content).hexdigest()
```上传采用路径和内容对，每个文件一对：

```python
uploaded = runtime.backend.upload_files([("/workspace/logo.png", payload)])
if uploaded[0].error:
    raise RuntimeError(uploaded[0].error)
```




每个结果都带有`path`和`error`，下载还带有`content`。失败时，`error`为`file_not_found`、`permission_denied`、`is_directory`或`invalid_path`之一，并且下载的`content`为空。检查`error`而不是假设传输成功。

### 限制

`runtime.backend` 仅涵盖沙盒。它没有到 [Context Hub](/langsmith/python/managed-deep-agents-context-hub) 的路由，因此无法通过它到达 [skills](/langsmith/python/managed-deep-agents-skills)、[instructions](/langsmith/python/managed-deep-agents-instructions) 和 [memory](/langsmith/python/managed-deep-agents-memory)。

如果没有沙箱，`runtime.backend`就是`None`。在每次调用之前对其进行保护，因为项目可以在工具发布后删除`sandbox/`。




`delete`、`upload_files` 和 `download_files` 取决于已安装的后端，并在未实现它们时引发。根`glob`返回错误而不是配置沙箱。




## 禁用沙箱

删除 `sandbox/` 目录以选择退出，例如仅需要提示、内存和工具的代理。

对于现有部署，使用 `mda delete` 删除部署还会删除与其关联的托管沙箱、`{deployment}--setup-*` 配方快照以及部署拥有的注册表（如果存在）。

## 部署托管Deep Agents拥有沙箱命名、配方烘焙、重用、恢复和清理。每个持久线程都有自己的沙箱，从当前配方快照克隆。有关平台级生命周期的详细信息，请参阅[Sandboxes](/langsmith/sandboxes)。

## 何时使用沙箱

|目标|使用 |
| ---| ---|
|隔离地写入文件、运行代码或执行 shell 命令 |沙盒|
|跨线程存储持久知识 | [Memory](/langsmith/python/managed-deep-agents-memory) |
|无需文件系统即可实现始终在线的行为 | [Instructions](/langsmith/python/managed-deep-agents-instructions) |

有关更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>