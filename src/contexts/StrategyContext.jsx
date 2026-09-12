import React, { createContext, useState, useContext } from 'react'

const StrategyContext = createContext()

const initialStrategy = {
  shortTermGoals: [
    { text: 'Improve plant food-safety certification', targetDate: '2026-12-31', priority: 3 },
    { text: 'Automate cold-chain logistics', targetDate: '2026-09-30', priority: 2 }
  ],
  longTermGoals: [
    { text: 'Achieve zero-safety incidents across plants', targetDate: '2029-12-31', priority: 3 }
  ],
  initiatives: [
    { text: 'Cross-train operators on HACCP and equipment maintenance' }
  ]
}

export function StrategyProvider({ children }){
  const [strategy, setStrategy] = useState(initialStrategy)
  return (
    <StrategyContext.Provider value={{strategy, setStrategy}}>
      {children}
    </StrategyContext.Provider>
  )
}

export function useStrategy(){
  return useContext(StrategyContext)
}

export default StrategyContext
