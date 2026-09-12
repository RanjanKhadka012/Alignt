import fs from 'fs'
import path from 'path'

const file = path.resolve(process.cwd(), 'src/data/employees.json')
const raw = fs.readFileSync(file, 'utf8')
const data = JSON.parse(raw)

const skillPools = {
  'Maintenance': ['PLC diagnostics', 'Preventive maintenance scheduling', 'Hydraulic systems repair', 'Conveyor belt alignment', 'Welding to food-safe standards'],
  'Quality & Food Safety': ['Sanitation compliance', 'HACCP procedures', 'Statistical process control', 'Allergen control auditing', 'Metal detection calibration'],
  'Production': ['High-speed wrapper operation', 'Batch mixing procedures', 'Pallet automation handling', 'Standard line changeover'],
  'Warehouse & Logistics': ['Forklift operation', 'Warehouse management systems (WMS)', 'Inventory reconciliation', 'Cold-chain logistics', 'Pallet automation handling'],
  'R&D': ['Product formulation', 'Packaging engineering', 'Sensory evaluation', 'Regulatory labeling'],
  'Finance': ['Financial planning & analysis', 'Budget forecasting', 'Cost accounting'],
  'HR & Corporate Affairs': ['Talent acquisition', 'Compensation benchmarking', 'HRIS administration'],
  'IT': ['ERP administration (SAP)', 'Network security', 'Business intelligence tooling', 'SCADA systems support'],
  'Legal & Compliance': ['Contract review', 'Regulatory compliance tracking', 'Risk assessment'],
  'Marketing': ['Category marketing strategy', 'Digital marketing analytics', 'Brand campaign management'],
  'Foodservice Sales': ['Foodservice menu consulting', 'Customer relationship management', 'Contract negotiation'],
  'Category & Demand Planning': ['Demand forecasting', 'S&OP planning', 'Dashboarding (Power BI/Tableau)'],
  'Commercial Function': ['Customer relationship management']
}

const certMap = {
  'Maintenance': { name: 'PLC Technician Cert', code: 'PLC-TECH' },
  'Quality & Food Safety': { name: 'HACCP Level II', code: 'HACCP-II' },
  'Production': { name: 'HACCP Awareness', code: 'HACCP-A' },
  'Warehouse & Logistics': { name: 'Forklift Operator (OSHA)', code: 'FORK-OSHA' },
  'R&D': { name: 'Food Tech Certification', code: 'FT-1' },
  'Finance': { name: 'Financial Controls Certificate', code: 'FIN-CTRL' },
  'HR & Corporate Affairs': { name: 'HR Professional Certificate', code: 'HR-PRO' },
  'IT': { name: 'IT Security Certificate', code: 'IT-SEC' },
  'Legal & Compliance': { name: 'Compliance Fundamentals', code: 'COMP-1' },
  'Marketing': { name: 'Digital Marketing Cert', code: 'DM-1' },
  'Foodservice Sales': { name: 'Foodservice Sales Cert', code: 'FSS-1' },
  'Category & Demand Planning': { name: 'Demand Planning Cert', code: 'DP-1' }
}

function pickSkills(team, existing = []) {
  const pool = skillPools[team] || Object.values(skillPools).flat()
  const result = [...existing]
  let i = 0
  while (result.length < 2 && i < pool.length) {
    const candidate = pool[i]
    if (!result.find(s => s.skill === candidate)) {
      result.push({ skill: candidate, rating: 3, proficiency: 'Intermediate' })
    }
    i++
  }
  return result
}

function makeCert(team) {
  const def = certMap[team] || { name: 'General skills certificate', code: 'GEN-1' }
  const issued = '2024-01-01'
  const expires = '2027-01-01'
  return { name: def.name, issued, expires }
}

for (const emp of data) {
  if (!Array.isArray(emp.skills) || emp.skills.length === 0) {
    emp.skills = pickSkills(emp.team, [])
  } else if (emp.skills.length === 1) {
    emp.skills = pickSkills(emp.team, emp.skills)
  }

  if (!Array.isArray(emp.certifications) || emp.certifications.length === 0) {
    emp.certifications = [makeCert(emp.team)]
  }

  // normalize noCertsRecorded flag
  emp.noCertsRecorded = !(Array.isArray(emp.certifications) && emp.certifications.length > 0)
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
console.log('enriched', data.length, 'employees')
