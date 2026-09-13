import React, { useState } from 'react'
import { useWorkforce } from '../contexts/WorkforceContext'
import { retirementStatus } from '../utils/retirement.mjs'
import './Retirement.css'
export default function RetirementProfile({ employee }) {
  const { setEmployees } = useWorkforce()
  const [editing, setEditing] = useState(false)
  const [eligibility, setEligibility] = useState('unknown'), [date, setDate] = useState('')
  const status = retirementStatus(employee)
  return <section className="retirement-panel"><h3>Retirement & knowledge continuity</h3>{employee.retirementDemo && <p>Illustrative demo assignment, not a confirmed retirement or eligibility record.</p>}<p className={status.soon ? 'retirement-urgent' : ''}>{status.label}{employee.retirementDate && ` · ${employee.retirementDate}`}</p>{status.flagged && <p>Confirm timing with the employee, document critical procedures, and develop backup skill coverage. Eligibility alone does not mean someone plans to retire.</p>}
    {editing ? <form onSubmit={event => { event.preventDefault(); setEmployees(previous => previous.map(item => item.id === employee.id ? { ...item, retirementEligible: eligibility === 'unknown' ? null : eligibility === 'yes', retirementDate: date || null } : item)); setEditing(false) }}>
      <label>Recorded eligibility<select value={eligibility} onChange={event => setEligibility(event.target.value)}><option value="unknown">Not recorded</option><option value="yes">Eligible</option><option value="no">Not eligible</option></select></label>
      <label>Employee-confirmed planned retirement date (optional)<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
      <p>Use confirmed information only. Changes apply across the app for this session; they are not saved to the database.</p><button>Save</button> <button type="button" onClick={() => setEditing(false)}>Cancel</button>
    </form> : <button onClick={() => { setEligibility(employee.retirementEligible == null ? 'unknown' : employee.retirementEligible ? 'yes' : 'no'); setDate(employee.retirementDate || ''); setEditing(true) }}>Update retirement information</button>}
  </section>
}
