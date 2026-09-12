import React, { createContext, useContext, useMemo } from 'react'
import { useWorkforce } from './WorkforceContext'
import { calculateReadiness, calculateOverallReadiness, talentConcentration } from '../utils/readiness'
import { useStrategy } from './StrategyContext'

const DerivedDataContext = createContext()

export function DerivedDataProvider({ children }){
  const { employees, skills, departments, roles } = useWorkforce()
  const { strategy } = useStrategy()

  const derived = useMemo(()=>{
    const skillHolders = {}
    skills.forEach(s=> skillHolders[s.id] = {skill: s, holders: []})
    employees.forEach(e=>{
      (e.skills||[]).forEach(es=>{
        if(skillHolders[es.skillId]){
          skillHolders[es.skillId].holders.push({ ...e, proficiency: es.proficiency, retirementEligible: !!e.retirementEligible })
        }
      })
    })

    const skillsWithRisk = Object.values(skillHolders).map(({skill, holders})=>{
      const holderCount = holders.length
      const retirementCount = holders.filter(h=>h.retirementEligible).length
      let risk = 'healthy'
      if(holderCount === 1 && retirementCount === 1) risk = 'critical'
      else if(retirementCount / Math.max(1,holderCount) >= 0.4 || holderCount < 3) risk = 'watch'
      return { skill, holders, holderCount, retirementCount, risk }
    })

    const criticalCount = skillsWithRisk.filter(s=>s.risk==='critical').length

    // department aggregation
    const deptMap = {}
    departments.forEach(d=> deptMap[d.id] = { ...d, headcount: 0, riskLevel: 'healthy' })
    employees.forEach(e=>{
      const did = e.departmentId
      if(!deptMap[did]) return
      deptMap[did].headcount = (deptMap[did].headcount || 0) + 1
    })

    // map skills risk into departments: if any critical skill holder in dept -> critical, else watch if any watch
    Object.values(skillHolders).forEach(({skill, holders, risk})=>{
      holders.forEach(h=>{
        const d = deptMap[h.departmentId]
        if(!d) return
        if(risk === 'critical') d.riskLevel = 'critical'
        else if(risk === 'watch' && d.riskLevel !== 'critical') d.riskLevel = 'watch'
      })
    })

    const departmentsWithRisk = Object.values(deptMap)

    // simple gap analysis placeholder
    const gaps = skillsWithRisk.map(s=>({ skillId: s.skill.id, gapScore: Math.max(0, 1 - s.holderCount/3) }))

    const namedEmployees = employees.map(employee => ({ ...employee, skills: (employee.skills || []).map(skill => ({ ...skill, skill: skill.skill || skills.find(item => item.id === skill.skillId)?.name })) }))
    const initiativeResults = [...(strategy.shortTermGoals || []), ...(strategy.longTermGoals || [])].map((goal, index) => {
      const objective = { ...goal, id: goal.id || `goal-${index}`, label: goal.text, relevantRoles: goal.relevantRoles || [], qualifyingSkills: goal.qualifyingSkills || [] }
      return { ...calculateReadiness(objective, namedEmployees), configured: !!objective.relevantRoles.length && !!objective.qualifyingSkills.length }
    })
    const overallReadiness = calculateOverallReadiness(initiativeResults.filter(item => item.configured))
    const criticalTalent = talentConcentration(namedEmployees)
    const documentationCoverage = roles.map(role => {
      const title = role.title || role.role || role.name
      const holders = namedEmployees.filter(employee => employee.role === title)
      return { title, total: holders.length, missing: holders.filter(employee => !employee.skills.length).length }
    })
    return { initiativeResults, overallReadiness, criticalTalent, documentationCoverage, namedEmployees, skillsWithRisk, criticalCount, gaps, strategySummary: strategy, departmentsWithRisk }
  },[employees, skills, strategy, departments, roles])

  return (
    <DerivedDataContext.Provider value={derived}>
      {children}
    </DerivedDataContext.Provider>
  )
}

export function useDerivedData(){
  return useContext(DerivedDataContext)
}

export default DerivedDataContext
