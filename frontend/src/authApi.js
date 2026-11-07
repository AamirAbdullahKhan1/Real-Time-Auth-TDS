const base = import.meta.env.VITE_API_BASE_URL || '/api/auth'
const tokenKey = 'ironclad.session'

export function saveSession(token) {
  sessionStorage.setItem(tokenKey, token)
}

export function clearSession() {
  sessionStorage.removeItem(tokenKey)
}

export function hasSession() {
  return Boolean(sessionStorage.getItem(tokenKey))
}

export async function authRequest(path, { method = 'GET', body } = {}) {
  const token = sessionStorage.getItem(tokenKey)
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    const error = new Error(data?.error || 'The authentication service is unavailable.')
    error.status = response.status
    throw error
  }
  return data
}
