# Agent Design Patterns

> Reference for agent architecture decisions. Use when designing new agents or iterating on existing ones.

---

## Agent Architecture Spectrum

```
Simple ←————————————————————————————→ Complex

Single prompt    + Tools    + Skills    + Subagents    + Orchestration
```

**Start simple. Add complexity only when evals show you need it.**

---

## Pattern 1: Single-Purpose Agent

**When:** Agent does ONE thing well.

```
agents/lint-fixer.md
└── System prompt with clear instructions
```

- No tools, no skills
- Works when the task is well-defined and the LLM can handle it directly
- Eval: Does it produce correct output for varied inputs?

---

## Pattern 2: Tool-Augmented Agent

**When:** Some steps need to be deterministic/reliable.

```
agents/schema-validator.md
tools/schema-validator-parse.ts      ← parses input
tools/schema-validator-validate.ts   ← validates against schema
```

- Tools handle the "always do it this way" parts
- Prompt handles the "use judgment" parts
- Eval: Does it call tools correctly? Does it handle tool errors?

---

## Pattern 3: Knowledge-Loaded Agent

**When:** Agent needs domain knowledge that's too long for the prompt.

```
agents/api-designer.md
skills/rest-conventions/SKILL.md       ← loaded when designing REST APIs
skills/graphql-patterns/SKILL.md       ← loaded when designing GraphQL
```

- Base prompt is short — just role and process
- Skills loaded on-demand based on context
- Eval: Does it load the right skill? Does it apply the knowledge correctly?

---

## Pattern 4: Full Stack Agent

**When:** Complex task requiring determinism + knowledge + judgment.

```
agents/code-reviewer.md
tools/code-reviewer-diff.ts          ← parses diff deterministically
tools/code-reviewer-lint.ts          ← runs linter for code checks
skills/security-review/SKILL.md      ← security patterns knowledge
skills/perf-review/SKILL.md          ← performance patterns knowledge
```

- Tools for reliable data acquisition
- Skills for domain expertise
- Prompt for orchestrating tools + skills + judgment
- Eval: End-to-end quality of reviews

---

## Pattern 5: Orchestrator + Specialists (Context Firewalls)

**When:** Different parts of the task need different expertise, or the context window would overflow if one agent did everything.

```
agents/review-orchestrator.md        ← routes to specialists
agents/review-security.md            ← security specialist (subagent)
agents/review-performance.md         ← perf specialist (subagent)
agents/review-architecture.md        ← arch specialist (subagent)
```

- **Context Firewalling:** The orchestrator delegates heavy reading to the specialists. The specialists read the code, but only return a *dense summary* back to the orchestrator. This keeps the orchestrator's context lean and focused.
- Orchestrator decides what to do and delegates.
- Specialists are focused subagents with restricted tools.
- Eval: Routing correctness + individual specialist quality + final summarization.

---

## Tool Design Principles

### DO create tools for:
- **Parsing**: Extract structured data from raw text
- **Validation**: Check if output matches a schema
- **Lookup**: Query databases, files, or APIs
- **Formatting**: Convert data to specific formats
- **Calculation**: Math, dates, statistics
- **State management**: Read/write persistent state

### DON'T create tools for:
- Things that need judgment or creativity
- Tasks where the "right answer" varies by context
- Wrapping another LLM call (that's just indirection)
- One-off operations that won't be reused

### Tool API Design
```typescript
// GOOD: Clear inputs, structured output
tool({
  description: "Parse git diff and return structured changes",
  args: {
    diffText: tool.schema.string().describe("Raw git diff output"),
  },
  async execute(args) {
    return JSON.stringify({
      files: [...],
      additions: N,
      deletions: M,
    })
  },
})

// BAD: Vague, unstructured
tool({
  description: "Help with code",
  args: {
    input: tool.schema.string(),
  },
  async execute(args) {
    return "some text"
  },
})
```

---

## Skill Design Principles

### DO create skills for:
- **Processes**: Multi-step procedures with decision points
- **Conventions**: Coding standards, naming rules, formatting rules
- **Domain knowledge**: Industry-specific rules and patterns
- **Decision trees**: When to choose approach A vs B
- **Templates**: Standard formats for producing specific outputs

### DON'T create skills for:
- Knowledge that's always needed (put in prompt)
- Short facts (< 20 lines — put in prompt)
- Rapidly changing information (will be stale)
- Agent-specific identity (that's the prompt's job)

### Skill Loading Triggers (Progressive Disclosure)
The agent router reads the `description` field in the YAML frontmatter *first*. It only loads the full `SKILL.md` body if that description matches the current task. **This is called Progressive Disclosure.**

To make it work, write descriptions as explicit trigger conditions:

```yaml
# GOOD — specific trigger condition
description: "Guidelines for writing GraphQL resolvers. Use this whenever the user asks to create or modify a GraphQL endpoint to prevent N+1 queries."

# BAD — vague, agent won't know when to use it
description: "Help with code"
```

---

## Prompt Engineering for Agents

### Structure
```markdown
1. Role (who you are — 1-2 sentences)
2. Context (what you know about the environment)
3. Process (step-by-step what to do)
4. Output format (exactly what to produce)
5. Guardrails (what NOT to do)
```

### Effective Techniques
- **Few-shot examples**: Show don't tell — include 1-2 examples of ideal output
- **Step-by-step process**: Numbered steps reduce missed steps
- **Explicit format**: Show the output structure, don't just describe it
- **Negative examples**: "Do NOT do X" is powerful
- **Tool references**: "Use the {tool-name} tool to..." makes tool usage explicit

### Anti-Patterns
- Walls of text without structure → agent gets confused
- Contradictory instructions → agent picks randomly
- Too many responsibilities → agent does none well
- No concrete examples → vague outputs
- "Be creative" + "Follow this exactly" → conflicting guidance

---

## Permission Design

| Agent Type | Recommended Permissions |
|-----------|------------------------|
| Read-only analyst | `edit: deny, bash: deny` |
| Code modifier | `edit: allow, bash: ask` |
| Full automation | `edit: allow, bash: allow` |
| Orchestrator | `task: allow, edit: deny` |
| Security-sensitive | `bash: { "*": deny, "grep *": allow }` |

---

## Choosing Models

| Task Type | Model Class | Why |
|-----------|-------------|-----|
| Deterministic/simple | Fast/cheap (Haiku, GPT-4.1-mini) | Speed matters more than reasoning |
| Complex reasoning | Full (Sonnet, GPT-5.2) | Needs strong judgment |
| Creative/open-ended | Full with higher temp | Variety helps |
| Orchestration | Full | Routing decisions need good judgment |
