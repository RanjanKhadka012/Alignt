import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { StrategyProvider } from './contexts/StrategyContext'
import { WorkforceProvider } from './contexts/WorkforceContext'
import { RoleBenchmarkProvider } from './contexts/RoleBenchmarkContext'
import { DerivedDataProvider } from './contexts/DerivedDataContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StrategyProvider>
      <WorkforceProvider>
        <DerivedDataProvider>
          <RoleBenchmarkProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          </RoleBenchmarkProvider>
        </DerivedDataProvider>
      </WorkforceProvider>
    </StrategyProvider>
  </React.StrictMode>
)
