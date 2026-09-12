import React from 'react'
import { useStrategy } from '../contexts/StrategyContext'

export default function StrategyCard(){
  const { strategy } = useStrategy()
  return (
    <div className="card">
      <h3 style={{margin:'0 0 8px 0'}}>Strategy Snapshot</h3>
      <div style={{fontSize:13,color:'var(--muted)'}}>This year</div>
      <ul>
        {strategy.shortTermGoals.map((g,i)=>(<li key={i}>{g.text} — {g.targetDate}</li>))}
      </ul>
      <div style={{fontSize:13,color:'var(--muted)'}}>1–3 years</div>
      <ul>
        {strategy.longTermGoals.map((g,i)=>(<li key={i}>{g.text} — {g.targetDate}</li>))}
      </ul>
    </div>
  )
}
