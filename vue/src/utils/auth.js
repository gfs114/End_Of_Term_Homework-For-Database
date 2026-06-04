const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

function parseUser(value) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

export function saveAuthSession(token, user, remember) {
  clearAuthSession()

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''
}

export function getAuthUser() {
  return parseUser(localStorage.getItem(USER_KEY)) || parseUser(sessionStorage.getItem(USER_KEY))
}

export function updateAuthUser(user) {
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
