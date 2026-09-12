import React from 'react'
import { useWorkforce } from '../contexts/WorkforceContext'

export default function Employees(){
  const { employees } = useWorkforce()
  return (
    <div>
      <h1 style={{fontFamily:'Space Grotesk'}}>Employees</h1>
      <ul>
        {employees.map(e => <li key={e.id}>{e.name} — {e.role} ({e.department})</li>)}
      </ul>
    </div>
  )
}
