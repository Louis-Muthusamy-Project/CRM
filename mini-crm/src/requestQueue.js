/**
 * Request Queue with Retry Logic
 * Handles failed API calls with exponential backoff and persistence
 */

const QUEUE_STORAGE_KEY = 'crm_request_queue'
const MAX_RETRIES = 5
const INITIAL_BACKOFF_MS = 1000 // 1 second
const MAX_BACKOFF_MS = 30000 // 30 seconds

class RequestQueue {
  constructor() {
    this.queue = []
    this.processing = false
    this.timers = new Map()
    this.loadQueue()
  }

  loadQueue() {
    try {
      const stored = window.localStorage.getItem(QUEUE_STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load request queue from localStorage', error)
      this.queue = []
    }
  }

  saveQueue() {
    try {
      window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.warn('Failed to save request queue to localStorage', error)
    }
  }

  async enqueue(config) {
    const request = {
      id: `${Date.now()}_${Math.random()}`,
      config, // { method, url, data, onSuccess?, onError? }
      retries: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
    }

    this.queue.push(request)
    this.saveQueue()

    // Try immediately if not already processing
    if (!this.processing) {
      this.processQueue()
    }

    return request
  }

  calculateBackoff(retries) {
    const exponential = INITIAL_BACKOFF_MS * Math.pow(2, retries)
    const jitter = Math.random() * 1000 // 0-1s jitter
    const backoff = Math.min(exponential + jitter, MAX_BACKOFF_MS)
    return Math.floor(backoff)
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue[0]

      try {
        // Execute the request
        const response = await this.executeRequest(request)

        // Success: remove from queue and call callback
        this.queue.shift()
        this.saveQueue()

        if (request.config.onSuccess) {
          request.config.onSuccess(response)
        }

        console.log(`✓ Request succeeded after ${request.retries} retries:`, request.config.url)
      } catch (error) {
        request.retries += 1
        request.lastError = error.message

        if (request.retries >= MAX_RETRIES) {
          // Max retries exceeded: remove from queue and call error callback
          this.queue.shift()
          this.saveQueue()

          console.error(`✗ Request failed after ${MAX_RETRIES} retries:`, request.config.url, error)

          if (request.config.onError) {
            request.config.onError(error)
          }
        } else {
          // Schedule retry with backoff
          const backoff = this.calculateBackoff(request.retries)
          console.warn(
            `⟳ Request retry ${request.retries}/${MAX_RETRIES} in ${backoff}ms:`,
            request.config.url,
          )

          this.saveQueue()

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, backoff))
          // Continue loop to retry this request
        }
      }
    }

    this.processing = false
  }

  async executeRequest(request) {
    const { method = 'GET', url, data, headers = {} } = request.config

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  getQueueSize() {
    return this.queue.length
  }

  clearQueue() {
    this.queue = []
    this.saveQueue()
  }

  // Resume processing on network restore
  resumeProcessing() {
    if (!this.processing && this.queue.length > 0) {
      this.processQueue()
    }
  }
}

export const requestQueue = new RequestQueue()

// Resume on online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network restored, resuming request queue...')
    requestQueue.resumeProcessing()
  })
}
