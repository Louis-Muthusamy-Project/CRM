import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useCRM } from '../CRMProvider'
import { validateEmail, required } from '../lib/validation'

export default function Settings() {
  const { state, setTheme, updateProfile } = useCRM()
  const [form, setForm] = useState(() => ({ ...state.settings.profile }))

  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!required(form.name)) e.name = 'Name is required.'
    if (!required(form.email) || !validateEmail(form.email)) e.email = 'Valid email is required.'
    if (!required(form.role)) e.role = 'Role is required.'
    return e
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Profile and theme preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">Theme</h2>
          <div className="mt-4 flex gap-2">
            <Button
              className='text-gray-500'
              variant={state.settings.theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => setTheme('light') }
            >
              Light Mode
            </Button>
            <Button
              className='text-gray-500'
              variant={state.settings.theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => setTheme('dark')}
            >
              Dark Mode
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-[var(--bg)] p-5 shadow-[var(--shadow)] text-left">
          <h2 className="text-sm font-semibold text-[var(--text-h)]">User Profile</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-2" />
              {errors.name ? <div className="mt-1 text-xs text-red-600">{errors.name}</div> : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Email</label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-2" />
              {errors.email ? <div className="mt-1 text-xs text-red-600">{errors.email}</div> : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Role</label>
              <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="mt-2" />
              {errors.role ? <div className="mt-1 text-xs text-red-600">{errors.role}</div> : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">Profile Image URL</label>
              <Input
                value={form.profileImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, profileImageUrl: e.target.value }))}
                className="mt-2"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const e = validate()
                  setErrors(e)
                  if (Object.keys(e).length > 0) return
                  updateProfile(form)
                }}
              >
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

