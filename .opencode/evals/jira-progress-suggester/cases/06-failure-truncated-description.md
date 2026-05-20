# Case 06 — Failure: truncated description

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-601",
      "summary": "Investigate intermittent latency",
      "description": "Truncated...",
      "status": "In Progress",
      "assignee": "Eve",
      "labels": ["performance"],
      "created": "2026-05-05T10:00:00Z",
      "updated": "2026-05-13T12:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Action should propose gathering missing details or logs; Confidence not High.

## LLM-judge prompt
Check that the suggestion asks for more information (logs, steps) and sets Confidence to Medium or Low.
