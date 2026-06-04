import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCRM } from '../CRMProvider'
import TaskActions from './TaskActions'
import { Search, Plus, GripVertical, Calendar, User, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const TASK_STATUSES = ['Todo', 'In Progress', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High']

// Helper: Check if any active filters exist
const hasActiveFilters = (statusSelectedDate) => {
  return !!statusSelectedDate
}

const COLUMN_CONFIG = {
  Todo:       { label: 'Todo',     Icon: Clock,          accent: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  'In Progress': { label: 'In Progress', Icon: AlertCircle,    accent: '#fbbf24', bg: 'rgba(251,191,36,0.10)'  },
  Completed:     { label: 'Completed',   Icon: CheckCircle2,   accent: '#4ade80', bg: 'rgba(74,222,128,0.10)'  },
}

const PRIORITY_STYLES = {
  High:   { color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
  Medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)'  },
  Low:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)'  },
}

// ── sub-components ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
      background: s.bg, color: s.color, letterSpacing: '0.3px',
    }}>
      {priority}
    </span>
  )
}

function TaskCard({ task, client, draggingId, onDragStart, onDragEnd }) {
  const isDragging = draggingId === task.id
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className="task-card"
      style={{
        background: 'var(--panel-bg)',
        border: '0.5px solid #242428',
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.35 : 1,
        transition: 'opacity 0.15s, border-color 0.15s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={e => !isDragging && (e.currentTarget.style.borderColor = '#333340')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#242428')}
    >
      {/* drag handle + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <GripVertical size={14} color="#333340" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, fontWeight: 500, color: '#d8d8e0', lineHeight: 1.4, margin: 0, flex: 1 }}>
          {task.title}
        </p>
      {/* actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <TaskActions taskId={task.id} />
      </div>
      </div>

      {/* description */}
      {task.description && (
        <p style={{
          fontSize: 12, color: 'var(--stat-fg)', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
        <PriorityBadge priority={task.priority} />
        {client && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--stat-fg)' }}>
            <User size={10} color="#4a4a58" />
            {client.clientName}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {task.startDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--stat-fg)' }}>
              <Calendar size={10} color="var(--stat-fg)" />
              <span style={{ fontWeight: 600 }}>Start</span>
              <span>{task.startDate}</span>
            </span>
          )}
          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--stat-fg)' }}>
              <Calendar size={10} color="var(--stat-fg)" />
              <span style={{ fontWeight: 600 }}>Due</span>
              <span>{task.dueDate}</span>
            </span>
          )}
        </div>
      </div>

    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Tasks() {
  const { state, updateTask } = useCRM()


  const [query, setQuery] = useState('')
  const [priorityFilter, setPriority] = useState('all')

  const [view, setView] = useState('status') // 'status' | 'all'

  // All tasks date range filter (based on startDate)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Status view single selected date filter (matches task range inclusively)
  const [statusSelectedDate, setStatusSelectedDate] = useState('')



  const [draggingId, setDraggingId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  const filteredBase = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.tasks.filter(t => {
      const client = state.clients.find(c => c.id === t.clientId)
      const matchQ = !q || `${t.title} ${t.description} ${t.status} ${t.priority} ${client?.clientName ?? ''} ${client?.companyName ?? ''}`.toLowerCase().includes(q)
      const matchP = priorityFilter === 'all' || t.priority === priorityFilter
      return matchQ && matchP
    })
  }, [query, priorityFilter, state.clients, state.tasks])

  const filteredAllTasks = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null

    // Normalize the upper bound to end-of-day so users expect inclusive ranges.
    if (to) to.setHours(23, 59, 59, 999)

    const parseStart = (startDate) => {
      if (!startDate) return null
      // Expecting YYYY-MM-DD from <input type="date">; fallback to Date parsing.
      const d = new Date(startDate)
      return Number.isNaN(d.getTime()) ? null : d
    }

    return filteredBase
      .filter((t) => {
        const start = parseStart(t.startDate)
        if (!start) return false
        if (from && start < from) return false
        if (to && start > to) return false
        if (t.completedDate === start) return true ;else return false ;
        return true
      })
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0
        const db = b.startDate ? new Date(b.startDate).getTime() : 0
        return db - da
      })
  }, [filteredBase, fromDate, toDate])


  const handleDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move' }
  const handleDragEnd   = ()      => { setDraggingId(null); setDragOverCol(null) }
  const handleDrop      = (e, status) => {
    e.preventDefault()
    if (!draggingId) return
    const task = state.tasks.find(t => t.id === draggingId)
    if (task && task.status !== status) updateTask({ ...task, status })
    setDraggingId(null); setDragOverCol(null)
  }

  return (
    <div id="crm-page-title" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── top bar ── */}
      <div style={{
        padding: '16px 24px', borderBottom: '0.5px solid #1e1e24',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Tasks</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>Track work assigned to clients.</div>
        </div>
        <Link to="/tasks/new" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            background: '#5b5ef4', color: '#fff', border: 'none',
          }}>
            <Plus size={14} />
            Create Task
          </button>
        </Link>
      </div>

      {/* ── content ── */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* filters */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#4a4a58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              placeholder="Search tasks..."
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

          {/* priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriority(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8,
              background: '#141417', border: '0.5px solid #242428',
              color: priorityFilter === 'all' ? '#4a4a58' : '#d8d8e0',
              fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
              background: 'var(--panel-bg)',
            }}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* view tabs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: -4 }}>
          <button
            type="button"
            onClick={() => setView('status')}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: view === 'status' ? '0.5px solid #5b5ef4' : '0.5px solid #242428',
              background: view === 'status' ? 'rgba(91,94,244,0.14)' : 'transparent',
              color: view === 'status' ? '#c7c8ff' : '#a0a0b0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Task status
          </button>
          <button
            type="button"
            onClick={() => setView('all')}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: view === 'all' ? '0.5px solid #5b5ef4' : '0.5px solid #242428',
              background: view === 'all' ? 'rgba(91,94,244,0.14)' : 'transparent',
              color: view === 'all' ? '#c7c8ff' : '#a0a0b0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All tasks
          </button>
        </div>

        {view === 'status' ? (
          <>
      {/* status date filter (single selected date inside startDate..dueDate) */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)' }}>Selected date</label>
                <input
                  type="date"
                  value={statusSelectedDate}
                  onChange={e => setStatusSelectedDate(e.target.value)}
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--panel-bg)', border: '0.5px solid #242428',
                    color: 'var(--stat-fg)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setStatusSelectedDate('')}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '0.5px solid #242428',
                  background: 'transparent',
                  color: '#a0a0b0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear date
              </button>
            </div>


            {/* kanban board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

              {TASK_STATUSES.map(status => {
                const { label, Icon, accent, bg } = COLUMN_CONFIG[status]
                
                const colTasks = filteredBase
                  .filter(t => t.status === status)
                  .filter(t => {
                    const isFiltered = hasActiveFilters(statusSelectedDate)
                    // if (isFiltered && t.status === 'Completed')  return false
                    // if (t.CompletedDate === statusSelectedDate ) return true ; else return false ;
                    // console.log(isFiltered.completedDate.substring(0,5)  )                  
                    
                    if (!statusSelectedDate) return true

                    // Match if selected date is within [startDate, dueDate] inclusive.
                    // statusSelectedDate comes from <input type="date"> (YYYY-MM-DD).
                    const selected = new Date(statusSelectedDate)
                    selected.setHours(0, 0, 0, 0)

                    const start = t.startDate ? new Date(t.startDate) : null
                    const due = t.dueDate ? new Date(t.dueDate) : null

                    if (!start || Number.isNaN(start.getTime())) return false
                    if (!due || Number.isNaN(due.getTime())) return false

                    // Normalize boundaries for inclusive comparisons.
                    start.setHours(0, 0, 0, 0)
                    due.setHours(23, 59, 59, 999)

                    return start <= selected && selected <= due
                  })
                  .sort((a, b) => {
                    const da = a.startDate ? new Date(a.startDate).getTime() : 0
                    const db = b.startDate ? new Date(b.startDate).getTime() : 0
                    return da - db
                  })


                const isOver = dragOverCol === status

                return (
                  <div
                    key={status}
                    className="kanban-column"
                    onDragOver={e => { e.preventDefault(); setDragOverCol(status) }}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={e => handleDrop(e, status)}
                    style={{
                      background: 'var(--panel-bg)',
                      border: isOver ? `0.5px solid ${accent}` : '0.5px solid #242428',
                      borderRadius: 12,
                      padding: '14px 12px',
                      minHeight: 340,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'border-color 0.2s ease, box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: isOver ? `0 0 0 3px ${accent}22` : 'none',
                    }}
                  >
                    {/* column header */}
                <div className="anim-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '0.5px solid #1e1e24' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={13} color={accent} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#a0a0b0', letterSpacing: '0.3px' }}>{label}</span>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: bg, color: accent,
                      }}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* cards */}
                    <div className="anim-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      {colTasks.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <p style={{ fontSize: 12, color: '#2a2a2e', userSelect: 'none' }}>Drop tasks here</p>
                        </div>
                      ) : (
                        colTasks.map(t => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            client={state.clients.find(c => c.id === t.clientId)}
                            draggingId={draggingId}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>

            {/* all tasks filters */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a0a0b0' }}>From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--panel-bg)', border: '0.5px solid #242428',
                    color: 'var(--stat-fg)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a0a0b0' }}>To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--panel-bg)', border: '0.5px solid #242428',
                    color: 'var(--stat-fg)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => { setFromDate(''); setToDate('') }}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '0.5px solid #242428',
                  background: 'transparent',
                  color: '#a0a0b0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear dates
              </button>
            </div>

            {/* list */}
            <div style={{
              marginTop: 10,
              border: '0.5px solid #242428',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--panel-bg)',
            }}>
              <div className="anim-slide-left" style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr',
                gap: 10,
                padding: '12px 14px',
                borderBottom: '0.5px solid #1e1e24',
                color: '#a0a0b0',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.3px',
              }}>
                <div>Task</div>
                <div>Client</div>
                <div>Status</div>
                <div>Start date</div>
                <div>Due date</div>
              </div>

              <div className="anim-slide-left" style={{ padding: '10px 10px' }}>
                {filteredAllTasks.length === 0 ? (
                  <div style={{ padding: '22px 10px', color: '#2a2a2e', fontSize: 12, textAlign: 'center' }}>
                    No tasks found for selected filters.
                  </div>
                ) : (
                  filteredAllTasks.map(t => {
                    const client = state.clients.find(c => c.id === t.clientId)
                    return (
                      <div
                        key={t.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2.2fr 1fr 1fr 1fr',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '0.5px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ color: '#cbcbe2', fontSize: 13, fontWeight: 700 }}>{t.title}</div>
                          {t.description ? (
                            <div style={{ color: 'var(--stat-fg)', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {t.description}
                            </div>
                          ) : null}
                        </div>
                        <div style={{ color: 'var(--stat-fg)', fontSize: 12 }}>
                          {client ? client.clientName : '—'}
                        </div>
                        <div style={{ color: 'var(--stat-fg)', fontSize: 12, fontWeight: 700 }}>{t.status}</div>
                        <div style={{ color: 'var(--stat-fg)', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {t.startDate ? (
                              <>
                                <Calendar size={12} color="var(--stat-fg)" />
                                <span>{t.startDate}</span>
                              </>
                            ) : '—'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {t.dueDate ? (
                              <>
                                <Calendar size={12} color="var(--stat-fg)" />
                                <span>{t.dueDate}</span>
                              </>
                            ) : '—'}
                          </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1', marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                          <TaskActions taskId={t.id} />
                        </div>

                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}