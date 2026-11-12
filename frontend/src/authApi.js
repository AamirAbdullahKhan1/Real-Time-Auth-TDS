const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const base = configuredBase && /^https?:\/\/[^/]+$/i.test(configuredBase)
  ? configuredBase + '/api/auth'
  : configuredBase || '/api/auth'
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

export async function startVerification(path, body) {
  const challenge = await authRequest(path, { method: 'POST', body })
  if (typeof challenge.challengeId !== 'string' || !challenge.challengeId ||
      typeof challenge.email !== 'string' || !challenge.email) {
    throw new Error('The server did not start email verification. Check that the current backend is running.')
  }
  clearSession()
  return { challengeId: challenge.challengeId, email: challenge.email }
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
