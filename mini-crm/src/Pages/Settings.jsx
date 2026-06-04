import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useCRM } from '../CRMProvider'
import { validateEmail, required } from '../lib/validation'
import { clearAuth } from '../auth'
import { Sun, Moon, User, Mail, Briefcase, ImageIcon, Save, Check, LogOut } from 'lucide-react'


// ── helpers ───────────────────────────────────────────────────────────────────

const inputStyle = {
  padding: '8px 12px',
  background: 'var(--panel-bg)',
  border: '0.5px solid #242428',
  borderRadius: 8,
  color: '#d8d8e0',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: 'var(--stat-fg)',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {Icon && <Icon size={11} color="#4a4a58" />}
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  )
}

// ── avatar preview ────────────────────────────────────────────────────────────

function AvatarPreview({ name, url }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
      background: url ? 'transparent' : 'rgba(91,94,244,0.18)',
      border: '0.5px solid #242428',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
        : <span style={{ fontSize: 18, fontWeight: 600, color: '#9b9ef8' }}>{initials}</span>
      }
    </div>
  )
}

// ── theme option ──────────────────────────────────────────────────────────────

function ThemeOption({ icon: Icon, label, description, active, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
        padding: '16px 14px', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
        background: active ? 'rgba(91,94,244,0.08)' :  'var(--panel-bg)',
        border: active ? '0.5px solid rgba(91,94,244,0.4)' : '0.5px solid #242428',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: active ? 'rgba(91,94,244,0.18)' : '#1a1a20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={active ? '#9b9ef8' : '#4a4a58'} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#d8d8e0' : '#6b6b7a' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--stat-fg)', marginTop: 2 }}>{description}</div>
      </div>
      {active && (
        <div style={{
          marginTop: 'auto', alignSelf: 'flex-end',
          width: 18, height: 18, borderRadius: '50%',
          background: '#5b5ef4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={10} color="#fff" />
        </div>
      )}
    </button>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate()
  const { state, setTheme, updateProfile } = useCRM()
  const [form, setForm]     = useState(() => ({ ...state.settings.profile }))


  // Keep local form in sync if profile is updated elsewhere or by another render.
  useEffect(() => {
    setForm({ ...state.settings.profile })
  }, [state.settings.profile])

  const [errors, setErrors] = useState({})
  const [saved, setSaved]   = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function validate() {
    const e = {}
    if (!required(form.name))                          e.name  = 'Name is required.'
    if (!required(form.email) || !validateEmail(form.email)) e.email = 'Valid email is required.'
    if (!required(form.role))                          e.role  = 'Role is required.'
    return e
  }

  function save() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className='anim-bounce' style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── top bar ── */}
      <div style={{
        padding: '16px 24px', borderBottom: '0.5px solid #1e1e24',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--stat-fg)' }}>Settings</div>
          <div style={{ fontSize: 12, color: 'var(--stat-fg)', marginTop: 2 }}>Profile and theme preferences.</div>
        </div>
         {/* ── logout card ── */}
        <div style={{ background: 'var(--bg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, gridColumn: 'span 1' }}>
          

          <button className='Logout'
            onClick={() => {
              clearAuth()
              navigate('/login', { replace: true })
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              border: '0.5px solid rgba(248,113,113,0.5)',
              background: 'var(--panel-bg)',
              color: '#f87171',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* ── content ── */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── theme card ── */}
        <div style={{ background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--stat-fg)' }}>Appearance</div>
            <div style={{ fontSize: 11, color: 'var(--stat-fg)', marginTop: 3 }}>Choose your preferred color theme.</div>
          </div>

          <div style={{ display: 'flex', gap: 10, background: 'var(--panel-bg)' }}>
            <ThemeOption
              icon={Sun}
              label="Light Mode"
              description="Clean and bright"
              active={state.settings.theme === 'light'}
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              icon={Moon}
              label="Dark Mode"
              description="Easy on the eyes"
              active={state.settings.theme === 'dark'}
              onClick={() => setTheme('dark')}
            />
          </div>
        </div>

        {/* ── profile card ── */}
        <div style={{ background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* avatar + heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <AvatarPreview name={form.name} url={form.profileImageUrl} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--stat-fg)' }}>User Profile</div>
              <div style={{ fontSize: 11, color: 'var(--stat-fg)', marginTop: 3 }}>
                {form.name || 'Your name'} · {form.role || 'Your role'}
              </div>
            </div>
          </div>

          <div style={{ height: '0.5px', background: '#1e1e24' }} />

          {/* fields */}
          <Field label="Name" icon={User} error={errors.name}>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="John Doe"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(91,94,244,0.5)'}
              onBlur={e => e.target.style.borderColor = '#242428'}
            />
          </Field>

          <Field label="Email" icon={Mail} error={errors.email}>
            <input
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="john@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(91,94,244,0.5)'}
              onBlur={e => e.target.style.borderColor = '#242428'}
            />
          </Field>

          <Field label="Role" icon={Briefcase} error={errors.role}>
            <input
              value={form.role}
              onChange={e => set('role', e.target.value)}
              placeholder="e.g. Sales Manager"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(91,94,244,0.5)'}
              onBlur={e => e.target.style.borderColor = '#242428'}
            />
          </Field>

          <Field label="Profile Image URL" icon={ImageIcon}>
            <input
              value={form.profileImageUrl}
              onChange={e => set('profileImageUrl', e.target.value)}
              placeholder="https://..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(91,94,244,0.5)'}
              onBlur={e => e.target.style.borderColor = '#242428'}
            />
          </Field>

          {/* save button */}
          <button
            onClick={save}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit', border: 'none',
              background: saved ? 'rgba(74,222,128,0.15)' : '#5b5ef4',
              color: saved ? '#4ade80' : '#fff',
              transition: 'all 0.25s',
            }}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>

      </div>
    </div>
  )
}