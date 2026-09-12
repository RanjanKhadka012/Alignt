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
