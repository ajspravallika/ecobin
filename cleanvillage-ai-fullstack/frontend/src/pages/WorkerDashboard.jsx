import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import BinGauge from '../components/common/BinGauge'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import { timeAgo } from '../utils/binHelpers'

export default function WorkerDashboard() {
  const { bins, markCollected, history } = useApp()
  const { user } = useAuth()
  const [tab, setTab] = useState('pending')

  const myBins = useMemo(
    () => bins.filter((b) => b.assignedWorkerId === user?.workerId),
    [bins, user]
  )
  const pending = myBins.filter((b) => b.status !== 'Normal' || b.fillLevel > 0)
  const completedToday = history.filter(
    (h) => h.worker === user?.name && new Date(h.collectedAt).toDateString() === new Date().toDateString()
  )

  const list = tab === 'pending' ? pending : completedToday

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="font-display text-xl font-bold">Today's Tasks</h2>
        <p className="text-sm text-[var(--text-secondary)]">Assigned bins for {user?.name} ({user?.workerId})</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="surface-card rounded-2xl p-4 text-center">
          <p className="font-display text-2xl font-bold">{myBins.length}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Assigned Bins</p>
        </div>
        <div className="surface-card rounded-2xl p-4 text-center">
          <p className="font-display text-2xl font-bold text-[var(--color-amber-warn)]">{pending.length}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Pending</p>
        </div>
        <div className="surface-card rounded-2xl p-4 text-center">
          <p className="font-display text-2xl font-bold text-[var(--color-success)]">{completedToday.length}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Completed Today</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {[
          ['pending', `Pending (${pending.length})`],
          ['completed', `Completed (${completedToday.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === key ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FiCheckCircle}
          title={tab === 'pending' ? 'No pending bins right now' : 'Nothing collected yet today'}
          description={tab === 'pending' ? 'All your assigned bins are within normal range.' : 'Bins you mark as collected today will show up here.'}
        />
      ) : (
        <div className="space-y-2.5">
          {tab === 'pending'
            ? pending
                .sort((a, b) => b.fillLevel - a.fillLevel)
                .map((bin) => (
                  <div key={bin.binId} className="surface-card rounded-2xl p-4 flex items-center gap-4">
                    <BinGauge fillLevel={bin.fillLevel} status={bin.status} size="md" offline={bin.sensorStatus === 'Offline'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-data font-semibold text-sm">{bin.binId}</span>
                        <Badge status={bin.status} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                        <FiMapPin size={11} /> {bin.landmark}, {bin.village}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Updated {timeAgo(bin.lastUpdated)}</p>
                    </div>
                    <button
                      onClick={() => markCollected(bin.binId, user?.name)}
                      className="shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-2.5"
                    >
                      Mark as Collected
                    </button>
                  </div>
                ))
            : completedToday.map((h) => (
                <div key={h.id} className="surface-card rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono-data font-semibold text-sm">{h.binId}</span>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{h.location}, {h.village}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-success)] font-medium">Collected · {h.fillLevelBeforeCollection}%</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{timeAgo(h.collectedAt)}</p>
                  </div>
                </div>
              ))}
        </div>
      )}

      <Link to="/history" className="inline-block text-xs text-teal-600 dark:text-teal-300 hover:underline">
        View full collection history →
      </Link>
    </div>
  )
}
