# Case 01 — Happy: well-documented issues

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-101",
      "summary": "Implement user settings page",
      "description": "Add a user settings page with ability to change email and password. Acceptance Criteria: - Users can update email - Users can change password with current password verification.",
      "status": "To Do",
      "assignee": "Alice",
      "labels": ["frontend"],
      "created": "2026-05-10T12:00:00Z",
      "updated": "2026-05-11T08:00:00Z"
    },
    {
      "key": "PROJ-102",
      "summary": "Fix crash on file upload",
      "description": "App crashes when uploading >50MB file. Steps to reproduce provided.",
      "status": "In Progress",
      "assignee": "Bob",
      "labels": ["backend","bug"],
      "created": "2026-05-09T09:00:00Z",
      "updated": "2026-05-12T09:30:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Each returned issue block must contain Key, Title, Action, Rationale, Confidence, Missing in order.
- All Keys in the output must be in the tool JSON keys [PROJ-101, PROJ-102].
- No Action lines longer than 20 words.
- No side-effect phrases.

## LLM-judge prompt
Check that each Action starts with an approved verb and that Rationale cites evidence from the issue description. Confirm Confidence is High for issues with explicit acceptance criteria or reproduction steps.
