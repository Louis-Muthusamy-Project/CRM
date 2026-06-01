const STORAGE_KEY = 'mini_crm_v1'

export const defaultState = {
  clients: [],
  tasks: [],
  activities: [],
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
  }
}

export function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}


