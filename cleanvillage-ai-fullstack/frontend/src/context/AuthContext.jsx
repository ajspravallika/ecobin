import { createContext, useContext, useState } from 'react'
import { WORKERS } from '../data/workers'

const AuthContext = createContext(null)

export const ROLES = {
  ADMIN: 'Administrator',
  OFFICER: 'Municipality Officer',
  WORKER: 'Waste Collection Worker',
}

const DEMO_USERS = {
  [ROLES.ADMIN]: { name: 'A. Chandra Sekhar', title: 'System Administrator', workerId: null },
  [ROLES.OFFICER]: { name: 'K. Padmavathi', title: 'Municipal Sanitation Officer', workerId: null },
  [ROLES.WORKER]: { name: WORKERS[0].name, title: 'Waste Collection Worker', workerId: WORKERS[0].id },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cv_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (role, workerId) => {
    const base = DEMO_USERS[role]
    const resolvedWorker = role === ROLES.WORKER && workerId
      ? WORKERS.find((w) => w.id === workerId) || WORKERS[0]
      : null
    const profile = {
      role,
      name: resolvedWorker ? resolvedWorker.name : base.name,
      title: base.title,
      workerId: resolvedWorker ? resolvedWorker.id : base.workerId,
    }
    setUser(profile)
    localStorage.setItem('cv_user', JSON.stringify(profile))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cv_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
