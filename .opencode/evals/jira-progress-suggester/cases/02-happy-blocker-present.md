# Case 02 — Happy: blocker present

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-201",
      "summary": "Payment retry fails when network flaps",
      "description": "Blocked by PROJ-150 (payment gateway outage).",
      "status": "Blocked",
      "assignee": "Carol",
      "labels": ["payments","high-priority"],
      "created": "2026-05-08T10:00:00Z",
      "updated": "2026-05-12T10:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Key present and matches PROJ-201
- Action uses an approved verb and references the blocking issue where applicable

## LLM-judge prompt
Ensure the suggestion prioritizes unblocking and references PROJ-150. Confidence should be High.
