import { Link } from 'react-router-dom'
import { FiTrash2, FiCheckCircle, FiAlertTriangle, FiXCircle, FiWifiOff, FiClipboard, FiArrowRight } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/common/StatCard'
import StatusPieChart from '../components/charts/StatusPieChart'
import VillageBarChart from '../components/charts/VillageBarChart'
import FillTrendLineChart from '../components/charts/FillTrendLineChart'
import BinGauge from '../components/common/BinGauge'
import Badge from '../components/common/Badge'
import { timeAgo } from '../utils/binHelpers'

export default function Dashboard() {
  const { bins, villages, notifications, stats } = useApp()
  const { user } = useAuth()

  const criticalBins = [...bins]
    .filter((b) => b.status === 'Full')
    .sort((a, b) => b.fillLevel - a.fillLevel)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {villages.length > 0
              ? `Live overview across all ${villages.length} registered village${villages.length === 1 ? '' : 's'}.`
              : 'Live overview of your deployment.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3.5">
        <StatCard label="Total Bins" value={stats.total} icon={FiTrash2} accent="teal" />
        <StatCard label="Normal" value={stats.normal} icon={FiCheckCircle} accent="success" />
        <StatCard label="Almost Full" value={stats.almostFull} icon={FiAlertTriangle} accent="warn" />
        <StatCard label="Full Bins" value={stats.full} icon={FiXCircle} accent="danger" />
        <StatCard label="Collected Today" value={stats.collectedToday} icon={FiClipboard} accent="teal" />
        <StatCard label="Pending Collection" value={stats.pendingCollection} icon={FiAlertTriangle} accent="warn" />
        <StatCard label="Offline Sensors" value={stats.offline} icon={FiWifiOff} accent="slate" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-4 lg:p-5">
          <p className="font-display font-semibold text-sm mb-1">Bin Status Distribution</p>
          <p className="text-xs text-[var(--text-secondary)] mb-2">Across all 100 monitored bins</p>
          <StatusPieChart stats={stats} />
        </div>
        <div className="surface-card rounded-2xl p-4 lg:p-5 lg:col-span-2">
          <p className="font-display font-semibold text-sm mb-1">Bins by Village</p>
          <p className="text-xs text-[var(--text-secondary)] mb-2">Status breakdown per Gram Panchayat</p>
          <VillageBarChart bins={bins} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-4 lg:p-5 lg:col-span-2">
          <p className="font-display font-semibold text-sm mb-1">Weekly Collection Trend</p>
          <p className="text-xs text-[var(--text-secondary)] mb-2">Bins marked collected per day</p>
          <FillTrendLineChart collectedToday={stats.collectedToday} />
        </div>

        <div className="surface-card rounded-2xl p-4 lg:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-semibold text-sm">Bins Needing Pickup</p>
            <Link to="/bins" className="text-xs text-teal-600 dark:text-teal-300 flex items-center gap-1 hover:underline">
              View all <FiArrowRight size={11} />
            </Link>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Highest fill level, sorted first</p>
          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {criticalBins.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] py-6 text-center">No full bins right now. Great work!</p>
            )}
            {criticalBins.map((bin) => (
              <Link
                key={bin.binId}
                to={`/bins/${bin.binId}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] p-2.5 hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                <BinGauge fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono-data text-xs font-semibold">{bin.binId}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">{bin.landmark}, {bin.village}</p>
                </div>
                <Badge status={bin.status} fillLevel={bin.fillLevel} offline={bin.sensorStatus === 'Offline'} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-semibold text-sm">Recent Notifications</p>
          <Link to="/notifications" className="text-xs text-teal-600 dark:text-teal-300 flex items-center gap-1 hover:underline">
            Notification Center <FiArrowRight size={11} />
          </Link>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] py-6 text-center">No alerts yet — try Auto Simulation from the top bar.</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {notifications.slice(0, 6).map((n) => (
              <div key={n._id} className="rounded-xl border border-[var(--border-soft)] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-semibold">{n.binId}</span>
                  <Badge status={n.status} fillLevel={n.fillLevel} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">{n.location}, {n.village}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">{timeAgo(n.createdAt)} · Priority: {n.priority}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
