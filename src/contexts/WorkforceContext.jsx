import React, { createContext, useState, useEffect, useContext } from 'react'
import seed from '../data/seed.json'
import initiativeSeed from '../data/initiatives.json'

// Optional supplied datasets take precedence over the existing demo seed.
const supplied = import.meta.glob('../data/{employees,roles}.json', { eager: true, import: 'default' })
const employeeSeed = supplied['../data/employees.json']
const roleSeed = supplied['../data/roles.json']
const sourceEmployees = employeeSeed?.employees || employeeSeed || seed.employees
const sourceRoles = roleSeed?.roles || roleSeed || seed.roles
const catalog = [...seed.skills]
const normalizedEmployees = sourceEmployees.map(employee => ({ ...employee,
  departmentId: employee.departmentId || employee.department,
  skills: (employee.skills || []).map(skill => {
    const name = skill.skill || skill.name || catalog.find(item => item.id === skill.skillId)?.name
    let entry = catalog.find(item => item.name === name)
    if (!entry && name) { entry = { id: `imported-${catalog.length}`, name, category: 'imported' }; catalog.push(entry) }
    return { ...skill, skill: name, skillId: entry?.id || skill.skillId, proficiency: { Beginner: 1, Intermediate: 3, Expert: 5 }[skill.proficiency] || skill.proficiency }
  }),
}))

const WorkforceContext = createContext()

export function WorkforceProvider({ children }){
  const [initiatives, setInitiatives] = useState(initiativeSeed)
  const [employees, setEmployees] = useState([])
  const [skills, setSkills] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(()=>{
    // load seed data
    setEmployees(normalizedEmployees)
    setSkills(catalog)
    setRoles(sourceRoles)
    setDepartments(seed.departments || [])
  },[])

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
