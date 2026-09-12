import React, { useState } from 'react'
import Tooltip from './Tooltip'

export default function MatchedTeamNetwork({ employees, suggestedTeam = [], hasResult = false }) {
  const [tooltip, setTooltip] = useState(null)
  const matches = new Map()
  suggestedTeam.forEach(match => {
    const previous = matches.get(match.employeeId)
    matches.set(match.employeeId, { stretched: previous?.stretched || match.stretched, skills: [...(previous?.skills || []), match.matchedSkill] })
  })
  const columns = Math.max(3, Math.ceil(Math.sqrt(employees.length * 1.6)))
  const rows = Math.ceil(employees.length / columns)
  const height = Math.max(440, 190 + rows * 85)
  const nodes = employees.map((employee, i) => ({ employee, x: 65 + (i % columns) * (590 / Math.max(1, columns - 1)), y: 185 + Math.floor(i / columns) * 85, match: matches.get(employee.id) }))
  return <div className="matched-network">
    <svg viewBox={`0 0 720 ${height}`} role="img" aria-label={`Matched network: ${matches.size} of ${employees.length} employees selected. Team details follow.`}>
      {hasResult && nodes.filter(node => node.match).map((node, i) => <path key={`edge-${node.employee.id}`} d={`M360 68 Q${node.x} 110 ${node.x} ${node.y}`} fill="none" stroke={node.match.stretched ? 'var(--warning)' : 'var(--primary)'} strokeWidth="1.5" pathLength="1" className="matching-edge" style={{ animationDelay: `${i * 90}ms` }} />)}
      {hasResult && <g><circle cx="360" cy="58" r="30" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2"/><text x="360" y="63" textAnchor="middle" fill="var(--text)" className="matching-data">Goal</text></g>}
      {nodes.map(({ employee, x, y, match }, i) => <g key={employee.id} transform={`translate(${x},${y})`}>
        <circle r={match ? 10 : 4} fill={match ? (match.stretched ? 'var(--warning)' : 'var(--primary)') : 'var(--muted)'} opacity={match ? 1 : hasResult ? 0.16 : 0.4} className={match ? 'matching-node' : undefined} style={{ animationDelay: `${suggestedTeam.findIndex(m => m.employeeId === employee.id) * 90}ms` }} />
        <circle r="20" fill="transparent" tabIndex="0" role="img" aria-label={`${employee.name}, ${employee.role}, ${match ? match.skills.join(', ') + (match.stretched ? ', stretched' : '') : 'not selected'}`}
          onMouseEnter={event => setTooltip({ x: event.clientX, y: event.clientY, employee, match })}
          onMouseLeave={() => setTooltip(null)} onFocus={event => { const rect = event.currentTarget.getBoundingClientRect(); setTooltip({ x: rect.left, y: rect.top, employee, match }) }} onBlur={() => setTooltip(null)} />
        {match && <text y="28" textAnchor="middle" fill="var(--text)" fontSize="10" fontFamily="Inter, sans-serif">{employee.name.split(' ')[0]} {employee.name.split(' ').slice(-1)[0]?.[0]}.</text>}
      </g>)}
    </svg>
    <div className="matching-legend matching-data"><span><i />Matched</span><span><i className="stretched" />Stretched</span><span><i className="unmatched" />Other employees</span></div>
    {tooltip && <Tooltip x={Math.min(tooltip.x, window.innerWidth - 290)} y={Math.min(tooltip.y, window.innerHeight - 130)}><strong>{tooltip.employee.name}</strong><div>{tooltip.employee.role}</div><div>{tooltip.match ? tooltip.match.skills.join(', ') : 'Not selected'}{tooltip.match?.stretched ? ' — stretched*' : ''}</div></Tooltip>}
  </div>
}
