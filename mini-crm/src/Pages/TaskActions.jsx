import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useCRM } from '../CRMProvider'

function EllipsisIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="3" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="13" cy="8" r="1.4" />
    </svg>
  )
}

export default function TaskActions({ taskId }) {
  const { state, deleteTask } = useCRM()
  const nav = useNavigate()
  const task = useMemo(() => state.tasks.find((t) => t.id === taskId) || null, [state.tasks, taskId])

  const [open, setOpen] = useState(false)

  if (!task) return null

  const handleDelete = async () => {
    // simple confirm to avoid accidental deletion
    const ok = window.confirm(`Delete task "${task.title}"?`)
    if (!ok) return
    await deleteTask(taskId)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="px-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        <EllipsisIcon />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-32 rounded-lg border border-border bg-[var(--bg)] shadow-[var(--shadow)] overflow-hidden"
        >
          <div className="flex flex-col">
            <Link
              to={`/tasks/${taskId}`}
              className="px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-secondary)]"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              View
            </Link>

            <button
              type="button"
              className="text-left px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-secondary)]"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                nav(`/tasks/${taskId}/edit`)
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className="text-left px-3 py-2 text-sm text-red-600 hover:bg-[var(--bg-secondary)]"
              role="menuitem"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

