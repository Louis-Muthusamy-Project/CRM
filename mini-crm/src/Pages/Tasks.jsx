import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useCRM } from '../CRMProvider'

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function Tasks() {
  const { state } = useCRM()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.tasks.filter((t) => {
      const client = state.clients.find((c) => c.id === t.clientId)
      const matchesQ = !q
        ? true
        : `${t.title} ${t.description} ${t.status} ${t.priority} ${client?.clientName || ''} ${client?.companyName || ''}`
            .toLowerCase()
            .includes(q)

      const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter
      const matchesPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter

      return matchesQ && matchesStatus && matchesPriority
    })
  }, [query, priorityFilter, statusFilter, state.clients, state.tasks])

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Track work assigned to clients."
        actions={
          <Link to="/tasks/new">
            <Button>Create Task</Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <div className="md:col-span-1">
          <Input placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-border bg-[var(--bg)] shadow-[var(--shadow)]">
        <table className="min-w-[820px] w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {['Title', 'Client', 'Due Date', 'Priority', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-[var(--text)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-[var(--text)]">
                  No matching tasks.
                </td>
              </tr>
            ) : (
              filtered
                .slice()
                .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
                .map((t) => {
                  const client = state.clients.find((c) => c.id === t.clientId)
                  return (
                    <tr key={t.id} className="border-b border-border/60">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[var(--text-h)]">{t.title}</div>
                        <div className="text-xs text-[var(--text)] line-clamp-2">{t.description || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {client ? `${client.clientName} • ${client.companyName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">{t.dueDate}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">{t.priority}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">{t.status}</td>
                      <td className="px-4 py-3">
                        <Link to={`/tasks/${t.id}`}>
                          <Button variant="secondary">View</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

