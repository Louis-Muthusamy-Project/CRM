import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, Activity, Settings as SettingsIcon, Inbox, MoreVertical } from 'lucide-react'
import { useCRM } from '../../CRMProvider'

const navItems = (clientsCount, tasksCount) => [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', Icon: Users, badge: clientsCount },
  { to: '/requests', label: 'Requests', Icon: Inbox },
  { to: '/tasks', label: 'Tasks', Icon: CheckSquare, badge: tasksCount },
  { to: '/activity', label: 'Activity', Icon: Activity },
]


const systemItems = [
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function AppLayout() {
  const { state } = useCRM()

  const profile = state?.settings?.profile || {}
  const avatarInitials = profile?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>


      {/* ── Sidebar ── */}
      <aside
        id="crm-sidebar"
        className="flex flex-col"
        style={{ width: 200, background: 'var(--sidebar-bg)', borderRight: '0.5px solid var(--sidebar-border)', flexShrink: 0 }}
      >


        {/* Logo */}
        <div
          className="flex items-center gap-3"
          style={{ padding: '18px 16px', borderBottom: '0.5px solid var(--sidebar-border)' }}
        >
          <div
            className="flex items-center justify-center rounded-lg text-white text-xs font-semibold"
            style={{ width: 30, height: 30, background: 'var(--accent)', flexShrink: 0 }}
          >

            CRM
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>mini-crm</div>
            <div style={{ fontSize: 11, color: 'var(--text)' }}>React + Local Storage</div>
          </div>

        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1" style={{ padding: '12px 10px', gap: 2 }}>
          <NavSection label="Menu" />
          {navItems(state?.clients?.length ?? 0, state?.tasks?.length ?? 0).map(item => <SidebarLink key={item.to} {...item} />)}

          <NavSection label="System" style={{ marginTop: 12 }} />
          {systemItems.map(item => <SidebarLink key={item.to} {...item} />)}
        </nav>


        {/* User footer */}
        <div style={{ padding: '12px 10px', borderTop: '0.5px solid #242428' }}>
          <div

            className="flex items-center gap-2 rounded-lg cursor-pointer"
            style={{ padding: '8px 10px' }}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-semibold"
              style={{ width: 28, height: 28, background: 'var(--accent-bg)', color: 'var(--accent)', flexShrink: 0 }}
            >
              {avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-h)' }}>{profile?.name || 'Your name'}</div>
              <div style={{ fontSize: 11, color: 'var(--text)' }}>{profile?.role || 'Role'}</div>
            </div>

            <NavLink
              to="/settings"
              style={({ isActive }) => ({
                marginLeft: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 8,
                textDecoration: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                border: isActive ? '0.5px solid var(--accent-border)' : '0.5px solid transparent',
                transition: 'background 0.15s, color 0.15s',
              })}
              aria-label="Open settings"
              end={false}
              title="Settings"
            >
              <SettingsIcon size={16} color="var(--accent)" />
            </NavLink>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex flex-col flex-1 overflow-hidden">
        <div id="crm-route">
          <Outlet />
        </div>
      </main>

    </div>
  )
}

function NavSection({ label, style }) {
  return (
    <div
        style={{
        fontSize: 10, fontWeight: 600, color: 'var(--text)',
        letterSpacing: '0.8px', padding: '8px 10px 4px',
        textTransform: 'uppercase', ...style
      }}

    >
      {label}
    </div>
  )
}


function SidebarLink({ to, label, Icon, badge }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
        fontSize: 13, fontWeight: 500, textDecoration: 'none',
        color: isActive ? 'var(--accent)' : 'var(--text)',
        background: isActive ? 'var(--accent-bg)' : 'transparent',
        border: isActive ? '0.5px solid var(--accent-border)' : '0.5px solid transparent',
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} style={{ flexShrink: 0 }} color={isActive ? 'var(--accent)' : 'currentColor'} />
          <span style={{ flex: 1 }}>{label}</span>
          {badge != null && (
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 20,
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

