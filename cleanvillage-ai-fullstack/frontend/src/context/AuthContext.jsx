import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/auth'
import { getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export const ROLES = {
  ADMIN: 'Administrator',
  OFFICER: 'Municipality Officer',
  WORKER: 'Waste Collection Worker',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Starts true: we don't know if the stored token is valid until /me
  // resolves, so routes must wait instead of bouncing to /login first.
  const [checkingSession, setCheckingSession] = useState(true)

  // On load, if a token is already stored, validate it against the real
  // backend and restore the session — never trust cached user data alone.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setCheckingSession(false)
      return
    }
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setCheckingSession(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: !!user, checkingSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
