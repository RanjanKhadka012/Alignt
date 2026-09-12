import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="logo">Alignt</div>
      <nav>
        <NavLink to="/overview" className="nav-item">Overview</NavLink>
        <NavLink to="/strategy" className="nav-item">Strategy</NavLink>
        <NavLink to="/risk-map" className="nav-item">Risk Map</NavLink>
        <NavLink to="/recommendations" className="nav-item">Recommendations</NavLink>
        <NavLink to="/matching" className="nav-item">Matching</NavLink>
        <NavLink to="/employees" className="nav-item">Employees</NavLink>
      </nav>
    </aside>
  )
}
