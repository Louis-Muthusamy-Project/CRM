import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import FieldError from '../components/ui/FieldError'
import { useCRM } from '../CRMProvider'
import { required, validateIsoDate } from '../lib/validation'

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, createTask, updateTask, addActivity } = useCRM()

  const existing = id ? state.tasks.find((t) => t.id === id) : null

  const [form, setForm] = useState(
    existing
      ? {
          title: existing.title,
          description: existing.description,
          dueDate: existing.dueDate,
          priority: existing.priority,
          clientId: existing.clientId,
          status: existing.status,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          priority: 'Low',
          clientId: state.clients[0]?.id || '',
          status: 'Pending',
        },
  )

  const errors = useMemo(() => {
    const e = {}
    if (!required(form.title)) e.title = 'Title is required.'
    if (!required(form.dueDate) || !validateIsoDate(form.dueDate)) e.dueDate = 'Due date is required (YYYY-MM-DD).'
    if (!required(form.priority)) e.priority = 'Priority is required.'
    if (!required(form.clientId)) e.clientId = 'Related client is required.'
    if (!required(form.status)) e.status = 'Status is required.'
    return e
  }, [form])

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div>
      <PageHeader
        title={existing ? 'Edit Task' : 'Create Task'}
        subtitle="Assign and track tasks for clients."
        actions={
          <Link to="/tasks">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[var(--text)]">Title</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-2" />
            <FieldError error={errors.title} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Related Client</label>
            <Select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} className="mt-2">
              {state.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} • {c.companyName}
                </option>
              ))}
            </Select>
            <FieldError error={errors.clientId} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Due Date</label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="mt-2" />
            <FieldError error={errors.dueDate} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Priority</label>
            <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="mt-2">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            <FieldError error={errors.priority} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Status</label>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-2">
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError error={errors.status} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-[var(--text)]">Description</label>
          <Textarea rows={6} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-2" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={hasErrors || state.clients.length === 0}
            onClick={() => {
              if (hasErrors) return
              if (existing) {
                const updated = updateTask({ ...existing, ...form })
                addActivity({
                  type: 'task_assigned',
                  description: `Task updated: ${updated.title}`,
                  dateTime: new Date().toISOString(),
                  meta: { taskId: updated.id, clientId: updated.clientId },
                })
                nav(`/tasks/${updated.id}`)
              } else {
                const created = createTask(form)
                const client = state.clients.find((c) => c.id === created.clientId)
                addActivity({
                  type: 'task_assigned',
                  description: `Task Assigned: ${created.title} → ${client ? client.clientName : 'client'}`,
                  dateTime: new Date().toISOString(),
                  meta: { taskId: created.id, clientId: created.clientId },
                })
                nav(`/tasks/${created.id}`)
              }
            }}
          >
            {existing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </div>
    </div>
  )
}

