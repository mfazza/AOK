---
name: aok
description: Guide for creating AI agents in opencode — use when the user wants to build, evaluate, or improve agents, or when they invoke any /aok-* command
license: MIT
compatibility: opencode
metadata:
  category: agent-development
  tools: opencode
---

# AOK — Agent Operator Kit

## Overview

AOK is a framework for creating and evaluating AI agents in opencode using eval-driven development. It generates agents, tools, skills, and eval suites from a guided interview process. It can also evaluate ANY existing agent — not just ones it created.

## When to Use

Use this skill when:
- User wants to create a new AI agent
- User invokes `/aok-new`, `/aok-eval`, `/aok-eval-compare`, `/aok-iterate`, `/aok-tools`, `/aok-skill`, or `/aok-help`
- User asks about agent creation best practices
- User wants to add evals to an existing agent
- User wants to compare agent performance across models

## Commands

| Command | Purpose |
|---------|---------|
| `/aok-new` | Create agent from scratch (interview → generate → E2E test) |
| `/aok-eval [name]` | Run eval suite against ANY agent (auto-generates evals if none exist) |
| `/aok-eval-compare [name]` | Multi-model comparison with side-by-side table |
| `/aok-audit [name]` | Audit agent for waste, injection surfaces, determinism gaps |
| `/aok-iterate <name>` | Improve agent based on eval failures |
| `/aok-tools <name>` | Add deterministic tools |
| `/aok-skill <name>` | Create procedural knowledge skill |
| `/aok-help` | Show command reference |

## Core Principles

1. **Evals are mandatory** — Every agent ships with test cases proving it works
2. **Tools add determinism** — Any step that should "always work the same way" becomes a tool
3. **User Interaction Standard** — All agents MUST use the `question([...])` JSON block format for user questions. No plain text lists or conversational preambles.
4. **Skills encode conditional knowledge** — Niche procedural knowledge is loaded on-demand, not bloating prompts or global context
5. **Global Context is for universal rules** — Repo-wide conventions and best practices belong in root `AGENTS.md` files
6. **Tables are the output** — Results are always presented as clear pass/fail tables
7. **Any agent can be evaluated** — Not limited to AOK-created agents
8. **Multi-model testing** — Compare performance across models before committing

## Agent Architecture Decision Tree

```
Is the task simple and well-defined?
├── YES → Single-purpose agent (prompt only)
└── NO → Does it need reliable/consistent steps?
    ├── YES → Tool-augmented agent
    └── NO → Does it need domain knowledge?
        ├── YES → Knowledge-loaded agent (with skills)
        └── NO → Review the task decomposition
```

## Eval-Driven Loop

```
Create Agent → Run Evals → Diagnose Failures → Apply Fix → Re-run Evals → Repeat
```

Stop when:
- All Critical dimensions pass
- All High dimensions >80% pass
- No regressions

## File Layout

```
.opencode/
├── agents/{name}.md          — Agent definition
├── commands/{name}.md        — Slash command
├── tools/{name}-*.ts         — Deterministic tools
├── skills/{name}/SKILL.md    — Procedural knowledge
└── evals/{name}/
    ├── EVAL-SPEC.md          — Dimensions + rubrics
    ├── cases/                — Test cases
    └── results/              — Eval run history + model comparisons
```

## References

Detailed guides available in the AOK installation:
- `references/eval-driven-development.md` — Full eval methodology
- `references/eval-taxonomy.md` — Catalog of 20+ test types
- `references/agent-design-patterns.md` — Architecture patterns
- `references/tool-cookbook.md` — Tool implementation templates
