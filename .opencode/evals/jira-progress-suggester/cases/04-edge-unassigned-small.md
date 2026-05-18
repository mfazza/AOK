# Case 04 — Edge: unassigned small task

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-401",
      "summary": "Update help text for onboarding",
      "description": "Change copy on the onboarding screen to match new marketing language.",
      "status": "To Do",
      "assignee": null,
      "labels": ["docs"],
      "created": "2026-05-11T09:00:00Z",
      "updated": "2026-05-11T09:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Action should suggest assignment or quick owner and be <= 20 words

## LLM-judge prompt
Confirm the Action suggests assigning or volunteering the task and that Confidence is Medium.
