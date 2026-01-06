import { httpService } from './http.service'

const SESSION_KEY = 'mrflights_session_id'

export const sessionService = {
  getSessionId,
  getStoredSessionId,
  clearSessionId,
  start,
  heartbeat,
  end
}

function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = _makeId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

function getStoredSessionId() {
  return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
}

function clearSessionId() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}

function start() {
  const sessionId = getSessionId()
  return httpService.post('session/start', { sessionId })
}

function heartbeat(meta = {}) {
  const sessionId = getSessionId()
  return httpService.post('session/heartbeat', { sessionId, meta })
}

function end(reason) {
  const sessionId = getSessionId()
  return httpService.post('session/end', { sessionId, reason })
}

function _makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}
