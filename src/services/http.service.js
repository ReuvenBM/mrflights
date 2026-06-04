const BASE_URL = import.meta.env.DEV && import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api'
export const httpService = { get, post, put, del }

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
    throw new Error('Server unavailable')
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
    throw err
  }
  if (res.status === 204) return null
  return isJson ? await res.json() : await res.text()
}
