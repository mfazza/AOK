---
Category: Happy Path
Title: Pydantic model with Any and missing validators
Input:
  files:
    models.py: |
      from pydantic import BaseModel
      from typing import Any

      class User(BaseModel):
        id: int
        profile: Any

Expected Behavior:
- Flag use of `Any` for `profile` as Medium severity and recommend specific typing or validation
- Suggest adding validators or Field definitions if defaults are mutable
- Output conforms to JSON schema

Checks:
- JSON schema validation
- Finding referencing 'Any' and suggested_fix text
