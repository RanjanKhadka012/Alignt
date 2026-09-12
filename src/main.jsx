import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { StrategyProvider } from './contexts/StrategyContext'
import { WorkforceProvider } from './contexts/WorkforceContext'
import { DerivedDataProvider } from './contexts/DerivedDataContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StrategyProvider>
      <WorkforceProvider>
        <DerivedDataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DerivedDataProvider>
      </WorkforceProvider>
    </StrategyProvider>
  </React.StrictMode>
)
