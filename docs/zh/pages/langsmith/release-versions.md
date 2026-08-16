<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Release policy | https://docs.langchain.com/langsmith/release-versions -->

# 发布策略

自托管 LangSmith 有两个发布渠道：客户在生产中运行的稳定渠道和跟踪下一个主要版本的预览渠道。

## 发布渠道

### 稳定

当前普遍可用的主要版本。 LangSmith推荐使用此通道进行制作。 Stable 每周都会收到补丁版本，其中仅包含关键错误修复和安全补丁。主要版本之间没有新功能、数据迁移或基础设施变化稳定。

在本页中，`N`指的是当前稳定的主要版本。预览版跟踪下一个主要版本`N+1`。

### 预览

下一个主要版本的开发版本。预览版包括合并到 LangSmith SaaS 中的新功能和修复，因此您可以在下一个主要版本变得稳定之前对其进行评估。预览版本可能包括数据迁移，但绝不添加或删除服务或引入重大更改。

预览旨在用于测试和登台环境中的评估。 LangSmith 不建议在生产中运行预览。

## 发布节奏|频道|节奏|
|---------|---------|
|预览 |已发布镜像 LangSmith SaaS 发布节奏 |
|稳定：新专业（`v0.X.0`）|大约每 6 周一次（每季度两次）|
|稳定：补丁（`v0.X.Y`）|每周（通常是星期五），如果没有变化则跳过。针对关键客户问题发布的临时版本。 |

## 每个频道中都有哪些内容

|  |预览 |稳定补丁|下一个专业 |
|--|:-:|:-:|:-:|
|新功能|是的 |没有|是的 |
|错误修复 |是的 |仅关键 |是的 |
|安全补丁|是的 |是的 |是的 |
|数据迁移和回填|是的 |没有|是的 |
|新的或删除的服务 |没有|没有|是的 |
|重大变化 |没有|没有|是的 |

服务添加、服务删除和重大更改只会出现在新的主要版本中，因此在计划升级到新的主要版本时请记住这一点。

## 版本编号

每个自托管版本都有两个版本号：

- **图表版本** 是您安装并固定的 Helm 图表版本。版本以 [self-hosted changelog](/langsmith/self-hosted-changelog) 和 [Helm repository](https://github.com/langchain-ai/helm/releases) 版本标签命名，例如 `langsmith-0.15.17`。
- **LangSmith版本**是图表部署的应用程序版本，在图表中记录为`appVersion`。|  |图表版本| LangSmith版 |
|--|--|--|
|稳定| `0.15.17` | `0.15.24` |
|预览（候选版本）| `0.16.0-rc.15` | `0.16.19rc1` |

- 稳定的图表版本是`0.X.Y`，其中`X`是主要版本，`Y`随着每个补丁版本的发布而递增。
- 预览图表版本为 `0.X.0-rc.N`，其中 `N` 随着每个候选版本而递增。
- 两个数字独立前进。图表补丁编号和LangSmith补丁编号预计不会匹配。

用于发布列车的`vX`简写（`v15`、`v16`）指的是主要版本，因此`v15`表示图表版本`0.15.Y`。

## 版本支持

LangSmith 支持当前稳定主要版本（`N`）和之前的稳定主要版本（`N-1`）：

- `N` 获得积极支持：关键错误修复、安全补丁和每周补丁发布。
- `N-1` 仅获得关键支持：关键错误修复和安全补丁，临时发布而不是每周发布。
- 早于 `N-1` 的版本已终止生命，不会收到新的补丁版本、错误修复或安全更新。由于新的主要版本大约每 6 周发布一次，因此版本在被稳定版本取代后大约 6 周就达到生命周期结束。一旦版本终止，修复就不会向后移植到该版本；升级到受支持的主要版本即可使用它们。

除了两个受支持的稳定版本之外，下一个主要版本也作为一系列候选版本在预览通道上提供，例如 `0.16.0-rc.15`。预览版本会持续发布，并始终包含最新的修复程序，但它们旨在用于测试和登台环境中的评估，而不是生产环境。在非生产环境中运行预览是在下一个主要版本变得稳定之前对其进行验证的推荐方法。

## 建议- **在生产中运行稳定。** 预览版仅用于评估，可能包含仍在验证中的未发布功能。
- **在测试或登台中使用预览。** 在非生产环境中运行预览是尽早发现问题并为下一次重大升级做好准备的最佳方法。
- **规划重大升级。** 数据迁移、服务添加或删除以及重大更改仅出现在新的主要版本中。在升级之前查看[self-hosted changelog](/langsmith/self-hosted-changelog)，并计划任何所需的数据或基础设施更改。
- **保留受支持的版本。** LangSmith 建议在发布后立即升级到每个新的主要版本，以便按照建议的节奏进行架构改进。

## 当前版本

要查看当前的稳定版和预览版，请参阅[self-hosted changelog](/langsmith/self-hosted-changelog)。

## 另请参阅

- [Release stages](/langsmith/release-stages) 了解功能如何从 alpha 迁移到 GA
- [API and SDK deprecation policy](/langsmith/endpoint-deprecation) 了解如何删除已弃用的端点和方法

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/release-versions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>