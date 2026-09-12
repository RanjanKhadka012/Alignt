import React from 'react'
import { useStrategy } from '../contexts/StrategyContext'
import { useDerivedData } from '../contexts/DerivedDataContext'

function MonoDate({d}){ return <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--muted)'}}>{d}</span> }

function daysRemaining(targetDate){
  try{
    const t = new Date(targetDate)
    const now = new Date()
    const diff = Math.ceil((t - now)/(1000*60*60*24))
    return diff
  }catch(e){return null}
}

function urgencyForDays(days){
  if(days <= 30) return 'critical'
  if(days <= 90) return 'watch'
  return 'healthy'
}

function GoalCard({goal, highlight}){
  const pr = goal.priority || 2
  const days = daysRemaining(goal.targetDate)
  const urgency = days!=null ? urgencyForDays(days) : 'healthy'
  const borderColor = urgency === 'critical' ? 'var(--critical)' : (urgency==='watch' ? 'var(--warning)' : 'var(--primary)')
  const titleSize = highlight ? 18 : 14 + (pr - 1) * 2
  const weight = highlight ? 800 : 600
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',marginBottom:8,borderLeft:`4px solid ${borderColor}`}}>
      <div style={{flex:1}}>
        <div style={{fontWeight:weight,fontSize:titleSize,marginBottom:6,color:'var(--text)'}}>{goal.text}</div>
        {goal.note ? <div style={{fontSize:12,color:'var(--muted)'}}>{goal.note}</div> : null}
      </div>
      <div style={{marginLeft:12,display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
        <div style={{fontFamily:'JetBrains Mono',fontSize:14,fontWeight:700,color:'var(--text)'}}>{days!=null ? `${Math.max(0,days)} days` : goal.targetDate}</div>
      </div>
    </div>
  )
}

export default function StrategyBanner(){
  const { strategy } = useStrategy()
  const derived = useDerivedData()

  const shortGoals = strategy?.shortTermGoals || []
  const longGoals = strategy?.longTermGoals || []
  // find nearest deadline across all goals
  const allGoals = [...shortGoals.map(g=>({...g, bucket:'short'})), ...longGoals.map(g=>({...g, bucket:'long'}))]
  const nearestGoal = allGoals.reduce((best,g)=>{
    const days = daysRemaining(g.targetDate)
    if(days==null) return best
    if(!best) return {goal:g, days}
    if(days < best.days) return {goal:g, days}
    return best
  }, null)

  return (
    <div className="card" style={{display:'flex',alignItems:'stretch',padding:18,marginBottom:20}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
        {/* Hero: nearest-deadline goal */}
        {nearestGoal ? (
          <div style={{padding:14,borderLeft:`6px solid ${urgencyForDays(nearestGoal.days) === 'critical' ? 'var(--critical)' : (urgencyForDays(nearestGoal.days) === 'watch' ? 'var(--warning)' : 'var(--primary)')}`,background:'rgba(255,255,255,0.01)',borderRadius:8}}>
            <div style={{fontSize:20,fontWeight:800,fontFamily:'Space Grotesk'}}>{nearestGoal.goal.text}</div>
            <div style={{fontSize:13,color:'var(--muted)',marginTop:6}}>Nearest deadline — <span style={{fontFamily:'JetBrains Mono',fontWeight:700}}>{`${Math.max(0,nearestGoal.days)} days`}</span></div>
          </div>
        ) : null}

      <div style={{flex:1,display:'flex',gap:24}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
            <h3 style={{marginTop:0,marginBottom:6,letterSpacing:0.2}}>This year</h3>
            <div style={{fontSize:12,color:'var(--muted)'}}>{shortGoals.length} {shortGoals.length===1? 'goal':'goals'}</div>
          </div>
          <div>
            {shortGoals.length===0 ? <div style={{color:'var(--muted)'}}>No short-term goals set.</div> : shortGoals.map((g,i)=>(<GoalCard key={i} goal={g} highlight={nearestGoal && nearestGoal.goal.text===g.text} />))}
          </div>
        </div>

        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
            <h3 style={{marginTop:0,marginBottom:6,letterSpacing:0.2}}>1–3 years</h3>
            <div style={{fontSize:12,color:'var(--muted)'}}>{longGoals.length} {longGoals.length===1? 'goal':'goals'}</div>
          </div>
          <div>
            {longGoals.length===0 ? <div style={{color:'var(--muted)'}}>No long-term goals yet.</div> : longGoals.map((g,i)=>(<GoalCard key={i} goal={g} highlight={nearestGoal && nearestGoal.goal.text===g.text} />))}
          </div>
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
