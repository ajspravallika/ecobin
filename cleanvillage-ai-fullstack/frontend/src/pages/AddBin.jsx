import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import BinForm from '../components/common/BinForm'
import { getStatusFromFill } from '../utils/binHelpers'

export default function AddBin() {
  const { addBin, bins, villages, workers } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const handleSubmit = async (data) => {
    setError(null)
    const binId = data.binId?.trim() || `BIN-${String(bins.length + 1).padStart(3, '0')}`
    try {
      await addBin({
        ...data,
        binId,
        fillLevel: 0,
        status: getStatusFromFill(0),
        lastUpdated: new Date().toISOString(),
      })
      navigate('/bins')
    } catch (err) {
      // Most common case: binId already exists (backend enforces uniqueness
      // with a 409) — surface it instead of failing silently.
      setError(err.message || 'Failed to create bin')
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold mb-1">Add Bin</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        Register a new smart bin. Once the ESP32 is provisioned with this Bin ID, its
        readings will resolve automatically to the location entered here.
      </p>
      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3.5 text-sm">
          <FiAlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="surface-card rounded-2xl p-5">
        <BinForm villages={villages} workers={workers} onSubmit={handleSubmit} submitLabel="Register Bin" />
      </div>
    </div>
  )
}
