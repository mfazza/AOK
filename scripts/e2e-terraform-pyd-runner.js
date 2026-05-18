#!/usr/bin/env node
// Simple E2E runner for TerraPyd-Reviewer: uses the parser tool logic and applies basic heuristics
const fs = require('fs')
const path = require('path')

async function readCase(caseFile) {
  const txt = fs.readFileSync(caseFile, 'utf8')
  // naive frontmatter parse to extract file blocks
  const files = {}
  const fileRe = /^(\s*)files:\n((?:\s+\w+: \|\n(?:\s+.+\n)+)+)/m
  const m = txt.match(/files:\n([\s\S]*)/m)
  if (!m) return { files }
  const blocks = m[1]
  const blockRe = /^(\s+)([^:]+): \|\n((?:\s+.*\n)+)/gm
  let match
  while ((match = blockRe.exec(blocks)) !== null) {
    const name = match[2].trim()
    const content = match[3].split('\n').map(l => l.replace(/^\s+/, '')).join('\n')
    files[name] = content
  }
  return { files }
}

function runParser(files) {
  // reuse logic similar to tool: detect terraform provider and security group
  const parsed = []
  for (const [p, c] of Object.entries(files)) {
    const ext = path.extname(p)
    const obj = { path: p, content: c, blocks: [] }
    const lines = c.split(/\r?\n/)
    if (ext === '.tf') {
      for (let i = 0; i < lines.length; i++) {
        if (/^provider\s+\"/.test(lines[i])) obj.blocks.push({ line: i+1, snippet: lines[i].trim() })
        if (/cidr_blocks\s*=\s*\[\"0.0.0.0\/0\"\]/.test(lines[i])) obj.blocks.push({ line: i+1, snippet: lines[i].trim(), issue: 'open_cidr' })
      }
    }
    parsed.push(obj)
  }
  return parsed
}

function analyze(parsed) {
  const findings = []
  for (const f of parsed) {
    if (f.path.endsWith('.tf')) {
      // check provider pin
      if (f.content.includes('provider "aws"')) {
        findings.push({ file: f.path, start_line: 1, end_line: 3, severity: 'High', title: 'Missing provider version pin', description: 'Provider block has no version constraint', suggested_fix: 'Pin provider: provider "aws" { version = "~> 4.0" }', citations: ['skills/terra-pyd-conventions'] })
      }
      for (const b of f.blocks) {
        if (b.issue === 'open_cidr') {
          findings.push({ file: f.path, start_line: b.line, end_line: b.line, severity: 'High', title: 'Open security group', description: 'CIDR 0.0.0.0/0 found in ingress', suggested_fix: 'Restrict CIDR to least privilege', citations: ['skills/terra-pyd-conventions'] })
        }
      }
    }
  }
  return findings
}

async function main() {
  const caseFile = process.argv[2] || ' .opencode/evals/terra-pyd-reviewer/cases/01-happy-path-simple-terraform.md'
  const { files } = await readCase(caseFile)
  const parsed = runParser(files)
  const findings = analyze(parsed)
  const output = { summary: { total_findings: findings.length }, findings, metadata: { parser_used: true } }
  console.log(JSON.stringify(output, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
