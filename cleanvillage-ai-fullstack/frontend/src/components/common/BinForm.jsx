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
    address: initial?.address || '',
    latitude: initial?.latitude ?? '',
    longitude: initial?.longitude ?? '',
    assignedWorkerId: initial?.assignedWorkerId || '',
    binType: initial?.binType || 'Household Cluster Bin',
    capacityLiters: initial?.capacityLiters || 120,
    binHeightCm: initial?.binHeightCm || 100,
    sensorEnabled: initial?.sensorEnabled ?? true,
    isActive: initial?.isActive ?? true,
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

  const toggle = (key) => () => setForm((f) => ({ ...f, [key]: !f[key] }))

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
      binHeightCm: Number(form.binHeightCm),
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
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

      <div>
        <label className={labelClass}>Full Address (optional)</label>
        <input
          value={form.address}
          onChange={set('address')}
          placeholder="12-34, Main Road, Kothapeta"
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Latitude (optional)</label>
          <input type="number" step="any" value={form.latitude} onChange={set('latitude')} placeholder="16.9891" className={`${inputClass} font-mono-data`} />
        </div>
        <div>
          <label className={labelClass}>Longitude (optional)</label>
          <input type="number" step="any" value={form.longitude} onChange={set('longitude')} placeholder="81.9591" className={`${inputClass} font-mono-data`} />
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

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Bin Height (cm)</label>
          <input type="number" min={10} value={form.binHeightCm} onChange={set('binHeightCm')} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 mt-1.5 sm:mt-6 text-sm">
          <input type="checkbox" checked={form.sensorEnabled} onChange={toggle('sensorEnabled')} className="h-4 w-4 rounded border-[var(--border-soft)]" />
          <span className={labelClass}>Sensor Enabled</span>
        </label>
        <label className="flex items-center gap-2 mt-1.5 sm:mt-6 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={toggle('isActive')} className="h-4 w-4 rounded border-[var(--border-soft)]" />
          <span className={labelClass}>Active</span>
        </label>
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
