import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiWifiOff } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import BinGauge from '../components/common/BinGauge'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import { timeAgo } from '../utils/binHelpers'

const STATUS_FILTERS = ['All', 'Normal', 'Almost Full', 'Full', 'Offline']

export default function BinManagement() {
  const { bins, villages, removeBin } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [villageFilter, setVillageFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    return bins.filter((b) => {
      const matchesSearch =
        !search ||
        b.binId.toLowerCase().includes(search.toLowerCase()) ||
        b.village.toLowerCase().includes(search.toLowerCase()) ||
        b.landmark.toLowerCase().includes(search.toLowerCase())
      const matchesVillage = villageFilter === 'All' || b.villageId === villageFilter
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Offline' ? b.sensorStatus === 'Offline' : b.status === statusFilter)
      return matchesSearch && matchesVillage && matchesStatus
    })
  }, [bins, search, villageFilter, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Bin Management</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {bins.length} registered bin{bins.length === 1 ? '' : 's'}
            {villages.length > 0 ? ` across ${villages.length} village${villages.length === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <Link
          to="/bins/add"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 w-fit"
        >
          <FiPlus size={16} /> Add Bin
        </Link>
      </div>

      <div className="surface-card rounded-2xl p-3.5 flex flex-col md:flex-row gap-3 md:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <select
          value={villageFilter}
          onChange={(e) => setVillageFilter(e.target.value)}
          className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          <option value="All">All Villages</option>
          {villages.map((v) => (
            <option key={v.villageId} value={v.villageId}>{v.name}</option>
          ))}
        </select>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          bins.length === 0 ? (
            <EmptyState
              icon={FiWifiOff}
              title="No bins registered yet"
              description="Add a bin above, or have your ESP32 units start reporting — bins will appear here the moment they exist in your database."
            />
          ) : (
            <EmptyState icon={FiWifiOff} title="No bins match your filters" description="Try clearing search or switching the village/status filter." />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--text-secondary)] border-b border-[var(--border-soft)]">
                  <th className="px-4 py-3 font-medium">Bin</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Worker</th>
                  <th className="px-4 py-3 font-medium">Sensor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bin) => (
                  <tr key={bin.binId} className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[var(--bg-surface-2)]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <BinGauge fillLevel={bin.fillLevel} status={bin.status} size="sm" offline={bin.sensorStatus === 'Offline'} />
                        <span className="font-mono-data font-semibold">{bin.binId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>{bin.landmark}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{bin.village} · {bin.ward}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{bin.assignedWorkerName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${bin.sensorStatus === 'Online' ? 'text-[var(--color-success)]' : 'text-slate-400'}`}>
                        {bin.sensorStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={bin.status} /></td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{timeAgo(bin.lastUpdated)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/bins/${bin.binId}`)} title="View" className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--bg-surface-2)]">
                          <FiEye size={15} />
                        </button>
                        <button onClick={() => navigate(`/bins/${bin.binId}/edit`)} title="Edit" className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--bg-surface-2)]">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(bin)} title="Delete" className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove bin from registry?" width="max-w-sm">
        <p className="text-sm text-[var(--text-secondary)]">
          This removes <span className="font-mono-data font-semibold">{confirmDelete?.binId}</span> and its sensor
          record from CleanVillage AI. Collection history for this bin is kept.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setConfirmDelete(null)} className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-[var(--bg-surface-2)]">
            Cancel
          </button>
          <button
            onClick={() => { removeBin(confirmDelete.binId); setConfirmDelete(null) }}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-[var(--color-danger)] text-white hover:opacity-90"
          >
            Remove Bin
          </button>
        </div>
      </Modal>
    </div>
  )
}
