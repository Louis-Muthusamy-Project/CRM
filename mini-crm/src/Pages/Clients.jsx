import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCRM } from '../CRMProvider'
import { Search, Plus, Eye, Users } from 'lucide-react'

// ── status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Active:   { color: '#4ade80', bg: 'rgba(74,222,128,0.10)'  },
  Inactive: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  Lead:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)'  },
  Prospect: { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {status}
    </span>
  )
}

// ── avatar initials ───────────────────────────────────────────────────────────

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(91,94,244,0.18)', color: '#9b9ef8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 600,
    }}>
      {initials}
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Clients() {
  const { state } = useCRM()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return state.clients
    return state.clients.filter(c => {
      const hay = `${c.clientName} ${c.companyName} ${c.email} ${c.phone} ${c.industry} ${c.status} ${c.notes}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, state.clients])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── top bar ── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '0.5px solid #1e1e24',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Clients</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>
            Manage your customer leads and convert them into clients.
          </div>
        </div>
        <Link to="/clients/new" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            background: '#5b5ef4', color: '#fff', border: 'none',
          }}>
            <Plus size={14} />
            Create Client
          </button>
        </Link>
      </div>

      {/* ── content ── */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* search + count row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#4a4a58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', background: 'var(--panel-bg)' }} />
            <input
              placeholder="Search clients..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px 8px 34px',
                background: '#141417', border: '0.5px solid #242428',
                borderRadius: 8, color: '#d8d8e0', fontSize: 13,
                fontFamily: 'inherit', outline: 'none',
                background: 'var(--panel-bg)',
              }}
            />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8,
            background: '#141417', border: '0.5px solid #242428',
            fontSize: 12, color: 'var(--stat-fg)', flexShrink: 0,
            background: 'var(--panel-bg)',
          }}>
            <Users size={13} color="#4a4a58" />
            {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* table */}
        <div style={{
          background: '#141417',
          border: '0.5px solid #242428',
          borderRadius: 12,
          overflow: 'auto',
          background: 'var(--panel-bg)',
        }}>
          <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #242428' }}>
                {['Client', 'Company', 'Email', 'Industry', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 10, fontWeight: 600, color: 'var(--stat-fg)',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--stat-fg)', fontSize: 13 }}>
                    No matching clients.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '0.5px solid #1a1a20' : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#7e7a7a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* client name + avatar */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={c.clientName} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--stat-fg)' }}>{c.clientName}</div>
                          {c.phone && (
                            <div style={{ fontSize: 11, color: 'var(--stat-fg)', marginTop: 1 }}>{c.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--stat-fg)' }}>{c.companyName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--stat-fg)' }}>{c.email || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--stat-fg)' }}>{c.industry || '—'}</td>

                    <td style={{ padding: '11px 14px' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      <Link to={`/clients/${c.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                          background: 'transparent', color: '#6b6b7a',
                          border: '0.5px solid #2a2a2e',
                          transition: 'color 0.12s, border-color 0.12s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#9b9ef8'; e.currentTarget.style.borderColor = 'rgba(91,94,244,0.4)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#6b6b7a'; e.currentTarget.style.borderColor = '#2a2a2e' }}
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}