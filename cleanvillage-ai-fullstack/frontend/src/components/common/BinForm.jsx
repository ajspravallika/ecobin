import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

// `villages` and `workers` are passed in from AppContext (real /api/villages
// and /api/workers data) by the parent page — this form has no data of its
// own and renders correctly whether those lists are empty or populated.
export default function BinForm({ initial, villages, workers, onSubmit, submitLabel = 'Save Bin' }) {
  const firstVillage = villages[0]

  const [form, setForm] = useState(() => ({
    binId: initial?.binId || '',
    villageId: initial?.villageId || firstVillage?.villageId || '',
    ward: initial?.ward || firstVillage?.ward || '',
    landmark: initial?.landmark || '',
    assignedWorkerId: initial?.assignedWorkerId || '',
    binType: initial?.binType || 'Household Cluster Bin',
    capacityLiters: initial?.capacityLiters || 120,
    sensorStatus: initial?.sensorStatus || 'Online',
  }))

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Convenience: prefill ward when switching villages, but only if the
      // person hasn't already typed a custom ward.
      if (key === 'villageId') {
        const village = villages.find((v) => v.villageId === value)
        if (village && (!f.ward || f.ward === firstVillage?.ward)) {
          next.ward = village.ward
        }
      }
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const village = villages.find((v) => v.villageId === form.villageId)
    const worker = workers.find((w) => w.workerId === form.assignedWorkerId)
    onSubmit({
      ...form,
      village: village?.name || '',
      mandal: village?.mandal || '',
      assignedWorkerId: form.assignedWorkerId || null,
      assignedWorkerName: worker?.name || null,
      capacityLiters: Number(form.capacityLiters),
    })
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40'
  const labelClass = 'text-xs font-medium text-[var(--text-secondary)]'

  if (villages.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[var(--color-amber-warn)]/10 text-[var(--color-amber-warn)] p-4 text-sm">
        <FiAlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">No villages registered yet</p>
          <p className="mt-1 text-[var(--text-secondary)]">
            Add at least one village to your database before registering bins — e.g.{' '}
            <code className="font-mono-data">POST /api/villages</code> with{' '}
            <code className="font-mono-data">{'{ villageId, name, ward, mandal }'}</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Bin ID</label>
          <input
            required
            disabled={!!initial}
            value={form.binId}
            onChange={set('binId')}
            placeholder="BIN-101"
            className={`${inputClass} font-mono-data disabled:opacity-60`}
          />
        </div>
        <div>
          <label className={labelClass}>Village</label>
          <select value={form.villageId} onChange={set('villageId')} className={inputClass}>
            {villages.map((v) => <option key={v.villageId} value={v.villageId}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ward Number</label>
          <input required value={form.ward} onChange={set('ward')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Landmark</label>
          <input
            required
            value={form.landmark}
            onChange={set('landmark')}
            placeholder="Near Government School"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Assigned Worker</label>
          <select value={form.assignedWorkerId} onChange={set('assignedWorkerId')} className={inputClass}>
            <option value="">Unassigned</option>
            {workers.map((w) => <option key={w.workerId} value={w.workerId}>{w.name} — {w.workerId}</option>)}
          </select>
          {workers.length === 0 && (
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              No workers yet — add one via <code className="font-mono-data">POST /api/workers</code> to assign bins.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Sensor Status</label>
          <select value={form.sensorStatus} onChange={set('sensorStatus')} className={inputClass}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Bin Type</label>
          <select value={form.binType} onChange={set('binType')} className={inputClass}>
            <option>Household Cluster Bin</option>
            <option>Bulk Community Bin</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Capacity (liters)</label>
          <input type="number" min={20} required value={form.capacityLiters} onChange={set('capacityLiters')} className={inputClass} />
        </div>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 text-sm"
      >
        {submitLabel}
      </button>
    </form>
  )
}
