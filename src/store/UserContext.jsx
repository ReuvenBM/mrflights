import { createContext, useContext, useEffect, useState } from 'react'
import { userService } from '../services/user.service'
import { sessionService } from '../services/session.service'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(userService.getLoggedinUser())

  // On mount, if we have a logged-in user but missing flightConfig, refresh from server
  useEffect(() => {
    if (!user?._id) return
    if (user.flightConfig) return
    ;(async () => {
      try {
        const fresh = await userService.getById(user._id)
        setUser(userService.saveLocalUser(fresh))
      } catch (err) {
        console.error('Failed to hydrate user', err)
      }
    })()
  }, [user?._id])

  async function logout() {
    await sessionService.end('logout').catch(() => {})
    sessionService.clearSessionId()
    await userService.logout()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
