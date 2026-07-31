import { useState } from 'react'
import { FiMoon, FiSun, FiZap } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { autoSimulation, setAutoSimulation } = useApp()
  const [notifPrefs, setNotifPrefs] = useState({ full: true, almostFull: true, offline: false })

  const toggle = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Settings</h2>
        <p className="text-sm text-[var(--text-secondary)]">Manage your profile, appearance, and simulation preferences.</p>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-3">Profile</p>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-teal-600 text-white grid place-items-center font-semibold">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">{user?.role} · {user?.title}</p>
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-3">Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-[var(--text-secondary)]">Switch between light and dark dashboard themes.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-sm font-medium hover:bg-[var(--bg-surface-2)]"
          >
            {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-3">Simulation</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5"><FiZap size={14} /> Auto Simulation Mode</p>
            <p className="text-xs text-[var(--text-secondary)]">Randomly nudges fill levels on your existing bins so the dashboard looks live during a demo. It never creates bins — if your database is empty, this does nothing.</p>
          </div>
          <button
            onClick={() => setAutoSimulation()}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${autoSimulation ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'}`}
          >
            {autoSimulation ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-3">Notification Preferences</p>
        <div className="space-y-3">
          {[
            ['full', 'Full bin alerts (90%+)'],
            ['almostFull', 'Almost full alerts (71–89%)'],
            ['offline', 'Offline sensor alerts'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <p className="text-sm">{label}</p>
              <button
                onClick={() => toggle(key)}
                className={`w-10 h-6 rounded-full relative transition-colors ${notifPrefs[key] ? 'bg-teal-600' : 'bg-[var(--bg-surface-2)]'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-1">About</p>
        <p className="text-xs text-[var(--text-secondary)]">CleanVillage AI v1.0.0 · Smart Waste Monitoring and Collection System</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Backend: {import.meta.env.VITE_API_URL || 'not configured'}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Database: MongoDB Atlas (all bins, villages, workers, notifications, and history are read live — nothing is hardcoded)</p>
      </div>
    </div>
  )
}
