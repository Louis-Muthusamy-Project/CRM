import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { setAuth } from '../auth'
import { Sun, Moon } from 'lucide-react'

// Theme toggle component
function ThemeToggle({ theme, onChange }) {
  return (
    <button
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '0.5px solid #242428',
        background: 'var(--panel-bg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        padding: 0,
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun size={18} color="#6b6b7a" />
      ) : (
        <Moon size={18} color="#9b9ef8" />
      )}
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passedTheme = location.state?.theme
  const [theme, setTheme] = useState(() => passedTheme || localStorage.getItem('theme') || 'dark')

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/login', form)
      if (!res.data?.ok) throw new Error(res.data?.error || 'Login failed')
      setAuth({ token: res.data.token, user: res.data.user })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      
      {/* Theme toggle in top-right corner */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      <form
        onSubmit={onSubmit}
        style={{ width: 420, background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 14, padding: 22 }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--stat-fg)' }}>Login</div>
          <div style={{ fontSize: 12, marginTop: 4, color: 'var(--muted-fg)' }}>
            Access your mini-crm workspace.
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--stat-fg)' }}>Email</span>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            type="email"
            required
            style={{ padding: '10px 12px', background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 10, color: 'var(--stat-fg)', outline: 'none' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--stat-fg)' }}>Password</span>
          <input
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            type="password"
            required
            style={{ padding: '10px 12px', background: 'var(--panel-bg)', border: '0.5px solid #242428', borderRadius: 10, color: 'var(--stat-fg)', outline: 'none' }}
          />
        </label>

        {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button className="bg-blue-500 hover:bg-blue-600"
          disabled={loading}
          type="submit"
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 10,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted-fg)' }}>
          No account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register', { state: { theme } })}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: '#9b9ef8',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  )
}

