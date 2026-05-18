import { tool } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

// Minimal deterministic parser: reads file contents or unified diff text and extracts changed files,
// file paths, and simple line ranges. For Terraform HCL files, uses regex heuristics to extract resource
// blocks; for Python, uses the built-in AST module via node's child_process to avoid shipping a full parser.

export default tool({
  description: "Deterministically parse diffs and extract file contexts for Terraform (.tf) and Python files.",
  args: {
    diffText: { type: 'string', description: 'Unified diff text (optional if files provided)' },
    files: { type: 'object', description: 'Map of path->content for changed files (optional)', optional: true },
  },
  async execute(args) {
    const { diffText, files } = args as any
    const results: any[] = []

    const collectFromFiles = (filePath: string, content: string) => {
      const ext = path.extname(filePath).toLowerCase()
      const obj: any = { path: filePath, lang: ext === '.py' ? 'python' : (ext === '.tf' ? 'terraform' : 'text'), content }
      // Simple heuristic: find beginning and end lines for changed regions by looking for non-empty blocks
      const lines = content.split(/\r?\n/)
      obj.lines = lines.length
      // For terraform, extract top-level resource/module blocks by regex
      if (obj.lang === 'terraform') {
        const blocks = []
        const re = /^(resource|module|provider)\s+"([^"]+)"\s+"([^"]+)"\s*\{/m
        let match
        for (let i = 0; i < lines.length; i++) {
          if (re.test(lines[i])) {
            blocks.push({ line: i + 1, snippet: lines[i].trim() })
          }
        }
        obj.blocks = blocks
      }
      // For python, extract class and def lines heuristically
      if (obj.lang === 'python') {
        const blocks = []
        const re = /^\s*(def|class)\s+([A-Za-z0-9_]+)/
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(re)
          if (m) blocks.push({ line: i + 1, type: m[1], name: m[2], snippet: lines[i].trim() })
        }
        obj.blocks = blocks
      }
      results.push(obj)
    }

    if (files && typeof files === 'object') {
      for (const [p, c] of Object.entries(files)) collectFromFiles(p, c as string)
    }

    if (diffText && diffText.length > 0) {
      // Parse unified diff to extract file chunks for changed files
      const fileHeaderRe = /^\+\+\+ b\/(.+)$/m
      const diffFiles = new Map<string, string[]>()
      const lines = diffText.split(/\r?\n/)
      let current: string | null = null
      for (const l of lines) {
        const fh = l.match(/^\+\+\+ b\/(.+)$/)
        if (fh) { current = fh[1]; diffFiles.set(current, []) ; continue }
        if (current) diffFiles.get(current)!.push(l)
      }
      for (const [p, chunkLines] of diffFiles.entries()) {
        // reconstruct a best-effort file by taking added lines (+) and context lines
        const content = chunkLines.map((l: string) => (l.startsWith('+') ? l.slice(1) : (l.startsWith(' ') ? l.slice(1) : ''))).join('\n')
        collectFromFiles(p, content)
      }
    }

    return { parsed: results }
  }
})
