const AUTH_STORAGE_KEY = 'mini_crm_auth_v1'

export function getAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuth(auth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getToken() {
  return getAuth()?.token ?? null
}

