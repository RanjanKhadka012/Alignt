import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { loadWorkforce } from '../server/workforceData.mjs'
import { readWorkforce } from '../server/database.mjs'

const databasePath = process.argv[2] || process.env.DATABASE_PATH
const outputPath = resolve(process.argv[3] || 'server/data/ai-workforce.json')
if (databasePath && !existsSync(resolve(databasePath))) throw new Error(`SQLite database not found: ${resolve(databasePath)}. Provide an existing database path or omit it to regenerate from seed data.`)
const data = databasePath ? readWorkforce(databasePath) : loadWorkforce()
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(data, null, 2) + '\n')
console.log(JSON.stringify({ output: outputPath, source: databasePath ? 'sqlite' : 'seed-fallback', employees: data.employees.length, skills: data.skills.length }))
