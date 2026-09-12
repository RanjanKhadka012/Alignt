import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'

export default function DepartmentDetail(){
  const { deptId } = useParams()
  const navigate = useNavigate()
  const { employees, departments, skills } = useWorkforce()
  const { departmentsWithRisk, skillsWithRisk } = useDerivedData()

  const dept = (departments || []).find(d=>d.id===deptId) || { name: deptId }
  const deptRisk = (departmentsWithRisk || []).find(d=>d.id===deptId) || { riskLevel: 'healthy', headcount:0 }
  const deptEmployees = (employees || []).filter(e=>e.departmentId===deptId)

  function skillIsCritical(skillId){
    const s = (skillsWithRisk||[]).find(x=>x.skill.id===skillId)
    return s && s.risk === 'critical'
  }

  return (
    <div>
      <button onClick={()=>navigate(-1)} style={{marginBottom:12}}>← Back</button>
      <h1 style={{fontFamily:'Space Grotesk'}}>{dept.name}</h1>
      <div style={{marginBottom:12}}>Employees: {deptRisk.headcount} • Risk: <strong style={{color: deptRisk.riskLevel==='critical'? 'var(--critical)': deptRisk.riskLevel==='watch'? 'var(--warning)': 'var(--primary)'}}>{deptRisk.riskLevel}</strong></div>

      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead style={{textAlign:'left',color:'var(--muted)'}}>
          <tr><th>Name</th><th>Role</th><th>Skills</th><th>Risk</th></tr>
        </thead>
        <tbody>
          {deptEmployees.map(e=>{
            const atRiskNote = e.retirementEligible && e.skills && e.skills.some(es=>{
              const s = (skillsWithRisk||[]).find(x=>x.skill.id===es.skillId)
              return s && s.risk==='critical' && ( (s.holders || []).length === 1 )
            })
            const risk = atRiskNote ? 'critical' : 'healthy'
            return (
              <tr key={e.id} style={{borderTop:'1px solid var(--hairline)',cursor:'pointer'}} onClick={()=>navigate(`/employees/${e.id}`)}>
                <td style={{padding:'12px 8px'}}>{e.name}<div style={{fontSize:12,color:'var(--muted)'}}>{e.tenure} yrs{e.retirementEligible? ' · retirement-eligible':''}{atRiskNote? ' · sole holder':''}</div></td>
                <td style={{padding:'12px 8px'}}>{e.role}</td>
                <td style={{padding:'12px 8px'}}>{(e.skills||[]).map(es=>{
                  const critical = skillIsCritical(es.skillId)
                  return <span key={es.skillId} style={{display:'inline-block',marginRight:8,padding:'4px 8px',border:`1px solid ${critical? 'var(--critical)':'var(--hairline)'}`,borderRadius:8,color: critical? 'var(--critical)':'var(--text)',fontSize:12}}>{es.skillId}</span>
                })}</td>
                <td style={{padding:'12px 8px'}}><span style={{padding:'6px 8px',borderRadius:8,border:'1px solid var(--hairline)'}}>{risk}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
