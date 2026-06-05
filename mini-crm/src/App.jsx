import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CRMProvider } from './CRMProvider'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './Pages/Dashboard'
import Clients from './Pages/Clients'
import ClientDetails from './Pages/ClientDetails'
import ClientForm from './Pages/ClientForm'
import Requests from './Pages/Requests'
import Tasks from './Pages/Tasks'
import TaskDetails from './Pages/TaskDetails'
import TaskForm from './Pages/TaskForm'
import ActivityTimeline from './Pages/ActivityTimeline'
import Settings from './Pages/Settings'
import Login from './Pages/Login'
import Register from './Pages/Register'
import RequireAuth from './components/auth/RequireAuth'

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/tasks/:id/edit" element={<TaskForm />} />
              <Route path="/activity" element={<ActivityTimeline />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  )
}


