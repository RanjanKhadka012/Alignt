import React, { useState } from 'react'
import { useStrategy } from '../contexts/StrategyContext'

function GoalsList({title, goals, onChange}){
  const [text, setText] = useState('')
  const [date, setDate] = useState('')
  function add(){
    if(!text) return
    onChange([...goals, { text, targetDate: date || 'TBD' }])
    setText(''); setDate('')
  }
  return (
    <div style={{flex:1}}>
      <h3 style={{marginTop:0}}>{title}</h3>
      <ul>
        {goals.map((g,i)=>(<li key={i}>{g.text} — <span style={{fontFamily:'JetBrains Mono'}}>{g.targetDate}</span></li>))}
      </ul>
      <div style={{display:'flex',gap:8}}>
        <input placeholder="Goal text" value={text} onChange={e=>setText(e.target.value)} style={{flex:1}} />
        <input placeholder="Target (Q2 2027)" value={date} onChange={e=>setDate(e.target.value)} style={{width:140}} />
        <button onClick={add}>Add</button>
      </div>
    </div>
  )
}

export default function Strategy(){
  const { strategy, setStrategy } = useStrategy()

  function updateShort(goals){ setStrategy({...strategy, shortTermGoals: goals}) }
  function updateLong(goals){ setStrategy({...strategy, longTermGoals: goals}) }
  function addInitiative(text){ setStrategy({...strategy, initiatives: [...(strategy.initiatives||[]), { text }]}) }

  return (
    <div>
      <h1 style={{fontFamily:'Space Grotesk'}}>Strategy Input</h1>
      <div style={{display:'flex',gap:20}}>
        <GoalsList title="This year" goals={strategy.shortTermGoals||[]} onChange={updateShort} />
        <GoalsList title="1–3 years" goals={strategy.longTermGoals||[]} onChange={updateLong} />
      </div>

      <div style={{marginTop:18}}>
        <h3>Initiatives</h3>
        <ul>
          {(strategy.initiatives||[]).map((it,i)=>(<li key={i}>{it.text}</li>))}
        </ul>
        <div style={{display:'flex',gap:8}}>
          <input id="init-text" placeholder="New initiative" style={{flex:1}} />
          <button onClick={()=>{const el=document.getElementById('init-text'); if(el && el.value){ addInitiative(el.value); el.value=''; }}}>Add</button>
        </div>
      </div>
    </div>
  )
}
