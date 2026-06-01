import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import FieldError from '../components/ui/FieldError'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import { useCRM } from '../CRMProvider'
import { validateEmail, validateIsoDate, validatePhone, required } from '../lib/validation'

export default function ClientDetails() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, deleteClient, addActivity, updateClient } = useCRM()

  const client = state.clients.find((c) => c.id === id)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(
    client
      ? {
          clientName: client.clientName,
          companyName: client.companyName,
          email: client.email,
          phone: client.phone,
          industry: client.industry,
          status: client.status,
          notes: client.notes,
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
    if (!editMode) return {}
    const e = {}
    if (!required(form.clientName)) e.clientName = 'Client name is required.'
    if (!required(form.companyName)) e.companyName = 'Company name is required.'
    if (!required(form.email) || !validateEmail(form.email)) e.email = 'A valid email is required.'
    if (!validatePhone(form.phone)) e.phone = 'Phone number format looks invalid.'
    if (!required(form.industry)) e.industry = 'Industry is required.'
    if (!required(form.status)) e.status = 'Status is required.'
    return e
  }, [editMode, form])

  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!client) {
    return (
      <div>
        <PageHeader title="Client not found" />
        <div className="text-sm text-[var(--text)]">The client you’re looking for does not exist.</div>
        <div className="mt-4">
          <Link to="/clients">
            <Button variant="secondary">Back to Clients</Button>
          </Link>
        </div>
      </div>
    )
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div>
      <PageHeader
        title={client.clientName}
        subtitle={`${client.companyName} • ${client.industry}`}
        actions={
          <div className="flex gap-2">
            <Link to="/clients">
              <Button variant="secondary">Back</Button>
            </Link>
            <Button variant="ghost" onClick={() => setEditMode((v) => !v)}>
              {editMode ? 'Cancel Edit' : 'Edit'}
            </Button>
            {editMode ? (
              <Button
                onClick={() => {
                  if (hasErrors) return
                  const updated = updateClient({
                    ...client,
                    ...form,
                  })
                  addActivity({
                    type: 'notes',
                    description: `Client details updated: ${updated.clientName}`,
                    dateTime: new Date().toISOString(),
                    meta: { clientId: updated.id },
                  })
                  setEditMode(false)
                }}
                disabled={hasErrors}
              >
                Save
              </Button>
            ) : null}
            {!editMode ? (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Client Information</h2>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Client Name</div>
              {editMode ? (
                <div>
                  <Input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} />
                  <FieldError error={errors.clientName} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.clientName}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Company Name</div>
              {editMode ? (
                <div>
                  <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
                  <FieldError error={errors.companyName} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.companyName}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Email</div>
              {editMode ? (
                <div>
                  <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  <FieldError error={errors.email} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.email}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Phone Number</div>
              {editMode ? (
                <div>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  <FieldError error={errors.phone} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.phone}</div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-[var(--bg)] p-4 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Account Details</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Industry</div>
              {editMode ? (
                <div>
                  <Input value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
                  <FieldError error={errors.industry} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.industry}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Status</div>
              {editMode ? (
                <div>
                  <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {['Active', 'Pending', 'Inactive'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                  <FieldError error={errors.status} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)]">{client.status}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text)]">Notes</div>
              {editMode ? (
                <div>
                  <Textarea rows={5} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
              ) : (
                <div className="mt-1 text-sm text-[var(--text)] whitespace-pre-wrap">{client.notes || '—'}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={confirmOpen}
        title="Delete Client"
        description="This will also remove tasks related to this client. This action cannot be undone."
        danger
        confirmText="Delete"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteClient(client.id)
          addActivity({
            type: 'notes',
            description: `Client deleted: ${client.clientName}`,
            dateTime: new Date().toISOString(),
            meta: { clientId: client.id },
          })
          setConfirmOpen(false)
          nav('/clients')
        }}
      />
    </div>
  )
}

