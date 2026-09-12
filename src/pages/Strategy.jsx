import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStrategy } from '../contexts/StrategyContext'
import './Strategy.css'

function deadline(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { label: 'No deadline set', tone: 'muted' }
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return { label: 'No deadline set', tone: 'muted' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((date - today) / 86400000)
  return { label: days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`, tone: days < 0 ? 'critical' : days <= 30 ? 'warning' : 'primary' }
}
const priorities = { 1: 'Standard', 2: 'High', 3: 'Critical' }

function GoalForm({ goal = {}, onSave, onCancel }) {
  const [text, setText] = useState(goal.text || '')
  const [date, setDate] = useState(/^\d{4}-\d{2}-\d{2}$/.test(goal.targetDate || '') ? goal.targetDate : '')
  const [priority, setPriority] = useState(goal.priority || 1)
  const [roles, setRoles] = useState((goal.relevantRoles || []).join('\n'))
  const [skills, setSkills] = useState((goal.qualifyingSkills || []).join('\n'))
  const lines = value => [...new Set(value.split('\n').map(item => item.trim()).filter(Boolean))]
  return <form className="strategy-form" onSubmit={event => { event.preventDefault(); if (text.trim()) onSave({ ...goal, id: goal.id || crypto.randomUUID(), text: text.trim(), targetDate: date, priority: Number(priority), relevantRoles: lines(roles), qualifyingSkills: lines(skills) }) }}>
    <label>What do you want to achieve?<textarea autoFocus required maxLength={1000} rows={3} value={text} onChange={event => setText(event.target.value)} placeholder="e.g. Certify every production line for food safety" /></label>
    <div className="strategy-form-fields"><label>Target date <span>optional</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Priority<select value={priority} onChange={event => setPriority(event.target.value)}>{Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    <fieldset className="strategy-readiness-fields"><legend>Workforce readiness criteria</legend><p>Overview measures employees in these roles who have at least one of these skills. Use exact names from your workforce records, one per line.</p><label>Relevant roles<textarea rows={3} value={roles} onChange={event => setRoles(event.target.value)} placeholder="Quality Technician" /></label><label>Qualifying skills<textarea rows={3} value={skills} onChange={event => setSkills(event.target.value)} placeholder="HACCP Food Safety" /></label></fieldset>
    <div className="strategy-actions"><button type="submit" className="strategy-primary" disabled={!text.trim()}>Save goal</button><button type="button" onClick={onCancel}>Cancel</button></div>
  </form>
}
function GoalCard({ goal, onSave, onRemove }) {
  const [editing, setEditing] = useState(false)
  const due = deadline(goal.targetDate)
  return <article className="strategy-goal">
    {editing ? <GoalForm goal={goal} onSave={updated => { onSave(updated); setEditing(false) }} onCancel={() => setEditing(false)} /> : <>
      <div className="strategy-goal-meta"><span className={`strategy-priority p${goal.priority || 1}`}>{priorities[goal.priority] || 'Standard'} priority</span><span className={`strategy-deadline ${due.tone}`}>{due.label}</span></div>
      <h3>{goal.text}</h3><p className="strategy-criteria-note">{goal.relevantRoles?.length && goal.qualifyingSkills?.length ? `${goal.relevantRoles.length} roles · ${goal.qualifyingSkills.length} qualifying skills linked to Overview` : 'Add roles and skills to measure readiness in Overview'}</p>
      <footer><span className="strategy-mono">{goal.targetDate && goal.targetDate !== 'TBD' ? new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add a date to track urgency'}</span><div><button onClick={() => setEditing(true)} aria-label={`Edit goal: ${goal.text}`}>Edit</button><button className="strategy-remove" onClick={onRemove} aria-label={`Remove goal: ${goal.text}`}>Remove</button></div></footer>
    </>}
  </article>
}
function GoalSection({ title, subtitle, number, goals, onChange }) {
  const [adding, setAdding] = useState(false)
  return <section className="strategy-section">
    <header className="strategy-section-heading"><div className="strategy-section-icon">{number}</div><div><h2>{title} <span>{goals.length}</span></h2><p>{subtitle}</p></div></header>
    <div className="strategy-goals">{goals.map((goal, index) => <GoalCard key={`${index}-${goal.text}-${goal.targetDate}`} goal={goal} onSave={updated => onChange(goals.map((current, i) => i === index ? updated : current), 'Goal updated')} onRemove={() => onChange(goals.filter((_, i) => i !== index), 'Goal removed')} />)}</div>
    {!goals.length && !adding && <div className="strategy-empty"><strong>Give your team a direction</strong><p>Add an outcome you want the business to achieve.</p></div>}
    {adding ? <GoalForm onSave={goal => { onChange([...goals, goal], 'Goal added'); setAdding(false) }} onCancel={() => setAdding(false)} /> : <button className="strategy-add" onClick={() => setAdding(true)}>＋ Add a goal</button>}
  </section>
}
function Initiative({ initiative, onSave, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(initiative.text)
  return <div className="strategy-initiative">{editing ? <form onSubmit={event => { event.preventDefault(); if (text.trim()) { onSave({ ...initiative, text: text.trim() }); setEditing(false) } }}><input aria-label="Initiative description" autoFocus required value={text} onChange={event => setText(event.target.value)} /><button className="strategy-primary" disabled={!text.trim()}>Save</button><button type="button" onClick={() => setEditing(false)}>Cancel</button></form> : <><span className="strategy-initiative-mark" aria-hidden="true">↗</span><p>{initiative.text}</p><button onClick={() => { setText(initiative.text); setEditing(true) }} aria-label={`Edit initiative: ${initiative.text}`}>Edit</button><button className="strategy-remove" onClick={onRemove} aria-label={`Remove initiative: ${initiative.text}`}>Remove</button></>}</div>
}
export default function Strategy() {
  const { strategy, setStrategy } = useStrategy()
  const [initiative, setInitiative] = useState('')
  const [notice, setNotice] = useState('')
  const [undo, setUndo] = useState(null)
  const short = strategy.shortTermGoals || [], long = strategy.longTermGoals || [], initiatives = strategy.initiatives || []
  const goals = [...short, ...long]
  const dueSoon = goals.filter(goal => ['warning', 'critical'].includes(deadline(goal.targetDate).tone)).length
  function change(key, values, message) {
    setUndo({ key, values: strategy[key] || [] })
    setStrategy(previous => ({ ...previous, [key]: values }))
    setNotice(message)
  }
  return <div className="strategy-page">
    <header className="strategy-header"><div><span className="strategy-eyebrow">BUSINESS DIRECTION</span><h1>Set the direction.<br/><span>Align your people.</span></h1><p>Turn business ambitions into clear priorities for your workforce.</p></div><Link to="/overview" className="strategy-next">View strategy readiness <span>↗</span></Link></header>
    <div className="strategy-stats"><div><span className="strategy-mono">STRATEGIC GOALS</span><strong>{goals.length.toString().padStart(2, '0')}</strong><p>Across both planning horizons</p></div><div><span className="strategy-mono">ACTIVE INITIATIVES</span><strong>{initiatives.length.toString().padStart(2, '0')}</strong><p>Turning strategy into action</p></div><div><span className="strategy-mono">NEEDS ATTENTION</span><strong className={dueSoon ? 'strategy-attention' : ''}>{dueSoon.toString().padStart(2, '0')}</strong><p>Overdue or due within 30 days</p></div></div>
    <div className="strategy-workspace-heading"><h2>Manage your strategy</h2><span>Changes apply immediately · This session only</span></div>
    <div className="strategy-notice" role="status">{notice && <><span>✓ {notice}</span>{undo && <button onClick={() => { setStrategy(previous => ({ ...previous, [undo.key]: undo.values })); setNotice('Change undone'); setUndo(null) }}>Undo</button>}</>}</div>
    <div className="strategy-horizons"><GoalSection number="01" title="This year" subtitle="Near-term outcomes that need focus now." goals={short} onChange={(values, message) => change('shortTermGoals', values, message)} /><GoalSection number="02" title="1–3 years" subtitle="Long-term ambitions to build toward." goals={long} onChange={(values, message) => change('longTermGoals', values, message)} /></div>
    <section className="strategy-section strategy-initiatives"><header className="strategy-section-heading"><div className="strategy-section-icon">↗</div><div><h2>Strategic initiatives <span>{initiatives.length}</span></h2><p>The concrete programs that help your goals become reality.</p></div></header>
      {!initiatives.length && <p className="strategy-empty">Add your first initiative, such as cross-training or a new automation program.</p>}
      {initiatives.map((item, index) => <Initiative key={`${index}-${item.text}`} initiative={item} onSave={updated => change('initiatives', initiatives.map((current, i) => i === index ? updated : current), 'Initiative updated')} onRemove={() => change('initiatives', initiatives.filter((_, i) => i !== index), 'Initiative removed')} />)}
      <form className="strategy-initiative-add" onSubmit={event => { event.preventDefault(); if (initiative.trim()) { change('initiatives', [...initiatives, { text: initiative.trim() }], 'Initiative added'); setInitiative('') } }}><label htmlFor="new-initiative">Add an initiative</label><div><input id="new-initiative" required maxLength={1000} placeholder="e.g. Cross-train operators on HACCP and equipment maintenance" value={initiative} onChange={event => setInitiative(event.target.value)} /><button className="strategy-primary" disabled={!initiative.trim()}>＋ Add initiative</button></div></form>
    </section>
    <div className="strategy-guidance"><span className="strategy-section-icon">◎</span><div><strong>Your strategy informs every recommendation.</strong><p>Goals and initiatives help identify critical skill gaps and shape employee development plans.</p></div><Link to="/recommendations">View recommendations →</Link></div>
  </div>
}
