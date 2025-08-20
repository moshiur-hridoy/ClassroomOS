"use client"

import * as React from "react"
import { demoUsers, type Role, type User } from "@/lib/auth"

type AuthContextValue = {
  user: User | null
  loginAs: (role: Role) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("classroomos_user") : null
    if (raw) setUser(JSON.parse(raw))
  }, [])

  const loginAs = React.useCallback((role: Role) => {
    const u = demoUsers[role]
    setUser(u)
    if (typeof window !== "undefined") window.localStorage.setItem("classroomos_user", JSON.stringify(u))
  }, [])

  const logout = React.useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") window.localStorage.removeItem("classroomos_user")
  }, [])

  const value = React.useMemo(() => ({ user, loginAs, logout }), [user, loginAs, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


