import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/activity', label: 'Activity' },
  { to: '/settings', label: 'Settings' },
]

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="w-54 border-r border-border bg-[var(--card)]">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-[var(--text-h)]">
            <span className="text-sm font-bold">CRM</span>
          </div>

          <div>
            <div className="text-sm font-semibold text-[var(--text-h)]">
              mini-crm
            </div>
            <div className="text-xs text-[var(--text)]">
              React + Local Storage
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/15 text-[var(--text-h)] border border-accent/30'
                    : 'text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}