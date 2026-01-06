import { useEffect, useRef } from 'react'
import { useUser } from '../store/UserContext'
import { sessionService } from '../services/session.service'

const HEARTBEAT_INTERVAL_MS = 30_000

export function useSessionTracking() {
  const intervalIdRef = useRef(null)
  const startedRef = useRef(false)
  const { user } = useUser()
  const isAuthenticated = Boolean(user && user._id)

  useEffect(() => {
    let mounted = true
    let listenersAttached = false

    const cleanup = () => {
      stopHeartbeat()
      detachListeners()
    }

    const startSession = () => {
      if (!isAuthenticated) return
      if (startedRef.current) return
      startedRef.current = true
      sessionService.start().catch(() => {})
    }

    const stopHeartbeat = () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }

    const startHeartbeat = () => {
      if (!isAuthenticated) return
      stopHeartbeat()
      intervalIdRef.current = setInterval(() => {
        if (document.visibilityState !== 'visible') return
        if (!isAuthenticated) return
        sessionService.heartbeat({ path: window.location.pathname }).catch(() => {})
      }, HEARTBEAT_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      if (!isAuthenticated) return
      if (document.visibilityState === 'hidden') {
        stopHeartbeat()
        if (!isAuthenticated) return
        sessionService.end('hidden').catch(() => {})
        return
      }
      startSession()
      startHeartbeat()
    }

    const handlePageHide = () => {
      const sessionId = sessionService.getStoredSessionId()
      if (!isAuthenticated) {
        sessionService.clearSessionId()
        return
      }
      stopHeartbeat()
      sessionService.end('pagehide').catch(() => {})
      if (sessionId && navigator.sendBeacon) {
        navigator.sendBeacon('/api/session/end', JSON.stringify({ sessionId, reason: 'close' }))
      }
      sessionService.clearSessionId()
    }

    const attachListeners = () => {
      if (listenersAttached) return
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('pagehide', handlePageHide)
      listenersAttached = true
    }

    const detachListeners = () => {
      if (!listenersAttached) return
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      listenersAttached = false
    }

    if (!isAuthenticated) {
      cleanup()
      return () => {
        mounted = false
        cleanup()
      }
    }

    if (mounted) {
      startSession()
      startHeartbeat()
    }

    attachListeners()

    return () => {
      mounted = false
      cleanup()
    }
  }, [isAuthenticated])
}
