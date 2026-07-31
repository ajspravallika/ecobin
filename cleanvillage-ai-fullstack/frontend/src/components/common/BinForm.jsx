import { useState } from 'react'
import { VILLAGES, LANDMARKS } from '../../data/villages'
import { WORKERS } from '../../data/workers'

export default function BinForm({ initial, onSubmit, submitLabel = 'Save Bin' }) {
  const [form, setForm] = useState(() => ({
    binId: initial?.binId || '',
    villageId: initial?.villageId || VILLAGES[0].id,
    ward: initial?.ward || VILLAGES[0].ward,
    landmark: initial?.landmark || LANDMARKS[0],
    assignedWorkerId: initial?.assignedWorkerId || WORKERS[0].id,
    binType: initial?.binType || 'Household Cluster Bin',
    capacityLiters: initial?.capacityLiters || 120,
    sensorStatus: initial?.sensorStatus || 'Online',
  }))

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const village = VILLAGES.find((v) => v.id === form.villageId)
    const worker = WORKERS.find((w) => w.id === form.assignedWorkerId)
    onSubmit({
      ...form,
      village: village.name,
      mandal: village.mandal,
      assignedWorkerName: worker.name,
      capacityLiters: Number(form.capacityLiters),
    })
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40'
  const labelClass = 'text-xs font-medium text-[var(--text-secondary)]'

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
            {VILLAGES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
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
          <select value={form.landmark} onChange={set('landmark')} className={inputClass}>
            {LANDMARKS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Assigned Worker</label>
          <select value={form.assignedWorkerId} onChange={set('assignedWorkerId')} className={inputClass}>
            {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.name} — {w.id}</option>)}
          </select>
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
