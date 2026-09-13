function getStatus(employee, now = new Date()) {
  const date = typeof employee.retirementDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(employee.retirementDate) ? new Date(`${employee.retirementDate}T00:00:00`) : null
  if (date && Number.isFinite(date.getTime())) {
    const today = new Date(now); today.setHours(0, 0, 0, 0)
    const days = Math.ceil((date - today) / 86400000)
    return { flagged: true, soon: days <= 365, label: days < 0 ? 'Retirement date passed — verify status' : days <= 365 ? 'Planned retirement within 12 months' : 'Planned retirement', days }
  }
  if (employee.retirementEligible === true) return { flagged: true, soon: false, label: 'Retirement eligible · timing unconfirmed' }
  return { flagged: false, soon: false, label: employee.retirementEligible === false ? 'Not currently retirement eligible' : 'Retirement status not recorded' }
}

export function retirementStatus(employee, now = new Date()) {
  const status = getStatus(employee, now)
  return { ...status, label: employee.retirementDemo ? `Demo scenario · ${status.label}` : status.label }
}
