import { tool } from "@opencode-ai/plugin"
import fs from "fs/promises"
import path from "path"

/**
 * AOK Validate Agent — checks that an agent definition follows AOK conventions.
 * This is a meta-tool: it validates the output of /aok-new.
 */
export default tool({
  description:
    "Validate an AOK-created agent definition for completeness and quality. Returns structured validation results.",
  args: {
    agentPath: tool.schema
      .string()
      .describe("Path to the agent .md file to validate"),
  },
  async execute(args, context) {
    const fullPath = path.resolve(context.directory, args.agentPath)
    const errors: string[] = []
    const warnings: string[] = []

    let content: string
    try {
      content = await fs.readFile(fullPath, "utf-8")
    } catch {
      return JSON.stringify({
        valid: false,
        errors: [`File not found: ${args.agentPath}`],
        warnings: [],
      })
    }

    // Check frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!frontmatterMatch) {
      errors.push("Missing YAML frontmatter (must start with ---)")
      return JSON.stringify({ valid: false, errors, warnings })
    }

    const [, frontmatter, body] = frontmatterMatch

    // Required frontmatter fields
    if (!frontmatter.includes("description:")) {
      errors.push("Missing 'description' in frontmatter")
    }
    if (!frontmatter.includes("mode:")) {
      errors.push("Missing 'mode' in frontmatter (primary | subagent)")
    }

    // Body quality checks
    if (body.length < 100) {
      errors.push("Agent prompt is too short (<100 chars) — needs more specific instructions")
    }

    // Check for process/steps structure
    if (!body.includes("Step") && !body.includes("step") && !body.includes("##")) {
      warnings.push("No structured process found — consider adding numbered steps")
    }

    // Check for guardrails
    if (
      !body.toLowerCase().includes("guardrail") &&
      !body.toLowerCase().includes("do not") &&
      !body.toLowerCase().includes("never")
    ) {
      warnings.push("No guardrails detected — consider adding constraints")
    }

    // Check for output format
    if (
      !body.toLowerCase().includes("output") &&
      !body.toLowerCase().includes("produce") &&
      !body.toLowerCase().includes("return")
    ) {
      warnings.push("No output format specified — agent may produce inconsistent formats")
    }

    // Check for tool references (if tools exist)
    const agentName = path.basename(fullPath, ".md")
    const toolsDir = path.join(context.directory, ".opencode", "tools")
    try {
      const files = await fs.readdir(toolsDir)
      const agentTools = files.filter((f) => f.startsWith(`${agentName}-`))
      for (const toolFile of agentTools) {
        const toolName = toolFile.replace(".ts", "")
        if (!body.includes(toolName)) {
          warnings.push(`Tool '${toolName}' exists but is not referenced in agent prompt`)
        }
      }
    } catch {
      // No tools dir — that's fine
    }

    return JSON.stringify({
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        promptLength: body.length,
        hasProcess: body.includes("Step") || body.includes("step"),
        hasGuardrails:
          body.toLowerCase().includes("guardrail") ||
          body.toLowerCase().includes("do not"),
        hasOutputFormat:
          body.toLowerCase().includes("output") ||
          body.toLowerCase().includes("produce"),
      },
    })
  },
})
