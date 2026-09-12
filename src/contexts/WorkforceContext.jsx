import React, { createContext, useState, useEffect, useContext } from 'react'
import seed from '../data/seed.json'

const WorkforceContext = createContext()

export function WorkforceProvider({ children }){
  const [employees, setEmployees] = useState([])
  const [skills, setSkills] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(()=>{
    // load seed data
    setEmployees(seed.employees)
    setSkills(seed.skills)
    setRoles(seed.roles)
    setDepartments(seed.departments || [])
  },[])

  return (
    <WorkforceContext.Provider value={{employees, skills, roles, departments, setEmployees, setSkills, setRoles, setDepartments}}>
      {children}
    </WorkforceContext.Provider>
  )
}

export function useWorkforce(){
  return useContext(WorkforceContext)
}

export default WorkforceContext
