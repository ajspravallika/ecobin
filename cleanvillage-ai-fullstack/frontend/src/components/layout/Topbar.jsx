import { useState, useRef, useEffect } from 'react'
import { FiMenu, FiSun, FiMoon, FiChevronDown, FiLogOut, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import NotificationBell from '../common/NotificationBell'

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { autoSimulation, setAutoSimulation } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 lg:px-6 glass-panel border-b">
      <button onClick={onMenuClick} className="lg:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-[var(--bg-surface-2)]">
        <FiMenu size={19} />
      </button>

      <h1 className="font-display font-semibold text-base hidden sm:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setAutoSimulation((v) => !v)}
          className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            autoSimulation
              ? 'bg-teal-600 text-white'
              : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title="Toggle Auto Simulation mode"
        >
          <FiZap size={13} className={autoSimulation ? 'animate-pulse' : ''} />
          Auto Simulation {autoSimulation ? 'On' : 'Off'}
        </button>

        <NotificationBell />

        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="h-9 w-9 grid place-items-center rounded-full hover:bg-[var(--bg-surface-2)]"
        >
          {theme === 'dark' ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full pl-1.5 pr-2.5 py-1.5 hover:bg-[var(--bg-surface-2)]"
          >
            <div className="h-7 w-7 rounded-full bg-teal-600 text-white grid place-items-center text-xs font-semibold">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
            <FiChevronDown size={14} className="text-[var(--text-secondary)]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 surface-card rounded-xl p-1.5 z-50">
              <div className="px-2.5 py-2">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user?.role}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings') }}
                className="w-full text-left text-sm rounded-lg px-2.5 py-2 hover:bg-[var(--bg-surface-2)]"
              >
                Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full flex items-center gap-2 text-left text-sm rounded-lg px-2.5 py-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
              >
                <FiLogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
