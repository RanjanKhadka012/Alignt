import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Strategy from './pages/Strategy'
import RiskMap from './pages/RiskMap'
import Recommendations from './pages/Recommendations'
import Matching from './pages/Matching'
import Employees from './pages/Employees'
import DepartmentDetail from './pages/DepartmentDetail'
import EmployeeProfile from './pages/EmployeeProfile'
import CategoryDetail from './pages/CategoryDetail'

export default function App(){
  class ErrorBoundary extends React.Component {
    constructor(props){ super(props); this.state = {error:null} }
    static getDerivedStateFromError(error){ return {error} }
    componentDidCatch(error, info){ console.error('ErrorBoundary caught', error, info) }
    render(){
      if(this.state.error) return (
        <div style={{padding:24,color:'var(--text)'}}>
          <h2>Something went wrong rendering the app</h2>
          <pre style={{whiteSpace:'pre-wrap',color:'#f88'}}>{this.state.error && this.state.error.toString()}</pre>
        </div>
      )
      return this.props.children
    }
  }

  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-area">
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview/>} />
          <Route path="/strategy" element={<Strategy/>} />
          <Route path="/departments/:deptId" element={<DepartmentDetail/>} />
          <Route path="/categories/:categoryId" element={<CategoryDetail/>} />
          <Route path="/risk-map" element={<RiskMap/>} />
          <Route path="/recommendations" element={<Recommendations/>} />
          <Route path="/matching" element={<Matching/>} />
          <Route path="/employees" element={<Employees/>} />
          <Route path="/employees/:employeeId" element={<EmployeeProfile/>} />
        </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
