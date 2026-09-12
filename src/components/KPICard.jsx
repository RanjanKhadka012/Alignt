import React from 'react'

export default function KPICard({ title, value }){
  return (
    <div className="kpicard card">
      <div style={{fontSize:12,color:'var(--muted)'}}>{title}</div>
      <div style={{fontSize:22,fontWeight:600}}>{value}</div>
    </div>
  )
}
