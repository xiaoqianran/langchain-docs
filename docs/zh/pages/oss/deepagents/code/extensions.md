<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Python extensions | https://docs.langchain.com/oss/deepagents/code/extensions -->

# Python 扩展

Python 扩展可自定义 dcode 代理服务器，而无需修改 dcode 本身。用它们来注册模型工具、LangChain中间件、虚拟存储路由。

<Note>
    Python 扩展需要 `DEEPAGENTS_CODE_EXPERIMENTAL=1`。此实验性 API 可能会更改或删除，恕不另行通知。
</Note>

<Warning>
    扩展程序可以使用您的用户帐户的权限运行任意Python。仅从您信任的来源加载扩展。扩展工具不会自动添加到人工批准图中，因此执行敏感工作的扩展必须通过中间件强制执行自己的批准或策略。
</Warning>

## 创建扩展

扩展入口文件必须公开异步 `extension` 设置函数。 dcode 传递具有只读会话上下文和添加功能的方法的 `ExtensionAPI` 注册器。

以下扩展使 LangGraph 存储可用于 `/memories/` 下的代理文件工具：

```python extension.py
from deepagents.backends import StoreBackend

from deepagents_code.extensions import ExtensionAPI


async def extension(d: ExtensionAPI) -> None:
    d.register_backend_route(
        "/memories/",
        StoreBackend(namespace=lambda _runtime: ("filesystem",)),
    )
```

使用实验门启动 dcode 并加载文件进行一次运行：

```bash
DEEPAGENTS_CODE_EXPERIMENTAL=1 dcode --extension ./extension.py
```重复`-e`或`--extension`加载多个文件或目录。目录扫描包括直接 `*.py` 文件以及包含 `__init__.py` 或 `extension.py` 的直接子目录。加载还需要扩展发现保持启用状态（`[extensions].enabled`或`DEEPAGENTS_CODE_EXTENSIONS`）；禁用发现时，Deep Agents 代码会跳过每个源，包括 CLI 路径。

## 注册功能

扩展 API 支持以下方法：

|方法|签名|目的|
|---|---|---|
| `register_middleware` | `(class_or_instance)` |添加LangChain`AgentMiddleware`。中间件类必须有一个零参数构造函数；否则，传递一个实例。 |
| `register_tool` | `(function_or_tool)` |向模型公开可调用或 `BaseTool`。 dcode 使用 LangChain 工具模式推理转换普通可调用对象。 |
| `register_backend_route` | `(prefix, backend)` |使 `BackendProtocol` 存储提供程序在虚拟路径下可用。 |
| `on_shutdown` | `(callback)` |当代理服务器停止时释放会话资源。支持同步和异步回调。 |

注册商还公开此只读上下文：

- `d.cwd`：会话的工作目录。
- `d.mode`：`interactive` 或 `headless`。
- `d.has_ui`：会话是否有交互式终端UI。
- `d.path`：扩展的入口文件。在模块导入期间不要打开长期连接或启动后台任务。如果安装程序打开会话资源，请注册幂等`on_shutdown`回调以释放它。

### 注册中间件

注册LangChain中间件以向代理添加模型或工具行为。 dcode 在构建代理图时加载中间件。

```python
from langchain.agents.middleware import AgentMiddleware

from deepagents_code.extensions import ExtensionAPI


class ExampleMiddleware(AgentMiddleware):
    name = "example-middleware"


async def extension(d: ExtensionAPI) -> None:
    d.register_middleware(ExampleMiddleware())
```

当构建需要配置时，使用`AgentMiddleware`实例。您还可以传递具有零参数构造函数的中间件类。

### 注册工具

注册一个可调用的或 `BaseTool` 以使其可供模型使用。

```python
from deepagents_code.extensions import ExtensionAPI


async def extension(d: ExtensionAPI) -> None:
    def current_directory() -> str:
        """Return the working directory for the current dcode session."""
        return str(d.cwd)

    d.register_tool(current_directory)
```

dcode 通过从函数签名和文档字符串推断其架构，将普通可调用对象转换为 LangChain 工具。扩展工具可以替代同名的内置工具。在扩展之间，工具名称的第一个注册获胜。

### 路由虚拟存储

后端路由前缀必须是带有前导斜杠和尾随斜杠的小写绝对路径，例如 `/memories/` 或 `/company/knowledge/`。 dcode 拒绝与其内部工件或对话历史记录存储重叠的无效路径和路由。路由内容可通过模型的文件工具获得。 Shell `execute` 仍然附加到默认本地或沙箱存储，因此 shell 命令无法访问虚拟路由内容。沙盒代理还会拒绝由 `FilesystemBackend` 直接支持的路由，因为这会暴露主机存储，而 shell 执行仍保留在沙盒中。

扩展工具和中间件取代了同名的内置工具。在分机之间，首先注册的路由前缀或单元名称获胜。

### 应用运行时更改

启动后注册的工具将出现在下一个模型请求中。中间件和后端路由改变了代理图的构造并需要`/reload`。运行 `/extensions` 列出注册、其源路径和范围、加载失败以及是否需要重新启动。

单独管理的远程代理服务器必须由其操作员重新启动或重新部署。

## 选择扩展源

dcode 按此顺序加载授权的扩展源并忽略后面的重复条目路径：1. `~/.deepagents/extensions/`中的Python文件。
2. `[extensions].extra_paths` 中的文件和目录。
3. 使用`-e`或`--extension`传递的文件和目录。
4. 来自启用的、版本化插件的 Python 扩展。
5. 通过 `dcode.extensions` Python 入口点组公开的模块。
6. `<project>/.deepagents/extensions/`中的可信项目扩展。

使用 `~/.deepagents/extensions/` 进行快速的用户范围扩展。使用 [plugin](#package-an-extension-in-a-plugin) 进行版本化分发和更新。对使用一个存储库维护的代码使用项目扩展。

## 信任项目扩展

`<project>/.deepagents/extensions/`中的项目扩展仅在授予项目信任后执行。在交互模式下，dcode 会提示您允许当前文件一次，记住规范的项目路径以供将来的会话和编辑使用，或者跳过它们。取消提示（例如，使用 Esc）会中止启动。

对于无头或 CI 运行，请授予该调用信任：

```bash
DEEPAGENTS_CODE_EXPERIMENTAL=1 \
  dcode --trust-project-extensions -n "Run the project checks"
```

将默认项目策略设置为 `ask`、`always` 或 `never` 以及 `[extensions].trust` 或 `DEEPAGENTS_CODE_EXTENSIONS_TRUST`。仅当您打开的每个项目都可信时才使用`always`。

## 配置扩展

在`~/.deepagents/config.toml`中配置发现：

```toml title="~/.deepagents/config.toml"
[extensions]
enabled = true
trust = "ask"
extra_paths = [
    "extensions/policy.py",
    "~/src/company-extensions",
]
```|设置|默认|描述 |
|---|---|---|
| `enabled` | `true` |为每个源启用扩展发现，包括`-e` / `--extension`。仍然需要实验环境变量。 |
| `trust` | `"ask"` |将项目扩展信任设置为 `ask`、`always` 或 `never`。 |
| `extra_paths` | `[]` |添加用户授权的Python文件或目录。相对路径从 dcode 配置文件目录解析； `~` 扩展到您的主目录。 |

`DEEPAGENTS_CODE_EXTENSIONS` 覆盖`enabled`，`DEEPAGENTS_CODE_EXTENSIONS_TRUST` 覆盖`trust`。两者仍然需要`DEEPAGENTS_CODE_EXPERIMENTAL=1`。当 `enabled` 为 `false` 时，Deep Agents 代码会跳过每个扩展源。

## 将扩展打包到插件中

版本化的[plugin](/oss/deepagents/code/plugins)是分发扩展的首选方式。在插件清单中的Deep AgentsCode命名空间下声明一个入口文件或一个列表：

```json title=".claude-plugin/plugin.json"
{
  "name": "shared-memory",
  "version": "1.0.0",
  "extensions": {
    "com.langchain.deepagents.code": {
      "pythonExtensions": "./extension.py"
    }
  }
}
```

每个条目必须以 `./` 开头，并保留在已安装的插件快照中。 dcode 拒绝绝对路径、父遍历、符号链接转义、丢失文件和非 Python 条目。声明 `pythonExtensions` 的插件还必须声明非空 `version`。安装并启用插件会授权其扩展代码。在会话期间安装、启用、禁用、更新或删除插件扩展后，运行 `/restart` 来重建代理图。

## 处理失败

每个扩展设置都是事务性的。如果导入或初始化失败，Deep Agents代码会删除该扩展的部分注册，在调试日志和`/extensions`中记录失败，并继续加载以后的扩展。关闭回调失败也不会阻止其他回调运行。

## 另请参阅

- [Plugins and marketplaces](/oss/deepagents/code/plugins)
- [Command reference](/oss/deepagents/code/cli-reference)
- [Config file](/oss/deepagents/code/config-file)
- [Approval modes](/oss/deepagents/code/approval-modes)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/extensions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>