# Tool Cookbook

> Reference for common tool patterns in opencode. Copy and adapt these templates.

---

## Setup

Tools require `@opencode-ai/plugin`. In your `.opencode/` directory:

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "latest"
  }
}
```

Then `npm install` or `bun install`.

---

## Pattern: Validate JSON Schema

Validates agent output against a known schema.

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Validate JSON output against the expected schema",
  args: {
    json: tool.schema.string().describe("JSON string to validate"),
    schemaName: tool.schema.string().describe("Schema to validate against: 'review' | 'plan' | 'report'"),
  },
  async execute(args) {
    let parsed: any
    try {
      parsed = JSON.parse(args.json)
    } catch (e) {
      return JSON.stringify({ valid: false, error: "Invalid JSON: " + (e as Error).message })
    }

    const schemas: Record<string, (obj: any) => string[]> = {
      review: (obj) => {
        const errors: string[] = []
        if (!obj.summary) errors.push("Missing 'summary' field")
        if (!Array.isArray(obj.findings)) errors.push("'findings' must be an array")
        if (obj.findings?.some((f: any) => !f.severity)) errors.push("Each finding needs 'severity'")
        return errors
      },
      // Add more schemas as needed
    }

    const validator = schemas[args.schemaName]
    if (!validator) {
      return JSON.stringify({ valid: false, error: `Unknown schema: ${args.schemaName}` })
    }

    const errors = validator(parsed)
    return JSON.stringify({ valid: errors.length === 0, errors })
  },
})
```

---

## Pattern: Parse Structured File

Reads and parses a specific file format into structured data.

```typescript
import { tool } from "@opencode-ai/plugin"
import fs from "fs/promises"
import path from "path"

export default tool({
  description: "Parse a YAML frontmatter file and return structured metadata + content",
  args: {
    filePath: tool.schema.string().describe("Path to the markdown file with frontmatter"),
  },
  async execute(args, context) {
    const fullPath = path.resolve(context.directory, args.filePath)

    try {
      const content = await fs.readFile(fullPath, "utf-8")
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

      if (!frontmatterMatch) {
        return JSON.stringify({ error: "No YAML frontmatter found" })
      }

      const [, yaml, body] = frontmatterMatch
      const metadata: Record<string, string> = {}

      for (const line of yaml.split("\n")) {
        const [key, ...valueParts] = line.split(":")
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(":").trim()
        }
      }

      return JSON.stringify({ metadata, body: body.trim(), charCount: body.length })
    } catch (e) {
      return JSON.stringify({ error: `File read failed: ${(e as Error).message}` })
    }
  },
})
```

---

## Pattern: Run Command with Structured Output

Wraps a shell command and returns structured results instead of raw text.

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Run tests and return structured pass/fail results",
  args: {
    testPattern: tool.schema.string().optional().describe("Glob pattern for test files to run"),
  },
  async execute(args, context) {
    const pattern = args.testPattern || "**/*.test.*"

    try {
      const result = await Bun.$`npm test -- --reporter=json ${pattern}`
        .cwd(context.directory)
        .text()

      const parsed = JSON.parse(result)
      return JSON.stringify({
        passed: parsed.numPassedTests,
        failed: parsed.numFailedTests,
        total: parsed.numTotalTests,
        failures: parsed.testResults
          ?.filter((t: any) => t.status === "failed")
          .map((t: any) => ({ name: t.name, message: t.message })),
      })
    } catch (e) {
      return JSON.stringify({ error: `Tests failed to run: ${(e as Error).message}` })
    }
  },
})
```

---

## Pattern: File Discovery

Finds files matching criteria and returns structured results.

```typescript
import { tool } from "@opencode-ai/plugin"
import { readdir, stat } from "fs/promises"
import path from "path"

export default tool({
  description: "Find project files matching criteria",
  args: {
    directory: tool.schema.string().describe("Directory to search in"),
    extension: tool.schema.string().optional().describe("File extension filter (e.g., '.ts')"),
    pattern: tool.schema.string().optional().describe("Filename pattern to match"),
  },
  async execute(args, context) {
    const dir = path.resolve(context.directory, args.directory)
    const results: string[] = []

    async function walk(d: string) {
      const entries = await readdir(d, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name)
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          await walk(fullPath)
        } else if (entry.isFile()) {
          if (args.extension && !entry.name.endsWith(args.extension)) continue
          if (args.pattern && !entry.name.includes(args.pattern)) continue
          results.push(path.relative(context.directory, fullPath))
        }
      }
    }

    try {
      await walk(dir)
      return JSON.stringify({ files: results, count: results.length })
    } catch (e) {
      return JSON.stringify({ error: `Search failed: ${(e as Error).message}` })
    }
  },
})
```

---

## Pattern: State Management

Read/write agent-specific state that persists across invocations.

```typescript
import { tool } from "@opencode-ai/plugin"
import fs from "fs/promises"
import path from "path"

export const read_state = tool({
  description: "Read agent state from persistent storage",
  args: {
    key: tool.schema.string().describe("State key to read"),
  },
  async execute(args, context) {
    const stateFile = path.join(context.directory, ".opencode", "state", `${args.key}.json`)
    try {
      const content = await fs.readFile(stateFile, "utf-8")
      return content
    } catch {
      return JSON.stringify({ exists: false })
    }
  },
})

export const write_state = tool({
  description: "Write agent state to persistent storage",
  args: {
    key: tool.schema.string().describe("State key to write"),
    value: tool.schema.string().describe("JSON value to store"),
  },
  async execute(args, context) {
    const stateDir = path.join(context.directory, ".opencode", "state")
    await fs.mkdir(stateDir, { recursive: true })
    const stateFile = path.join(stateDir, `${args.key}.json`)
    await fs.writeFile(stateFile, args.value)
    return JSON.stringify({ written: true, key: args.key })
  },
})
```

---

## Pattern: API Integration

Call external APIs with structured error handling.

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Query the GitHub API for repository information",
  args: {
    owner: tool.schema.string().describe("Repository owner"),
    repo: tool.schema.string().describe("Repository name"),
    endpoint: tool.schema.string().describe("API endpoint path (e.g., 'issues', 'pulls')"),
  },
  async execute(args) {
    const url = `https://api.github.com/repos/${args.owner}/${args.repo}/${args.endpoint}`
    const token = process.env.GITHUB_TOKEN

    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        return JSON.stringify({
          error: `API returned ${response.status}: ${response.statusText}`,
        })
      }

      const data = await response.json()
      return JSON.stringify(data)
    } catch (e) {
      return JSON.stringify({ error: `Request failed: ${(e as Error).message}` })
    }
  },
})
```

---

## Tool Design Checklist

Before creating a tool, verify:

- [ ] This step genuinely needs to be deterministic (LLM can't handle it reliably)
- [ ] Inputs are well-defined and typed
- [ ] Output is structured (JSON) not raw text
- [ ] Error cases are handled with clear messages
- [ ] Tool is focused (one job, not a kitchen sink)
- [ ] Tool is idempotent where possible
- [ ] Description is clear enough for the LLM to know when to use it
