#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const ALLOWED_VERBS = [
  'Ask','Add','Clarify','Request','Break','Create','Assign','Reassign','Update','Remove','Reproduce','Investigate','Triage','Estimate','Schedule'
]

function firstMatch(regex, text) {
  const m = regex.exec(text)
  return m ? m[0] : null
}

function wordCount(s){ return s.trim().split(/\s+/).filter(Boolean).length }

function synthesize(issue){
  const key = issue.key
  const title = issue.summary || ''
  const desc = issue.description || ''
  const status = issue.status || ''
  const assignee = issue.assignee || null
  const labels = issue.labels || []

  const missing = []
  if(!desc || desc.trim().length === 0) missing.push('Description')
  if(!/Acceptance Criteria|Acceptance criteria|AC:/i.test(desc)) missing.push('Acceptance criteria')
  if(/repro|steps to reproduce|steps/i.test(desc) === false) missing.push('Steps to reproduce')

  // detect referenced keys
  const refKey = firstMatch(/[A-Z][A-Z0-9]+-\d+/g, desc)

  let action = ''
  let rationale = ''
  let confidence = 'Medium'

  if(/blocked/i.test(status) || /blocked by/i.test(desc) || labels.includes('blocker')){
    if(refKey){
      action = `Investigate blocking issue ${refKey} and request unblock from owner.`
      confidence = 'High'
      rationale = `Issue is blocked by ${refKey}; resolving the blocker will allow progress.`
    } else {
      action = `Investigate why this issue is blocked and identify the blocker.`
      confidence = 'Medium'
      rationale = 'Issue indicates it is blocked but no blocker key was found in the description.'
    }
  } else if(/Acceptance Criteria|Acceptance criteria|AC:/i.test(desc)){
    if(assignee){
      action = `Assign to ${assignee} to implement per acceptance criteria.`
      confidence = 'High'
      rationale = 'Clear acceptance criteria present; assigning owner focuses implementation.'
    } else {
      action = `Ask the Product Owner for acceptance criteria.`
      confidence = 'High'
      rationale = 'Acceptance criteria present or implied; clarifying AC prevents rework.'
    }
  } else if(!desc || desc.trim().length < 20){
    action = `Ask the reporter for details and acceptance criteria.`
    confidence = 'Low'
    rationale = 'Description is sparse or missing; more details are required to proceed.'
  } else if(labels.includes('bug') || /fail|error|crash|exception|latency/i.test(desc)){
    action = assignee ? `Investigate logs and reproduce the error with the assignee.` : `Investigate logs and attempt to reproduce the error.`
    confidence = 'Medium'
    rationale = 'Evidence suggests a bug; reproducing is the next step to diagnose.'
  } else {
    action = `Triage the issue and estimate effort.`
    confidence = 'Medium'
    rationale = 'No obvious blocker or missing AC; triage to determine next steps and size.'
  }

  // enforce verb start
  const verb = action.split(' ')[0]
  if(!ALLOWED_VERBS.includes(verb)){
    // replace with Triage default
    action = `Triage the issue and estimate effort.`
  }

  // cap words to 20 words
  if(wordCount(action) > 20){
    action = action.split(/\s+/).slice(0,20).join(' ') + '...'
  }

  return { key, title, action, rationale, confidence, missing: missing.length? missing.join(', '): 'None' }
}

function main(){
  const tmp = '/tmp/acli_recent_slim.json'
  let data
  if(fs.existsSync(tmp)){
    data = JSON.parse(fs.readFileSync(tmp, 'utf8'))
  } else {
    console.error('No tool output found at /tmp/acli_recent_slim.json')
    process.exit(1)
  }

  const issues = (Array.isArray(data) && data.length? data : (data.issues || []))
  const suggestions = issues.slice(0,10).map(synthesize)

  const counts = {High:0, Medium:0, Low:0}
  for(const s of suggestions) counts[s.confidence]++

  console.log(`Summary: ${suggestions.length} issues reviewed — ${counts.High} High, ${counts.Medium} Medium, ${counts.Low} Low\n`)
  for(const s of suggestions){
    console.log(`Key: ${s.key}`)
    console.log(`Title: ${s.title}`)
    console.log(`Action: ${s.action}`)
    console.log(`Rationale: ${s.rationale}`)
    console.log(`Confidence: ${s.confidence}`)
    console.log(`Missing: ${s.missing}\n`)
  }
}

main()
