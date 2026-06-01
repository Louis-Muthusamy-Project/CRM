import { useEffect } from 'react'

export default function Modal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onClose,
  onConfirm,
  danger = false,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-[var(--bg)] p-5 text-left shadow-[var(--shadow)]">
        <h3 className="text-base font-semibold text-[var(--text-h)]">{title}</h3>
        {description ? <p className="mt-2 text-sm">{description}</p> : null}

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={() => onClose?.()}
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm?.()}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:brightness-110'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

