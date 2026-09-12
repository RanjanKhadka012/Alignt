import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'

export default function EmployeeProfile(){
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { employees } = useWorkforce()
  const emp = (employees || []).find(e=>e.id===employeeId) || { name: employeeId }

  return (
    <div>
      <button onClick={()=>navigate(-1)} style={{marginBottom:12}}>← Back</button>
      <h1 style={{fontFamily:'Space Grotesk'}}>{emp.name}</h1>
      <div>Role: {emp.role} • Dept: {emp.departmentId}</div>
      <div style={{marginTop:12}}>
        <h3>Skills</h3>
        <ul>
          {(emp.skills||[]).map(s=> <li key={s.skillId}>{s.skillId} — prof {s.proficiency} ({s.source})</li>)}
        </ul>
      </div>
    </div>
  )
}
