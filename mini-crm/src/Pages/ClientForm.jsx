import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import FieldError from '../components/ui/FieldError'
import { useCRM } from '../CRMProvider'
import { validateEmail, validatePhone, required } from '../lib/validation'

export default function ClientForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, createClient, updateClient, addActivity } = useCRM()

  const existing = id ? state.clients.find((c) => c.id === id) : null

  const [form, setForm] = useState(
    existing
      ? {
          clientName: existing.clientName,
          companyName: existing.companyName,
          email: existing.email,
          phone: existing.phone,
          industry: existing.industry,
          status: existing.status,
          notes: existing.notes,
        }
      : {
          clientName: '',
          companyName: '',
          email: '',
          phone: '',
          industry: '',
          status: 'Active',
          notes: '',
        },
  )

  const errors = useMemo(() => {
    const e = {}
    if (!required(form.clientName)) e.clientName = 'Client name is required.'
    if (!required(form.companyName)) e.companyName = 'Company name is required.'
    if (!required(form.email) || !validateEmail(form.email)) e.email = 'A valid email is required.'
    if (!validatePhone(form.phone)) e.phone = 'Phone number format looks invalid.'
    if (!required(form.industry)) e.industry = 'Industry is required.'
    if (!required(form.status)) e.status = 'Status is required.'
    return e
  }, [form])

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div>
      <PageHeader
        title={existing ? 'Edit Client' : 'Create Client'}
        subtitle="Add or update client details."
        actions={
          <Link to="/clients">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Client Name</label>
            <Input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} className="mt-2" />
            <FieldError error={errors.clientName} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Company Name</label>
            <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className="mt-2" />
            <FieldError error={errors.companyName} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Email</label>
            <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-2" />
            <FieldError error={errors.email} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Phone Number</label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-2" />
            <FieldError error={errors.phone} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Industry</label>
            <Input value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="mt-2" />
            <FieldError error={errors.industry} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)]">Status</label>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-2">
              {['Active', 'Pending', 'Inactive'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError error={errors.status} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-[var(--text)]">Notes</label>
          <Textarea rows={5} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-2" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={hasErrors}
            onClick={() => {
              if (hasErrors) return

              if (existing) {
                const updated = updateClient({ id: existing.id, ...existing, ...form })
                addActivity({
                  type: 'notes',
                  description: `Client updated: ${updated.clientName}`,
                  dateTime: new Date().toISOString(),
                  meta: { clientId: updated.id },
                })
                nav(`/clients/${updated.id}`)
              } else {
                const created = createClient(form)
                addActivity({
                  type: 'client_created',
                  description: `Client Created: ${created.clientName} (${created.companyName})`,
                  dateTime: new Date().toISOString(),
                  meta: { clientId: created.id },
                })
                nav(`/clients/${created.id}`)
              }
            }}
          >
            {existing ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </div>
    </div>
  )
}

