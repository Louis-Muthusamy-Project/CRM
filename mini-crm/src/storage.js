const STORAGE_KEY = 'mini_crm_v1'
const USER_PROFILE_KEY = 'mini_crm_user_profile'

export const defaultState = {
  clients: [],
  tasks: [],
  activities: [],
  projects: [],
  settings: {
    theme: 'light',
    profile: {
      name: '',
      email: '',
      role: '',
      profileImageUrl: '',
    },
  },
}


function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return structuredClone(defaultState)

  const parsed = safeParse(raw, null)
  if (!parsed || typeof parsed !== 'object') return structuredClone(defaultState)

  return {
    ...structuredClone(defaultState),
    ...parsed,
    settings: {
      ...structuredClone(defaultState.settings),
      ...(parsed.settings || {}),
      profile: {
        ...structuredClone(defaultState.settings.profile),
        ...((parsed.settings || {}).profile || {}),
      },
    },
    clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
  }
}


export function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  
  // Also save user profile separately for faster access
  if (state.settings && state.settings.profile) {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(state.settings.profile))
  }
}

/**
 * Load user profile from storage
 * Falls back to profile in main state if not found separately
 */
export function loadUserProfile() {
  try {
    const profileRaw = window.localStorage.getItem(USER_PROFILE_KEY)
    if (profileRaw) {
      const parsed = JSON.parse(profileRaw)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load user profile from separate storage:', e)
  }

  // Fallback to profile in main state
  const state = loadState()
  return state.settings?.profile || defaultState.settings.profile
}

/**
 * Save user profile separately for persistence
 */
export function saveUserProfile(profile) {
  try {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
  } catch (e) {
    console.error('Failed to save user profile:', e)
  }
}

/**
 * Verify all data is stored correctly
 */
export function verifyStoredData() {
  const result = {
    valid: true,
    issues: [],
  }

  try {
    const state = loadState()

    // Check if main state key exists
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      result.valid = false
      result.issues.push('Main storage key not found')
    }

    // Check collections
    if (!Array.isArray(state.clients)) result.issues.push('Clients not an array')
    if (!Array.isArray(state.tasks)) result.issues.push('Tasks not an array')
    if (!Array.isArray(state.activities)) result.issues.push('Activities not an array')
    if (!Array.isArray(state.projects)) result.issues.push('Projects not an array')
    if (!state.settings || typeof state.settings !== 'object') result.issues.push('Settings invalid')

    // Try loading profile
    const profile = loadUserProfile()
    if (!profile || typeof profile !== 'object') result.issues.push('User profile invalid')

    if (result.issues.length > 0) result.valid = false

    return result
  } catch (e) {
    result.valid = false
    result.issues.push(`Verification error: ${e.message}`)
    return result
  }
}

