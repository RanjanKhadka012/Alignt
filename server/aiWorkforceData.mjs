import { readFileSync } from 'node:fs'

const snapshotUrl = new URL('./data/ai-workforce.json', import.meta.url)
let cached

export function loadAiWorkforce() {
  if (!cached) {
    const data = JSON.parse(readFileSync(snapshotUrl, 'utf8'))
    const names = new Map(data.skills.map(skill => [skill.id, skill.name]))
    cached = {
      ...data,
      employees: data.employees.map(employee => ({
        ...employee,
        skills: (employee.skills || []).map(skill => ({ ...skill, name: skill.name || skill.skill || names.get(skill.skillId) || skill.skillId })),
      })),
    }
  }
  return cached
}

export function findAiEmployee(employee) {
  const data = loadAiWorkforce()
  return data.employees.find(candidate => employee?.id && candidate.id === employee.id)
    || data.employees.find(candidate => employee?.name && candidate.name === employee.name && (!employee.role || candidate.role === employee.role))
}
