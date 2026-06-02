import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CRMProvider } from './CRMProvider'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './Pages/Dashboard'
import Clients from './Pages/Clients'
import ClientDetails from './Pages/ClientDetails'
import ClientForm from './Pages/ClientForm'
import Tasks from './Pages/Tasks'
import TaskDetails from './Pages/TaskDetails'
import TaskForm from './Pages/TaskForm'
import ActivityTimeline from './Pages/ActivityTimeline'
import Settings from './Pages/Settings'

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
            <Route path="/tasks/:id/edit" element={<TaskForm />} />
            <Route path="/activity" element={<ActivityTimeline />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  )
}

