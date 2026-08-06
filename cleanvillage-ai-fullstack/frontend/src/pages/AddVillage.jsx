import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiMapPin } from 'react-icons/fi'
import { useApp } from '../context/AppContext'

const emptyForm = { villageId: '', name: '', ward: '', mandal: '' }

export default function AddVillage() {
  const { addVillage } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.villageId.trim() || !form.name.trim() || !form.ward.trim() || !form.mandal.trim()) {
      setError('All fields are required — Village ID, Name, Ward and Mandal.')
      return
    }

    setSubmitting(true)
    try {
      // villageId is lowercased/trimmed by the backend schema automatically —
      // going through this form (instead of editing MongoDB directly) is what
      // guarantees it always matches the villageId stored on any Bin that
      // references it.
      await addVillage({
        villageId: form.villageId.trim(),
        name: form.name.trim(),
        ward: form.ward.trim(),
        mandal: form.mandal.trim(),
      })
      navigate('/bins/add')
    } catch (err) {
      setError(err.message || 'Failed to create village')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-xl font-bold mb-1">Add Village</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        Register a new Gram Panchayat jurisdiction. Bins are linked to a village purely by
        matching Village ID — create it here first, then it will show up in the Village
        dropdown when adding or editing a bin.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3.5 text-sm">
          <FiAlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface-card rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Village ID</label>
            <input
              value={form.villageId}
              onChange={update('villageId')}
              placeholder="vishnupur"
              className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Short, unique code. Will be auto-lowercased — this is what Bins reference.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Village Name</label>
            <input
              value={form.name}
              onChange={update('name')}
              placeholder="Vishnupur"
              className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Ward</label>
            <input
              value={form.ward}
              onChange={update('ward')}
              placeholder="Ward-1"
              className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Mandal</label>
            <input
              value={form.mandal}
              onChange={update('mandal')}
              placeholder="Ravulapalem Mandal"
              className="mt-1 w-full rounded-xl border border-[var(--border-soft)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 text-sm"
        >
          <FiMapPin size={15} /> {submitting ? 'Saving…' : 'Register Village'}
        </button>
      </form>
    </div>
  )
}