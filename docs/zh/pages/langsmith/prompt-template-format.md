<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt template format guide | https://docs.langchain.com/langsmith/prompt-template-format -->

# 提示模板格式指南

本页介绍 [Playground](/langsmith/prompt-engineering-concepts#playground)、[prompt hub](/langsmith/manage-prompts#public-prompt-hub) 和 [evaluators](/langsmith/evaluation-concepts#evaluators) 支持的 [prompt template](/langsmith/prompt-engineering-concepts#prompts-vs-prompt-templates) 格式。提示模板允许您使用在运行时填充的动态占位符创建可重用的提示。

<Tip>
有关提示工程和提示模板的一般概述，请参阅[Concepts](/langsmith/prompt-engineering-concepts#prompts-vs-prompt-templates)页面。
</Tip>

LangSmith 支持两种提示模板格式，适用于不同的复杂程度：

|格式|语法 |最适合 |
|--------|--------|----------|
| **f 字符串** | `{variable}` |带有基本变量替换的简单提示 |
| **小胡子** | `{{variable}}` |带有循环、条件、嵌套数据或求值器的复杂提示 |

[F-string syntax](#f-string-syntax) 非常适合简单的提示。 [Mustache](#mustache-syntax)提供了处理复杂数据结构和逻辑的功能，这对于评估者和高级用例很有帮助。

您可以在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-prompt-template-format)中切换格式。 LangSmith 将在可能的情况下自动 [convert your template](#conversion-between-formats)，尽管某些 Mustache 功能（如循环和条件）无法转换为 f 字符串格式。

<Callout icon="test-pipe" color="#4F46E5" iconType="regular">
使用 [Playground](https://smith.langchain.com/playground) 测试本页上的示例。在 Playground 中的提示设置<Icon icon="settings" color="#4F46E5" iconType="solid" />菜单下切换**提示格式**。
</Callout>## F 字符串语法

F 字符串模板使用带有单花括号 `{variable}` 的 Python 风格格式。 LangSmith 使用 Python 的 [f-string syntax](https://realpython.com/python-f-strings/) 的 [simplified subset](#limitations)：它仅支持基本变量替换，而不支持全部 Python 表达式和格式选项。当您有一个平面数据结构并且只需要在提示中插入值时，f 字符串是理想的选择。

### 基本变量

变量被替换为输入数据中的值。变量名称必须完全匹配（区分大小写）：

```python
# Template
Hello, {name}! Welcome to {company}.

# Input
{
  "name": "Ashley",
  "company": "LangChain"
}

# Output
Hello, Ashley! Welcome to LangChain.
```

当模板运行时，LangSmith查找输入对象中的每个变量名称，并将`{name}`替换为`name`键的值。

### 变量名称

F 字符串变量名称被视为简单字符串标识符。它们不能包含点、括号或特殊字符，只能包含字母数字字符和下划线。

```python
# Template
Hello, {name}!
Your topic is: {topic}

# Input
{
  "name": "Ashley",
  "topic": "LangSmith"
}

# Output
Hello, Ashley!
Your topic is: LangSmith
```

如果您的输入具有像 `{"user": {"name": "Ashley"}}` 这样的嵌套对象，则您**无法**使用 f 字符串格式的 `{user.name}` 访问嵌套值。该点将被视为变量名称的一部分（字面意思是寻找名为 `"user.name"` 的键），而不是作为路径分隔符。对于嵌套访问，请使用 [mustache format](#mustache-syntax) 代替。

### 文字大括号有时您需要在输出中包含实际的花括号（例如，在 JSON 示例或代码片段中）。为此，**双括号**：

```python
# Template
Use double braces for literals: {{not_a_variable}}
But single braces for variables: {variable}

# Input
{
  "variable": "value"
}

# Output
Use double braces for literals: {not_a_variable}
But single braces for variables: value
```

模板解析器将 `{{` 识别为转义大括号，而不是变量占位符。只有单大括号 `{...}` 被视为变量。

### 限制

LangSmith 的 f 字符串实现仅限于保持模板简单且可预测。 **不支持**以下功能：

- **嵌套访问的点表示法：** 无法使用 `{user.name}` 访问嵌套对象。整个字符串 `"user.name"` 将被视为单个变量名称。
- **格式说明符：** 不能使用 `{price:.2f}` 进行数字格式设置或 `{rate:.1%}` 进行百分比设置。
- **表达式：** 不能使用 `{x + y}`、`{len(items)}` 或 `{value if condition else default}`。
- **函数调用：**不能使用`{str.upper()}`或其他方法调用。
- **循环或条件：** 无控制流结构。
- **数组索引：** 无法使用 `{items[0]}` 访问数组元素。

对于任何这些高级功能，**请改用小胡子格式**。

## 小胡子语法[Mustache](https://mustache.github.io/mustache.5.html) 是一种“无逻辑”模板语言，这意味着它不允许执行任意代码，但确实通过部分提供结构化控制流。它被称为“无逻辑”，因为您无法编写复杂的表达式 - 相反，您可以构建数据来控制呈现的内容。

Mustache 专为复杂的数据结构和动态渲染而设计。它对于以下方面至关重要：

- **评估者：** 处理线程历史记录和对话上下文。
- **少量提示：** 迭代示例列表。
- **嵌套数据：** 访问深度嵌套的对象和数组。
- **条件内容：** 根据数据存在显示不同的文本。

双括号语法 `{{variable}}` 将其与 f 字符串区分开来。

### 基本变量

与 f 字符串一样，mustache 将变量替换为其值：

```mustache
{{!-- Template --}}
Hello, {{name}}! Welcome to {{company}}.

{{!-- Input --}}
{
  "name": "Ashley",
  "company": "LangChain"
}

{{!-- Output --}}
Hello, Ashley! Welcome to LangChain.
```

<Note>
`{{!-- ... --}}` 是小胡子注释，不会出现在输出中。请参阅[Comments](#comments)部分。
</Note>

### 嵌套对象访问

您可以使用点表示法遍历嵌套对象：

```mustache
{{!-- Template --}}
User: {{user.name}}
Email: {{user.profile.email}}

{{!-- Input --}}
{
  "user": {
    "name": "Billy",
    "profile": {
      "email": "billy@example.com"
    }
  }
}

{{!-- Output --}}
User: Billy
Email: billy@example.com
```

模板引擎遵循路径 `user` → `profile` → `email` 通过您的数据结构。每个点代表一层嵌套。现实世界的数据通常是嵌套的（例如：API 响应、数据库记录等）。 Mustache 让您可以自然地处理这些数据，而无需先将其展平。

### 部分

部分是小胡子的核心特征。节以 `{{#name}}` 开始，以 `{{/name}}` 结束。内部发生的情况取决于值：

- **Array:** 重复每个元素的内容。
- **对象：** 使用该对象作为上下文渲染一次。
- **真实值：** 渲染一次。
- **虚假值（false、null、未定义、空数组）：** 不渲染。

在以下示例中，部分 `{{#items}}` 迭代 `items` 数组。对于每次迭代，该部分内的变量（如 `{{name}}` 和 `{{price}}`）都会根据当前数组元素进行解析：

```mustache
{{!-- Template --}}
Shopping List:
{{#items}}
  - {{name}}: ${{price}}
{{/items}}

{{!-- Input --}}
{
  "items": [
    {"name": "Apple", "price": "1.50"},
    {"name": "Banana", "price": "0.75"},
    {"name": "Orange", "price": "2.00"}
  ]
}

{{!-- Output --}}
Shopping List:
  - Apple: $1.50
  - Banana: $0.75
  - Orange: $2.00
```

章节消除了手动构建重复文本的需要。在评估器中，您将使用部分来迭代对话消息或[few-shot examples](#few-shot-examples)。

对于深度嵌套的分层数据，您可以嵌套多个部分来处理具有多个级别的数组和对象的复杂结构：

```mustache
{{!-- Template --}}
{{#company}}
Company: {{name}}
{{#departments}}
  Department: {{dept_name}}
  {{#employees}}
    - {{employee_name}} ({{role}})
  {{/employees}}
{{/departments}}
{{/company}}

{{!-- Input --}}
{
  "company": {
    "name": "TechCorp",
    "departments": [
      {
        "dept_name": "Engineering",
        "employees": [
          {"employee_name": "Ashley", "role": "Senior Engineer"},
          {"employee_name": "Billy", "role": "Engineer"}
        ]
      },
      {
        "dept_name": "Sales",
        "employees": [
          {"employee_name": "Carol", "role": "Sales Manager"}
        ]
      }
    ]
  }
}

{{!-- Output --}}
Company: TechCorp
  Department: Engineering
    - Ashley (Senior Engineer)
    - Billy (Engineer)
  Department: Sales
    - Carol (Sales Manager)
```<Tip>
您可以根据需要创建尽可能深的结构，但在模板化之前考虑展平非常深的结构以提高可读性。此方法对于嵌套类别、具有元数据的对话线程或任何分层数据表示非常有用。
</Tip>

### 嵌套循环

您可以嵌套部分来处理多级数据结构：

```mustache
{{!-- Template --}}
{{#categories}}
Category: {{name}}
{{#products}}
  - {{title}} ({{price}})
{{/products}}
{{/categories}}

{{!-- Input --}}
{
  "categories": [
    {
      "name": "Fruits",
      "products": [
        {"title": "Apple", "price": "$1.50"},
        {"title": "Banana", "price": "$0.75"}
      ]
    },
    {
      "name": "Vegetables",
      "products": [
        {"title": "Carrot", "price": "$0.50"},
        {"title": "Lettuce", "price": "$1.25"}
      ]
    }
  ]
}

{{!-- Output --}}
Category: Fruits
  - Apple ($1.50)
  - Banana ($0.75)
Category: Vegetables
  - Carrot ($0.50)
  - Lettuce ($1.25)
```

外部部分`{{#categories}}`设置每个类别对象的上下文。在该上下文中，`{{name}}`指的是类别名称，内部部分`{{#products}}`迭代该类别的产品。

当您的数据具有层次关系（类别与产品、部门与员工或对话线程与多个交换）时，请使用嵌套循环。

### 按索引排列数组元素

有时您需要特定元素而不是循环。使用带有数字索引的点表示法：

```mustache
{{!-- Template --}}
First item: {{items.0}}
Second item: {{items.1}}
Last item: {{items.2}}

{{!-- Input --}}
{
  "items": ["Apple", "Banana", "Orange"]
}

{{!-- Output --}}
First item: Apple
Second item: Banana
Last item: Orange
```

编写模板时必须知道索引。

评估人员通常需要对话线程中的第一条用户消息或最后一次人工智能响应。使用 `{{all_messages.0}}` 作为第一条消息或预先计算数据中的最后一条消息。

### 条件您可以使用部分作为条件。它们仅在值存在、非空且不是 `false` 时才渲染：

```mustache
{{!-- Template --}}
{{#user}}
Welcome back, {{name}}!
{{/user}}

{{!-- Input (user exists) --}}
{
  "user": {
    "name": "Ashley"
  }
}

{{!-- Output --}}
Welcome back, Ashley!

{{!-- Input (no user) --}}
{}

{{!-- Output --}}
(empty - section doesn't render)
```

`{{#user}}` 部分检查 `user` 是否存在且为真。如果是这样，它会以 `user` 作为上下文渲染内部内容（因此 `{{name}}` 在 `user` 中查找 `name`）。

仅当用户数据可用时才显示可选内容，例如“欢迎回来”消息，或者仅在存在错误时显示错误消息。

### 倒置部分

仅当值不存在、为 false、null、未定义或空数组时，才会呈现倒置部分。倒置部分通常用于处理空状态，例如丢失数据或空列表。

在以下示例中：

- `{{#results}}` 迭代每个结果并为每个项目渲染一行。
- `{{^results}}` 仅当结果数组为空或缺失时才渲染。
- 当没有结果可显示时，倒置部分提供了清晰的后备。

```mustache
{{!-- Template --}}
Search results for "{{query}}":

{{#results}}
  - {{title}} ({{year}})
{{/results}}

{{^results}}
No results found. Try a different search term.
{{/results}}

{{!-- Input (with results)--}}
{
  "query": "matrix",
  "results": [
    {"title": "The Matrix", "year": 1999},
    {"title": "The Matrix Reloaded", "year": 2003}
  ]
}

{{!-- Output --}}
Search results for "matrix":

  - The Matrix (1999)
  - The Matrix Reloaded (2003)

{{!-- Input (no results) --}}
{
    "query": "asdlkjasd",
    "results": []
}

{{!-- Output --}}
Search results for "asdlkjasd":

No results found. Try a different search term.
```

您还可以组合常规部分和反转部分来创建 if/else 逻辑，在变量丢失时提供默认值。仅当 `username` 存在时，常规部分 `{{#username}}` 才会呈现。仅当不渲染时，反转部分 `{{^username}}` 才会渲染。它们一起创建一个 if/else 分支。当用户数据可选时，这对于个性化提示或在未提供自定义说明时显示默认说明非常有用：

```mustache
{{!-- Template --}}
{{#username}}
Hello, {{username}}!
{{/username}}
{{^username}}
Hello, Guest!
{{/username}}

{{!-- Input (with username) --}}
{"username": "Ashley"}
{{!-- Output: Hello, Ashley! --}}

{{!-- Input (no username) --}}
{}
{{!-- Output: Hello, Guest! --}}
```

此模式扩展到布尔标志，允许您根据数据条件更改输出格式：

```mustache
{{!-- Template --}}
Status: {{status}}
{{#is_urgent}}
⚠️ URGENT - Immediate attention required!
{{/is_urgent}}
{{^is_urgent}}
Standard priority
{{/is_urgent}}

{{!-- Input --}}
{
  "status": "Open",
  "is_urgent": true
}

{{!-- Output --}}
Status: Open
⚠️ URGENT - Immediate attention required!
```

在数据中使用布尔标志来控制呈现哪些内容块。这使得格式化逻辑不再出现在应用程序代码中，而是出现在模板中。这种方法对于突出显示重要信息、根据上下文调整语气（正式与休闲）或为不同的用户类型显示不同的说明非常有用。

### 评论

注释记录您的模板而不影响输出。使用 `{{! comment }}` 或 `{{!-- comment --}}`：

```mustache
{{!-- Template --}}
Hello, {{name}}!
{{! This is a comment and won't appear in output }}
Welcome to our service.

{{!-- Input --}}
{
  "name": "Ashley"
}

{{!-- Output --}}
Hello, Ashley!
Welcome to our service.
```

使用注释来解释复杂的部分、记录预期的数据结构或说明为什么存在某些逻辑。这有助于协作者了解您的模板。

## 求值器和线程的特殊变量在构建 [evaluators](/langsmith/evaluation-concepts#evaluators) 或使用对话式 AI 时，LangSmith 自动提供特殊变量，以有用的方式构建对话数据。这些变量**仅在评估器上下文中可用**，而不是在常规 Playground 提示中可用。

评估者需要全面分析对话——查看多条消息的模式，将第一个问题与最终答案进行比较，或者检查人工智能对后续问题的反应如何。这些变量使得无需手动数据操作即可轻松访问对话结构。

### 线程消息变量

LangSmith 提供了三种预先结构化的对话视图 [threads](/langsmith/evaluation-concepts#threads)：

```mustache
{{!-- Access all messages in the thread --}}
{{#all_messages}}
{{role}}: {{content}}
{{/all_messages}}

{{!-- Access human-AI message pairs --}}
{{#human_ai_pairs}}
Human: {{human}}
AI: {{ai}}
{{/human_ai_pairs}}

{{!-- Access first human and last AI message --}}
{{#first_human_last_ai}}
Original question: {{first_human}}
Final answer: {{last_ai}}
{{/first_human_last_ai}}

{{!-- Access specific message by index --}}
First message: {{all_messages.0}}
Second message: {{all_messages.1}}
```

- **`all_messages`**：按时间顺序排列的每条消息，带有 `role`（用户/助理/系统）和 `content` 字段。用它来显示完整的对话流程。
- **`human_ai_pairs`**：消息分组为问题-答案对。每对都有`human`（用户消息）和`ai`（助理响应）。在评估响应质量时使用此选项。
- **`first_human_last_ai`**：只是最初的问题（`first_human`）和最终答案（`last_ai`）。用它来检查人工智能是否最终回答了原来的问题，忽略了中间的对话。

### 线程上下文示例以下示例是使用线程上下文的实用评估器提示：

```mustache
{{!-- Template --}}
Evaluate this conversation:

{{#all_messages}}
{{role}}: {{content}}
{{/all_messages}}

Was the AI helpful? Rate from 1-5.

{{!-- Input (provided by LangSmith) --}}
{
  "all_messages": [
    {"role": "user", "content": "What's the weather?"},
    {"role": "assistant", "content": "I don't have access to weather data."},
    {"role": "user", "content": "Can you tell me a joke instead?"},
    {"role": "assistant", "content": "Why did the chicken cross the road?"}
  ]
}

{{!-- Output --}}
Evaluate this conversation:

user: What's the weather?
assistant: I don't have access to weather data.
user: Can you tell me a joke instead?
assistant: Why did the chicken cross the road?

Was the AI helpful? Rate from 1-5.
```

该模板使用 Mustache 部分 `{{#all_messages}}` 来循环对话数组。对于每次迭代，该部分都会将上下文设置为该消息对象，因此 `{{role}}` 和 `{{content}}` 访问当前消息的属性。该循环会自动按顺序遍历所有四个消息，将每个消息显示为 `"role: content"`。这为评估者 LLM 提供了完整的对话历史记录以评估有用性。

当您在 LangSmith 中创建赋值器时，选择要包含的线程变量。 LangSmith 会自动从正在评估的对话中填充它们。

## 少量示例

少量提示以实例方式教授法学硕士课程。您提供几个输入-输出对来演示该任务，然后要求它对新输入执行相同的任务。

[Few-shot examples](/langsmith/create-few-shot-evaluators#how-few-shot-examples-work) 帮助LLM理解：

- **格式期望**（例如，“使用 JSON 响应”或“使用此语气”）
- **边缘情况**（例如，如何处理不明确的输入）
- **任务细微差别**（例如，“积极”和“非常积极”情绪之间的差异）它对于分类、格式化和文体任务特别有用，在这些任务中，展示比讲述更清晰。

### 少镜头占位符

在 LangSmith 中，使用 `{{few_shot_examples}}` 占位符来显示示例：

```mustache
{{!-- Template --}}
You are a sentiment classifier.

{{few_shot_examples}}

Now classify this text:
Text: {{text}}
Sentiment:
```

当您在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-prompt-template-format)（在评估器或提示中心）中启用少数样本示例时，您可以单独配置示例格式。无论您在何处放置 `{{few_shot_examples}}` 占位符，LangSmith 都会自动注入这些格式化示例。这可以使您的提示模板保持干净，并让您独立管理示例。

**带有配置示例的示例输出：**

```
You are a sentiment classifier.

Text: I love this!
Sentiment: positive
Text: This is terrible.
Sentiment: negative
Text: It's okay.
Sentiment: neutral

Now classify this text:
Text: This is amazing!
Sentiment:
```

在 LangSmith UI 中配置您的少数示例，以匹配您用于实际任务的格式。这种一致性有助于法学硕士正确概括。占位符方法将提示结构与示例数据分开，使两者更易于维护。

## 格式之间的转换

**F 字符串到小胡子** 始终适用于基本变量。格式说明符已转换，但格式已删除。

**小胡子到 f 字符串**仅适用于基本变量。点表示法、部分、条件和注释等 Mustache 功能在 f 字符串中没有等效项，因此无法转换：- **点符号：** `{{user.name}}` F 字符串会将 `"user.name"` 视为单个变量名称而不是嵌套访问。
- **部分/循环：** `{{#items}}...{{/items}}` f 字符串中没有等效项。
- **条件：** `{{#value}}...{{/value}}` f 字符串中没有等效项。
- **倒置部分：** `{{^value}}...{{/value}}` f 字符串中没有等效项。
- **评论：** `{{! comment }}` f 字符串中没有等效项。

如果您尝试使用这些功能转换胡子模板，LangSmith将拒绝转换或仅转换简单部分，从而破坏模板的功能。转换后始终预览。

## 其他资源

- **[LangSmith Prompt Engineering Concepts](https://docs.langchain.com/langsmith/prompt-engineering-concepts)**：关于有效提示策略的更高级别指导。
- **[Mustache Manual](https://mustache.github.io/mustache.5.html)**：具有所有功能的完整胡须规格。
- **[Python f-string Documentation](https://docs.python.org/3/reference/lexical_analysis.html#f-strings)**：官方 Python f 字符串语法（注意：LangSmith 使用简化子集）。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-template-format.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>