import { FiDownload } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { VILLAGES } from '../data/villages'
import { STATUS } from '../utils/binHelpers'
import StatusPieChart from '../components/charts/StatusPieChart'
import VillageBarChart from '../components/charts/VillageBarChart'

export default function Reports() {
  const { bins, history, stats } = useApp()

  const villageSummary = VILLAGES.map((v) => {
    const villageBins = bins.filter((b) => b.villageId === v.id)
    const collected = history.filter((h) => h.village === v.name).length
    const avgFill = villageBins.length
      ? Math.round(villageBins.reduce((sum, b) => sum + b.fillLevel, 0) / villageBins.length)
      : 0
    return {
      name: v.name,
      total: villageBins.length,
      full: villageBins.filter((b) => b.status === STATUS.FULL).length,
      offline: villageBins.filter((b) => b.sensorStatus === 'Offline').length,
      collected,
      avgFill,
    }
  })

  const handleExport = () => {
    const rows = [
      ['Village', 'Total Bins', 'Full Bins', 'Offline Sensors', 'Collections Logged', 'Avg Fill %'],
      ...villageSummary.map((v) => [v.name, v.total, v.full, v.offline, v.collected, v.avgFill]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleanvillage-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Reports</h2>
          <p className="text-sm text-[var(--text-secondary)]">Municipality-wide summary for Ravulapalem Mandal</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg-surface-2)] w-fit"
        >
          <FiDownload size={15} /> Export CSV
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-4 lg:p-5">
          <p className="font-display font-semibold text-sm mb-2">Status Distribution</p>
          <StatusPieChart stats={stats} />
        </div>
        <div className="surface-card rounded-2xl p-4 lg:p-5 lg:col-span-2">
          <p className="font-display font-semibold text-sm mb-2">Bins by Village</p>
          <VillageBarChart bins={bins} />
        </div>
      </div>

      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="p-4 lg:p-5 pb-0">
          <p className="font-display font-semibold text-sm">Village-wise Summary</p>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-secondary)] border-b border-[var(--border-soft)]">
                <th className="px-4 py-3 font-medium">Village</th>
                <th className="px-4 py-3 font-medium">Total Bins</th>
                <th className="px-4 py-3 font-medium">Full Bins</th>
                <th className="px-4 py-3 font-medium">Offline Sensors</th>
                <th className="px-4 py-3 font-medium">Collections Logged</th>
                <th className="px-4 py-3 font-medium">Avg Fill %</th>
              </tr>
            </thead>
            <tbody>
              {villageSummary.map((v) => (
                <tr key={v.name} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3">{v.total}</td>
                  <td className="px-4 py-3 text-[var(--color-danger)]">{v.full}</td>
                  <td className="px-4 py-3 text-slate-400">{v.offline}</td>
                  <td className="px-4 py-3">{v.collected}</td>
                  <td className="px-4 py-3">{v.avgFill}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
