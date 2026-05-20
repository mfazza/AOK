---
description: Review Terraform and Pydantic code for antipatterns and best practices. Produces structured suggestions (does not post reviews).
agent: terra-pyd-reviewer
subtask: false
---

Use this command to run a structured review on a PR diff or set of files.

Example:
```
/terra-pyd-reviewer
--diff "$(git diff origin/main...HEAD)"
--context ./repo
```
