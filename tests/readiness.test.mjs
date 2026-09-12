import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { calculateReadiness, calculateOverallReadiness, talentConcentration } = await import('data:text/javascript;base64,' + Buffer.from(await readFile(new URL('../src/utils/readiness.js', import.meta.url), 'utf8')).toString('base64'))
const initiative = { relevantRoles: ['Operator'], qualifyingSkills: ['Safety'] }
test('readiness counts each relevant employee once regardless of proficiency', () => {
 const employees = [{ id: 'a', role: 'Operator', skills: [{ skill: 'Safety', proficiency: 1 }, { skill: 'Safety' }] }, { id: 'b', role: 'Operator', skills: [] }, { id: 'c', role: 'Other', skills: [{ skill: 'Safety' }] }]
 const result = calculateReadiness(initiative, employees)
 assert.equal(result.qualified, 1); assert.equal(result.gap, 1); assert.equal(result.readinessPct, 50); assert.equal(result.riskLevel, 'critical')
 assert.equal(calculateReadiness(initiative, []).readinessPct, 0)
})
test('weighted readiness handles empty populations and weights objectives', () => {
 assert.equal(calculateOverallReadiness([]), 0)
 assert.equal(calculateOverallReadiness([{ readinessPct: 100, relevantWorkforce: 10 }, { readinessPct: 50, relevantWorkforce: 30 }]), 63)
})
test('concentration counts unique holders across roles', () => {
 const risk = talentConcentration([{ id: 'a', skills: [{ skill: 'Common' }, { skill: 'Rare' }, { skill: 'Rare' }] }, { id: 'b', skills: [{ skill: 'Common' }] }])
 assert.equal(risk.name, 'Rare'); assert.equal(risk.holders.length, 1)
 assert.equal(talentConcentration([]), null)
})
test('real workforce reproduces supplied reference counts and talent dependency', async () => {
 const { workforce } = await import('../server/workforceData.mjs')
 const results = workforce.initiatives.map(initiative => calculateReadiness(initiative, workforce.employees))
 assert.equal(workforce.employees.length, 150)
 assert.equal(workforce.roles.length, 4)
 const food = results.find(item => item.id === 'food_safety')
 const cold = results.find(item => item.id === 'cold_chain_automation')
 assert.deepEqual([food.readinessPct, food.qualified, food.relevantWorkforce], [40, 17, 42])
 assert.deepEqual([cold.readinessPct, cold.qualified, cold.relevantWorkforce], [62, 25, 40])
 assert.equal(calculateOverallReadiness(results), 55)
 const holders = workforce.employees.filter(employee => employee.skills.some(skill => skill.skill === 'Legacy line-equipment troubleshooting'))
 assert.deepEqual(holders.map(employee => [employee.name, employee.skills.find(skill => skill.skill === 'Legacy line-equipment troubleshooting').proficiencyLabel]), [['Dana K.', 'Expert'], ['Marcus T.', 'Beginner']])
})
