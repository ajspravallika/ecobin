import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth, ROLES } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BinManagement from './pages/BinManagement'
import AddBin from './pages/AddBin'
import AddVillage from './pages/AddVillage'
import EditBin from './pages/EditBin'
import BinDetails from './pages/BinDetails'
import NotificationCenter from './pages/NotificationCenter'
import WorkerDashboard from './pages/WorkerDashboard'
import CollectionHistory from './pages/CollectionHistory'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function SessionLoading() {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg-page)] text-sm text-[var(--text-secondary)]">
      Checking your session…
    </div>
  )
}

function ProtectedRoute({ children, allow }) {
  const { user, isAuthenticated, checkingSession } = useAuth()
  if (checkingSession) return <SessionLoading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) {
    return <Navigate to={user.role === ROLES.WORKER ? '/worker' : '/dashboard'} replace />
  }
  return children
}

function RoleHome() {
  const { user } = useAuth()
  if (user?.role === ROLES.WORKER) return <Navigate to="/worker" replace />
  return <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  const { isAuthenticated, checkingSession } = useAuth()
  const staffRoles = [ROLES.ADMIN, ROLES.OFFICER]

  return (
    <Routes>
      <Route
        path="/login"
        element={checkingSession ? <SessionLoading /> : isAuthenticated ? <RoleHome /> : <Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ProtectedRoute allow={staffRoles}><Dashboard /></ProtectedRoute>} />
        <Route path="/bins" element={<ProtectedRoute allow={staffRoles}><BinManagement /></ProtectedRoute>} />
        <Route path="/bins/add" element={<ProtectedRoute allow={staffRoles}><AddBin /></ProtectedRoute>} />
        <Route path="/villages/add" element={<ProtectedRoute allow={staffRoles}><AddVillage /></ProtectedRoute>} />
        <Route path="/bins/:binId" element={<BinDetails />} />
        <Route path="/bins/:binId/edit" element={<ProtectedRoute allow={staffRoles}><EditBin /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allow={staffRoles}><NotificationCenter /></ProtectedRoute>} />
        <Route path="/worker" element={<ProtectedRoute allow={[ROLES.WORKER]}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/history" element={<CollectionHistory />} />
        <Route path="/reports" element={<ProtectedRoute allow={staffRoles}><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<RoleHome />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
