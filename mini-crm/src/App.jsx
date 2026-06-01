import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CRMProvider } from './CRMProvider'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetails from './pages/ClientDetails'
import ClientForm from './pages/ClientForm'
import Tasks from './pages/Tasks'
import TaskDetails from './pages/TaskDetails'
import TaskForm from './pages/TaskForm'
import ActivityTimeline from './pages/ActivityTimeline'
import Settings from './pages/Settings'

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/activity" element={<ActivityTimeline />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  )
}

