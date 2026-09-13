import { readFileSync } from 'node:fs'
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'))
export function loadWorkforce() {
const employees = read('employees'), roles = read('roles'), initiatives = read('initiatives')
const rank = value => ({ Beginner: 1, Intermediate: 3, Expert: 5 }[value] || value)
const names = [...new Set([...employees.flatMap(employee => employee.skills.map(skill => skill.skill)), ...roles.flatMap(role => role.idealSkillProfile.map(skill => skill.skill)), ...initiatives.flatMap(initiative => initiative.qualifyingSkills)])]
const skills = names.map((name, index) => ({ id: `skill-${index + 1}`, name, category: 'workforce', strategicWeight: 1 }))
const skillId = name => skills.find(skill => skill.name === name).id
const teams = [...new Set(employees.map(employee => employee.team))]
const departments = teams.map((name, index) => ({ id: `department-${index + 1}`, name }))
return {
  dataSource: 'real-seed',
  employees: employees.map(employee => ({ ...employee, department: employee.team, departmentId: departments.find(department => department.name === employee.team).id, skills: employee.skills.map(skill => ({ ...skill, skillId: skillId(skill.skill), proficiencyLabel: skill.proficiency, proficiency: rank(skill.proficiency) })) })),
  roles: roles.map(role => ({ ...role, idealSkillProfile: role.idealSkillProfile.map(skill => ({ ...skill, skillId: skillId(skill.skill), targetProficiency: rank(skill.targetProficiency) })) })),
  skills, departments, initiatives,
}

}
export const workforce = loadWorkforce()
