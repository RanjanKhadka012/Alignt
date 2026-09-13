import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import aligntWordmark from '../assets/brand/2.png'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <Link className="logo" to="/overview" aria-label="Alignt home">
        <img src={aligntWordmark} alt="Alignt" width="1080" height="1080" />
      </Link>
      <nav>
        <NavLink to="/overview" className="nav-item">Overview</NavLink>
        <NavLink to="/strategy" className="nav-item">Strategy</NavLink>
        <NavLink to="/risk-map" className="nav-item">Skills → Employees</NavLink>
        <NavLink to="/recommendations" className="nav-item">Recommendations</NavLink>
        <NavLink to="/matching" className="nav-item">Matching</NavLink>
        <NavLink to="/employees" className="nav-item">Employees</NavLink>
      </nav>
    </aside>
  )
}
