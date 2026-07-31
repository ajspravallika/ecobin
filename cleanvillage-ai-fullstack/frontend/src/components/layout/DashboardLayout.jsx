import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/bins': 'Bin Management',
  '/bins/add': 'Add Bin',
  '/notifications': 'Notification Center',
  '/worker': 'Worker Dashboard',
  '/history': 'Collection History',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const matchedTitle = Object.entries(TITLES).find(([path]) => location.pathname.startsWith(path))?.[1]

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={matchedTitle || 'CleanVillage AI'} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
