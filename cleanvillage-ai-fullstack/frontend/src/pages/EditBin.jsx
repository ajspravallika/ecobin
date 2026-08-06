import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import BinForm from '../components/common/BinForm'
import EmptyState from '../components/common/EmptyState'
import { FiTrash2 } from 'react-icons/fi'

export default function EditBin() {
  const { binId } = useParams()
  const { bins, editBin, villages, workers } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const bin = bins.find((b) => b.binId === binId)

  if (!bin) {
    return <EmptyState icon={FiTrash2} title="Bin not found" description={`No bin with ID ${binId} exists.`} />
  }

  const handleSubmit = async (data) => {
    setError(null)
    try {
      await editBin(binId, data)
      navigate(`/bins/${binId}`)
    } catch (err) {
      setError(err.message || 'Failed to save changes')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={`/bins/${binId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3">
        <FiArrowLeft size={14} /> Back to bin details
      </Link>
      <h2 className="font-display text-xl font-bold mb-1">Edit {bin.binId}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">Update location, assignment, or sensor configuration.</p>
      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3.5 text-sm">
          <FiAlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="surface-card rounded-2xl p-5">
        <BinForm initial={bin} villages={villages} workers={workers} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
