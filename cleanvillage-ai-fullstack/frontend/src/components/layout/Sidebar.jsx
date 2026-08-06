import { NavLink } from 'react-router-dom'
import {
  FiGrid, FiTrash2, FiPlusCircle, FiBell, FiUsers, FiClock, FiBarChart2, FiSettings, FiMapPin,
} from 'react-icons/fi'
import { PiRecycleBold } from 'react-icons/pi'
import { useAuth, ROLES } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const ADMIN_OFFICER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/bins', label: 'Bin Management', icon: FiTrash2 },
  { to: '/bins/add', label: 'Add Bin', icon: FiPlusCircle },
  { to: '/villages', label: 'Village Management', icon: FiMapPin },
  { to: '/notifications', label: 'Notification Center', icon: FiBell },
  { to: '/history', label: 'Collection History', icon: FiClock },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/settings', label: 'Settings', icon: FiSettings },
]

const WORKER_NAV = [
  { to: '/worker', label: 'My Tasks', icon: FiUsers },
  { to: '/history', label: 'Collection History', icon: FiClock },
  { to: '/settings', label: 'Settings', icon: FiSettings },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const { bins, villages } = useApp()
  const nav = user?.role === ROLES.WORKER ? WORKER_NAV : ADMIN_OFFICER_NAV

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-[var(--border-soft)] bg-[var(--bg-surface)] flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--border-soft)]">
          <div className="h-9 w-9 rounded-xl bg-teal-600 text-white grid place-items-center">
            <PiRecycleBold size={19} />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[15px]">CleanVillage AI</p>
            <p className="text-[10.5px] text-[var(--text-secondary)]">Smart Waste Monitoring</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-soft)]">
          <div className="surface-card rounded-xl p-3">
            <p className="text-xs text-[var(--text-secondary)]">Live deployment</p>
            <p className="text-sm font-semibold mt-0.5">
              {villages.length} village{villages.length === 1 ? '' : 's'}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              {bins.length} sensor{bins.length === 1 ? '' : 's'} registered
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
