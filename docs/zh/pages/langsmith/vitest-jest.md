<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to run evaluations with Vitest/Jest | https://docs.langchain.com/langsmith/vitest-jest -->

# 如何使用 Vitest/Jest 进行评估

LangSmith 提供与 [Vitest](https://vitest.dev/) 和 [Jest](https://jestjs.io/) 的集成，允许 JavaScript 和 TypeScript 开发人员定义其 [datasets](/langsmith/evaluation-concepts#datasets) 并使用熟悉的语法进行评估。

![Jest/Vitest reporter output](/langsmith/images/jest-vitest-reporter-output.png)

与 [⟦T28⟧](https://reference.langchain.com/javascript/langsmith/evaluation/evaluate) 评估流程相比，Vitest 或 Jest 测试框架在以下情况下非常有用：

* **每个示例需要不同的评估逻辑**：标准评估流程假设所有数据集示例中的应用程序和评估器执行一致。对于更复杂的系统或更全面的评估，特定的系统子集可能需要使用特定的输入类型和指标进行评估。这些异构评估更容易编写为一起跟踪的不同测试用例套件。
* **您想要断言二进制期望**：跟踪 LangSmith 中的断言并在本地引发断言错误（例如在 CI 管道中）。测试工具有助于评估系统输出并断言其基本属性。
* **您想要利用模拟、观看模式、本地结果或 Vitest/Jest 生态系统的其他功能**。

<Info>
需要 JS/TS SDK 版本`langsmith>=0.3.1`。
</Info>

<Info>
Python SDK 有一个类似的 [pytest integration](/langsmith/pytest)。
</Info>

## 设置按如下方式设置集成。请注意，虽然您可以使用现有的测试配置文件将 LangSmith 评估与其他单元测试（作为标准 `*.test.ts` 文件）一起添加，但以下示例还将设置一个单独的测试配置文件和命令来运行评估。它将假设您以 `.eval.ts` 结束测试文件。

这可确保自定义测试报告器和其他LangSmith接触点不会修改您现有的测试输出。

### 维泰斯特

如果尚未安装所需的开发依赖项，请安装：

<CodeGroup>

```bash yarn
yarn add -D vitest dotenv
```

```bash npm
npm install -D vitest dotenv
```

```bash pnpm
pnpm add -D vitest dotenv
```

</CodeGroup>

以下示例还需要 `openai` （和 `langsmith`）作为依赖项：

<CodeGroup>

```bash yarn
yarn add langsmith openai
```

```bash npm
npm install langsmith openai
```

```bash pnpm
pnpm add langsmith openai
```

</CodeGroup>

然后，使用以下基本配置创建一个单独的 `ls.vitest.config.ts` 文件：

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.eval.?(c|m)[jt]s"],
    reporters: ["langsmith/vitest/reporter"],
    setupFiles: ["dotenv/config"],
    testTimeout: 30000,
  },
});
```

* `include` 确保项目中仅运行以 `eval.ts` 的某些变体结尾的文件
* `reporters` 负责很好地格式化你的输出，如上所示
* `setupFiles` 运行 `dotenv` 在运行评估之前加载环境变量
* `testTimeout`为每个测试设置全局默认超时。由于 LLM 调用可能很慢，因此我们在 Vitest 默认值的基础上增加了此值<Warning>
目前不支持 JSDom 环境。您应该从配置中省略 `"environment"` 字段或将其设置为 `"node"`。
</Warning>

最后，将以下内容添加到 `package.json` 中的 `scripts` 字段，以使用您刚刚创建的配置运行 Vitest：

```json
{
  "name": "YOUR_PROJECT_NAME",
  "scripts": {
    "eval": "vitest run --config ls.vitest.config.ts"
  },
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  }
}
```

请注意，此脚本禁用 Vitest 用于运行评估的默认监视模式，因为许多评估器可能包含更长的运行 LLM 调用。

### 开玩笑

如果尚未安装所需的开发依赖项，请安装：

<CodeGroup>

```bash yarn
yarn add -D jest dotenv
```

```bash npm
npm install -D jest dotenv
```

```bash pnpm
pnpm add -D jest dotenv
```

</CodeGroup>

下面的示例还需要 `openai` （和 `langsmith`）作为依赖项：

<CodeGroup>

```bash yarn
yarn add langsmith openai
```

```bash npm
npm install langsmith openai
```

```bash pnpm
pnpm add langsmith openai
```

</CodeGroup>

<Info>
以下设置说明适用于基本 JS 文件和 CJS。要添加对 TypeScript 和 ESM 的支持，请参阅 Jest 的官方文档或使用 [Vitest](#vitest)。
</Info>

然后，创建一个名为 `ls.jest.config.cjs` 的单独配置文件：

```javascript
module.exports = {
  testMatch: ["**/*.eval.?(c|m)[jt]s"],
  reporters: ["langsmith/jest/reporter"],
  setupFiles: ["dotenv/config"],
  testTimeout: 30000,
};
```

* `testMatch` 确保项目中仅运行以 `eval.js` 的某些变体结尾的文件
* `reporters` 负责很好地格式化你的输出，如上所示
* `setupFiles` 在运行评估之前运行 `dotenv` 加载环境变量
* `testTimeout`为每个测试设置一个全局默认超时。由于 LLM 调用可能会很慢，因此我们在 Jest 默认值的基础上增加了此值<Warning>
目前不支持 JSDom 环境。您应该从配置中省略 `"testEnvironment"` 字段或将其设置为 `"node"`。
</Warning>

最后，将以下内容添加到 `package.json` 中的 `scripts` 字段，以使用您刚刚创建的配置运行 Jest：

```json
{
  "name": "YOUR_PROJECT_NAME",
  "scripts": {
    "eval": "jest --config ls.jest.config.cjs"
  },
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  }
}
```

## 定义并运行评估

您现在可以使用熟悉的 Vitest/Jest 语法将 eval 定义为测试，但有一些注意事项：

* 您应该从 [⟦T60⟧](https://reference.langchain.com/javascript/modules/langsmith.jest.html) 或 [⟦T61⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html) 入口点导入 `describe` 和 `test`。
* 您必须将测试用例包装在 `describe` 块中。
* 声明测试时，签名略有不同 - 有一个额外的参数，其中包含示例输入和预期输出。

通过创建一个名为 `sql.eval.ts`（或 `sql.eval.js`，如果您在不使用 TypeScript 的情况下使用 Jest）的文件并将以下代码粘贴到其中来尝试一下：

```typescript
import * as ls from "langsmith/vitest";
import { expect } from "vitest";
// import * as ls from "langsmith/jest";
// import { expect } from "@jest/globals";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers/openai";

// Add "openai" as a dependency and set OPENAI_API_KEY as an environment variable
const tracedClient = wrapOpenAI(new OpenAI());

const generateSql = traceable(
  async (userQuery: string) => {
    const result = await tracedClient.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "system",
          content:
            "Convert the user query to a SQL query. Do not wrap in any markdown tags.",
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });
    return result.choices[0].message.content;
  },
  { name: "generate_sql" }
);

ls.describe("generate sql demo", () => {
  ls.test(
    "generates select all",
    {
      inputs: { userQuery: "Get all users from the customers table" },
      referenceOutputs: { sql: "SELECT * FROM customers;" },
    },
    async ({ inputs, referenceOutputs }) => {
      const sql = await generateSql(inputs.userQuery);
      ls.logOutputs({ sql }); // <-- Log run outputs, optional
      expect(sql).toEqual(referenceOutputs?.sql); // <-- Assertion result logged under 'pass' feedback key
    }
  );
});
```

您可以将每个[ls.test](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#test)案例视为对应于一个数据集示例，并将[⟦T65⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#describe)视为定义一个LangSmith数据集。如果您在运行测试套件时设置了 LangSmith [tracing environment variables](#setup)，则 SDK 会执行以下操作：* 创建一个与LangSmith中传递给`ls.describe()`同名的[dataset](/langsmith/evaluation-concepts#datasets)（如果不存在）。
* 如果尚不存在匹配的输入，则在数据集中为传递到测试用例的每个输入和预期输出创建一个[example](/langsmith/evaluation-concepts#datasets)。
* 创建一个新的[experiment](/langsmith/evaluation-concepts#experiment)，每个测试用例都有一个结果。
* 收集每个测试用例在`pass`反馈键下的通过/失败率。

当您运行此测试时，它将有一个基于测试用例通过/失败的默认`pass`布尔反馈键。它还将跟踪您使用 [⟦T69⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#logOutputs) 记录的任何输出或从测试函数返回的任何输出，作为实验应用程序的“实际”结果值。

如果您还没有 `OPENAI_API_KEY` 和 LangSmith 凭据，请创建一个 `.env` 文件：

```bash
OPENAI_API_KEY="YOUR_KEY_HERE"
LANGSMITH_API_KEY="YOUR_LANGSMITH_KEY"
LANGSMITH_TRACING="true"
```

现在使用我们在上一步中设置的 `eval` 脚本来运行测试：

<CodeGroup>

```bash yarn
yarn run eval
```

```bash npm
npm run eval
```

```bash pnpm
pnpm run eval
```

</CodeGroup>

并且您声明的测试应该运行！

完成后，如果您设置了 LangSmith 环境变量，您应该会看到一个链接，将您引导至在 LangSmith 中创建的实验以及测试结果。

针对该测试套件的实验如下所示：

![Experiment](/langsmith/images/simple-vitest.png)

## 跟踪反馈默认情况下，LangSmith收集每个测试用例的`pass`反馈键下的通过/失败率。您可以使用 [⟦T74⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#logFeedback) 或 [⟦T75⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#wrapEvaluator) 添加其他反馈。为此，请尝试将以下内容作为您的 `sql.eval.ts` 文件（如果您使用的是不带 TypeScript 的 Jest，则为 `sql.eval.js`）：

```typescript
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers/openai";

// Add "openai" as a dependency and set OPENAI_API_KEY as an environment variable
const tracedClient = wrapOpenAI(new OpenAI());

const generateSql = traceable(
  async (userQuery: string) => {
    const result = await tracedClient.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "system",
          content:
            "Convert the user query to a SQL query. Do not wrap in any markdown tags.",
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });
    return result.choices[0].message.content ?? "";
  },
  { name: "generate_sql" }
);

const myEvaluator = async (params: {
  outputs: { sql: string };
  referenceOutputs: { sql: string };
}) => {
  const { outputs, referenceOutputs } = params;
  const instructions = [
    "Return 1 if the ACTUAL and EXPECTED answers are semantically equivalent, ",
    "otherwise return 0. Return only 0 or 1 and nothing else.",
  ].join("\n");
  const grade = await tracedClient.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content: instructions,
      },
      {
        role: "user",
        content: `ACTUAL: ${outputs.sql}\nEXPECTED: ${referenceOutputs?.sql}`,
      },
    ],
  });
  const score = parseInt(grade.choices[0].message.content ?? "");
  return { key: "correctness", score };
};

ls.describe("generate sql demo", () => {
  ls.test(
    "generates select all",
    {
      inputs: { userQuery: "Get all users from the customers table" },
      referenceOutputs: { sql: "SELECT * FROM customers;" },
    },
    async ({ inputs, referenceOutputs }) => {
      const sql = await generateSql(inputs.userQuery);
      ls.logOutputs({ sql });
      const wrappedEvaluator = ls.wrapEvaluator(myEvaluator);
      // Will automatically log "correctness" as feedback
      await wrappedEvaluator({
        outputs: { sql },
        referenceOutputs,
      });
      // You can also manually log feedback with `ls.logFeedback()`
      ls.logFeedback({
        key: "harmfulness",
        score: 0.2,
      });
    }
  );
  ls.test(
    "offtopic input",
    {
      inputs: { userQuery: "what's up" },
      referenceOutputs: { sql: "sorry that is not a valid query" },
    },
    async ({ inputs, referenceOutputs }) => {
      const sql = await generateSql(inputs.userQuery);
      ls.logOutputs({ sql });
      const wrappedEvaluator = ls.wrapEvaluator(myEvaluator);
      // Will automatically log "correctness" as feedback
      await wrappedEvaluator({
        outputs: { sql },
        referenceOutputs,
      });
      // You can also manually log feedback with `ls.logFeedback()`
      ls.logFeedback({
        key: "harmfulness",
        score: 0.2,
      });
    }
  );
});
```

请注意在 `myEvaluator` 函数周围使用 [⟦T78⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#wrapEvaluator)。这使得 LLM-as-judge 调用与测试用例的其余部分分开跟踪，以避免混乱，并且如果包装函数的返回值与 `{ key: string; score: number | boolean }` 匹配，则可以方便地创建反馈。在这种情况下，评估器跟踪将显示在与 `correctness` 反馈键关联的跟踪中，而不是显示在主测试用例运行中。

您可以通过点击 UI 中相应的反馈选项来查看评估器在 LangSmith 中运行。

## 针对一个测试用例运行多个示例

您可以在多个示例上运行相同的测试用例，并使用 [⟦T82⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#test) 参数化您的测试。当您想要针对不同的输入以相同的方式评估您的应用程序时，这非常有用：

```typescript
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";

const DATASET = [
  {
    inputs: { userQuery: "what's up" },
    referenceOutputs: { sql: "sorry that is not a valid query" }
  },
  {
    inputs: { userQuery: "what color is the sky?" },
    referenceOutputs: { sql: "sorry that is not a valid query" }
  },
  {
    inputs: { userQuery: "how are you today?" },
    referenceOutputs: { sql: "sorry that is not a valid query" }
  }
];

ls.describe("generate sql demo", () => {
  ls.test.each(DATASET)(
    "offtopic inputs",
    async ({ inputs, referenceOutputs }) => {
      ...
    },
  );
});
```

如果您启用了跟踪，本地数据集中的每个示例都将同步到 LangSmith 中创建的示例。

## 使用现有数据集（仅限 Vitest）您可以针对 LangSmith 中的现有数据集运行测试，而不是内联定义 [examples](/langsmith/evaluation-concepts#examples)：

- 使用[⟦T83⟧](https://reference.langchain.com/javascript/classes/langsmith.client.Client.html#listexamples)从LangSmith中已存在的数据集中获取示例。
- 通过迭代异步生成器将示例收集到数组中（例如，`testExamples`）。
- 将数组传递给[⟦T85⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#test)，以针对数据集中的每个示例运行测试逻辑。

```typescript {3,30-43,47}
import * as ls from "langsmith/vitest";
import { expect } from "vitest";
import { Client, Example } from "langsmith";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers/openai";

const tracedClient = wrapOpenAI(new OpenAI());

const generateSql = traceable(
  async (userQuery: string) => {
    const result = await tracedClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Convert the user query to a SQL query. Do not wrap in any markdown tags.",
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });
    return result.choices[0].message.content;
  },
  { name: "generate_sql" }
);

// Fetch examples from an existing dataset
const client = new Client();

const examples = client.listExamples({
  datasetName: "generate sql demo",
});

const testExamples: Example[] = [];

for await (const example of examples) {
  testExamples.push(example);
}

ls.describe(
  "generate sql demo",
  () => {
    ls.test.each(testExamples)(
      "generates valid sql",
      async ({ inputs, referenceOutputs }) => {
        const sql = await generateSql(inputs.userQuery);
        ls.logOutputs({ sql });
        expect(sql).toEqual(referenceOutputs?.sql);
      }
    );
  }
);
```

## 日志输出

每次运行测试时，我们都会将其同步到数据集示例并将其作为运行进行跟踪。要跟踪运行的最终输出，您可以像这样使用 [⟦T86⟧](https://reference.langchain.com/javascript/modules/langsmith.vitest.html#logOutputs)：

```typescript
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";

ls.describe("generate sql demo", () => {
  ls.test(
    "offtopic input",
    {
      inputs: { userQuery: "..." },
      referenceOutputs: { sql: "..." }
    },
    async ({ inputs, referenceOutputs }) => {
      ls.logOutputs({ sql: "SELECT * FROM users;" })
    },
  );
});
```

记录的输出将出现在您的报告者摘要和LangSmith中。

您还可以直接从测试函数返回一个值：

```typescript
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";

ls.describe("generate sql demo", () => {
  ls.test(
    "offtopic input",
    {
      inputs: { userQuery: "..." },
      referenceOutputs: { sql: "..." }
    },
    async ({ inputs, referenceOutputs }) => {
      return { sql: "SELECT * FROM users;" }
    },
  );
});
```

但请记住，如果您这样做，如果您的测试由于断言失败或其他错误而无法完成，您的输出将不会出现。

## 跟踪中间调用

LangSmith 将自动跟踪测试用例执行过程中发生的任何可跟踪的中间调用。

## 关注或跳过测试

您可以在 `ls.test()` 和 `ls.describe()` 上链接 Vitest/Jest `.skip` 和 `.only` 方法：

```typescript
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";

ls.describe("generate sql demo", () => {
  ls.test.skip(
    "offtopic input",
    {
      inputs: { userQuery: "..." },
      referenceOutputs: { sql: "..." }
    },
    async ({ inputs, referenceOutputs }) => {
      return { sql: "SELECT * FROM users;" }
    },
  );
  ls.test.only(
    "other",
    {
      inputs: { userQuery: "..." },
      referenceOutputs: { sql: "..." }
    },
    async ({ inputs, referenceOutputs }) => {
      return { sql: "SELECT * FROM users;" }
    },
  );
});
```

## 配置测试套件您可以使用元数据或自定义客户端等值来配置测试套件，方法是将额外参数传递给 `ls.describe()` 以获得完整套件，或将 `config` 字段传递到 `ls.test()` 进行单独测试：

```typescript
ls.describe("test suite name", () => {
  ls.test(
    "test name",
    {
      inputs: { ... },
      referenceOutputs: { ... },
      // Extra config for the test run
      config: { tags: [...], metadata: { ... } }
    },
    {
      name: "test name",
      tags: ["tag1", "tag2"],
      skip: true,
      only: true,
    }
  );
}, {
  testSuiteName: "overridden value",
  metadata: { ... },
  // Custom client
  client: new Client(),
});
```

测试套件还将自动从`process.env.ENVIRONMENT`、`process.env.NODE_ENV`和`process.env.LANGSMITH_ENVIRONMENT`中提取环境变量，并将它们设置为创建的实验的元数据。然后，您可以在 LangSmith 的 UI 中按元数据过滤实验。

有关配置选项的完整列表，请参阅[the API refs](https://docs.smith.langchain.com/reference/js/functions/vitest.describe)。

## 试运行模式

如果您想运行测试而不将结果同步到 LangSmith，您可以设置忽略 LangSmith 跟踪环境变量或在您的环境中设置 `LANGSMITH_TEST_TRACKING=false`。

测试将正常运行，但实验日志不会发送到LangSmith。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/vitest-jest.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>