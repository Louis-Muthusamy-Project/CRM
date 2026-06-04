import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getToken, setAuth, clearAuth } from '../../auth'

export default function RequireAuth() {
  const location = useLocation()
  const [checked, setChecked] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setOk(false)
      setChecked(true)
      return
    }

    const run = async () => {
      try {
        const res = await axios.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data?.ok) {
          // persist user in auth storage
          setAuth({ token, user: res.data.user })
          setOk(true)
        } else {
          clearAuth()
          setOk(false)
        }
      } catch {
        clearAuth()
        setOk(false)
      } finally {
        setChecked(true)
      }
    }

    run()
  }, [])

  if (!checked) return null
  if (!ok) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

