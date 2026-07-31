// Single source of truth for talking to the real CleanVillage AI backend.
// Nothing in this app should ever read bin/village/worker/notification data
// from anywhere except this client — no local arrays, no seeded demo
// objects. If VITE_API_URL is missing, we fail loudly instead of silently
// falling back to fake data.

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Intentionally visible in the console during setup — this is the most
  // common reason someone sees "nothing loads" after cloning the project.
  console.error(
    '[CleanVillage AI] VITE_API_URL is not set. Create a .env file (see .env.example) ' +
    'pointing at your deployed backend, e.g. VITE_API_URL=https://your-api.onrender.com'
  )
}

const TOKEN_KEY = 'cv_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

async function request(path, { method = 'GET', body, headers, skipAuth = false } = {}) {
  if (!API_URL) {
    throw new ApiError('Backend URL is not configured (VITE_API_URL missing).', 0)
  }

  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    // Expired/invalid token: clear it so the app falls back to the login
    // screen instead of quietly displaying nothing.
    if (res.status === 401) setToken(null)
    throw new ApiError(payload?.message || `Request failed (${res.status})`, res.status, payload)
  }

  return payload
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { API_URL, ApiError }
