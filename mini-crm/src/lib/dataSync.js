/**
 * Data Synchronization & Verification Utility
 * Ensures data consistency between local storage and database
 */

import axios from 'axios'

const SYNC_LOG_KEY = 'mini_crm_sync_log'
const LAST_SYNC_KEY = 'mini_crm_last_sync'

/**
 * Log sync events for debugging
 */
function addSyncLog(event) {
  try {
    const logs = JSON.parse(localStorage.getItem(SYNC_LOG_KEY) || '[]')
    logs.push({
      timestamp: new Date().toISOString(),
      ...event,
    })
    // Keep last 100 logs
    if (logs.length > 100) logs.shift()
    localStorage.setItem(SYNC_LOG_KEY, JSON.stringify(logs))
  } catch (e) {
    console.error('Failed to log sync event:', e)
  }
}

/**
 * Verify data exists in local storage
 */
export function verifyLocalStorage() {
  const result = {
    exists: true,
    data: {},
    missing: [],
    errors: [],
  }

  try {
    const stored = localStorage.getItem('mini_crm_v1')
    if (!stored) {
      result.exists = false
      result.missing.push('Storage key "mini_crm_v1" not found')
      return result
    }

    const data = JSON.parse(stored)
    result.data = data

    // Check required collections
    const requiredCollections = ['clients', 'tasks', 'activities', 'projects', 'settings']
    for (const collection of requiredCollections) {
      if (!data.hasOwnProperty(collection)) {
        result.missing.push(`Collection "${collection}" missing from local storage`)
      } else if (collection !== 'settings' && !Array.isArray(data[collection])) {
        result.errors.push(`Collection "${collection}" is not an array`)
      }
    }

    // Validate settings structure
    if (data.settings && typeof data.settings === 'object') {
      if (!data.settings.profile) {
        result.missing.push('Settings.profile missing from local storage')
      }
    }

    return result
  } catch (e) {
    result.errors.push(`Failed to parse local storage: ${e.message}`)
    return result
  }
}

/**
 * Verify data exists in database via API
 */
export async function verifyDatabase() {
  const result = {
    connected: false,
    collections: {},
    errors: [],
  }

  try {
    const response = await axios.get('/api/bootstrap')
    if (!response.data?.ok) {
      result.errors.push('Bootstrap API returned ok: false')
      return result
    }

    result.connected = true
    const state = response.data.state || {}

    // Count items in each collection
    result.collections = {
      clients: (state.clients || []).length,
      tasks: (state.tasks || []).length,
      activities: (state.activities || []).length,
      projects: (state.projects || []).length,
    }

    return result
  } catch (e) {
    result.errors.push(`Database connection failed: ${e.message}`)
    return result
  }
}

/**
 * Compare local storage and database to find discrepancies
 */
export async function findDataDiscrepancies() {
  const result = {
    missingInDatabase: {},
    missingInLocalStorage: {},
    differences: [],
  }

  try {
    const localResult = verifyLocalStorage()
    if (localResult.errors.length > 0 || !localResult.exists) {
      throw new Error('Local storage verification failed')
    }

    const dbResponse = await axios.get('/api/bootstrap')
    if (!dbResponse.data?.ok) {
      throw new Error('Database verification failed')
    }

    const localData = localResult.data
    const dbState = dbResponse.data.state || {}

    // Check clients
    const localClientIds = new Set((localData.clients || []).map((c) => c.id).filter(Boolean))
    const dbClientIds = new Set((dbState.clients || []).map((c) => c.id).filter(Boolean))

    result.missingInDatabase.clients = Array.from(localClientIds).filter((id) => !dbClientIds.has(id))
    result.missingInLocalStorage.clients = Array.from(dbClientIds).filter((id) => !localClientIds.has(id))

    // Check tasks
    const localTaskIds = new Set((localData.tasks || []).map((t) => t.id).filter(Boolean))
    const dbTaskIds = new Set((dbState.tasks || []).map((t) => t.id).filter(Boolean))

    result.missingInDatabase.tasks = Array.from(localTaskIds).filter((id) => !dbTaskIds.has(id))
    result.missingInLocalStorage.tasks = Array.from(dbTaskIds).filter((id) => !localTaskIds.has(id))

    // Check activities
    const localActivityIds = new Set((localData.activities || []).map((a) => a.id).filter(Boolean))
    const dbActivityIds = new Set((dbState.activities || []).map((a) => a.id).filter(Boolean))

    result.missingInDatabase.activities = Array.from(localActivityIds).filter(
      (id) => !dbActivityIds.has(id),
    )
    result.missingInLocalStorage.activities = Array.from(dbActivityIds).filter(
      (id) => !localActivityIds.has(id),
    )

    // Check projects
    const localProjectIds = new Set((localData.projects || []).map((p) => p.id).filter(Boolean))
    const dbProjectIds = new Set((dbState.projects || []).map((p) => p.id).filter(Boolean))

    result.missingInDatabase.projects = Array.from(localProjectIds).filter((id) => !dbProjectIds.has(id))
    result.missingInLocalStorage.projects = Array.from(dbProjectIds).filter((id) => !localProjectIds.has(id))

    addSyncLog({
      type: 'discrepancy_check',
      missingInDatabase: result.missingInDatabase,
      missingInLocalStorage: result.missingInLocalStorage,
    })

    return result
  } catch (e) {
    result.errors = [e.message]
    return result
  }
}

/**
 * Sync data from local storage to database
 */
export async function syncLocalToDatabase(state, headers = {}) {
  const result = {
    synced: {},
    failed: [],
  }

  try {
    // Sync clients
    if ((state.clients || []).length > 0) {
      try {
        await axios.post('/api/import/clients', { clients: state.clients || [] }, { headers })
        result.synced.clients = (state.clients || []).length
      } catch (e) {
        result.failed.push(`Clients sync failed: ${e.message}`)
      }
    }

    // Sync tasks
    if ((state.tasks || []).length > 0) {
      try {
        await axios.post('/api/import/tasks', { tasks: state.tasks || [] }, { headers })
        result.synced.tasks = (state.tasks || []).length
      } catch (e) {
        result.failed.push(`Tasks sync failed: ${e.message}`)
      }
    }

    // Sync activities
    if ((state.activities || []).length > 0) {
      try {
        await axios.post('/api/import/activities', { activities: state.activities || [] }, { headers })
        result.synced.activities = (state.activities || []).length
      } catch (e) {
        result.failed.push(`Activities sync failed: ${e.message}`)
      }
    }

    // Sync projects
    if ((state.projects || []).length > 0) {
      try {
        await axios.post('/api/import/projects', { projects: state.projects || [] }, { headers })
        result.synced.projects = (state.projects || []).length
      } catch (e) {
        result.failed.push(`Projects sync failed: ${e.message}`)
      }
    }

    // Sync settings
    if (state.settings) {
      try {
        await axios.put('/api/settings', state.settings, { headers })
        result.synced.settings = true
      } catch (e) {
        result.failed.push(`Settings sync failed: ${e.message}`)
      }
    }

    addSyncLog({
      type: 'local_to_db_sync',
      result,
    })

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())

    return result
  } catch (e) {
    result.failed.push(`Sync operation failed: ${e.message}`)
    return result
  }
}

/**
 * Get sync history
 */
export function getSyncHistory(limit = 10) {
  try {
    const logs = JSON.parse(localStorage.getItem(SYNC_LOG_KEY) || '[]')
    return logs.slice(-limit).reverse()
  } catch (e) {
    return []
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime() {
  return localStorage.getItem(LAST_SYNC_KEY) || null
}

/**
 * Clear all sync logs
 */
export function clearSyncLogs() {
  localStorage.removeItem(SYNC_LOG_KEY)
  localStorage.removeItem(LAST_SYNC_KEY)
}

/**
 * Generate comprehensive data verification report
 */
export async function generateVerificationReport() {
  const report = {
    timestamp: new Date().toISOString(),
    localStorage: verifyLocalStorage(),
    database: await verifyDatabase(),
    discrepancies: await findDataDiscrepancies(),
    syncHistory: getSyncHistory(5),
    lastSync: getLastSyncTime(),
  }

  return report
}
