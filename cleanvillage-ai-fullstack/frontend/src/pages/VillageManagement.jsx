import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiPlusCircle, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import EmptyState from '../components/common/EmptyState'

export default function VillageManagement() {
  const { villages, bins, removeVillage } = useApp()
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const binCountFor = (villageId) => bins.filter((b) => b.villageId === villageId).length

  const handleDelete = async (villageId) => {
    setError(null)
    if (!window.confirm(`Delete village "${villageId}"? This can't be undone.`)) return
    setDeletingId(villageId)
    try {
      await removeVillage(villageId)
    } catch (err) {
      // Backend blocks deletion if bins still reference this village (409) —
      // surface that instead of failing silently.
      setError(err.message || 'Failed to delete village')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold mb-1">Village Management</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {villages.length} village{villages.length === 1 ? '' : 's'} registered
          </p>
        </div>
        <Link
          to="/villages/add"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 text-sm"
        >
          <FiPlusCircle size={15} /> Add Village
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3.5 text-sm">
          <FiAlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {villages.length === 0 ? (
        <EmptyState
          icon={FiMapPin}
          title="No villages registered yet"
          description="Add your first village to start registering bins."
        />
      ) : (
        <div className="surface-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-left text-[var(--text-secondary)] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Village</th>
                <th className="px-4 py-3 font-medium">Village ID</th>
                <th className="px-4 py-3 font-medium">Ward</th>
                <th className="px-4 py-3 font-medium">Mandal</th>
                <th className="px-4 py-3 font-medium">Bins</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {villages.map((v) => (
                <tr key={v.villageId} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 font-mono-data text-xs text-[var(--text-secondary)]">{v.villageId}</td>
                  <td className="px-4 py-3">{v.ward}</td>
                  <td className="px-4 py-3">{v.mandal}</td>
                  <td className="px-4 py-3">{binCountFor(v.villageId)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(v.villageId)}
                      disabled={deletingId === v.villageId}
                      title={binCountFor(v.villageId) > 0 ? 'Cannot delete: bins still reference this village' : 'Delete village'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--bg-surface-2)] disabled:opacity-40"
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
