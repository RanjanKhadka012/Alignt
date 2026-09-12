import React, { createContext, useState, useEffect, useContext } from 'react'
import initiativeSeed from '../data/initiatives.json'

// Optional supplied datasets take precedence over the existing demo seed.
const supplied = import.meta.glob('../data/{employees,roles}.json', { eager: true, import: 'default' })
const employeeSeed = supplied['../data/employees.json']
const roleSeed = supplied['../data/roles.json']
function normalizeWorkforce(data) {
const sourceEmployees = employeeSeed?.employees || employeeSeed || data.employees
const sourceRoles = roleSeed?.roles || roleSeed || data.roles
const catalog = [...data.skills]
const normalizedEmployees = sourceEmployees.map(employee => ({ ...employee,
  departmentId: employee.departmentId || employee.department,
  skills: (employee.skills || []).map(skill => {
    const name = skill.skill || skill.name || catalog.find(item => item.id === skill.skillId)?.name
    let entry = catalog.find(item => item.name === name)
    if (!entry && name) { entry = { id: `imported-${catalog.length}`, name, category: 'imported' }; catalog.push(entry) }
    return { ...skill, skill: name, skillId: entry?.id || skill.skillId, proficiency: { Beginner: 1, Intermediate: 3, Expert: 5 }[skill.proficiency] || skill.proficiency }
  }),
}))

return { employees: normalizedEmployees, skills: catalog, roles: sourceRoles }
}

const WorkforceContext = createContext()

export function WorkforceProvider({ children }){
  const [initiatives, setInitiatives] = useState(initiativeSeed)
  const [employees, setEmployees] = useState([])
  const [skills, setSkills] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      setError('Loading workforce data timed out. Please retry.')
      setLoading(false)
    }, 15000)
    fetch('/api/workforce', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Could not load workforce data. Please reload to retry.')
      const data = await response.json()
      if (!['employees', 'skills', 'roles', 'departments'].every(key => Array.isArray(data[key]))) throw new Error('The workforce service returned invalid data.')
      if (controller.signal.aborted) return
      const normalized = normalizeWorkforce(data)
      setEmployees(normalized.employees); setSkills(normalized.skills); setRoles(normalized.roles); setDepartments(data.departments)
      setLoading(false)
    }).catch(error => {
      if (!controller.signal.aborted) { setError(error.message); setLoading(false) }
    }).finally(() => clearTimeout(timeout))
    return () => { clearTimeout(timeout); controller.abort() }
  },[])

  if (loading) return <div role="status" style={{padding: 24}}>Loading workforce…</div>
  if (error) return <div role="alert" style={{padding: 24}}>{error} <button onClick={() => window.location.reload()}>Retry</button></div>

  return (
    <WorkforceContext.Provider value={{initiatives, setInitiatives, readinessDataComplete: !!employeeSeed && !!roleSeed, employees, skills, roles, departments, setEmployees, setSkills, setRoles, setDepartments}}>
      {children}
    </WorkforceContext.Provider>
  )
}

export function useWorkforce(){
  return useContext(WorkforceContext)
}

export default WorkforceContext
