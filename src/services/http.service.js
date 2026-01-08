const BASE_URL = '/api'
export const httpService = { get, post, put, del }

function get(resource, params) {
  const url = new URL(`${BASE_URL}/${resource}`, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  return _request(url, { method: 'GET' })
}

function post(resource, data) {
  return _request(`${BASE_URL}/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

function put(resource, data) {
  return _request(`${BASE_URL}/${resource}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

function del(resource) {
  return _request(`${BASE_URL}/${resource}`, { method: 'DELETE' })
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
