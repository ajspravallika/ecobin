import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiX, FiCheck } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import { timeAgo, getDisplayStatus } from '../utils/binHelpers'

const FILTERS = ['All', 'Full', 'Almost Full']

export default function NotificationCenter() {
  const { notifications, dismissNotification, markAllNotificationsRead } = useApp()
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(
    () => notifications.filter((n) => filter === 'All' || n.status === filter),
    [notifications, filter]
  )

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Notification Center</h2>
          <p className="text-sm text-[var(--text-secondary)]">{notifications.length} active alerts across the network</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-sm font-medium hover:bg-[var(--bg-surface-2)] w-fit"
          >
            <FiCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FiBell} title="No notifications here" description="Full and Almost Full alerts will appear here automatically as sensor readings come in." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <div key={n._id} className={`surface-card rounded-2xl p-4 flex items-start gap-3 ${!n.read ? 'ring-1 ring-teal-500/25' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono-data font-semibold text-sm">{n.binId}</span>
                  <Badge status={n.status} fillLevel={n.fillLevel} />
                  <span className="text-[11px] text-[var(--text-secondary)]">Priority: {n.priority}</span>
                </div>
                <p className="text-sm mt-1.5">
                  {n.status === 'Full' ? '🔴' : '🟡'} {n.binId} is {getDisplayStatus(n.fillLevel)}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{n.location}, {n.village} · {n.ward}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-[var(--text-secondary)]">{timeAgo(n.createdAt)}</span>
                  <Link to={`/bins/${n.binId}`} className="text-xs text-teal-600 dark:text-teal-300 hover:underline">
                    View bin
                  </Link>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(n._id)}
                aria-label="Dismiss"
                className="h-8 w-8 shrink-0 grid place-items-center rounded-full hover:bg-[var(--bg-surface-2)]"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
