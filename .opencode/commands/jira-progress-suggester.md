---
description: "Suggest next actions for your recent Jira items"
agent: jira-progress-suggester
subtask: false
---

Use: `/jira-progress-suggester [optional context]`

Optional parameters in the body (as free text):
- projectLimit: number (default 3)
- issueLimit: number (default 10)
- context: free-form text to bias suggestions (e.g., "only blockers")

Examples:
`/jira-progress-suggester` — review defaults
`/jira-progress-suggester context: only blockers` — prioritize blockers
