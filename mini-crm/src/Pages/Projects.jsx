import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCRM } from '../CRMProvider'
import { Search, Plus, Eye, Briefcase, Folder, FilePenLine, X } from 'lucide-react'




function ProjectRowActions({ projectId, onView }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
      <button
        type="button"
        onClick={() => onView(projectId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'inherit',
          background: 'transparent',
          color: '#6b6b7a',
          border: '0.5px solid #2a2a2e',
          transition: 'color 0.12s, border-color 0.12s',
        }}
        aria-label="View project"
      >
        <Eye size={14} />
        View
      </button>

      <Link to={`/projects/${projectId}/edit`} style={{ textDecoration: 'none' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'inherit',
            background: 'transparent',
            color: '#6b6b7a',
            border: '0.5px solid #2a2a2e',
            transition: 'color 0.12s, border-color 0.12s',
          }}
          aria-label="Edit project"
        >
          <FilePenLine size={14} />
          Edit
        </button>
      </Link>
    </div>
  )
}


export default function Projects() {
  const { state } = useCRM()
  const [query, setQuery] = useState('')
  const [viewProjectId, setViewProjectId] = useState(null)

  const viewProject = useMemo(() => {
    if (!viewProjectId) return null
    return (state.projects || []).find((p) => p.id === viewProjectId) || null
  }, [viewProjectId, state.projects])

  const detailsRows = useMemo(() => {
    if (!viewProject) return []
    const rows = [
      { label: 'ID', value: viewProject.id },
      { label: 'Name', value: viewProject.name },
      { label: 'Description', value: viewProject.description },
      { label: 'Status', value: viewProject.status },
      { label: 'Client ID', value: viewProject.clientId },
      (() => {
        const assignedTasks = (state.tasks || []).filter((t) => t.projectId === viewProject.id)
        const assignedImages = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedImageCount) || 0), 0)
        const assignedVideos = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedVideoCount) || 0), 0)
        const remainingImages = Math.max(0, Number(viewProject.imageCount || 0) - assignedImages)
        const remainingVideos = Math.max(0, Number(viewProject.videoCount || 0) - assignedVideos)

        return { label: 'Image Count', value: remainingImages }
      })(),
      (() => {
        const assignedTasks = (state.tasks || []).filter((t) => t.projectId === viewProject.id)
        const assignedImages = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedImageCount) || 0), 0)
        const assignedVideos = assignedTasks.reduce((sum, t) => sum + (Number(t.assignedVideoCount) || 0), 0)
        const remainingImages = Math.max(0, Number(viewProject.imageCount || 0) - assignedImages)
        const remainingVideos = Math.max(0, Number(viewProject.videoCount || 0) - assignedVideos)

        return { label: 'Video Count', value: remainingVideos }
      })(),
      { label: 'Created At', value: viewProject.createdAt ? new Date(viewProject.createdAt).toLocaleString() : null },
      { label: 'Updated At', value: viewProject.updatedAt ? new Date(viewProject.updatedAt).toLocaleString() : null },
    ]

    // Include any extra keys in case backend adds more fields.
    // knownKeys kept for clarity (not currently used)
    const knownKeys = new Set(rows.map((r) => r.label))

    const extraKeys = Object.keys(viewProject).filter((k) => {
      const mappedLabel = ({ id: 'ID', name: 'Name', description: 'Description', status: 'Status', clientId: 'Client ID', imageCount: 'Image Count', videoCount: 'Video Count', createdAt: 'Created At', updatedAt: 'Updated At' })[k]
      return !mappedLabel
    })

    const extras = extraKeys.map((k) => ({ label: k, value: viewProject[k] }))
    return [...rows, ...extras]
  }, [viewProject])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return state.projects
    return state.projects.filter((p) => {
      const hay = `${p.name} ${p.description ?? ''} ${p.status ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, state.projects])

  function renderValue(value) {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'number' && !Number.isFinite(value)) return '—'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }


  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {viewProject && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewProjectId(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 18,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 760,
              borderRadius: 14,
              background: 'var(--panel-bg)',
              border: '0.5px solid #242428',
              boxShadow: '0 14px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '0.5px solid #242428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--stat-fg)' }}>
                  {viewProject.name || 'Project'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
                  Project details
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewProjectId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '0.5px solid #242428',
                  background: 'transparent',
                  color: 'var(--stat-fg)',
                  cursor: 'pointer',
                }}
                aria-label="Close project details"
              >
                <X size={16} />
              </button>
            </div>

            <div className='overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' style={{ padding: 16, maxHeight: '70vh' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                {detailsRows.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      background: 'transparent',
                      border: '0.5px solid #242428',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: 'var(--muted-fg)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                      }}
                    >
                      {row.label}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--stat-fg)', wordBreak: 'break-word' }}>
                      {renderValue(row.value)}
                    </div>
                  </div>
                ))}
              </div>








              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'var(--muted-fg)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Assigned Tasks (This Project)
                </div>


                <div style={{ marginTop: 10 }}>
                  {((state.tasks || []).filter((t) => t.projectId === viewProject.id) || []).length === 0 ? (
                    <div style={{ color: 'var(--stat-fg)', fontSize: 13, padding: '10px 0' }}>No tasks assigned to this project.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(state.tasks || [])
                        .filter((t) => t.projectId === viewProject.id)
                        .sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)))
                        .map((t) => (
                          <div
                            key={t.id}
                            style={{
                              background: '#141417',
                              border: '0.5px solid #242428',
                              borderRadius: 12,
                              padding: 12,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--stat-fg)' }}>{t.title || 'Untitled Task'}</div>
                                <div style={{ marginTop: 3, fontSize: 12, color: 'var(--stat-fg)' }}>
                                  Status: <span style={{ fontWeight: 700 }}>{t.status || '—'}</span>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: 'var(--stat-fg)' }}>
                                  <span style={{ fontWeight: 800 }}>Images:</span> {t.assignedImageCount ?? 0}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 3 }}>
                                  <span style={{ fontWeight: 800 }}>Videos:</span> {t.assignedVideoCount ?? 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div style={{ padding: 16, borderTop: '0.5px solid #242428', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewProjectId(null)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '0.5px solid #242428',
                  color: 'var(--stat-fg)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          padding: '16px 24px',
          borderBottom: '0.5px solid #1e1e24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Projects</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>
            Manage projects and track work outcomes.
          </div>
        </div>

        <Link to="/projects/new" style={{ textDecoration: 'none' }}>
          <button
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
              background: '#5b5ef4',
              color: '#fff',
              border: 'none',
            }}
          >
            <Plus size={14} />
            Create Project
          </button>
        </Link>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={14}
              color="#4a4a58"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', background: 'var(--panel-bg)' }}
            />
            <input
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px 8px 34px',
                background: '#141417',
                border: '0.5px solid #242428',
                borderRadius: 8,
                color: '#d8d8e0',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                background: 'var(--panel-bg)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: '#141417',
              border: '0.5px solid #242428',
              fontSize: 12,
              color: 'var(--stat-fg)',
              flexShrink: 0,
              background: 'var(--panel-bg)',
            }}
          >
            <Briefcase size={13} color="#4a4a58" />
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className='overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
          style={{
            background: '#141417',
            border: '0.5px solid #242428',
            borderRadius: 12,
            background: 'var(--panel-bg)',
          }}
        >
          <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #242428' }}>
                {['Project', 'Description', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--stat-fg)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--stat-fg)', fontSize: 13 }}>
                    No matching projects.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="anim-slide-left"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '0.5px solid #1a1a20' : 'none',
                      transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      animationDelay: `${i * 0.05}s`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#7e7a7a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            flexShrink: 0,
                            background: 'rgba(91,94,244,0.18)',
                            color: '#9b9ef8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <Folder size={15} color="#9b9ef8" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--stat-fg)' }}>{p.name}</div>
                          {p.createdAt && (
                            <div style={{ fontSize: 11, color: 'var(--stat-fg)', marginTop: 1 }}>
                              {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--stat-fg)' }}>
                      {p.description || '—'}
                    </td>

                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--stat-fg)' }}>
                      {p.status || '—'}
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      <ProjectRowActions projectId={p.id} onView={setViewProjectId} />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

