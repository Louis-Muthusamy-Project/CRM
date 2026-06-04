import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import axios from 'axios'
import { loadState, saveState } from './storage'
import { createId } from './lib/id'
import { getToken } from './auth'
import { requestQueue } from './requestQueue'

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

    case 'BOOTSTRAP': {
      return {
        ...state,
        ...action.payload,
        settings: {
          ...state.settings,
          ...(action.payload.settings || {}),
          profile: {
            ...state.settings.profile,
            ...((action.payload.settings || {}).profile || {}),
          },
        },
        clients: Array.isArray(action.payload.clients) ? action.payload.clients : [],
        tasks: Array.isArray(action.payload.tasks) ? action.payload.tasks : [],
        activities: Array.isArray(action.payload.activities) ? action.payload.activities : [],
      }
    }

    default:
      return state

  }
}

export function CRMProvider({ children }) {
  // Attach auth token for protected API calls (bootstrap + CRUD)
  useEffect(() => {
    const token = getToken()
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`
    else delete axios.defaults.headers.common.Authorization
  }, [])

  const [state, dispatch] = useReducer(reducer, null, () => loadState())





  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        // Snapshot localStorage state before overwriting it with DB bootstrap.
        const localSnapshot = loadState()

        const response = await axios.get('/api/bootstrap')
        if (response.data?.ok) {
          dispatch({ type: 'BOOTSTRAP', payload: response.data.state })

          // After bootstrap, migrate any missing items from localStorage into Mongo.
          const dbState = response.data.state || {}

          const dbClientIds = new Set((dbState.clients || []).map((c) => c.id).filter(Boolean))
          const dbTaskIds = new Set((dbState.tasks || []).map((t) => t.id).filter(Boolean))
          const dbActivityIds = new Set((dbState.activities || []).map((a) => a.id).filter(Boolean))

          const importClients = (localSnapshot.clients || []).filter((c) => c && c.id && !dbClientIds.has(c.id))
          const importTasks = (localSnapshot.tasks || []).filter((t) => t && t.id && !dbTaskIds.has(t.id))
          const importActivities = (localSnapshot.activities || []).filter((a) => a && a.id && !dbActivityIds.has(a.id))

          if (importClients.length || importTasks.length || importActivities.length) {
            const token = getToken()
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            // Queue imports with retry logic
            if (importClients.length) {
              requestQueue.enqueue({
                method: 'POST',
                url: '/api/import/clients',
                data: { clients: importClients },
                headers,
                onError: (error) => console.warn('Failed to import clients after retries', error),
              })
            }
            if (importTasks.length) {
              requestQueue.enqueue({
                method: 'POST',
                url: '/api/import/tasks',
                data: { tasks: importTasks },
                headers,
                onError: (error) => console.warn('Failed to import tasks after retries', error),
              })
            }
            if (importActivities.length) {
              requestQueue.enqueue({
                method: 'POST',
                url: '/api/import/activities',
                data: { activities: importActivities },
                headers,
                onError: (error) => console.warn('Failed to import activities after retries', error),
              })
            }

            // Refresh UI state from DB so the user immediately sees imported data.
            const refreshed = await axios.get('/api/bootstrap')
            if (refreshed.data?.ok) {
              dispatch({ type: 'BOOTSTRAP', payload: refreshed.data.state })
            }
          }
        }
      } catch (error) {
        console.warn('CRM backend bootstrap failed', error)
      }
    }

    loadInitialState()
  }, [])

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

      const activity = {
        id: createId('act'),
        type: 'client_created',
        description: `Client Created: ${client.clientName}`,
        dateTime: now,
        meta: { clientId: client.id },
      }
      dispatch({ type: 'ACTIVITY_ADD', payload: activity })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'POST',
        url: '/api/clients',
        data: client,
        headers,
        onError: (error) => console.warn('Failed to save client after retries', error),
      })

      requestQueue.enqueue({
        method: 'POST',
        url: '/api/activities',
        data: activity,
        headers,
        onError: (error) => console.warn('Failed to save activity after retries', error),
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

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'PUT',
        url: `/api/clients/${client.id}`,
        data: client,
        headers,
        onError: (error) => console.warn('Failed to update client after retries', error),
      })

      return client
    },


    deleteClient: async (id) => {
      dispatch({ type: 'CLIENT_DELETE', payload: id })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'DELETE',
        url: `/api/clients/${id}`,
        headers,
        onError: (error) => console.warn('Failed to delete client after retries', error),
      })
    },





    // Tasks
    createTask: async (data) => {
      const id = createId('task')
      const now = new Date().toISOString()
      const task = {
        id,
        title: data.title.trim(),
        startDate: data.startDate,
        description: data.description?.trim() || '',
        dueDate: data.dueDate,
        priority: data.priority,
        clientId: data.clientId,
        status: data.status,
        completedDate: data.status === 'Completed' ? (data.completedDate || new Date().toISOString()) : null,
        createdAt: now,
        updatedAt: now,
      }

      dispatch({ type: 'TASK_CREATE', payload: task })


      const activity = {
        id: createId('act'),
        type: 'task_assigned',
        description: `Task Assigned: ${task.title}`,
        dateTime: now,
        meta: { taskId: task.id, clientId: task.clientId },
      }
      dispatch({ type: 'ACTIVITY_ADD', payload: activity })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'POST',
        url: '/api/tasks',
        data: task,
        headers,
        onError: (error) => console.warn('Failed to save task after retries', error),
      })

      requestQueue.enqueue({
        method: 'POST',
        url: '/api/activities',
        data: activity,
        headers,
        onError: (error) => console.warn('Failed to save activity after retries', error),
      })

      return task
    },


    updateTask: async (data) => {
      const now = new Date().toISOString()
      const task = {
        ...data,
        title: (data.title ?? '').trim(),
        startDate: data.startDate,
        description: data.description?.trim() || '',
        dueDate: data.dueDate,
        priority: data.priority,
        clientId: data.clientId,
        status: data.status,
        // Preserve completedDate if present; backend will enforce correct value on status transitions.
        completedDate: data.completedDate ?? null,
        updatedAt: now,

      }

      dispatch({ type: 'TASK_UPDATE', payload: task })


      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'PUT',
        url: `/api/tasks/${task.id}`,
        data: task,
        headers,
        onError: (error) => console.warn('Failed to update task after retries', error),
      })

      return task
    },


    deleteTask: async (id) => {
      dispatch({ type: 'TASK_DELETE', payload: id })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'DELETE',
        url: `/api/tasks/${id}`,
        headers,
        onError: (error) => console.warn('Failed to delete task after retries', error),
      })
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

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'POST',
        url: '/api/activities',
        data: activity,
        headers,
        onError: (error) => console.warn('Failed to save activity after retries', error),
      })

      return activity
    },


    // Settings
    setTheme: async (theme) => {
      const updatedSettings = {
        ...state.settings,
        theme,
      }

      dispatch({ type: 'SET_THEME', payload: theme })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'PUT',
        url: '/api/settings',
        data: updatedSettings,
        headers,
        onError: (error) => console.warn('Failed to save settings after retries', error),
      })
    },


    updateProfile: async (profile) => {
      const updatedSettings = {
        ...state.settings,
        profile: {
          ...state.settings.profile,
          ...profile,
        },
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: profile })

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      requestQueue.enqueue({
        method: 'PUT',
        url: '/api/settings',
        data: updatedSettings,
        headers,
        onError: (error) => console.warn('Failed to update profile after retries', error),
      })
    },




  }), [state])

  return <CRMContext.Provider value={api}>{children}</CRMContext.Provider>
}

export function useCRM() {
  const ctx = useContext(CRMContext)
  if (!ctx) throw new Error('useCRM must be used within CRMProvider')
  return ctx
}

