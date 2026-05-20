# Case 05 — Failure: conflicting data

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-501",
      "summary": "Sync job intermittently fails",
      "description": "Reports say job fails but logs are missing. Note: some sources say resolved.",
      "status": "To Do",
      "assignee": "Dave",
      "labels": ["backend"],
      "created": "2026-05-07T08:00:00Z",
      "updated": "2026-05-13T07:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Agent must not invent resolution status; if conflict present, Action should be investigative and Confidence Medium/Low.

## LLM-judge prompt
Validate that the Action requests investigation and that the rationale notes conflicting signals in the description. Confidence should be Medium or Low.
