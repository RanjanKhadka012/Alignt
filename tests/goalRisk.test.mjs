import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const config = await readFile(new URL('../src/config/financialAssumptions.js', import.meta.url), 'utf8')
const source = await readFile(new URL('../src/utils/goalRisk.js', import.meta.url), 'utf8')
const { analyzeGoalReadiness, calculateFinancials } = await import('data:text/javascript;base64,' + Buffer.from(source.replace("import { FINANCIAL_ASSUMPTIONS } from '../config/financialAssumptions.js'", config)).toString('base64'))
test('pool classification honors proficiency, distinct capabilities, and company-wide holders', () => {
 const employees = [
  { id: 'qualified', role: 'Operator', skills: [{ skill: 'A', proficiency: 3 }, { skill: 'B', proficiency: 'Expert' }] },
  { id: 'beginner', role: 'Operator', skills: [{ skill: 'A', proficiency: 1 }] },
  { id: 'gapped', role: 'Operator', skills: [] },
  { id: 'outside', role: 'Engineer', skills: [{ skill: 'A', proficiency: 'Intermediate' }] },
  { id: 'duplicate', role: 'Operator', skills: [{ skill: 'A', proficiency: 5 }, { skill: 'A', proficiency: 5 }] },
 ]
 const result = analyzeGoalReadiness('Goal', ['A', 'B', 'C'], ['Operator'], employees)
 assert.equal(result.pool.length, 4); assert.equal(result.fullyQualified.length, 1); assert.equal(result.trainable.length, 2); assert.equal(result.gapped.length, 1)
 assert.equal(result.concentration[0].holders.length, 3); assert.equal(result.concentration[0].flag, 'watch'); assert.equal(result.concentration[2].holders.length, 0)
})
test('financials apply specified formulas and handle negative savings and zero investment', () => {
 const result = calculateFinancials(5, 10)
 assert.equal(result.optionA, 900000); assert.equal(result.recommended.total, 205200); assert.equal(result.recommended.savingsVsOptionA, 694800)
 assert.equal(result.projectedValue.annualSavings, 1440000)
 assert.equal(calculateFinancials(5, 0).recommended.savingsVsOptionA, -6000)
 assert.equal(calculateFinancials(0, 1).recommended.recruitCount, 1)
 assert.equal(calculateFinancials(0, 0).projectedValue.roiMultiple, 0)
})
