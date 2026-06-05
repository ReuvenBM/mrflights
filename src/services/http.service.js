const BASE_URL = import.meta.env.DEV && import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api'
export const httpService = { get, post, put, del }

export function getUserErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.userMessage || _getHttpUserMessage(err?.status, err?.data) || fallback
}

function get(resource, params) {
  const url = _buildUrl(resource)
  if (params) Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  return _request(url, { method: 'GET' })
}

function post(resource, data) {
  return _request(_buildUrl(resource), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

function put(resource, data) {
  return _request(_buildUrl(resource), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

function del(resource) {
  return _request(_buildUrl(resource), { method: 'DELETE' })
}

function _buildUrl(resource) {
  const path = `${BASE_URL}/${resource}`
  if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
    return new URL(path)
  }
  return new URL(path, window.location.origin)
}

async function _request(input, options) {
  let res
  try {
    res = await fetch(input, { credentials: 'include', ...options })
  } catch {
    const err = new Error('Server unavailable')
    err.userMessage = 'Unable to reach the server. Please check your connection and try again.'
    throw err
  }
  const isJson = res.headers.get('content-type')?.includes('application/json')
  if (!res.ok) {
    let parsed
    try {
      parsed = isJson ? await res.json() : await res.text()
    } catch {
      parsed = null
    }
    let msg
    if (res.status === 401) {
      msg = typeof parsed === 'string'
        ? parsed
        : parsed?.message || parsed?.error || 'Unauthorized'
    } else {
      msg = `HTTP ${res.status}${parsed ? ' | ' + (typeof parsed === 'string' ? parsed : JSON.stringify(parsed)) : ''}`
    }
    const err = new Error(msg)
    err.status = res.status
    err.data = parsed
    err.userMessage = _getHttpUserMessage(res.status, parsed)
    throw err
  }
  if (res.status === 204) return null
  return isJson ? await res.json() : await res.text()
}

function _getHttpUserMessage(status, data) {
  if (status === 401) return 'Please log in again to continue.'
  if (status === 403) return 'You do not have permission to do that.'
  const detail = _getErrorDetail(data)
  const validationMessage = _getValidationUserMessage(detail)
  if (validationMessage) return validationMessage
  if (status === 404 || _includesAny(detail, ['not found', 'no flight', 'missing flights data'])) {
    return 'No matching flight results were found. Try changing your route or dates.'
  }
  if (_includesAny(detail, ['api key', 'server error', 'request failed', 'malformed', 'unsupported cabin'])) {
    return 'Flight search is temporarily unavailable. Please try again later.'
  }
  if (status >= 400 && status < 500) return 'Please check your details and try again.'
  return 'Something went wrong on our side. Please try again.'
}

function _getErrorDetail(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  return data.error || data.message || data.err || ''
}

function _getValidationUserMessage(detail) {
  if (_includesAny(detail, ['origin', 'origins'])) return 'Choose a departure airport and try again.'
  if (_includesAny(detail, ['dest', 'destination', 'dests'])) return 'Choose a destination airport and try again.'
  if (_includesAny(detail, ['date', 'dates'])) return 'Choose at least one travel date and try again.'
  if (_includesAny(detail, ['runid'])) return 'The search did not start correctly. Please try again.'
  if (_includesAny(detail, ['firstname'])) return 'Enter your first name and try again.'
  if (_includesAny(detail, ['lastname'])) return 'Enter your last name and try again.'
  if (_includesAny(detail, ['email'])) return 'Enter a valid email address and try again.'
  return ''
}

function _includesAny(value, parts) {
  const lowerValue = String(value || '').toLowerCase()
  return parts.some((part) => lowerValue.includes(part))
}
