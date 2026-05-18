import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"

type Issue = {
  key: string
  summary: string
  description?: string
  status?: string
  assignee?: string | null
  reporter?: string | null
  labels?: string[]
  created?: string
  updated?: string
  commentsCount?: number
  comments?: { author: string; body: string; created: string }[]
}

export default tool({
  description: "Retrieve up to N recent open Jira issues from the top M projects you most recently created tickets in using `acli`.",
  args: {
    userId: {
      type: "string",
      description: "Optional: user id or username to query created-by. If omitted, acli's current user will be used.",
    },
    projectLimit: {
      type: "number",
      description: "How many recent projects to include (default 3)",
      default: 3,
    },
    issueLimit: {
      type: "number",
      description: "Max number of issues to return (default 10)",
      default: 10,
    },
  },
  async execute(args, _context) {
    const { userId, projectLimit = 3, issueLimit = 10 } = args as any

    const runAcli = (cmd: string) => {
      try {
        const out = execSync(`acli ${cmd}`, { encoding: "utf8" })
        return out
      } catch (err: any) {
        throw new Error(`ACLI_ERROR: ${err.message}`)
      }
    }

    // Step 1: list issues created by user, ordered by created desc, to discover recent projects
    let createdIssuesRaw: string
    try {
      const byClause = userId ? `--created-by ${userId}` : "--created-by me"
      // acli assumed to have a 'issue list' command that supports JQL-like options; adjust as needed
      createdIssuesRaw = runAcli(`issue list ${byClause} --order-by created --limit 100 --output json`)
    } catch (err: any) {
      return { error: { code: "ACLI_ERROR", detail: String(err.message) } }
    }

    let createdIssues: any[]
    try {
      createdIssues = JSON.parse(createdIssuesRaw)
    } catch (_e) {
      return { error: { code: "ACLI_PARSE_ERROR", detail: "Failed to parse JSON from acli issue list" } }
    }

    // Extract project keys in the order they appear (most recent created issues first)
    const seen = new Set<string>()
    const projectKeys: string[] = []
    for (const it of createdIssues) {
      const proj = it.key?.split("-")[0]
      if (proj && !seen.has(proj)) {
        seen.add(proj)
        projectKeys.push(proj)
      }
      if (projectKeys.length >= projectLimit) break
    }

    if (projectKeys.length === 0) {
      return { error: { code: "NO_PROJECTS", detail: "No projects found from user's created issues" } }
    }

    // Step 2: Query open issues in those projects. We will request fields and sort as required.
    const projectQuery = projectKeys.map((p) => `project=${p}`).join(" OR ")
    try {
      // acli issue search --jql "(project=A OR project=B) AND statusCategory != Done" --order-by created,updated --limit N --output json
      const jql = `(${projectQuery}) AND statusCategory != Done`
      const searchCmd = `issue search --jql '${jql}' --order-by created,updated --limit ${issueLimit} --output json`
      const issuesRaw = runAcli(searchCmd)
      const issuesArr = JSON.parse(issuesRaw) as any[]

      // Normalize and enrich with comments count (safely)
      const issues: Issue[] = []
      for (const i of issuesArr) {
        try {
          const key = i.key
          const fields = i.fields || i
          const comments = fields.comments || []
          const issue: Issue = {
            key,
            summary: fields.summary || "",
            description: fields.description || "",
            status: fields.status?.name || fields.status || "",
            assignee: fields.assignee?.displayName || fields.assignee || null,
            reporter: fields.reporter?.displayName || fields.reporter || null,
            labels: fields.labels || [],
            created: fields.created || fields.createdDate || null,
            updated: fields.updated || fields.updatedDate || null,
            commentsCount: Array.isArray(comments) ? comments.length : Number(comments?.total || 0),
            comments: Array.isArray(comments)
              ? comments.slice(-3).map((c: any) => ({ author: c.author?.displayName || c.author, body: c.body || c, created: c.created }))
              : [],
          }
          issues.push(issue)
        } catch (_e) {
          // skip malformed entry but note it
        }
      }

      if (issues.length === 0) {
        return { error: { code: "NO_ISSUES", detail: "No open issues found in selected projects" } }
      }

      return { issues }
    } catch (err: any) {
      return { error: { code: "ACLI_SEARCH_ERROR", detail: String(err.message) } }
    }
  },
})
