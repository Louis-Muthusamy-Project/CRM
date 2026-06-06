import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCRM } from '../CRMProvider'
import { createId } from '../lib/id'
import { required } from '../lib/validation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function ProjectForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, createProject, updateProject, deleteProject } = useCRM()

  const existing = useMemo(() => {
    if (!id) return null
    return state.projects.find((p) => p.id === id) || null
  }, [id, state.projects])

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Active',
    clientId: '',
    imageCount: 0,
    videoCount: 0,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name ?? '',
        description: existing.description ?? '',
        status: existing.status ?? 'Active',
        clientId: existing.clientId ?? '',
        imageCount: Number.isFinite(existing.imageCount) ? existing.imageCount : Number(existing.imageCount || 0) || 0,
        videoCount: Number.isFinite(existing.videoCount) ? existing.videoCount : Number(existing.videoCount || 0) || 0,
      })
    }
  }, [existing])


  const [errors, setErrors] = useState({})

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const e = {}
    if (!required(form.name)) e.name = 'Project name is required.'
    return e
  }

  async function onSave() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    if (existing) {
      await updateProject({
        ...existing,
        name: form.name.trim(),
        description: (form.description ?? '').trim(),
        status: form.status || '',
        clientId: form.clientId || null,
        imageCount: Math.max(0, Number(form.imageCount || 0)) || 0,
        videoCount: Math.max(0, Number(form.videoCount || 0)) || 0,
      })

      navigate('/projects', { replace: true })
      return
    }

    await createProject({
      name: form.name.trim(),
      description: (form.description ?? '').trim(),
      status: form.status || '',
      clientId: form.clientId || null,
      imageCount: Math.max(0, Number(form.imageCount || 0)) || 0,
      videoCount: Math.max(0, Number(form.videoCount || 0)) || 0,
    })


    navigate('/projects', { replace: true })
  }

  async function onDelete() {
    if (!existing) return
    deleteProject(existing.id)
    navigate('/projects', { replace: true })
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '0.5px solid #1e1e24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '0.5px solid #242428',
              background: 'var(--panel-bg)',
              cursor: 'pointer',
              color: 'var(--stat-fg)',
            }}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>
              {existing ? 'Edit Project' : 'Create Project'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>
              {existing ? 'Update project details.' : 'Add a new project.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            border: 'none',
            background: '#5b5ef4',
            color: '#fff',
          }}
        >
          <Save size={14} />
          {existing ? 'Save Changes' : 'Create'}
        </button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div
          style={{
            background: 'var(--panel-bg)',
            border: '0.5px solid #242428',
            borderRadius: 12,
            padding: '18px 20px',
            maxWidth: 700,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="e.g. Website Redesign"
              />
              {errors.name && <div style={{ fontSize: 11, color: '#f87171' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={4}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="Optional notes about this project"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Image Count (mock)
              </label>
              <input
                type="number"
                min={0}
                value={form.imageCount}
                onChange={(e) => setField('imageCount', Math.max(0, Number(e.target.value || 0)))}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="e.g. 12"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Video Count (mock)
              </label>
              <input
                type="number"
                min={0}
                value={form.videoCount}
                onChange={(e) => setField('videoCount', Math.max(0, Number(e.target.value || 0)))}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="e.g. 3"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Client (optional)
              </label>
              <select
                value={form.clientId}
                onChange={(e) => setField('clientId', e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--panel-bg)',
                  border: '0.5px solid #242428',
                  borderRadius: 8,
                  color: '#d8d8e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Unassigned</option>
                {(state.clients || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientName}
                  </option>
                ))}
              </select>
            </div>


            {existing && (

              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '9px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    border: '0.5px solid rgba(248,113,113,0.5)',
                    background: 'transparent',
                    color: '#f87171',
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

