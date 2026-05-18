// Simple eval runner to exercise sector-thesis-agent tools pipeline (lightweight, no TS build)
// Usage: node .opencode/run/simple_eval.js "photonics"
const fs = require('fs')
const path = require('path')

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'opencode-eval/1.0' } })
  return await res.text()
}

async function searchDuck(query, limit = 10) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const html = await fetchText(url)
  const hrefs = Array.from(html.matchAll(/href="(https?:\/\/[^\"]+)"/g)).map(m=>m[1])
  return Array.from(new Set(hrefs)).slice(0, limit)
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i)
  if (m) return m[1].trim()
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1) return h1[1].trim()
  return null
}

function extractFinancials(text) {
  const out = {}
  const num = s=>{ const m = s.match(/([0-9.,]+)\s*(B|M|K|bn|m|k)?/i); if(!m) return null; let n=parseFloat(m[1].replace(/,/g,'')); const scale=(m[2]||'').toLowerCase(); if(scale==='b'||scale==='bn') n*=1e9; if(scale==='m') n*=1e6; if(scale==='k') n*=1e3; return n }
  const mcap = text.match(/market cap(?:italization)?[:\s]\$?([0-9.,]+)\s*(B|M|K|bn|m|k)?/i)
  if(mcap) out.marketCap = num(mcap[0])
  const rev = text.match(/revenue[:\s]\$?([0-9.,]+)\s*(B|M|K|bn|m|k)?/i)
  if(rev) out.revenue = num(rev[0])
  const pe = text.match(/\bP\/?E[:\s]([0-9.,]+)/i)
  if(pe) out.pe = parseFloat(pe[1].replace(/,/g,''))
  const dy = text.match(/dividend yield[:\s]([0-9.,]+)%/i)
  if(dy) out.dividendYield = parseFloat(dy[1])
  return out
}

async function run(query) {
  console.log('Searching for', query)
  const links = await searchDuck(query, 12)
  console.log('Found links:', links.length)
  const pages = []
  for (const l of links) {
    try {
      const txt = await fetchText(l)
      const title = extractTitle(txt) || l
      pages.push({ url: l, title, snippet: txt.slice(0,2000), financials: extractFinancials(txt) })
    } catch (e) {
      // ignore
    }
  }
  // pick top 5 distinct titles/domains
  const seen = new Set()
  const candidates = []
  for (const p of pages) {
    const host = (()=>{ try{ return new URL(p.url).hostname.replace('www.','') }catch(e){return p.url}})()
    if (seen.has(host)) continue
    seen.add(host)
    candidates.push(p)
    if (candidates.length>=5) break
  }

  if (candidates.length < 5) {
    console.log('Warning: fewer than 5 distinct candidates found; returning', candidates.length)
  }

  // build simple theses
  const theses = candidates.map((c, idx) => ({
    ticker: `TICKER${idx+1}`,
    name: c.title,
    summary: `Candidate from ${c.url}. Short summary derived from title.`,
    catalysts: ['Market adoption', 'New product cycle', 'Partnerships'],
    risks: ['Competition', 'Supply chain', 'Regulation'],
    financialSnapshot: c.financials,
    valuation: 'Simple comps or estimate — notional',
    recommendation: 'Hold',
    confidence: 'Medium',
    sources: [c.url]
  }))

  // render HTML
  const outDir = path.join(process.cwd(), '.opencode', 'output')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const filePath = path.join(outDir, `${Date.now()}-simple-sector-thesis.html`)
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>Simple Sector Thesis: ${query}</title></head><body><h1>Simple Sector Thesis: ${query}</h1>${theses.map(t=>`<section><h2>${t.ticker} - ${t.name}</h2><p>${t.summary}</p><h3>Catalysts</h3><ul>${t.catalysts.map(x=>`<li>${x}</li>`).join('')}</ul><h3>Risks</h3><ul>${t.risks.map(x=>`<li>${x}</li>`).join('')}</ul><h3>Financial Snapshot</h3><pre>${JSON.stringify(t.financialSnapshot,null,2)}</pre><h3>Recommendation</h3><p>${t.recommendation} (Confidence: ${t.confidence})</p><h3>Sources</h3><ul>${t.sources.map(s=>`<li><a href="${s}">${s}</a></li>`).join('')}</ul></section>`).join('')}</body></html>`
  fs.writeFileSync(filePath, body)
  console.log('Wrote HTML to', filePath)

  // print CLI bullets
  console.log('\nCLI Output:')
  for (const t of theses) {
    console.log(`- ${t.ticker} — ${t.summary} — ${t.recommendation}`)
  }
}

const q = process.argv.slice(2).join(' ')
if (!q) {
  console.error('Usage: node simple_eval.js "photons"')
  process.exit(1)
}
run(q).catch(e=>{ console.error('Run error', e); process.exit(2) })
