<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a SQL agent | https://docs.langchain.com/oss/python/langchain/sql-agent -->

## 概述

在本教程中，您将学习如何使用 LangChain [agents](/oss/python/langchain/agents) 构建一个可以回答有关 SQL 数据库问题的代理。

在较高层面上，代理人将：

1. 从数据库中获取可用的表和模式
2. 确定哪些表格与问题相关
3. 获取相关表的模式
4. 根据模式中的问题和信息生成查询
5. 使用 LLM 仔细检查查询是否存在常见错误
6.执行查询并返回结果
7. 纠正数据库引擎出现的错误，直到查询成功
8. 根据结果制定响应

<Warning>
  构建 SQL 数据库的问答系统需要执行模型生成的 SQL 查询。这样做存在固有的风险。确保数据库连接权限的范围始终尽可能缩小，以满足代理的需求。这将减轻（但不能消除）构建模型驱动系统的风险。
</Warning>

### 概念

以下教程涵盖以下概念：

* [Tools](/oss/python/langchain/tools) 用于从 SQL 数据库读取
* LangChain[agents](/oss/python/langchain/agents)
* [Human-in-the-loop](/oss/python/langchain/human-in-the-loop)工艺

## 设置

<Steps>
  <Step title="Install dependencies">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain langgraph
      ```
    </CodeGroup>
  </Step><Step title="Set up LangSmith">
    设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-sql-agent) 来检查您的连锁店或代理内部发生的情况。然后设置以下环境变量：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_TRACING="true"
    export LANGSMITH_API_KEY="..."
    ```
  </Step>
</Steps>

## 构建你的 SQL 代理

<Steps>
  <Step title="Select an LLM">
    选择支持[tool-calling](/oss/python/integrations/providers/overview)的型号：

    <Tabs>
      <Tab title="OpenAI">
        👉 阅读[OpenAI chat model integration docs](/oss/python/integrations/chat/openai/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[openai]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[openai]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["OPENAI_API_KEY"] = "sk-..."

          model = init_chat_model("gpt-5.5")
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_openai import ChatOpenAI

          os.environ["OPENAI_API_KEY"] = "sk-..."

          model = ChatOpenAI(model="gpt-5.5")
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Anthropic">
        👉 阅读[Anthropic chat model integration docs](/oss/python/integrations/chat/anthropic/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[anthropic]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[anthropic]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["ANTHROPIC_API_KEY"] = "sk-..."

          model = init_chat_model("claude-sonnet-4-6")
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_anthropic import ChatAnthropic

          os.environ["ANTHROPIC_API_KEY"] = "sk-..."

          model = ChatAnthropic(model="claude-sonnet-4-6")
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Azure">
        👉 阅读[Azure chat model integration docs](/oss/python/integrations/chat/azure_chat_openai/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[openai]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[openai]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["AZURE_OPENAI_API_KEY"] = "..."
          os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
          os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

          model = init_chat_model(
              "azure_openai:gpt-5.5",
              azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
          )
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_openai import AzureChatOpenAI

          os.environ["AZURE_OPENAI_API_KEY"] = "..."
          os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
          os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

          model = AzureChatOpenAI(
              model="gpt-5.5",
              azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"]
          )
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Google Gemini">
        👉 阅读[Google GenAI chat model integration docs](/oss/python/integrations/chat/google_generative_ai/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[google-genai]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[google-genai]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["GOOGLE_API_KEY"] = "..."

          model = init_chat_model("google_genai:gemini-2.5-flash-lite")
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_google_genai import ChatGoogleGenerativeAI

          os.environ["GOOGLE_API_KEY"] = "..."

          model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")
          ```
        </CodeGroup>
      </Tab>

      <Tab title="AWS Bedrock">
        👉 阅读[AWS Bedrock chat model integration docs](/oss/python/integrations/chat/bedrock/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[aws]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[aws]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from langchain.chat_models import init_chat_model

          # Follow the steps here to configure your credentials:
          # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

          model = init_chat_model(
              "us.anthropic.claude-sonnet-4-6",
              model_provider="bedrock_converse",
          )
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from langchain_aws import ChatBedrock

          model = ChatBedrock(model="us.anthropic.claude-sonnet-4-6")
          ```
        </CodeGroup>
      </Tab>

      <Tab title="HuggingFace">
        👉 阅读[HuggingFace chat model integration docs](/oss/python/integrations/chat/huggingface/)<CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain[huggingface]"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain[huggingface]"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

          model = init_chat_model(
              "microsoft/Phi-3-mini-4k-instruct",
              model_provider="huggingface",
              temperature=0.7,
              max_tokens=1024,
          )
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

          os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

          llm = HuggingFaceEndpoint(
              repo_id="microsoft/Phi-3-mini-4k-instruct",
              temperature=0.7,
              max_length=1024,
          )
          model = ChatHuggingFace(llm=llm)
          ```
        </CodeGroup>
      </Tab>

      <Tab title="OpenRouter">
        👉 阅读[OpenRouter chat model integration docs](/oss/python/integrations/chat/openrouter/)

        <CodeGroup>
          ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pip install -U "langchain-openrouter"
          ```

          ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          uv add "langchain-openrouter"
          ```
        </CodeGroup>

        <CodeGroup>
          ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain.chat_models import init_chat_model

          os.environ["OPENROUTER_API_KEY"] = "sk-..."

          model = init_chat_model(
              "auto",
              model_provider="openrouter",
          )
          ```

          ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os
          from langchain_openrouter import ChatOpenRouter

          os.environ["OPENROUTER_API_KEY"] = "sk-..."

          model = ChatOpenRouter(model="auto")
          ```
        </CodeGroup>
      </Tab>
    </Tabs>

    以下示例中显示的输出使用 OpenAI。
  </Step>

  <Step title="Configure the database">
    您将为本教程创建一个 [SQLite database](https://www.sqlitetutorial.net/sqlite-sample-database/)。 SQLite 是一个轻量级数据库，易于设置和使用。我们将加载 `chinook` 数据库，这是代表数字媒体商店的示例数据库。

    为了方便起见，我们将数据库 (`Chinook.db`) 托管在公共 GCS 存储桶上。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import pathlib
    import requests

    url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db"
    local_path = pathlib.Path("Chinook.db")

    if local_path.exists():
        print(f"{local_path} already exists, skipping download.")
    else:
        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            local_path.write_bytes(response.content)
            print(f"File downloaded and saved as {local_path}")
        else:
            print(f"Failed to download the file. Status code: {response.status_code}")
    ```

    我们将使用Python内置的`sqlite3`模块与数据库交互：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import sqlite3

    con = sqlite3.connect("Chinook.db")
    cursor = con.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]

    print("Dialect: sqlite")
    print(f"Available tables: {tables}")

    cursor.execute("SELECT * FROM Artist LIMIT 5;")
    print(f"Sample output: {cursor.fetchall()}")
    con.close()
    ```

    ```
    Dialect: sqlite
    Available tables: ['Album', 'Artist', 'Customer', 'Employee', 'Genre', 'Invoice', 'InvoiceLine', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
    Sample output: [(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains')]
    ```
  </Step>

  <Step title="Add tools for database interactions">
    <Warning>
      以下数据库工具是最小包装器，仅用于演示目的。它们的目的不是为了安全或在生产中使用。在执行模型生成的 SQL 之前，使用范围狭窄的数据库权限并添加特定于应用程序的验证。
    </Warning>我们可以使用 `langchain.tools` 中的 `@tool` 装饰器将数据库 [tools](/oss/python/langchain/tools) 实现为瘦包装器：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import sqlite3
    from langchain.tools import tool

    # Below are minimal tools for demonstration purposes.
    # They are not intended to be secure or for production use.

    @tool
    def sql_db_list_tables() -> str:
        """Input is an empty string, output is a comma-separated list of tables in the database."""
        con = sqlite3.connect("Chinook.db")
        try:
            cursor = con.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]
            return ", ".join(tables)
        finally:
            con.close()

    @tool
    def sql_db_schema(table_names: str) -> str:
        """Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables.
        Be sure that the tables actually exist by calling sql_db_list_tables first!
        Example Input: table1, table2, table3"""
        con = sqlite3.connect("Chinook.db")
        try:
            cursor = con.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            valid_tables = {row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")}
            results = []
            for table in table_names.split(","):
                table = table.strip()
                if table not in valid_tables:
                    results.append(f"Error: table_names {{{table!r}}} not found in database")
                    continue
                cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?;", (table,))
                schema_row = cursor.fetchone()
                if schema_row:
                    results.append(schema_row[0])
                    try:
                        quoted_table = '"' + table.replace('"', '""') + '"'
                        cursor.execute(f"SELECT * FROM {quoted_table} LIMIT 3;")
                        rows = cursor.fetchall()
                        if rows:
                            col_names = [description[0] for description in cursor.description]
                            results.append(
                                f"/*\n3 rows from {table} table:\n"
                                + "\t".join(col_names)
                                + "\n"
                                + "\n".join("\t".join(str(x) for x in row) for row in rows)
                                + "\n*/"
                            )
                    except Exception as e:
                        results.append(f"Error fetching sample rows: {e}")
            return "\n\n".join(results)
        finally:
            con.close()

    @tool
    def sql_db_query(query: str) -> str:
        """Input to this tool is a detailed and correct SQL query, output is a result from the database.
        If the query is not correct, an error message will be returned.
        If an error is returned, rewrite the query, check the query, and try again.
        If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields."""
        con = sqlite3.connect("Chinook.db")
        try:
            cursor = con.cursor()
            cursor.execute(query)
            res = cursor.fetchall()
            return str(res)
        except Exception as e:
            return f"Error: {e}"
        finally:
            con.close()

    @tool
    def sql_db_query_checker(query: str) -> str:
        """Use this tool to double check if your query is correct before executing it.
        Always use this tool before executing a query with sql_db_query!"""
        trigger_prompt = """{query}
    Double check the sqlite query above for common mistakes, including:
    - Using NOT IN with NULL values
    - Using UNION when UNION ALL should have been used
    - Using BETWEEN for exclusive ranges
    - Data type mismatch in predicates
    - Properly quoting identifiers
    - Using the correct number of arguments for functions
    - Casting to the correct data type
    - Using the proper columns for joins

    If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.

    Output the final SQL query only.

    SQL Query: """.format(query=query)

        response = model.invoke(trigger_prompt)
        return response.text.strip()

    tools = [sql_db_list_tables, sql_db_schema, sql_db_query, sql_db_query_checker]

    # Use a distinct loop variable so it does not shadow the `tool` decorator.
    for t in tools:
        print(f"{t.name}: {t.description}\n")
    ```

    ```
    sql_db_query: Input to this tool is a detailed and correct SQL query, output is a result from the database.
        If the query is not correct, an error message will be returned.
        If an error is returned, rewrite the query, check the query, and try again.
        If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields.

    sql_db_schema: Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables.
        Be sure that the tables actually exist by calling sql_db_list_tables first!
        Example Input: table1, table2, table3

    sql_db_list_tables: Input is an empty string, output is a comma-separated list of tables in the database.

    sql_db_query_checker: Use this tool to double check if your query is correct before executing it.
        Always use this tool before executing a query with sql_db_query!
    ```
  </Step>

  <Step title="Create the agent">
    使用 [⟦T52⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 以最少的代码构建 [ReAct agent](https://arxiv.org/pdf/2210.03629)。代理将解释请求并生成 SQL 命令，工具将执行该命令。如果命令有错误，错误消息将返回给模型。然后，该模型可以检查原始请求和新的错误消息并生成新命令。这可以继续，直到 LLM 成功生成命令或达到结束计数。这种为模型提供反馈（本例中为错误消息）的模式非常强大。

    使用描述性系统提示初始化代理以自定义其行为：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    system_prompt = """
    You are an agent designed to interact with a SQL database.
    Given an input question, create a syntactically correct {dialect} query to run,
    then look at the results of the query and return the answer. Unless the user
    specifies a specific number of examples they wish to obtain, always limit your
    query to at most {top_k} results.

    You can order the results by a relevant column to return the most interesting
    examples in the database. Never query for all the columns from a specific table,
    only ask for the relevant columns given the question.

    You MUST double check your query before executing it. If you get an error while
    executing a query, rewrite the query and try again.

    DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the
    database.

    To start you should ALWAYS look at the tables in the database to see what you
    can query. Do NOT skip this step.

    Then you should query the schema of the most relevant tables.
    """.format(
        dialect="sqlite",
        top_k=5,
    )
    ```

    现在，使用模型、工具和提示创建代理：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent


    agent = create_agent(
        model,
        tools,
        system_prompt=system_prompt,
    )
    ```
  </Step>

  <Step title="Run the agent">
    对示例查询运行代理并观察其行为：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    question = "Which genre on average has the longest tracks?"

    stream = agent.stream_events(
        {"messages": [{"role": "user", "content": question}]},
        version="v3",
    )
    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "messages":
            for token in item.text:
                print(token, end="", flush=True)
        elif kind == "tool_calls":
            print(f"\nTool call: {item.tool_name}({item.input})")
            for delta in item.output_deltas:
                print(delta, end="", flush=True)
            print(f"\nTool result: {item.output}")

    final_state = stream.output
    ```

    ```
    ================================ Human Message =================================

    Which genre on average has the longest tracks?
    ================================== Ai Message ==================================
    Tool Calls:
      sql_db_list_tables (call_BQsWg8P65apHc8BTJ1NPDvnM)
     Call ID: call_BQsWg8P65apHc8BTJ1NPDvnM
      Args:
    ================================= Tool Message =================================
    Name: sql_db_list_tables

    Album, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track
    ================================== Ai Message ==================================
    Tool Calls:
      sql_db_schema (call_i89tjKECFSeERbuACYm4w0cU)
     Call ID: call_i89tjKECFSeERbuACYm4w0cU
      Args:
        table_names: Track, Genre
    ================================= Tool Message =================================
    Name: sql_db_schema


    CREATE TABLE "Genre" (
    	"GenreId" INTEGER NOT NULL,
    	"Name" NVARCHAR(120),
    	PRIMARY KEY ("GenreId")
    )

    /*
    3 rows from Genre table:
    GenreId	Name
    1	Rock
    2	Jazz
    3	Metal
    */


    CREATE TABLE "Track" (
    	"TrackId" INTEGER NOT NULL,
    	"Name" NVARCHAR(200) NOT NULL,
    	"AlbumId" INTEGER,
    	"MediaTypeId" INTEGER NOT NULL,
    	"GenreId" INTEGER,
    	"Composer" NVARCHAR(220),
    	"Milliseconds" INTEGER NOT NULL,
    	"Bytes" INTEGER,
    	"UnitPrice" NUMERIC(10, 2) NOT NULL,
    	PRIMARY KEY ("TrackId"),
    	FOREIGN KEY("MediaTypeId") REFERENCES "MediaType" ("MediaTypeId"),
    	FOREIGN KEY("GenreId") REFERENCES "Genre" ("GenreId"),
    	FOREIGN KEY("AlbumId") REFERENCES "Album" ("AlbumId")
    )

    /*
    3 rows from Track table:
    TrackId	Name	AlbumId	MediaTypeId	GenreId	Composer	Milliseconds	Bytes	UnitPrice
    1	For Those About To Rock (We Salute You)	1	1	1	Angus Young, Malcolm Young, Brian Johnson	343719	11170334	0.99
    2	Balls to the Wall	2	2	1	U. Dirkschneider, W. Hoffmann, H. Frank, P. Baltes, S. Kaufmann, G. Hoffmann	342562	5510424	0.99
    3	Fast As a Shark	3	2	1	F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman	230619	3990994	0.99
    */
    ================================== Ai Message ==================================
    Tool Calls:
      sql_db_query_checker (call_G64yYm6R6UauiVPCXJZMA49b)
     Call ID: call_G64yYm6R6UauiVPCXJZMA49b
      Args:
        query: SELECT Genre.Name, AVG(Track.Milliseconds) AS AverageLength FROM Track INNER JOIN Genre ON Track.GenreId = Genre.GenreId GROUP BY Genre.Name ORDER BY AverageLength DESC LIMIT 5;
    ================================= Tool Message =================================
    Name: sql_db_query_checker

    SELECT Genre.Name, AVG(Track.Milliseconds) AS AverageLength FROM Track INNER JOIN Genre ON Track.GenreId = Genre.GenreId GROUP BY Genre.Name ORDER BY AverageLength DESC LIMIT 5;
    ================================== Ai Message ==================================
    Tool Calls:
      sql_db_query (call_AnO3SrhD0ODJBxh6dHMwvHwZ)
     Call ID: call_AnO3SrhD0ODJBxh6dHMwvHwZ
      Args:
        query: SELECT Genre.Name, AVG(Track.Milliseconds) AS AverageLength FROM Track INNER JOIN Genre ON Track.GenreId = Genre.GenreId GROUP BY Genre.Name ORDER BY AverageLength DESC LIMIT 5;
    ================================= Tool Message =================================
    Name: sql_db_query

    [('Sci Fi & Fantasy', 2911783.0384615385), ('Science Fiction', 2625549.076923077), ('Drama', 2575283.78125), ('TV Shows', 2145041.0215053763), ('Comedy', 1585263.705882353)]
    ================================== Ai Message ==================================

    On average, the genre with the longest tracks is "Sci Fi & Fantasy" with an average track length of approximately 2,911,783 milliseconds. This is followed by "Science Fiction," "Drama," "TV Shows," and "Comedy."
    ```

    代理正确地编写了一个查询，检查了该查询，然后运行它以告知其最终响应。

    <Note>
      您可以检查上述运行的各个方面，包括采取的步骤、调用的工具、LLM 看到的提示以及[LangSmith trace](https://smith.langchain.com/public/cd2ce887-388a-4bb1-a29d-48208ce50d15/r) 中的更多信息。
    </Note>
  </Step><Step title="(Optional) Use Studio">
    [Studio](/langsmith/studio) 提供“客户端”循环以及内存，因此您可以将其作为聊天界面运行并查询数据库。您可以提出诸如“告诉我数据库的方案”或“显示前 5 位客户的发票”之类的问题。您将看到生成的 SQL 命令和结果输出。下面详细介绍了如何开始。

    <Accordion title="Run your agent in Studio">
      除了前面提到的包之外，您还需要：

      ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U langgraph-cli[inmem]>=0.4.0
      ```

      在您将运行的目录中，您将需要一个包含以下内容的 `langgraph.json` 文件：

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "dependencies": ["."],
        "graphs": {
            "agent": "./sql_agent.py:agent",
            "graph": "./sql_agent_langgraph.py:graph"
        },
        "env": ".env"
      }
      ```

      创建一个文件 `sql_agent.py` 并插入以下内容：

      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # sql_agent.py for studio
      import pathlib
      import sqlite3

      import requests
      from langchain.agents import create_agent
      from langchain.chat_models import init_chat_model
      from langchain.tools import tool

      # Initialize an LLM
      model = init_chat_model("gpt-5.5")

      # Get the database, store it locally
      url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db"
      local_path = pathlib.Path("Chinook.db")

      if local_path.exists():
          print(f"{local_path} already exists, skipping download.")
      else:
          response = requests.get(url, timeout=60)
          if response.status_code == 200:
              local_path.write_bytes(response.content)
              print(f"File downloaded and saved as {local_path}")
          else:
              print(f"Failed to download the file. Status code: {response.status_code}")

      # Below are minimal tools for demonstration purposes.

      @tool
      def sql_db_list_tables() -> str:
          """Input is an empty string, output is a comma-separated list of tables in the database."""
          con = sqlite3.connect("Chinook.db")
          try:
              cursor = con.cursor()
              cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
              tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]
              return ", ".join(tables)
          finally:
              con.close()

      @tool
      def sql_db_schema(table_names: str) -> str:
          """Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables.
          Be sure that the tables actually exist by calling sql_db_list_tables first!
          Example Input: table1, table2, table3"""
          con = sqlite3.connect("Chinook.db")
          try:
              cursor = con.cursor()
              cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
              valid_tables = {row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")}
              results = []
              for table in table_names.split(","):
                  table = table.strip()
                  if table not in valid_tables:
                      results.append(f"Error: table_names {{{table!r}}} not found in database")
                      continue
                  cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?;", (table,))
                  schema_row = cursor.fetchone()
                  if schema_row:
                      results.append(schema_row[0])
                      try:
                          quoted_table = '"' + table.replace('"', '""') + '"'
                          cursor.execute(f"SELECT * FROM {quoted_table} LIMIT 3;")
                          rows = cursor.fetchall()
                          if rows:
                              col_names = [description[0] for description in cursor.description]
                              results.append(
                                  f"/*\n3 rows from {table} table:\n"
                                  + "\t".join(col_names)
                                  + "\n"
                                  + "\n".join("\t".join(str(x) for x in row) for row in rows)
                                  + "\n*/"
                              )
                      except Exception as e:
                          results.append(f"Error fetching sample rows: {e}")
              return "\n\n".join(results)
          finally:
              con.close()

      @tool
      def sql_db_query(query: str) -> str:
          """Input to this tool is a detailed and correct SQL query, output is a result from the database.
          If the query is not correct, an error message will be returned.
          If an error is returned, rewrite the query, check the query, and try again.
          If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields."""
          con = sqlite3.connect("Chinook.db")
          try:
              cursor = con.cursor()
              cursor.execute(query)
              res = cursor.fetchall()
              return str(res)
          except Exception as e:
              return f"Error: {e}"
          finally:
              con.close()

      @tool
      def sql_db_query_checker(query: str) -> str:
          """Use this tool to double check if your query is correct before executing it.
          Always use this tool before executing a query with sql_db_query!"""
          trigger_prompt = """{query}
      Double check the sqlite query above for common mistakes, including:
      - Using NOT IN with NULL values
      - Using UNION when UNION ALL should have been used
      - Using BETWEEN for exclusive ranges
      - Data type mismatch in predicates
      - Properly quoting identifiers
      - Using the correct number of arguments for functions
      - Casting to the correct data type
      - Using the proper columns for joins

      If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.

      Output the final SQL query only.

      SQL Query: """.format(query=query)

          response = model.invoke(trigger_prompt)
          return response.text.strip()

      tools = [sql_db_list_tables, sql_db_schema, sql_db_query, sql_db_query_checker]

      # Use a distinct loop variable so it does not shadow the `tool` decorator.
      for t in tools:
          print(f"{t.name}: {t.description}\n")

      # Use create_agent
      system_prompt = """
      You are an agent designed to interact with a SQL database.
      Given an input question, create a syntactically correct {dialect} query to run,
      then look at the results of the query and return the answer. Unless the user
      specifies a specific number of examples they wish to obtain, always limit your
      query to at most {top_k} results.

      You can order the results by a relevant column to return the most interesting
      examples in the database. Never query for all the columns from a specific table,
      only ask for the relevant columns given the question.

      You MUST double check your query before executing it. If you get an error while
      executing a query, rewrite the query and try again.

      DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the
      database.

      To start you should ALWAYS look at the tables in the database to see what you
      can query. Do NOT skip this step.

      Then you should query the schema of the most relevant tables.
      """.format(
          dialect="sqlite",
          top_k=5,
      )

      agent = create_agent(
          model,
          tools,
          system_prompt=system_prompt,
      )
      ```
    </Accordion>
  </Step>

  <Step title="Implement human-in-the-loop review">
    在执行代理的 SQL 查询之前检查是否存在任何意外操作或效率低下，这可能是谨慎的做法。

    LangChain代理支持内置[human-in-the-loop middleware](/oss/python/langchain/human-in-the-loop)，以增加对代理工具调用的监督。让我们将代理配置为在调用 `sql_db_query` 工具时暂停以供人工审核：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import HumanInTheLoopMiddleware # [!code highlight]
    from langgraph.checkpoint.memory import InMemorySaver # [!code highlight]


    agent = create_agent(
        model,
        tools,
        system_prompt=system_prompt,
        middleware=[ # [!code highlight]
            HumanInTheLoopMiddleware( # [!code highlight]
                interrupt_on={"sql_db_query": True}, # [!code highlight]
                description_prefix="Tool execution pending approval", # [!code highlight]
            ), # [!code highlight]
        ], # [!code highlight]
        checkpointer=InMemorySaver(), # [!code highlight]
    )
    ```

    <Note>
      我们在代理中添加了一个[checkpointer](/oss/python/langchain/short-term-memory)，以允许暂停和恢复执行。有关此内容以及可用中间件配置的详细信息，请参阅 [human-in-the-loop guide](/oss/python/langchain/human-in-the-loop)。
    </Note>在运行代理时，它现在将在执行 `sql_db_query` 工具之前暂停以进行审查：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    question = "Which genre on average has the longest tracks?"
    config = {"configurable": {"thread_id": "1"}} # [!code highlight]

    stream = agent.stream_events( # [!code highlight]
        {"messages": [{"role": "user", "content": question}]},
        config, # [!code highlight]
        version="v3",
    )
    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "messages":
            for token in item.text:
                print(token, end="", flush=True)
        elif kind == "tool_calls":
            print(f"\nTool call: {item.tool_name}({item.input})")
    if stream.interrupted: # [!code highlight]
        print("INTERRUPTED:") # [!code highlight]
        interrupt = stream.interrupts[0] # [!code highlight]
        for request in interrupt.value["action_requests"]: # [!code highlight]
            print(request["description"]) # [!code highlight]
    ```

    ```
    ...

    INTERRUPTED:
    Tool execution pending approval

    Tool: sql_db_query
    Args: {'query': 'SELECT g.Name AS Genre, AVG(t.Milliseconds) AS AvgTrackLength FROM Track t JOIN Genre g ON t.GenreId = g.GenreId GROUP BY g.Name ORDER BY AvgTrackLength DESC LIMIT 1;'}
    ```

    我们可以使用 [Command](/oss/python/langgraph/use-graph-api#combine-control-flow-and-state-updates-with-command) 恢复执行，在本例中接受查询：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph.types import Command # [!code highlight]

    stream = agent.stream_events( # [!code highlight]
        Command(resume={"decisions": [{"type": "approve"}]}), # [!code highlight]
        config,
        version="v3",
    )
    for kind, item in stream.interleave("messages", "tool_calls"):
        if kind == "messages":
            for token in item.text:
                print(token, end="", flush=True)
        elif kind == "tool_calls":
            print(f"\nTool call: {item.tool_name}({item.input})")
    if stream.interrupted:
        print("INTERRUPTED:")
        interrupt = stream.interrupts[0]
        for request in interrupt.value["action_requests"]:
            print(request["description"])
    ```

    ```
    ================================== Ai Message ==================================
    Tool Calls:
      sql_db_query (call_7oz86Epg7lYRqi9rQHbZPS1U)
     Call ID: call_7oz86Epg7lYRqi9rQHbZPS1U
      Args:
        query: SELECT Genre.Name, AVG(Track.Milliseconds) AS AvgDuration FROM Track JOIN Genre ON Track.GenreId = Genre.GenreId GROUP BY Genre.Name ORDER BY AvgDuration DESC LIMIT 5;
    ================================= Tool Message =================================
    Name: sql_db_query

    [('Sci Fi & Fantasy', 2911783.0384615385), ('Science Fiction', 2625549.076923077), ('Drama', 2575283.78125), ('TV Shows', 2145041.0215053763), ('Comedy', 1585263.705882353)]
    ================================== Ai Message ==================================

    The genre with the longest average track length is "Sci Fi & Fantasy" with an average duration of about 2,911,783 milliseconds, followed by "Science Fiction" and "Drama."
    ```

    详情请参阅[human-in-the-loop guide](/oss/python/langchain/human-in-the-loop)。
  </Step>
</Steps>

## 后续步骤

如需更深入的自定义，请查看 [this tutorial](/oss/python/langgraph/sql-agent) 以直接使用 LangGraph 原语实现 SQL 代理。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/sql-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>