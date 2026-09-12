import { DatabaseSync } from 'node:sqlite'

export function readWorkforce(path) {
  const db = new DatabaseSync(path, { readOnly: true })
  try {
    const departments = db.prepare('SELECT id,name FROM departments ORDER BY name').all()
    const roles = db.prepare('SELECT id,title FROM roles ORDER BY title').all().map(role => ({ ...role, idealSkillProfile: [] }))
    const skills = db.prepare('SELECT id,name,category FROM skills ORDER BY name').all()
    const holdings = db.prepare('SELECT employee_id,skill_id AS skillId,proficiency,source FROM employee_skills').all()
    const employees = db.prepare('SELECT e.id,e.name,e.department_id AS departmentId,r.title AS role,e.is_fictional AS isFictional,e.tenure,e.retirement_eligible AS retirementEligible,e.category,e.certification_requirements AS certificationRequirements FROM employees e JOIN roles r ON r.id=e.role_id ORDER BY e.source_row').all().map(employee => ({
      ...employee, isFictional: Boolean(employee.isFictional), retirementEligible: employee.retirementEligible === null ? null : Boolean(employee.retirementEligible),
      skills: holdings.filter(skill => skill.employee_id === employee.id).map(({ employee_id, ...skill }) => skill),
    }))
    return { employees, departments, roles, skills }
  } finally { db.close() }
}
