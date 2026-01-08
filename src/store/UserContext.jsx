import { createContext, useContext, useEffect, useState } from 'react'
import { userService } from '../services/user.service'
import { sessionService } from '../services/session.service'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(userService.getLoggedinUser())
  const [userLoading, setUserLoading] = useState(true)

  // Always rehydrate on app load/refresh
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const fresh = await userService.getMe()
        if (!isMounted) return
        setUser(userService.saveLocalUser(fresh))
      } catch (err) {
        if (!isMounted) return
        if (err?.status === 401) {
          sessionService.clearSessionId()
          sessionStorage.removeItem('loggedinUser')
          setUser(null)
        } else {
          console.error('Failed to hydrate user', err)
        }
      } finally {
        if (isMounted) setUserLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  async function logout() {
    await sessionService.end('logout').catch(() => {})
    sessionService.clearSessionId()
    await userService.logout()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, userLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
