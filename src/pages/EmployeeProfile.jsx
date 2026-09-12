import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'
import initiatives from '../data/initiatives.json'

function initials(name){
  return (name || '').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
}

function proficiencyColor(p){
  if(!p) return 'var(--muted)'
  // normalize common shapes: string, object { proficiency }, numeric rating
  let val = p
  if(typeof p !== 'string'){
    if(p && typeof p === 'object'){
      val = p.proficiency || p.rating || JSON.stringify(p)
    } else {
      val = String(p)
    }
  }
  const norm = val.toLowerCase()
  if(norm.includes('expert')) return 'var(--success)'
  if(norm.includes('inter')) return 'var(--teal)'
  if(norm.includes('begin')) return 'var(--warning)'
  return 'var(--muted)'
}

export default function EmployeeProfile(){
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { employees } = useWorkforce()
  const derived = useDerivedData()
  const emp = (employees || []).find(e=>e.id===employeeId) || { name: employeeId, skills: [] }

  const skills = emp.skills || []
  const totalSkills = skills.length
  const expertCount = skills.filter(s=>/expert/i.test(s.proficiency)).length
  const avgRating = skills.length ? Math.round(skills.reduce((a,b)=>a+(b.rating||0),0)/skills.length) : 0

  // initiatives that match role or have qualifying skills employee already has
  const matchedInitiatives = initiatives.filter(init => (init.relevantRoles || []).includes(emp.role) || (init.qualifyingSkills || []).some(s=>skills.find(k=>k.skill===s)))

  return (
    <div>
      <button onClick={()=>navigate(-1)} style={{marginBottom:12}}>← Back</button>
      <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
        <aside style={{width:220,background:'var(--panel)',padding:16,borderRadius:8}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:64,height:64,background:'linear-gradient(135deg,var(--accent),var(--primary))',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:18}}>{initials(emp.name)}</div>
            <div>
              <h2 style={{margin:0}}>{emp.name}</h2>
              <div style={{color:'var(--muted)'}}>{emp.role} • {emp.team || emp.category}</div>
            </div>
          </div>

          <hr style={{border:'none',borderTop:'1px solid var(--hairline)',margin:'12px 0'}} />

          <div style={{fontSize:13}}>
            <div><strong>Profile summary</strong></div>
            <div style={{marginTop:8}}>
              <div>Skills recorded: <strong>{totalSkills}</strong></div>
              <div>Expert skills: <strong>{expertCount}</strong></div>
              <div>Average rating: <strong>{avgRating}</strong></div>
              <div style={{marginTop:8}}>{emp.noCertsRecorded ? <span style={{color:'var(--warning)'}}>No certifications recorded</span> : <span style={{color:'var(--muted)'}}>Certifications OK</span>}</div>
            </div>
          </div>
        </aside>

        <main style={{flex:1}}>
          <h1 style={{fontFamily:'Space Grotesk',marginTop:0}}>{emp.name}</h1>
          <div style={{display:'flex',gap:18,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
            <div style={{padding:'6px 8px',background:'var(--panel)',borderRadius:6}}>Team: <strong>{emp.team || '—'}</strong></div>
            <div style={{padding:'6px 8px',background:'var(--panel)',borderRadius:6}}>Category: <strong>{emp.category || '—'}</strong></div>
            <div style={{padding:'6px 8px',background:'var(--panel)',borderRadius:6}}>Role: <strong>{emp.role || '—'}</strong></div>
          </div>

          <section style={{marginBottom:18}}>
            <h3>Skills & proficiencies</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12,alignItems:'start'}}>
              <div>
                {skills.length ? (
                  <ul style={{listStyle:'none',padding:0,margin:0}}>
                    {skills.map(s=>{
                      const isCritical = (derived?.skillsWithRisk || []).some(sw => sw.skill.name === s.skill && sw.holderCount <= 2)
                      return (
                        <li key={s.skill} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px dashed var(--hairline)'}}>
                          <div>
                            <div style={{fontWeight:600}}>{s.skill}</div>
                            <div style={{fontSize:12,color:'var(--muted)'}}>{s.proficiency} • rating {s.rating || '—'}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{background:'var(--panel)',padding:'4px 6px',borderRadius:6,color:proficiencyColor(s.proficiency)}}>{s.proficiency}</div>
                            <div style={{fontSize:12,marginTop:6}}>{isCritical ? <span style={{color:'var(--critical)'}}>Critical single-holder skill</span> : <span style={{color:'var(--muted)'}}>&nbsp;</span>}</div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : <p style={{color:'var(--muted)'}}>No skills recorded for this employee.</p>}
              </div>

              <aside style={{background:'var(--panel)',padding:12,borderRadius:8}}>
                <div style={{fontWeight:600,marginBottom:8}}>Suggested development</div>
                {skills.length ? (
                  <div>
                    <div style={{marginBottom:8}}>Upskill opportunities based on current profile:</div>
                    <ul style={{margin:0,paddingLeft:16}}>
                      {(skills.filter(s=>/beginner/i.test(s.proficiency)).map(s=>s.skill)).slice(0,3).map(skill => <li key={skill}>{skill} — recommend mentoring / targeted course</li>)}
                    </ul>
                    <div style={{marginTop:8}}>
                      <div style={{fontWeight:600}}>Related initiatives</div>
                      <ul style={{margin:0,paddingLeft:16}}>
                        {matchedInitiatives.length ? matchedInitiatives.map(i=> <li key={i.id}>{i.label} — target {i.timeframe}</li>) : <li style={{color:'var(--muted)'}}>No direct initiative matches</li>}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{color:'var(--muted)'}}>Recommend baseline skills assessment and onboarding checklist.</div>
                )}
              </aside>
            </div>
          </section>

          <section>
            <h3>Notes & next steps</h3>
            <p style={{color:'var(--muted)'}}>Add private notes or coaching items here (not yet implemented).</p>
            <ul>
              <li>Consider pairing with an expert on critical skills.</li>
              <li>Schedule a 1:1 to confirm training interests.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}
