import React from 'react'
import StrategyBanner from '../components/StrategyBanner'
import CategoryConstellation from '../components/CategoryConstellation'
import TopCapabilityRisks from '../components/TopCapabilityRisks'
import { useWorkforce } from '../contexts/WorkforceContext'
import { useDerivedData } from '../contexts/DerivedDataContext'

export default function Overview(){
  const { employees, skills } = useWorkforce()
  const derived = useDerivedData()

  return (
    <div>
      <h1 style={{fontFamily:'Space Grotesk',marginTop:0}}>Overview — Command Center</h1>
      <StrategyBanner />

      <TopCapabilityRisks />

      <div style={{marginTop:8}}>
        <h2 style={{fontFamily:'Space Grotesk'}}>Organization</h2>
        <p style={{color:'var(--muted)',marginTop:0,marginBottom:8}}>High-level categories: Corporate, Commercial, Plant-floor — click a circle to view people.</p>
        <CategoryConstellation />
      </div>
    </div>
  )
}
