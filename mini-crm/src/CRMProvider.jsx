import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadState, saveState } from './storage'
import { createId } from './lib/id'

const CRMContext = createContext(null)

function sortByDateDesc(a, b) {
  return new Date(b.dateTime || b.createdAt || 0) - new Date(a.dateTime || a.createdAt || 0)
}

function reducer(state, action) {
  switch (action.type) {

    case 'SET_THEME': {
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload },
      }
    }

    case 'UPDATE_PROFILE': {
      return {
        ...state,
        settings: {
          ...state.settings,
          profile: { ...state.settings.profile, ...action.payload },
        },
      }
    }

    case 'CLIENT_CREATE': {
      return {
        ...state,
        clients: [action.payload, ...state.clients],
      }
    }

    case 'CLIENT_UPDATE': {
      const updated = action.payload
      return {
        ...state,
        clients: state.clients.map((c) => (c.id === updated.id ? updated : c)),
      }
    }

    case 'CLIENT_DELETE': {
      const id = action.payload
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== id),
        tasks: state.tasks.filter((t) => t.clientId !== id),
      }
    }

    case 'TASK_CREATE': {
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      }
    }

    // Single unified case — handles all task updates including drag-and-drop status changes
    case 'TASK_UPDATE': {
      const updated = action.payload
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }
    }

    case 'TASK_DELETE': {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      }
    }

    case 'ACTIVITY_ADD': {
      return {
        ...state,
        activities: [action.payload, ...state.activities].sort(sortByDateDesc),
      }
    }

    default:
      return state
  }
}

export function CRMProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const theme = state?.settings?.theme || 'light'

    // Drive theme via CSS variables
    document.documentElement.dataset.theme = theme

    // Keep legacy Tailwind-style class for any existing `.dark` usage
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [state?.settings?.theme])


  const api = useMemo(() => ({
    state,

    // Clients
    createClient: async (data) => {
      const id = createId('client')
      const now = new Date().toISOString()
      const client = {
        id,
        clientName: data.clientName.trim(),
        companyName: data.companyName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '',
        industry: data.industry.trim(),
        status: data.status,
        notes: data.notes?.trim() || '',
        createdAt: now,
      }
      dispatch({ type: 'CLIENT_CREATE', payload: client })
      dispatch({
        type: 'ACTIVITY_ADD',
        payload: {
          id: createId('act'),
          type: 'client_created',
          description: `Client Created: ${client.clientName}`,
          dateTime: now,
          meta: { clientId: client.id },
        },
      })
      return client
    },

    updateClient: async (data) => {
      const now = new Date().toISOString()
      const client = {
        ...data,
        clientName: data.clientName.trim(),
        companyName: data.companyName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '',
        industry: data.industry.trim(),
        notes: data.notes?.trim() || '',
        updatedAt: now,
      }
      dispatch({ type: 'CLIENT_UPDATE', payload: client })
      return client
    },

    deleteClient: async (id) => {
      dispatch({ type: 'CLIENT_DELETE', payload: id })
    },

    // Tasks
    createTask: async (data) => {
      const id = createId('task')
      const now = new Date().toISOString()
      const task = {
        id,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        dueDate: data.dueDate,
        priority: data.priority,
        clientId: data.clientId,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      }
      dispatch({ type: 'TASK_CREATE', payload: task })
      dispatch({
        type: 'ACTIVITY_ADD',
        payload: {
          id: createId('act'),
          type: 'task_assigned',
          description: `Task Assigned: ${task.title}`,
          dateTime: now,
          meta: { taskId: task.id, clientId: task.clientId },
        },
      })
      return task
    },

    updateTask: async (data) => {
      const now = new Date().toISOString()
      const task = {
        ...data,
        title: (data.title ?? '').trim(),
        description: data.description?.trim() || '',
        dueDate: data.dueDate,
        priority: data.priority,
        clientId: data.clientId,
        status: data.status,
        updatedAt: now,
      }
      dispatch({ type: 'TASK_UPDATE', payload: task })
      return task
    },

    deleteTask: async (id) => {
      dispatch({ type: 'TASK_DELETE', payload: id })
    },

    // Activity
    addActivity: async (data) => {
      const id = createId('act')
      const activity = {
        id,
        type: data.type,
        description: data.description?.trim() || '',
        dateTime: data.dateTime || new Date().toISOString(),
        meta: data.meta || {},
      }
      dispatch({ type: 'ACTIVITY_ADD', payload: activity })
      return activity
    },

    // Settings
    setTheme: async (theme) => {
      dispatch({ type: 'SET_THEME', payload: theme })
    },

    updateProfile: async (profile) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: profile })
    },

  }), [state])

  return <CRMContext.Provider value={api}>{children}</CRMContext.Provider>
}

export function useCRM() {
  const ctx = useContext(CRMContext)
  if (!ctx) throw new Error('useCRM must be used within CRMProvider')
  return ctx
}