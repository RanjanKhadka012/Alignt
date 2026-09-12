import React from 'react'
import { useStrategy } from '../contexts/StrategyContext'
import { useDerivedData } from '../contexts/DerivedDataContext'

function MonoDate({d}){ return <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--muted)'}}>{d}</span> }

function GoalCard({goal}){
  const pr = goal.priority || 2
  const scale = 1 + ((pr - 1) * 0.12) // subtle size scale per priority
  const titleSize = 14 + (pr - 1) * 2
  const dotSize = 8 + (pr - 1) * 4
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 4px',marginBottom:6}}>
      <div style={{display:'flex',alignItems:'center',gap:12,flex:1}}>
        <div style={{width:dotSize,height:dotSize,borderRadius:999,background:'var(--accent)',opacity:0.9,flex:'0 0 auto'}} />
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:titleSize,marginBottom:2,color:'var(--text)'}}>{goal.text}</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>{goal.note || ''}</div>
        </div>
      </div>
      <div style={{marginLeft:12,display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
        <div style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--muted)'}}>{goal.targetDate}</div>
      </div>
    </div>
  )
}

export default function StrategyBanner(){
  const { strategy } = useStrategy()
  const derived = useDerivedData()

  const shortGoals = strategy?.shortTermGoals || []
  const longGoals = strategy?.longTermGoals || []

  return (
    <div className="card" style={{display:'flex',alignItems:'stretch',padding:18,marginBottom:20}}>
      <div style={{flex:1,display:'flex',gap:24}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
            <h3 style={{marginTop:0,marginBottom:6,letterSpacing:0.2}}>This year</h3>
            <div style={{fontSize:12,color:'var(--muted)'}}>{shortGoals.length} goals</div>
          </div>
          <div>
            {shortGoals.length===0 ? <div style={{color:'var(--muted)'}}>No short-term goals set.</div> : shortGoals.map((g,i)=>(<GoalCard key={i} goal={g} />))}
          </div>
        </div>

        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
            <h3 style={{marginTop:0,marginBottom:6,letterSpacing:0.2}}>1–3 years</h3>
            <div style={{fontSize:12,color:'var(--muted)'}}>{longGoals.length} goals</div>
          </div>
          <div>
            {longGoals.length===0 ? <div style={{color:'var(--muted)'}}>No long-term goals yet.</div> : longGoals.map((g,i)=>(<GoalCard key={i} goal={g} />))}
          </div>
        </div>
      </div>

      <div style={{width:200,borderLeft:'1px solid var(--hairline)',paddingLeft:16,display:'flex',flexDirection:'column',justifyContent:'center',gap:10}}>
        <div style={{fontSize:12,color:'var(--muted)'}}>Employee Count</div>
        <div style={{fontWeight:700,fontSize:20}}>{derived?.departmentsWithRisk?.reduce((acc,d)=>acc + (d.headcount||0),0) || 0}</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>Skills Mapped</div>
        <div style={{fontWeight:700,fontSize:20}}>{derived?.skillsWithRisk?.length || 0}</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>Strategy-critical Risks</div>
        <div style={{fontWeight:700,fontSize:20,color:'var(--critical)'}}>{derived?.criticalCount || 0}</div>
      </div>
    </div>
  )
}
