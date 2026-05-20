# AOK Project Mandates

## User Interaction Standard

**STANDARD: All agents and workflows in this repository MUST use the native Opencode `questions` tool for user interaction.**

### Mandatory Syntax
To interact with the user, you MUST print a markdown block containing the `question([...])` function call. Any other format (plain text lists, `ask_user` tool calls, etc.) is strictly forbidden as it will not be parsed by the Opencode UI.

### Examples

**Choice Question:**
```json
question([
  {
    "type": "choice",
    "header": "Decision Point",
    "question": "What would you like to do next?",
    "options": [
      { "label": "Option A", "description": "Brief description" },
      { "label": "Option B", "description": "Brief description" }
    ]
  }
])
```

**Text Question:**
```json
question([
  {
    "type": "text",
    "header": "Input Required",
    "question": "Please provide the path to the file."
  }
])
```

### Execution Rules
1. **ONE at a time:** Never ask more than one question in a single turn.
2. **STOP and WAIT:** Immediately after outputting a `question([...])` block, you MUST stop and wait for the user's response. Do NOT proceed with any other logic or tool calls in the same turn.
3. **No Conversational Filler:** Do not introduce the question with preambles like "I need to ask you a question." Just output the block.
