import React, { createContext, useState, useEffect, useContext } from 'react'

const WorkforceContext = createContext()

export function WorkforceProvider({ children }){
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
      setEmployees(data.employees); setSkills(data.skills); setRoles(data.roles); setDepartments(data.departments)
      setLoading(false)
    }).catch(error => {
      if (!controller.signal.aborted) { setError(error.message); setLoading(false) }
    }).finally(() => clearTimeout(timeout))
    return () => { clearTimeout(timeout); controller.abort() }
  },[])

  if (loading) return <div role="status" style={{padding: 24}}>Loading workforce…</div>
  if (error) return <div role="alert" style={{padding: 24}}>{error} <button onClick={() => window.location.reload()}>Retry</button></div>

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
