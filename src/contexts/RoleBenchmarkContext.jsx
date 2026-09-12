import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { benchmarkRole, compareToProfile, createRoleCache, isFresh } from '../services/recommendations.mjs'

const RoleBenchmarkContext = createContext()
export const profileKey = (employee, strategy) => JSON.stringify([employee, strategy])
export function RoleBenchmarkProvider({ children }) {
  const [roleBenchmarks, setRoleBenchmarks] = useState({})
  const [reviews, setReviews] = useState({})
  const cache = useRef(null)
  const completed = useRef(new Map())
  const pending = useRef(new Map())
  if (!cache.current) cache.current = createRoleCache(benchmarkRole, (key, value) => setRoleBenchmarks(previous => ({ ...previous, [key]: value })))
  const getReview = useCallback((employee, strategy) => {
    const key = profileKey(employee, strategy)
    const cached = completed.current.get(key)
    if (cached && isFresh(cached.benchmark)) return Promise.resolve(cached)
    if (pending.current.has(key)) return pending.current.get(key)
    const update = state => setReviews(previous => ({ ...previous, [key]: state }))
    update({ status: 'benchmarking' })
    const promise = cache.current.get(employee.role).then(async benchmark => {
      update({ status: 'comparing', benchmark })
      const comparison = await compareToProfile(employee, benchmark, strategy)
      const review = { ...comparison, benchmark, status: 'ready' }
      completed.current.set(key, review); update(review)
      return review
    }).catch(error => { update({ status: 'error', error: error.message }); throw error }).finally(() => pending.current.delete(key))
    pending.current.set(key, promise)
    return promise
  }, [])
  return <RoleBenchmarkContext.Provider value={{ roleBenchmarks, reviews, getReview }}>{children}</RoleBenchmarkContext.Provider>
}
export const useRoleBenchmarks = () => useContext(RoleBenchmarkContext)
