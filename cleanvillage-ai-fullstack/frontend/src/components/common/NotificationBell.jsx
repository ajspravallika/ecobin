import { useState, useRef, useEffect } from 'react'
import { FiBell } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { timeAgo } from '../../utils/binHelpers'
import Badge from './Badge'

export default function NotificationBell() {
  const { notifications, markAllNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)]"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto surface-card rounded-2xl p-2 z-50"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold font-display">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-teal-600 dark:text-teal-300 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] px-2 py-6 text-center">All caught up. No active alerts.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setOpen(false)
                    navigate('/notifications')
                  }}
                  className={`w-full text-left rounded-xl px-2.5 py-2.5 hover:bg-[var(--bg-surface-2)] transition-colors ${!n.read ? 'bg-[var(--bg-surface-2)]/60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-data text-xs font-semibold">{n.binId}</span>
                    <Badge status={n.status} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{n.location}, {n.village}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
            {notifications.length > 8 && (
              <button
                onClick={() => { setOpen(false); navigate('/notifications') }}
                className="w-full text-center text-xs text-teal-600 dark:text-teal-300 py-2 hover:underline"
              >
                View all {notifications.length} notifications
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
