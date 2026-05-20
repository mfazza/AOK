import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Render detailed HTML report for five theses and write to .opencode/output/<timestamp>-sector-thesis.html",
  args: {
    theses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ticker: { type: "string" },
          name: { type: "string" },
          summary: { type: "string" },
          catalysts: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          financialSnapshot: { type: "object" },
          valuation: { type: "string" },
          recommendation: { type: "string" },
          confidence: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
        },
      },
      description: "Array of thesis objects",
    },
    title: { type: "string", default: "Sector Thesis Report" },
  },
  async execute(args) {
    const { theses, title } = args
    const now = Date.now()
    const outDir = path.join(process.cwd(), '.opencode', 'output')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const filePath = path.join(outDir, `${now}-sector-thesis.html`)
    const body = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${theses.map(t => `
      <section>
        <h2>${t.ticker} — ${t.name || ''}</h2>
        <h3>Investment Summary</h3><p>${t.summary}</p>
        <h3>Catalysts</h3><ul>${t.catalysts.map(c=>`<li>${c}</li>`).join('')}</ul>
        <h3>Risks</h3><ul>${t.risks.map(r=>`<li>${r}</li>`).join('')}</ul>
        <h3>Financial Snapshot</h3><pre>${JSON.stringify(t.financialSnapshot, null, 2)}</pre>
        <h3>Valuation</h3><p>${t.valuation}</p>
        <h3>Recommendation</h3><p>${t.recommendation}</p>
        <h3>Confidence</h3><p>${t.confidence}</p>
        <h3>Sources</h3><ul>${(t.sources||[]).map(s=>`<li><a href="${s}">${s}</a></li>`).join('')}</ul>
      </section>`).join('')}</body></html>`
    fs.writeFileSync(filePath, body)
    return { path: filePath }
  },
})
