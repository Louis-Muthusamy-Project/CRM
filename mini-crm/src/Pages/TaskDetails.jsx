import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { useCRM } from '../CRMProvider'

export default function TaskDetails() {
  const { id } = useParams()
  const { state } = useCRM()

  const task = state.tasks.find((t) => t.id === id)
  const client = task ? state.clients.find((c) => c.id === task.clientId) : null

  if (!task) {
    return (
      <div>
        <PageHeader title="Task not found" />
        <div className="text-sm text-[var(--text)]">The task you’re looking for does not exist.</div>
        <div className="mt-4">
          <Link to="/tasks">
            <Button variant="secondary">Back to Tasks</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={client ? `${client.clientName} • ${client.companyName}` : '—'}
        actions={
          <div className="flex gap-2">
            <Link to="/tasks">
              <Button variant="secondary">Back </Button>
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Task Details</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Title</div>
              <div className="mt-1 text-sm text-[var(--text)]">{task.title}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Start Date</div>
              <div className="mt-1 text-sm text-[var(--text)]">{task.startDate}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Due Date</div>
              <div className="mt-1 text-sm text-[var(--text)]">{task.dueDate}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Priority</div>
              <div className="mt-1 text-sm text-[var(--text)]">{task.priority}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Assignment</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Related Client</div>
              <div className="mt-1 text-sm text-[var(--text)]">{client ? `${client.clientName} • ${client.companyName}` : '—'}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Task Status</div>
              <div className="mt-2">
                <span className="font-semibold text-sm">{task.status}</span>
              </div>
              {task.status === 'Completed' && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-[var(--text)]">Completed Date</div>
                  <div className="mt-1 text-sm text-[var(--text)]">{task.completedDate || '—'}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Description</div>
              <div className="mt-1 text-sm text-[var(--text)] whitespace-pre-wrap">{task.description || '—'}</div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

