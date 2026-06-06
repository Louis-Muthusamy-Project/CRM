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

const TASK_STATUSES = ['Todo', 'In Progress', 'Completed']
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
          startDate: existing.startDate,
          dueDate: existing.dueDate,
          priority: existing.priority,
          clientId: existing.clientId,
          status: existing.status,
          projectId: existing.projectId || '',
          assignedImageCount: Number.isFinite(existing.assignedImageCount)
            ? Number(existing.assignedImageCount)
            : Number(existing.assignedImageCount || 0) || 0,
          assignedVideoCount: Number.isFinite(existing.assignedVideoCount)
            ? Number(existing.assignedVideoCount)
            : Number(existing.assignedVideoCount || 0) || 0,
          service:
            Number(existing.assignedImageCount) === 1
              ? 'image'
              : Number(existing.assignedVideoCount) === 1
                ? 'video'
                : '',
        }
      : {
          title: '',
          description: '',
          startDate: '',
          dueDate: '',
          priority: 'Low',
          clientId: state.clients[0]?.id || '',
          status: 'Todo',
          projectId: '',
          assignedImageCount: 0,
          assignedVideoCount: 0,
          service: '',
        },
  )

  const selectedProject = (state.projects || []).find((p) => p.id === form.projectId) || null

  const filteredProjects = useMemo(() => {
    const allProjects = state.projects || []

    // If client is selected, only show projects that belong to that client.
    // If no client is selected, show all projects.
    if (!form.clientId) return allProjects

    return allProjects.filter((p) => p?.clientId === form.clientId)
  }, [state.projects, form.clientId])

  const assignedTasksForSelectedProject = (state.tasks || []).filter((t) => t.projectId === form.projectId)
  const assignedImagesForSelectedProject = assignedTasksForSelectedProject.reduce((sum, t) => sum + (Number(t.assignedImageCount) || 0), 0)
  const assignedVideosForSelectedProject = assignedTasksForSelectedProject.reduce((sum, t) => sum + (Number(t.assignedVideoCount) || 0), 0)


  const hasServiceCounts =
    (Number(form.assignedImageCount) === 1 && Number(form.assignedVideoCount) === 0) ||
    (Number(form.assignedImageCount) === 0 && Number(form.assignedVideoCount) === 1)

  // Remaining capacity for the selected project.
  const imageLimit = selectedProject
    ? Math.max(0, Number(selectedProject.imageCount || 0) - assignedImagesForSelectedProject)
    : 0
  const videoLimit = selectedProject
    ? Math.max(0, Number(selectedProject.videoCount || 0) - assignedVideosForSelectedProject)
    : 0




  const errors = useMemo(() => {
    const e = {}
    if (!required(form.title)) e.title = 'Title is required.'
    if (!required(form.startDate) || !validateIsoDate(form.startDate)) e.startDate = 'Start date is required (YYYY-MM-DD).'
    if (required(form.dueDate) && !validateIsoDate(form.dueDate)) e.dueDate = 'Due date must be a valid (YYYY-MM-DD) date.'
    if (!required(form.priority)) e.priority = 'Priority is required.'
    if (!required(form.clientId)) e.clientId = 'Related client is required.'
    if (!required(form.status)) e.status = 'Status is required.'

    // service is optional, but if selected it must fit remaining capacity
    if (form.service && required(form.projectId)) {
      if (form.service === 'image' && imageLimit < 1) {
        e.service = `Selected image requires at least 1 image remaining in the project.`
      }
      if (form.service === 'video' && videoLimit < 1) {
        e.service = `Selected video requires at least 1 video remaining in the project.`
      }
    }

    // Keep underlying counts consistent with service choice.
    if (form.service && required(form.projectId) && !hasServiceCounts) {
      e.service = 'Service selection is not compatible with assigned counts.'
    }

    return e
  }, [form, imageLimit, videoLimit, hasServiceCounts])



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
            <label className="text-xs font-semibold text-[var(--text)]">Start Date</label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="mt-2" />
            <FieldError error={errors.startDate} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Due Date (optional)</label>
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

          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Project</label>
            <Select
              value={form.projectId}
              onChange={(e) => {
                const projectId = e.target.value
                const nextProject = (state.projects || []).find((p) => p.id === projectId) || null

                const assignedTasks = (state.tasks || []).filter((t) => t.projectId === projectId)
                const assignedImages = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedImageCount) || 0), 0)
                const assignedVideos = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedVideoCount) || 0), 0)

                // Remaining/unassigned capacity = project capacity minus already-assigned counts
                const nextImageLimit = Math.max(0, (nextProject?.imageCount ?? 0) - assignedImages)
                const nextVideoLimit = Math.max(0, (nextProject?.videoCount ?? 0) - assignedVideos)


                setForm((f) => {
                  // If switching projects and limits shrink, keep the service-consistent counts.
                  const nextAssignedImageCount = projectId ? Math.min(f.assignedImageCount, nextImageLimit) : 0
                  const nextAssignedVideoCount = projectId ? Math.min(f.assignedVideoCount, nextVideoLimit) : 0

                  // If service capacity gets clamped, clear the service.
                  const serviceCompatible =
                    (f.service === 'image' && nextAssignedImageCount === 1 && nextAssignedVideoCount === 0) ||
                    (f.service === 'video' && nextAssignedImageCount === 0 && nextAssignedVideoCount === 1)

                  return {
                    ...f,
                    projectId,
                    assignedImageCount: serviceCompatible ? nextAssignedImageCount : 0,
                    assignedVideoCount: serviceCompatible ? nextAssignedVideoCount : 0,
                    service: serviceCompatible ? f.service : '',
                  }
                })
              }}
              className="mt-2"
            >
              <option value="">(No project)</option>
              {(filteredProjects || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>


          {form.projectId ? (
            <>
              <div className="mt-4">
                <label className="text-xs font-semibold text-[var(--text)]">Service</label>
                <Select
                  value={form.service}
                  onChange={(e) => {
                    const service = e.target.value
                    setForm((f) => {
                      if (!service) {
                        return { ...f, service: '', assignedImageCount: 0, assignedVideoCount: 0 }
                      }

                      // Service selection decides which count to consume.
                      // Capacity validation is handled in `errors.service`.
                      if (service === 'image') {
                        return { ...f, service, assignedImageCount: 1, assignedVideoCount: 0 }
                      }

                      if (service === 'video') {
                        return { ...f, service, assignedImageCount: 0, assignedVideoCount: 1 }
                      }

                      return { ...f, service, assignedImageCount: 0, assignedVideoCount: 0 }
                    })
                  }}

                  className="mt-2"
                >
                  <option value="">(No service)</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </Select>
                <FieldError error={errors.service} />
              </div>

              <div className="mt-3 text-sm text-[var(--text)]/80">
                Remaining in project: Images left: {imageLimit} • Videos left: {videoLimit}
              </div>
            </>
          ) : (
            <div className="mt-4 text-sm text-[var(--text)]">
              <div className="text-xs font-semibold text-[var(--text)]">Service</div>
              <div className="mt-1 text-[var(--text)]/80">Select a project to choose a service.</div>
            </div>
          )}

        </div>


        <div className="mt-4">
          <label className="text-xs font-semibold text-[var(--text)]">Description</label>
          <Textarea rows={6} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-2" />
        </div>

        <div className="mt-5 flex justify-end gap-2 ">
          <Button className='bg-zinc-800 '
            disabled={hasErrors || state.clients.length === 0}
            onClick={async () => {
              if (hasErrors) return
              if (existing) {
                const updated = await updateTask({ ...existing, ...form })
                await addActivity({
                  type: 'task_assigned',
                  description: `Task updated: ${updated.title}`,
                  dateTime: new Date().toISOString(),
                  meta: { taskId: updated.id, clientId: updated.clientId },
                })
                nav(`/tasks`)
              } else {
                const created = await createTask(form)
                const client = state.clients.find((c) => c.id === created.clientId)
                await addActivity({
                  type: 'task_assigned',
                  description: `Task Assigned: ${created.title} → ${client ? client.clientName : 'client'}`,
                  dateTime: new Date().toISOString(),
                  meta: { taskId: created.id, clientId: created.clientId },
                })
                nav(`/tasks`)
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

