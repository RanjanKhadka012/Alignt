import React, { createContext, useState, useContext } from 'react'

import objectiveSeeds from '../data/initiatives.json'

const StrategyContext = createContext()

const goals = objectiveSeeds.map(objective => ({ ...objective, text: objective.label, priority: objective.priority || 1 }))
const initialStrategy = {
  shortTermGoals: goals.filter(goal => goal.timeframe === 'This year'),
  longTermGoals: goals.filter(goal => goal.timeframe !== 'This year'),
  initiatives: [],
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
