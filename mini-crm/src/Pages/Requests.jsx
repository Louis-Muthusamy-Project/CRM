import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCcw, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  Pending: { background: '#4338ca1a', color: '#818cf8' },
  Accepted: { background: '#16a34a1a', color: '#86efac' },
  Rejected: { background: '#f59e0b1a', color: '#facc15' },
  Failed: { background: '#dc26261a', color: '#fca5a5' },
}

function formatDateTime(value) {
  if (!value) return 'Pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Pending'
  return date.toLocaleString()
}

async function fetchRequests() {
  const response = await fetch('/api/external/requests')
  if (!response.ok) throw new Error('Failed to load requests')
  const body = await response.json()
  return body.requests || []
}

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortDesc, setSortDesc] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [processingRequestId, setProcessingRequestId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests
      .filter((request) => {
        if (statusFilter !== 'All' && request.requestStatus !== statusFilter) return false
        if (!q) return true
        return [
          request.clientName,
          request.companyName,
          request.email,
          request.phone,
          request.industry,
          request.status,
          request.errorMessage,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      })
      .sort((a, b) => {
        const first = new Date(a.submittedAt).getTime()
        const second = new Date(b.submittedAt).getTime()
        return sortDesc ? second - first : first - second
      })
  }, [requests, query, statusFilter, sortDesc])

  const refresh = async () => {
    setRefreshing(true)
    setRefreshError(null)
    try {
      const remoteRequests = await fetchRequests()
      setRequests(remoteRequests)
    } catch (err) {
      console.error(err)
      setRefreshError(err?.message || 'Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  const updateRequest = (requestId, patch) => {
    const next = requests.map((item) => (item.id === requestId ? { ...item, ...patch } : item))
    setRequests(next)
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(next.find((item) => item.id === requestId) || null)
    }
  }

  const rejectRequest = async (request) => {
    if (!request || processingRequestId) return
    setProcessingRequestId(request.id)
    try {
      const response = await fetch(`/api/external/requests/${request.id}/reject`, {
        method: 'POST',
      })
      const body = await response.json().catch(() => ({ error: 'Invalid JSON response' }))
      if (!response.ok) {
        throw new Error(body?.error || `HTTP ${response.status} ${response.statusText}`)
      }
      updateRequest(request.id, body.request)
    } catch (error) {
      console.error(error)
      updateRequest(request.id, {
        requestStatus: 'Failed',
        responseAt: new Date().toISOString(),
        responseBody: null,
        errorMessage: error?.message || 'Rejection failed',
      })
    } finally {
      setProcessingRequestId(null)
    }
  }

  const acceptRequest = async (request) => {
    if (!request || processingRequestId) return
    setProcessingRequestId(request.id)

    try {
      const response = await fetch(`/api/external/requests/${request.id}/accept`, {
        method: 'POST',
      })
      const body = await response.json().catch(() => ({ error: 'Invalid JSON response' }))
      if (!response.ok) {
        throw new Error(body?.error || `HTTP ${response.status} ${response.statusText}`)
      }
      updateRequest(request.id, body.request)
    } catch (error) {
      console.error(error)
      updateRequest(request.id, {
        requestStatus: 'Failed',
        responseAt: new Date().toISOString(),
        responseBody: null,
        errorMessage: error?.message || 'Approval failed',
      })
    } finally {
      setProcessingRequestId(null)
    }
  }

  const statusCounts = useMemo(
    () => ({
      All: requests.length,
      Pending: requests.filter((item) => item.requestStatus === 'Pending').length,
      Accepted: requests.filter((item) => item.requestStatus === 'Accepted').length,
      Rejected: requests.filter((item) => item.requestStatus === 'Rejected').length,
      Failed: requests.filter((item) => item.requestStatus === 'Failed').length,
    }),
    [requests],
  )

  return (
    <div className='anim-list' style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: '16px 24px', borderBottom: '0.5px solid #1e1e24', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Request Center</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>
            Review all requests submitted from App 2. Only accepted requests are added to the CRM database.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="group transition-all duration-300"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, border: '1px solid #2a2a2e',
              background: 'var(--panel-bg)', color: 'var(--stat-fg)', cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.65 : 1,
            }}
          >
            <span className={`inline-block transition-transform duration-500 ease-in-out 
                    ${refreshing ? 'animate-spin' : 'group-hover:-rotate-180'}`}>
              <RefreshCcw size={14} />
            </span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="bg-blue-100 text-blue-700 border border-blue-200 px-6 py-3 rounded-lg font-medium shadow-sm
               transition-all duration-300 ease-in-out
               hover:bg-blue-700 hover:text-white hover:border-blue-700
               hover:shadow-2xl hover:shadow-blue-500/60"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, border: '1px solid #2a2a2e',
              cursor: 'pointer',
            }}
          >
            Back to Clients
          </button>
        </div>
      </div>

      {refreshError && (
        <div style={{ margin: '16px 24px', padding: 16, borderRadius: 16, background: '#4b1d1d', color: '#fee2e2' }}>
          Refresh failed: {refreshError}
        </div>
      )}

      <div style={{ padding: '20px 24px', display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1.5fr 1fr 1fr', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by client, company, email, phone, industry"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid #2a2a2e', background: 'var(--panel-bg)', color: 'var(--stat-fg)', fontSize: 13 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #2a2a2e', background: 'var(--panel-bg)', color: 'var(--stat-fg)', fontSize: 13 }}
          >
            {['All', 'Pending', 'Accepted', 'Rejected', 'Failed'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDesc((prev) => !prev)}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #2a2a2e', background: 'var(--panel-bg)', color: 'var(--stat-fg)', cursor: 'pointer' }}
          >
            Sort: {sortDesc ? 'Newest' : 'Oldest'}
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {Object.entries(statusCounts).map(([label, count]) => (
            <div className='transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-blue-900'  key={label} style={{ borderRadius: 16, border: '1px solid #2a2a2e', background: 'var(--panel-bg)', padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stat-fg)' }}>{label}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700, color: 'var(--stat-fg)' }}>{count}</div>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 20, border: '1px solid #2a2a2e', background: 'var(--panel-bg)' }}>
          <table style={{ width: '100%', minWidth: 960, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2e' }}>
                {['Client', 'Company', 'Email', 'Phone', 'Industry', 'Submitted', 'Response', 'Status', ''].map((heading) => (
                  <th key={heading} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--stat-fg)' }}>
                    No requests found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((request) => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #2a2a2e' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13, fontWeight: 500 }}>{request.clientName}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{request.companyName}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{request.email}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{request.phone || '—'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{request.industry || '—'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{formatDateTime(request.submittedAt || request.createdAt)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--stat-fg)', fontSize: 13 }}>{formatDateTime(request.responseAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 700, background: STATUS_STYLES[request.requestStatus]?.background || '#334155', color: STATUS_STYLES[request.requestStatus]?.color || 'var(--stat-fg)' }}>
                        {request.requestStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 10, border: '1px solid #2a2a2e',
                          background: 'transparent', color: 'var(--stat-fg)', cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className='w-screen h-screen' style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className='overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ' style={{ width: '100%', height: '100%', maxWidth: 940, borderRadius: 24, background: 'var(--panel-bg)', border: '1px solid #2a2a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #2a2a2e' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{selectedRequest.clientName}</div>
                <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 4 }}>{selectedRequest.companyName}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="bg-red-400 text-red-700 border border-red-200 px-6 py-3 rounded-lg font-medium shadow-sm
               transition-all duration-300 ease-in-out
               hover:bg-red-700 hover:text-white hover:border-red-700
               hover:shadow-xl hover:shadow-red-500/60"
                style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid var(--stat-fg)', color: 'var(--stat-fg)', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            <div style={{ display: 'grid', gap: 18, padding: '24px' }}>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>Submitted</div>
                  <div style={{ marginTop: 8, color: 'var(--stat-fg)', fontSize: 14 }}>{formatDateTime(selectedRequest.submittedAt || selectedRequest.createdAt)}</div>
                </div>
                <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>Response</div>
                  <div style={{ marginTop: 8, color: 'var(--stat-fg)', fontSize: 14 }}>{formatDateTime(selectedRequest.responseAt)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ marginTop: 8, color: 'var(--stat-fg)', fontSize: 14 }}>{selectedRequest.requestStatus}</div>
                </div>
                <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>Error</div>
                  <div style={{ marginTop: 8, color: selectedRequest.errorMessage ? '#fda4af' : 'var(--stat-fg)', fontSize: 14, minHeight: 24 }}>{selectedRequest.errorMessage || 'No error'}</div>
                </div>
              </div>
              {selectedRequest.requestStatus === 'Pending' && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => acceptRequest(selectedRequest)}
                    disabled={processingRequestId === selectedRequest.id}
                    style={{
                      padding: '12px 18px', borderRadius: 12, border: '1px solid #2a2a2e',
                      background: '#16a34a', color: 'var(--stat-fg)', cursor: 'pointer', minWidth: 120,
                    }}
                  >
                    {processingRequestId === selectedRequest.id ? 'Approving…' : 'Accept Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectRequest(selectedRequest)}
                    disabled={processingRequestId === selectedRequest.id}
                    style={{
                      padding: '12px 18px', borderRadius: 12, border: '1px solid #2a2a2e',
                      background: '#f59e0b', color: 'var(--stat-fg)', cursor: 'pointer', minWidth: 120,
                    }}
                  >
                    Reject Request
                  </button>
                </div>
              )}
              <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>Payload</div>
                <pre style={{ marginTop: 12, padding: 16, borderRadius: 16, background: 'var(--panel-bg)', color: 'var(--stat-fg)', fontSize: 12, overflowX: 'auto' }}>
                  <h3>clientName: {selectedRequest.clientName}<br/>
                  companyName: {selectedRequest.companyName}<br/>
                  email: {selectedRequest.email}<br/>
                  phone: {selectedRequest.phone}<br/>
                  industry: {selectedRequest.industry}<br/>
                  status: {selectedRequest.status}<br/>
                  notes: {selectedRequest.notes}</h3>
                </pre>
              </div>
              <div style={{ borderRadius: 18, background: 'var(--panel-bg)', border: '1px solid #2a2a2e', padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--stat-fg)', textTransform: 'uppercase' }}>API Response</div>
                <pre style={{ marginTop: 12, padding: 16, borderRadius: 16, background: 'var(--panel-bg)', color: 'var(--stat-fg)', fontSize: 12, overflowX: 'auto' }}>{JSON.stringify(selectedRequest.responseBody || { message: 'No response recorded' }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
