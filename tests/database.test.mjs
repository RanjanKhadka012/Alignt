import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readWorkforce } from '../server/database.mjs'

test('SQL preserves unknown ratings and fictional flags and enforces relationships', () => {
  const folder = mkdtempSync(join(tmpdir(), 'alignt-db-')), path = join(folder, 'test.sqlite')
  const db = new DatabaseSync(path)
  try {
    db.exec(readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8'))
    db.exec("INSERT INTO departments VALUES ('d','Maintenance'); INSERT INTO roles VALUES ('r','Technician'); INSERT INTO skills VALUES ('s','PLC','uncategorized')")
    db.prepare('INSERT INTO employees(id,name,department_id,role_id,is_fictional,source_row,source_file) VALUES (?,?,?,?,?,?,?)').run('e', "O'Brien", 'd', 'r', 1, 19, 'test')
    db.exec("INSERT INTO employee_skills VALUES ('e','s',NULL,'workbook')")
    assert.throws(() => db.exec("INSERT INTO employee_skills VALUES ('missing','s',3,'workbook')"))
    assert.throws(() => db.exec("UPDATE employee_skills SET proficiency=6"))
    const data = readWorkforce(path)
    assert.equal(data.employees[0].name, "O'Brien")
    assert.equal(data.employees[0].isFictional, true)
    assert.equal(data.employees[0].retirementEligible, null)
    assert.equal(data.employees[0].skills[0].proficiency, null)
    assert.equal(data.roles[0].title, 'Technician')
  } finally { db.close(); rmSync(folder, { recursive: true }) }
})
