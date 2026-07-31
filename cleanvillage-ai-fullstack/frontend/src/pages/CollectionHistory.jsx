import { useMemo, useState } from 'react'
import { FiClock } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import SearchBar from '../components/common/SearchBar'
import EmptyState from '../components/common/EmptyState'
import { timeAgo } from '../utils/binHelpers'

export default function CollectionHistory() {
  const { history } = useApp()
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      history.filter(
        (h) =>
          !search ||
          h.binId.toLowerCase().includes(search.toLowerCase()) ||
          h.village.toLowerCase().includes(search.toLowerCase()) ||
          h.worker.toLowerCase().includes(search.toLowerCase())
      ),
    [history, search]
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Collection History</h2>
        <p className="text-sm text-[var(--text-secondary)]">{history.length} collections logged this session</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search Bin ID, village, or worker..." />

      <div className="surface-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={FiClock} title="No collections logged yet" description="Mark a bin as collected from Bin Management or the Worker Dashboard to see it appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--text-secondary)] border-b border-[var(--border-soft)]">
                  <th className="px-4 py-3 font-medium">Bin</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Worker</th>
                  <th className="px-4 py-3 font-medium">Fill Before Collection</th>
                  <th className="px-4 py-3 font-medium">Collected</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[var(--bg-surface-2)]/50">
                    <td className="px-4 py-3 font-mono-data font-semibold">{h.binId}</td>
                    <td className="px-4 py-3">{h.location}, {h.village}</td>
                    <td className="px-4 py-3">{h.worker}</td>
                    <td className="px-4 py-3">{h.fillLevelBeforeCollection}%</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{timeAgo(h.collectedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
