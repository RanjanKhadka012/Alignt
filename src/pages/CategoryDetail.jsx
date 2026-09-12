import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'

const CATEGORY_MAP = {
  'corporate': ['it','people'],
  'commercial': ['supply-chain'],
  'plant-floor': ['manufacturing','maintenance','facilities','automation','engineering']
}

export default function CategoryDetail(){
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { employees, skills } = useWorkforce()
  const { skillsWithRisk } = useDerivedData()

  const deptIds = CATEGORY_MAP[categoryId] || []
  const catsEmployees = (employees || []).filter(e=> deptIds.includes(e.departmentId))

  function skillIsCritical(skillId){
    const s = (skillsWithRisk||[]).find(x=>x.skill.id===skillId)
    return s && s.risk === 'critical'
  }

  return (
    <div>
      <button onClick={()=>navigate(-1)} style={{marginBottom:12}}>← Back</button>
      <h1 style={{fontFamily:'Space Grotesk'}}>{categoryId.replace('-', ' ').toUpperCase()}</h1>
      <div style={{marginTop:12}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{textAlign:'left',color:'var(--muted)'}}>
            <tr><th>Name</th><th>Role</th><th>Skills</th></tr>
          </thead>
          <tbody>
            {catsEmployees.map(e=> (
              <tr key={e.id} style={{borderTop:'1px solid var(--hairline)',cursor:'pointer'}} onClick={()=>navigate(`/employees/${e.id}`)}>
                <td style={{padding:'12px 8px'}}>{e.name}<div style={{fontSize:12,color:'var(--muted)'}}>{e.tenure} yrs{e.retirementEligible? ' · retirement-eligible':''}</div></td>
                <td style={{padding:'12px 8px'}}>{e.role}</td>
                <td style={{padding:'12px 8px'}}>{(e.skills||[]).map(es=>{
                  const critical = skillIsCritical(es.skillId)
                  return <span key={es.skillId} style={{display:'inline-block',marginRight:8,padding:'4px 8px',border:`1px solid ${critical? 'var(--critical)':'var(--hairline)'}`,borderRadius:8,color: critical? 'var(--critical)':'var(--text)',fontSize:12}}>{es.skillId}</span>
                })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
