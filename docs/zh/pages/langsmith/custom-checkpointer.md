<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to use a custom checkpointer | https://docs.langchain.com/langsmith/custom-checkpointer -->

# 如何使用自定义检查点

将代理部署到 LangSmith 时，服务器提供内置的 Postgres 支持的检查指针，用于处理图形运行之间的状态持久性。您可以将其替换为您自己的 [BaseCheckpointSaver](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.base.BaseCheckpointSaver) 实现，以使用不同的存储后端。

您提供一个生成 `BaseCheckpointSaver` 实例的异步上下文管理器的路径，并且服务器自动管理其生命周期。

<Warning>
自定义检查点处于 **alpha** 状态。此功能可能会在次要版本更新中经历重大更改。
</Warning>

<Tip>
要使用 MongoDB 而不是 PostgreSQL 进行检查点存储，请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。此页面用于实现完全自定义的存储后端。
</Tip>

## 定义检查点

从 **现有** LangSmith 应用程序开始，创建一个定义异步上下文管理器的文件，以生成自定义检查点。如果您要开始一个新项目，您可以使用 CLI 从模板创建应用程序。

```bash
langgraph new --template=new-langgraph-project-python my_new_project
```

异步上下文管理器模式允许服务器在应用程序生命周期的正确点打开和关闭数据库连接：

```python
# ./src/agent/checkpointer.py
import contextlib

class MyCheckpointer(BaseCheckpointSaver):
    def __init__(self):
        super().__init__()
        # Initialize your custom checkpointer here
    ...

    @contextlib.asynccontextmanager
    async def aget(self, config: RunnableConfig):
        # Your custom logic to create a connection pool and initialize your checkpointer here.
        yield


@contextlib.asynccontextmanager
async def generate_checkpointer():
    """Yield a BaseCheckpointSaver, open for the duration of the server."""
    async with AsyncSqliteSaver.from_conn_string("./checkpoints.db") as saver:
        await saver.setup()
        yield saver
```

## 针对一致性套件进行测试大多数开源检查点实现尚未实现代理服务器所需的所有操作。在配置检查点之前，请根据一致性测试套件对其进行验证以确保兼容性。

安装包：

```bash
pip install langgraph-checkpoint-conformance
```

注册您的检查点并运行验证：

```python
import asyncio

from langgraph.checkpoint.conformance import checkpointer_test, validate


@checkpointer_test(name="MyCheckpointer")
async def my_checkpointer():
    async with MyCheckpointer(...) as saver:
        yield saver


async def main():
    report = await validate(my_checkpointer)
    report.print_report()
    assert report.passed_all_base()


asyncio.run(main())
```

该套件自动检测您的检查点实现了哪些扩展功能并运行适当的测试。您还可以将其作为 pytest 测试运行：

```python
import pytest

from langgraph.checkpoint.conformance import checkpointer_test, validate


@checkpointer_test(name="MyCheckpointer")
async def my_checkpointer():
    async with MyCheckpointer(...) as saver:
        yield saver


@pytest.mark.asyncio
async def test_conformance():
    report = await validate(my_checkpointer)
    report.print_report()
    assert report.passed_all_base()
```

要查看套件验证的基本和扩展操作的完整列表，请参阅 [capabilities](#capabilities) 部分。

## 配置`langgraph.json`

将 `checkpointer` 密钥添加到您的 [⟦T10⟧ configuration file](/langsmith/application-structure#configuration-file-concepts)。 `path` 指向异步上下文管理器[defined earlier](#define-the-checkpointer)。

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env",
  "checkpointer": {
    "path": "./src/agent/checkpointer.py:generate_checkpointer"
  }
}
```

## 启动服务器

在本地测试服务器：

```bash
langgraph dev --no-browser
```

服务器日志将确认您的自定义检查点处于活动状态。

## 能力

服务器在启动时检查您的检查指针的**基本**（必需）和**扩展**（可选）功能。如果缺少扩展功能，服务器将使用回退或禁用相应的功能。

### 基本能力（必填）|方法|描述 |
|---|---|
| `aput` |存储检查点 |
| `aput_writes` |存储挂起的写入|
| `aget_tuple` |检索检查点 |
| `alist` |列出检查点 |
| `adelete_thread` |删除话题 |

### 扩展功能（可选）

|方法|描述 |如果丢失则后备|
|---|---|---|
| `adelete_for_runs` |删除特定运行的检查点 |回滚多任务策略不可用 |
| `acopy_thread` |复制主题 |缓慢回退（一一重新插入检查点）|
| `aprune` |修剪线程历史 |线程历史记录修剪不可用 |

## 部署

您可以将此应用程序按原样部署到 LangSmith 或您的自托管平台。

## 后续步骤

- [Build a custom checkpointer](/oss/python/langgraph/checkpointers#build-a-custom-checkpointer) 包括 Delta 通道支持。
- [Use a custom store](/langsmith/custom-store) 取代内置长期记忆存储。
- 在LangGraph中了解[persistence and memory](/oss/python/langgraph/persistence)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-checkpointer.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>