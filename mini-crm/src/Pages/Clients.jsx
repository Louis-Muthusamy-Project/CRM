import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useCRM } from '../CRMProvider'

export default function Clients() {
  const { state, addActivity } = useCRM()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return state.clients
    return state.clients.filter((c) => {
      const hay = `${c.clientName} ${c.companyName} ${c.email} ${c.phone} ${c.industry} ${c.status} ${c.notes}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, state.clients])

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Manage your customer leads and convert them into clients."
        actions={
          <Link to="/clients/new">
            <Button>Create Client</Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-full">
          <Input placeholder="Search clients..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-border bg-[var(--bg)] shadow-[var(--shadow)]">
        <table className="min-w-[720px] w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {['Client Name', 'Company', 'Email', 'Phone', 'Industry', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-[var(--text)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-sm text-[var(--text)]">
                  No matching clients.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-h)]">{c.clientName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{c.companyName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{c.industry}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{c.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/clients/${c.id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

