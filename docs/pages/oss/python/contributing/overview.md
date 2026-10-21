<!-- langchain-docs: Contributing | https://docs.langchain.com/oss/python/contributing/overview -->

# Contributing

**Welcome! Thank you for your interest in contributing.**

LangChain has helped form the largest developer community in generative AI, and we're always open to new contributors. Whether you're fixing bugs, adding features, improving documentation, or sharing feedback, your involvement helps make LangChain and LangGraph better for everyone 🦜❤️

## Ways to contribute

> **Report bugs**
>
> Found a bug? Please help us fix it by following these steps:
>
> **1. Search**
>
> Check if the issue already exists in our GitHub Issues for the respective repo:
>
> > **[LangChain](https://github.com/langchain-ai/langchain/issues)**
> >
> > Issues
>
> > **[LangGraph](https://github.com/langchain-ai/langgraph/issues)**
> >
> > Issues
>
> > **[Deep Agents](https://github.com/langchain-ai/deepagents/issues)**
> >
> > Issues
>
> **2. Create issue**
>
> If no issue exists, create a new one. When writing, be sure to follow the template provided and to include a [minimal, reproducible, example](https://stackoverflow.com/help/minimal-reproducible-example). Attach any relevant labels to the final issue once created. If a project maintainer is unable to reproduce the issue, it is unlikely to be addressed in a timely manner.
>
> **3. Wait**
>
> A project maintainer will triage the issue and may ask for additional information. Please be patient as we manage a high volume of issues. Do not bump the issue unless you have new information to provide.
>
> If you are adding an issue, please try to keep it focused on a single topic. If two issues are related, or blocking, please [link them](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) rather than combining them. For example:
>
> ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> This issue is blocked by #123 and related to #456.
> ```

> **Suggest features**
>
> Have an idea for a new feature or enhancement?
>
> **1. Search**
>
> Search the issues for the respective repository for existing feature requests:
>
> > **[LangChain](https://github.com/langchain-ai/langchain/issues?q=state%3Aopen%20label%3A%22feature%20request%22)**
> >
> > Issues
>
> > **[LangGraph](https://github.com/langchain-ai/langgraph/issues?q=state%3Aopen%20label%3Aenhancement)**
> >
> > Issues
>
> > **[Deep Agents](https://github.com/langchain-ai/deepagents/issues?q=is%3Aissue%20state%3Aopen%20label%3Afeature)**
> >
> > Issues
>
> **2. Discuss**
>
> If no requests exist, start a new discussion under the [relevant category](https://forum.langchain.com/c/oss-product-help-lc-and-lg/16) so that project maintainers and the community can provide feedback.
>
> **3. Describe**
>
> Be sure to describe the use case and why it would be valuable to others. If possible, provide examples or mockups where applicable. Outline test cases that should pass.

> **Improve documentation**
>
> Documentation improvements are welcome! We strive to keep our docs clear and comprehensive, and your perspective can make a big difference.
>
> > **[How to propose changes to the documentation](/oss/python/contributing/documentation)**
> >
> > Guide

> **Contribute code**
>
> With a large userbase, it can be hard for our small team to keep up with all the feature requests and bug fixes. If you have the skills and time, we would love your help!
>
> > **[How to make your first Pull Request](/oss/python/contributing/code)**
> >
> > Guide
>
> If you start working on an issue, please assign it to yourself or ask a maintainer to do so. This helps avoid duplicate work.
>
> If you are looking for something to work on, check out the issue labeled "help wanted" in our repos:
>
> > **[LangChain](https://github.com/langchain-ai/langchain/labels?q=help+wanted)**
> >
> > Labels
>
> > **[LangGraph](https://github.com/langchain-ai/langgraph/labels?q=help+wanted)**
> >
> > Labels
>
> > **[Deep Agents](https://github.com/langchain-ai/deepagents/labels?q=help+wanted)**
> >
> > Labels

> **Build a new integration**
>
> Anyone can build and publish their own LangChain integration package. New integrations are not accepted as PRs to `langchain-ai` repos — they must be published independently to PyPI or npm.
>
> > **[LangChain](/oss/python/contributing/integrations-langchain)**
> >
> > Guide to building a LangChain integration
>
> > **[Deep Agents sandboxes](/oss/python/contributing/integrations-langchain)**
> >
> > Guide to building a sandbox integration

## Issues and pull request requirements

You can submit pull requests for typos and small fixes directly, without an issue, prior maintainer approval, or assignment.

> [!WARNING]
>
> **Larger changes, such as new tutorials, guides, or conceptual pages require a linked issue and maintainer approval before you open a pull request.** Wait until a maintainer has approved your approach and assigned the issue to you. Larger PRs opened before approval and assignment may be closed automatically and are not reviewed until assignment.

All pull requests should demonstrate meaningful effort and contextual understanding. **If the effort required to create a pull request is less than the effort required for maintainers to review it, that contribution should not be submitted.** Low-effort drive-by contributions—regardless of how they are produced—often miss the mark in terms of contextual relevance, accuracy, and quality. Mass automated contributions represent a denial-of-service attack on our human effort.

> [!WARNING]
>
> **We prioritize issues motivated by actual usage.** Issue boards are a mechanism for allocating maintainer attention. They are not a comprehensive catalog of every statically-discoverable defect. Please avoid submitting issues discovered by (AI) code-scanning without first personally validating them and grounding them in real usage of LangChain's public APIs. If maintainers suspect an issue has not been validated it may be closed without review, and the authoring account may be blocked.

The following requirements must be met for all external pull requests:

* For larger changes, link to an issue where a maintainer has approved your approach and assigned it to you before opening the PR. Typos and small fixes are exempt from this requirement.
* The pull request must fill in the repository's pull request template.
* Pull requests for net new features or behavior-changing bugfixes should include a `## Release note` section that states the user-visible change in release-note-ready language.

Maintainers reserve the right to close PRs without comment if these requirements are not met. **We will close pull requests and issues that appear to be low-effort spam.**

## Language policy

All contributions—issues, pull requests, code reviews, and discussions—must be in English. This keeps communications accessible and searchable across our global contributor base.

If English isn't your first language, don't worry. We value clear communication over perfect grammar, and translation tools are welcome.

## Acceptable uses of LLMs

You may use AI assistants to help draft or revise contributions when you **verify every change**: run and test code, check facts against the codebase and official provider docs, and ensure the result matches repository style. Do not submit bulk, unreviewed generated content. We close pull requests that read as low-effort or spam regardless of how they were produced.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).