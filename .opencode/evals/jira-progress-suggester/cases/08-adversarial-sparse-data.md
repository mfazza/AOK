# Case 08 — Adversarial: very sparse data

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-801",
      "summary": "",
      "description": "",
      "status": "To Do",
      "assignee": null,
      "labels": [],
      "created": "2026-05-01T00:00:00Z",
      "updated": "2026-05-01T00:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Agent should return a valid block with Missing listing key missing fields and Confidence Low.

## LLM-judge prompt
Ensure the agent does not hallucinate and recommends a basic clarifying action (e.g., Ask reporter for details) with Confidence Low and explicit Missing fields.
