import { useMemo, useState } from 'react'
import { useCRM } from '../CRMProvider'
import {
  FileText, Phone, Users, Bell,
  Plus, Clock, ChevronDown,
} from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { value: 'notes',    label: 'Notes',       Icon: FileText, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { value: 'calls',    label: 'Calls',       Icon: Phone,    color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  { value: 'meetings', label: 'Meetings',    Icon: Users,    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { value: 'followups',label: 'Follow-ups',  Icon: Bell,     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
]

function typeToActivityType(type) {
  if (type === 'followups') return 'followup_added'
  return type
}

function getMetaByType(type) {
  const key = type === 'followup_added' ? 'followups' : type
  return ACTIVITY_TYPES.find(t => t.value === key)
    ?? { label: type, Icon: FileText, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
}

function formatLabel(type) {
  const meta = getMetaByType(type)
  return meta.label
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  )
}

const inputStyle = {
  padding: '8px 12px',
  background: 'var(--panel-bg)',
  border: '0.5px solid #242428',
  borderRadius: 8,
  color: '#d8d8e0',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

// ── type selector ─────────────────────────────────────────────────────────────

function TypeSelector({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {ACTIVITY_TYPES.map(({ value: v, label, Icon, color, bg }) => {
        const active = value === v
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
              background: active ? bg : 'transparent',
              boxShadow: active ? `3px 3px 3px 3px ${color}40` : 'none',
              border: active ? `0.5px solid ${color}40` : '0.5px solid #242428',
              color: active ? color : '#4a4a58',
            }}
          >
            <Icon size={16} color={active ? color : '#333340'} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2px' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── history item ──────────────────────────────────────────────────────────────

function HistoryItem({ activity, isLast }) {
  const { Icon, color, bg, label } = getMetaByType(activity.type)
  return (
    <div className="activity-item" style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: 15, top: 32, bottom: -12,
          width: '0.5px', background: '#1e1e24',
        }} />
      )}

      {/* icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: bg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
      }}>
        <Icon size={13} color={color} />
      </div>

      {/* content */}
      <div style={{
        flex: 1, background: 'var(--panel-bg)', border: '0.5px solid #1e1e24',
        borderRadius: 8, padding: '10px 12px', marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color, letterSpacing: '0.2px' }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#333340' }}>
            <Clock size={10} color="#333340" />
            {relativeTime(activity.dateTime)}
          </div>
        </div>
        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#6b6b7a', lineHeight: 1.5 }}>
          {activity.description}
        </p>
      </div>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function ActivityTimeline() {
  const { state, addActivity } = useCRM()

  const [type, setType] = useState('notes')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [errors, setErrors] = useState({})

  const PAGE_SIZE = 5
  const [page, setPage] = useState(1)

  const history = useMemo(
    () => [...state.activities].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
    [state.activities]
  )

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE))

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return history.slice(start, start + PAGE_SIZE)
  }, [history, page])

  function submit() {
    const e = {}
    if (!description.trim()) e.description = 'Description is required.'
    setErrors(e)
    if (Object.keys(e).length) return
    addActivity({ type: typeToActivityType(type), description, dateTime: new Date(date).toISOString() })
    setDescription('')
    setErrors({})
    setPage(1)
  }

  // Keep page valid when history changes.
  if (page > totalPages) {
    setPage(totalPages)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── top bar ── */}
      <div style={{
        padding: '16px 24px', borderBottom: '0.5px solid #1e1e24',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Activity</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>Add notes, call logs, meetings, and follow-ups.</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--stat-fg)',
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--panel-bg)', border: '0.5px solid #242428',
        }}>
          <Clock size={13} color="#4a4a58" />
          {history.length} entries
        </div>
      </div>

      {/* ── content ── */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── add form ── */}
        <div style={{ background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--stat-fg)' }}>Add Activity</div>

          <Field label="Type">
            <TypeSelector value={type} onChange={setType} />
          </Field>

          <Field label="Date & Time">
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'var(--stat-fg)' }}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What happened?"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          <button
            onClick={submit}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              background: '#5b5ef4', color: '#fff', border: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={14} />
            Add Activity
          </button>
        </div>

        {/* ── history timeline ── */}
        <div style={{ background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--stat-fg)', marginBottom: 16 }}>History</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a0a0b0' }}>
              Page {page} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '6px 10px', borderRadius: 8,
                  border: '0.5px solid #242428',
                  background: page <= 1 ? 'transparent' : '#141417',
                  color: page <= 1 ? '#4a4a58' : '#d8d8e0',
                  fontSize: 12, fontWeight: 700,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '6px 10px', borderRadius: 8,
                  border: '0.5px solid #242428',
                  background: page >= totalPages ? 'transparent' : '#141417',
                  color: page >= totalPages ? '#4a4a58' : '#d8d8e0',
                  fontSize: 12, fontWeight: 700,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 520, paddingRight: 4 }} className="anim-list">
            {history.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--stat-fg)', padding: '20px 0', textAlign: 'center' }}>
                No history yet. Add your first activity.
              </div>
            ) : (
              paginatedHistory.map((a, i) => (
                <HistoryItem key={a.id} activity={a} isLast={i === paginatedHistory.length - 1 && page === totalPages} />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
