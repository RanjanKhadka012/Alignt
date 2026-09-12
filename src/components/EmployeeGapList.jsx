import React from 'react'

export default function EmployeeGapList({ employees, selectedId, onSelect, search, onSearch, reviewFor }) {
  const query = search.trim().toLowerCase()
  const filtered = employees.filter(employee => `${employee.name} ${employee.role}`.toLowerCase().includes(query))
  return <section className="recommendations-panel employee-gap-list" aria-label="Employee list">
    <h2>Employees <span className="recommendations-data">{employees.length}</span></h2>
    <label className="employee-search">Search by name or role<input type="search" value={search} onChange={event => onSearch(event.target.value)} placeholder="Find an employee…" /></label>
    <div className="employee-gap-rows">{filtered.map(employee => {
      const review = reviewFor(employee)
      const ready = review?.status === 'ready'
      const count = review?.gaps?.length || 0
      const severity = !ready ? 'unknown' : review.gaps.some(gap => gap.priority === 'critical') ? 'critical' : count ? 'recommended' : 'current'
      const label = ready ? count ? `${count} gap${count === 1 ? '' : 's'}` : 'current' : review?.status === 'error' ? 'retry needed' : review ? 'checking' : 'not checked'
      return <button key={employee.id} className={`employee-gap-row ${selectedId === employee.id ? 'selected' : ''}`} onClick={() => onSelect(employee.id)} aria-pressed={selectedId === employee.id}>
        <span><strong>{employee.name}</strong><span className="employee-gap-role">{employee.role}</span></span>
        <span className={`gap-badge recommendations-data ${severity}`}>{label}</span>
      </button>
    })}</div>
    {!filtered.length && <p className="recommendations-muted">No employees match your search.</p>}
  </section>
}
