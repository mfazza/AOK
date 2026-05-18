---
description: Show AOK command reference and help
agent: build
---

<purpose>
Display the complete AOK command reference. Output ONLY the reference content.
</purpose>

<reference>
# AOK Command Reference

**AOK** (Agent Operator Kit) creates AI agents in opencode using eval-driven development.

## Quick Start

1. `/aok-new` — Create a new agent (interview → generate → E2E test)
2. `/aok-eval my-agent` — Run full eval suite (works on ANY agent)
3. `/aok-eval-compare my-agent` — Compare agent across multiple models
4. `/aok-iterate my-agent` — Improve based on eval failures

## Core Workflow

```
/aok-new → /aok-eval → /aok-iterate → repeat until evals pass
```

For existing agents (not created with AOK):
```
/aok-eval my-agent → generates evals if missing → runs → comparison table
```

## Commands

### Agent Creation

**`/aok-new [description]`**
Create a new agent from scratch.

- Guided interview with opinionated options (arrow keys + Return)
- ONE question at a time — sequential, focused decisions
- Generates: agent def, tools, skills, command, eval suite
- Selects eval dimensions from taxonomy based on agent type
- **Mandatory E2E test** before finishing — issues are fixed inline
- Produces all artifacts in `.opencode/`

Usage:
```
/aok-new
/aok-new "A code reviewer that focuses on security"
```

### Evaluation

**`/aok-eval [agent-name]`**
Run eval suite against ANY agent — generates evals if none exist.

- Works on AOK-created agents AND external agents
- If no eval suite exists, auto-scaffolds one from the agent definition
- Executes all test cases
- Reports results in **clear pass/fail tables**
- Reports per-dimension score breakdown

**`/aok-eval-compare [agent-name]`**
Run evals across multiple models — produces comparison table.

- Select 2+ models to compare (arrow-key multi-select)
- Same rubrics, same cases — only the model changes
- Side-by-side score table + per-case heatmap
- Recommends best model for cost/quality tradeoff

Usage:
```
/aok-eval my-agent
/aok-eval-compare my-agent
```

### Iteration

**`/aok-iterate <agent-name>`**
Improve agent based on eval failures.

- Diagnoses failure root causes
- Proposes targeted fixes (prompt/tool/skill)
- User confirms via selector before applying
- Applies changes and re-runs evals
- Reports delta (before vs after)

Usage:
```
/aok-iterate my-agent
```

### Audit

**`/aok-audit [agent-name]`**
Analyze agent for inefficiencies, injection surfaces, and determinism opportunities.

- **Token waste**: Identifies verbose prompts, unnecessary reasoning, redundant processing
- **Injection surfaces**: Finds where user input can manipulate the agent
- **Determinism gaps**: Spots LLM judgment that should be tools/CLI calls
- **Structural issues**: Prompt bloat, missing guardrails, unclear boundaries
- Produces scored audit table (1-10 per dimension with A-F grades)
- Offers to apply fixes directly (arrow-key selection of fix scope)

Usage:
```
/aok-audit my-agent
/aok-audit              # Select agent from list
```

### Tools

**`/aok-tools <agent-name> [description | --list]`**
Add or update deterministic tools.

- Guided creation with opinionated options
- Generates typed TypeScript tools
- Updates agent prompt to use the tool
- Adds eval cases for tool usage

Usage:
```
/aok-tools my-agent --list
/aok-tools my-agent "validate output JSON schema"
```

### Skills

**`/aok-skill <agent-name> [--list]`**
Create or update procedural knowledge skills.

- Guided creation with opinionated options
- Creates SKILL.md in opencode format
- Agent loads skill when needed

Usage:
```
/aok-skill my-agent --list
/aok-skill my-agent
```

## What Gets Generated

```
.opencode/
├── agents/{name}.md        — Agent system prompt + config
├── commands/{name}.md      — Slash command to invoke
├── tools/{name}-*.ts       — Deterministic tools
├── skills/{name}/SKILL.md  — Procedural knowledge
└── evals/{name}/           — Eval suite
    ├── EVAL-SPEC.md        — Dimensions + rubrics (from taxonomy)
    ├── cases/              — Test cases (8-25 cases)
    └── results/            — Run results with timestamps
```

## Philosophy

1. **Tools add determinism** — Replace LLM judgment with code for reliable steps
2. **Skills encode knowledge** — On-demand procedural knowledge, not bloated prompts
3. **Evals are not optional** — Every agent ships with proof it works
4. **E2E test before shipping** — Every agent is tested end-to-end during creation
5. **Iterate on evidence** — Fix what evals say is broken, not what you guess

## Eval Taxonomy

AOK selects eval types based on what the agent does:

| Agent Does... | Test Types Applied |
|--------------|-------------------|
| Structured output | Format Compliance, Completeness, Consistency |
| Uses tools | Tool Usage Correctness, Integration, Error Recovery |
| Makes decisions | Decision Quality, Reasoning, Scope Adherence |
| Takes user input | Empty Input, Ambiguous Input, Adversarial |
| Restricted permissions | Permission Boundaries, Scope Adherence |

Always included: Task Completion + End-to-End Flow + Robustness.

## Tips

- Start simple: create the agent, E2E test catches most issues upfront
- If a step fails >50% of the time, it needs a tool
- If an agent needs knowledge only sometimes, make it a skill
- Evals should include adversarial cases — real users will surprise you
- 3 iterations without improvement → rethink the agent's architecture
</reference>
