import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "{TOOL_DESCRIPTION}",
  args: {
    // Define typed arguments
    input: tool.schema.string().describe("{ARG_DESCRIPTION}"),
  },
  async execute(args, context) {
    // Implementation
    // context.directory = session working directory
    // context.worktree = git worktree root

    return JSON.stringify({ result: "TODO" })
  },
})
