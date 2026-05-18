import { tool } from "@opencode-ai/plugin"
import fs from "fs/promises"
import path from "path"

/**
 * AOK Eval Case Loader — reads and structures all eval cases for an agent.
 * Returns structured data the eval runner can iterate over.
 */
export default tool({
  description:
    "Load all eval cases for an agent and return them as structured data. Use before running evals.",
  args: {
    agentName: tool.schema.string().describe("Name of the agent to load cases for"),
  },
  async execute(args, context) {
    const casesDir = path.join(
      context.directory,
      ".opencode",
      "evals",
      args.agentName,
      "cases"
    )

    try {
      const files = await fs.readdir(casesDir)
      const mdFiles = files.filter((f) => f.endsWith(".md")).sort()

      const cases: Array<{
        id: string
        filename: string
        content: string
        category: string | null
        checks: string[]
      }> = []

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(casesDir, file), "utf-8")

        // Extract category
        const categoryMatch = content.match(
          /### Category\n+([^\n]+)/i
        )
        const category = categoryMatch?.[1]?.trim() ?? null

        // Extract checks
        const checks: string[] = []
        const checkMatches = content.matchAll(/- \[ \] (.+)/g)
        for (const match of checkMatches) {
          checks.push(match[1])
        }

        cases.push({
          id: file.replace(".md", ""),
          filename: file,
          content,
          category,
          checks,
        })
      }

      return JSON.stringify({
        agent: args.agentName,
        totalCases: cases.length,
        byCategory: {
          "happy-path": cases.filter((c) => c.category === "happy-path").length,
          "edge-case": cases.filter((c) => c.category === "edge-case").length,
          "failure-mode": cases.filter((c) => c.category === "failure-mode").length,
          adversarial: cases.filter((c) => c.category === "adversarial").length,
        },
        cases,
      })
    } catch (e) {
      return JSON.stringify({
        error: `Failed to load cases: ${(e as Error).message}`,
        hint: `Expected cases at: ${casesDir}`,
      })
    }
  },
})
