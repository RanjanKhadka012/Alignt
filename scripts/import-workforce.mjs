import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const input = process.argv[2]
if (!input) throw new Error('Usage: node scripts/import-workforce.mjs <extracted-rows.json> [database-path]')
const target = resolve(process.argv[3] || '.local/workforce.sqlite')
mkdirSync(dirname(target), { recursive: true })
const rows = JSON.parse(readFileSync(input, 'utf8').replace(/^\uFEFF/, ''))
const db = new DatabaseSync(target)
db.exec(readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8'))
const id = (prefix, name) => prefix + createHash('sha256').update(name).digest('hex').slice(0, 20)
try {
  db.exec('BEGIN IMMEDIATE')
  // Refuse to overwrite an existing import or merge unrelated people by name.
  if (db.prepare('SELECT count(*) AS n FROM employees').get().n) throw new Error('Database already contains employees. Import into a new database file.')
  for (const row of rows) {
    if (!row.A || !row.B) continue
    const leadership = row.row <= 18
    const name = row.A.replace(/^404\s+/, '').trim()
    const department = leadership ? row.D : row.B
    const role = leadership ? row.B : row.D
    if (!name || !department || !role) throw new Error(`Missing identity fields at row ${row.row}`)
    const departmentId = id('dept-', department), roleId = id('role-', role), employeeId = `schwans-row-${row.row}`
    db.prepare('INSERT OR IGNORE INTO departments(id,name) VALUES (?,?)').run(departmentId, department)
    db.prepare('INSERT OR IGNORE INTO roles(id,title) VALUES (?,?)').run(roleId, role)
    db.prepare('INSERT INTO employees(id,name,department_id,role_id,is_fictional,category,certification_requirements,source_row,source_file) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(employeeId, name, departmentId, roleId, Number(/^404\s+/.test(row.A)), leadership ? row.D : row.C, leadership ? row.E : null, row.row, "CJ Schwan's Profile.xlsx")
    for (const tag of (leadership ? row.C : row.E || '').split(';').map(v => v.trim()).filter(v => v && !/^None (recorded|specified)$/i.test(v))) {
      const rated = tag.match(/^(.*?)\s*\(([1-5])\/5\)$/)
      if (!leadership && !rated) throw new Error(`Unrecognized skill rating at row ${row.row}: ${tag}`)
      const skillName = rated ? rated[1].trim() : tag, skillId = id('skill-', skillName)
      db.prepare('INSERT OR IGNORE INTO skills(id,name) VALUES (?,?)').run(skillId, skillName)
      db.prepare('INSERT INTO employee_skills(employee_id,skill_id,proficiency,source) VALUES (?,?,?,?)').run(employeeId, skillId, rated ? Number(rated[2]) : null, 'workbook')
    }
  }
  db.exec('COMMIT')
  console.log(JSON.stringify({ database: target, employees: db.prepare('SELECT count(*) AS n FROM employees').get().n, fictional: db.prepare('SELECT count(*) AS n FROM employees WHERE is_fictional=1').get().n, skills: db.prepare('SELECT count(*) AS n FROM skills').get().n }))
} catch (error) { db.exec('ROLLBACK'); throw error } finally { db.close() }
