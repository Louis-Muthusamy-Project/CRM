import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { useMemo } from 'react'
import { useCRM } from '../CRMProvider'

function statusLabel(status) {
  return status
}

export default function Dashboard() {
  const { state, addActivity } = useCRM()

  const stats = useMemo(() => {
    const totalClients = state.clients.length
    const activeClients = state.clients.filter((c) => c.status === 'Active').length
    const openTasks = state.tasks.filter((t) => t.status !== 'Completed').length

    const pendingFollowUps = (() => {
      // Demo rule: any task with status Pending or any activity of type Follow-ups in last 7 days counts.
      const pendingTasks = state.tasks.filter((t) => t.status === 'Pending').length
      return pendingTasks
    })()

    return { totalClients, activeClients, openTasks, pendingFollowUps }
  }, [state.clients, state.tasks])

  const recentActivities = useMemo(() => {
    return [...state.activities].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)).slice(0, 8)
  }, [state.activities])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your CRM at a glance."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              addActivity({
                type: 'notes',
                description: 'Dashboard activity check ✅',
                dateTime: new Date().toISOString(),
              })
            }}
          >
            Test Activity
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 text-left shadow-[var(--shadow)]">
          <div className="text-xs text-[var(--text)]">Total Clients</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-h)]">{stats.totalClients}</div>
        </div>
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 text-left shadow-[var(--shadow)]">
          <div className="text-xs text-[var(--text)]">Active Clients</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-h)]">{stats.activeClients}</div>
        </div>
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 text-left shadow-[var(--shadow)]">
          <div className="text-xs text-[var(--text)]">Pending Follow-ups</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-h)]">{stats.pendingFollowUps}</div>
        </div>
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 text-left shadow-[var(--shadow)]">
          <div className="text-xs text-[var(--text)]">Open Tasks</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-h)]">{stats.openTasks}</div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-[var(--bg)] p-4 shadow-[var(--shadow)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-h)]">Recent Activities</h2>
            <p className="mt-1 text-sm">Latest updates across clients and tasks.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-sm text-[var(--text)]">No activities yet. Create a client or task to get started.</div>
          ) : (
            recentActivities.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-white/0 p-3 text-left">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-h)]">
                      {a.type === 'client_created'
                        ? 'Client Created'
                        : a.type === 'task_assigned'
                          ? 'Task Assigned'
                          : a.type === 'followup_added'
                            ? 'Follow-up Added'
                            : 'Activity'}
                    </div>
                    <div className="text-xs text-[var(--text)]">{a.description}</div>
                  </div>
                  <div className="text-xs text-[var(--text)] whitespace-nowrap">
                    {new Date(a.dateTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

