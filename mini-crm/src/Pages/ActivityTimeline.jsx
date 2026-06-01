import { useMemo, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Input from '../components/ui/Input'
import FieldError from '../components/ui/FieldError'
import { useCRM } from '../CRMProvider'
import { required } from '../lib/validation'

const ACTIVITY_TYPES = [
  { value: 'notes', label: 'Notes' },
  { value: 'calls', label: 'Calls' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'followups', label: 'Follow-ups' },
]

function typeToActivityType(type) {
  // Map to spec-required keys for dashboard display
  if (type === 'followups') return 'followup_added'
  if (type === 'notes') return 'notes'
  if (type === 'calls') return 'calls'
  if (type === 'meetings') return 'meetings'
  return 'notes'
}

export default function ActivityTimeline() {
  const { state, addActivity } = useCRM()

  const [type, setType] = useState('notes')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16)) // datetime-local

  const [errors, setErrors] = useState({})

  const history = useMemo(() => {
    return [...state.activities].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
  }, [state.activities])

  function submit() {
    const e = {}
    if (!required(description)) e.description = 'Description is required.'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    addActivity({
      type: typeToActivityType(type),
      description,
      dateTime: new Date(date).toISOString(),
    })

    setDescription('')
    setErrors({})
  }

  return (
    <div>
      <PageHeader title="Activity Timeline" subtitle="Add notes, call logs, meetings, and follow-ups." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Add Activity</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Activity Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-2">
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Date & Time</label>
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Description</label>
              <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" />
              <FieldError error={errors.description} />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={false}
              >
                Add Activity
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">History</h2>
          <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
            {history.length === 0 ? (
              <div className="text-sm text-[var(--text)]">No history yet.</div>
            ) : (
              history.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-white/0 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-h)]">
                        {a.type === 'followup_added' ? 'Follow-up Added' : a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                      </div>
                      <div className="text-xs text-[var(--text)] mt-1">{a.description}</div>
                    </div>
                    <div className="text-xs text-[var(--text)] whitespace-nowrap">
                      {new Date(a.dateTime).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

