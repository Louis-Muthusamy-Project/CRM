import { useMemo } from 'react'
import { useCRM } from '../CRMProvider'
import {
  Users,
  UserCheck,
  ClipboardList,
  Bell,
  UserPlus,
  CheckSquare,
  MessageSquare,
  Activity,
  Plus,
} from 'lucide-react'


// ── helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_META = {
  client_created: {
    label: 'Client Created',
    Icon: UserPlus,
    color: '#5b5ef4',
    bg: 'rgba(91,94,244,0.12)',
  },
  task_assigned: {
    label: 'Task Assigned',
    Icon: CheckSquare,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.10)',
  },
  followup_added: {
    label: 'Follow-up Added',
    Icon: MessageSquare,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.10)',
  },
  notes: {
    label: 'Note',
    Icon: ClipboardList,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
  },
}

function getActivityMeta(type) {
  return (
    ACTIVITY_META[type] ?? {
      label: 'Activity',
      Icon: Activity,
      color: '#6b6b7a',
      bg: 'rgba(107,107,122,0.10)',
    }
  )
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, accent }) {
  return (
    <div 
      className='rounded-xl border border-slate-700 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]'
      style={{
        background: 'var(--panel-bg)',
        border: '0.5px solid var(--panel-border)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span 
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--muted-fg)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          {label}
        </span>

        <div 
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${accent}1a`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={15} color={accent} />
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--stat-fg)', lineHeight: 1 }} className="stat-value">
        {value}
      </div>
    </div>
  )
}

// ── activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity }) {
  const { label, Icon, color, bg } = getActivityMeta(activity.type)

  return (
    <div className='relative overflow-hidden rounded-[20px]
         border border-white/10
         bg-zinc-950/80 backdrop-blur-xl
         shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.2)]
         transition-all duration-300
         hover:-translate-y-0.5
         hover:border-white/20
         hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_rgba(255,255,255,0.06),0_20px_60px_rgba(255,255,255,0.04)]'
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 8,
        border: '0.5px solid var(--table-row-sep)',
        background: 'var(--timeline-surface)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={15} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--input-text)' }}>{label}</div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--muted-fg)',
            marginTop: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activity.description}
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--icon-muted)', flexShrink: 0 }}>
        {relativeTime(activity.dateTime)}
      </div>
    </div>
  )
}

// ── main ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, addActivity } = useCRM()

  const stats = useMemo(() => {
    const totalClients = state.clients.length
    const activeClients = state.clients.filter((c) => c.status === 'Active').length
    const openTasks = state.tasks.filter((t) => t.status !== 'Completed').length
    const pendingFollowUps = state.tasks.filter((t) => t.status === 'Todo').length
    return { totalClients, activeClients, openTasks, pendingFollowUps }
  }, [state.clients, state.tasks])

  const recentActivities = useMemo(
    () =>
      [...state.activities]
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        .slice(0, 8),
    [state.activities]
  )

  return (
    <div id="crm-page-title" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── top bar ── */}
      <div
        id="crm-card-anim"
        style={{
          padding: '16px 24px',
          borderBottom: '0.5px solid var(--timeline-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Dashboard</div>
          <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
            Overview of your CRM at a glance.
          </div>
        </div>

        <button
          onClick={() =>
            addActivity({
              type: 'notes',
              description: 'Dashboard activity check ✅',
              dateTime: new Date().toISOString(),
            })
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'inherit',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            border: 'none',
          }}
        >
          <Plus size={14} />
          Test Activity
        </button>
      </div>

      <div className="anim-list" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <StatCard label="Total Clients" value={stats.totalClients} Icon={Users} accent="#5b5ef4" />
          <StatCard
            label="Active Clients"
            value={stats.activeClients}
            Icon={UserCheck}
            accent="#4ade80"
          />
          <StatCard
            label="Pending Follow-ups"
            value={stats.pendingFollowUps}
            Icon={Bell}
            accent="#fbbf24"
          />
          <StatCard label="Open Tasks" value={stats.openTasks} Icon={ClipboardList} accent="#a78bfa" />
        </div>

        <div
          style={{
            background: 'var(--accent-bg)',
            border: '0.5px solid var(--panel-border)',
            borderRadius: 12,
            padding: '16px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,background: 'transparent' }}>
            <Activity size={15} color="var(--accent) " />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--stat-fg)' }}>Recent Activities</span>
            <span
              style={{
                marginLeft: 4,
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                padding: '2px 7px',
                borderRadius: 20,
              }}
            >
              {recentActivities.length}
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted-fg)', padding: '12px 0' }}>
              No activities yet. Create a client or task to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentActivities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

