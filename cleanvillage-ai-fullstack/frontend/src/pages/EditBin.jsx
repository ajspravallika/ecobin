import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import BinForm from '../components/common/BinForm'
import EmptyState from '../components/common/EmptyState'
import { FiTrash2 } from 'react-icons/fi'

export default function EditBin() {
  const { binId } = useParams()
  const { bins, editBin } = useApp()
  const navigate = useNavigate()
  const bin = bins.find((b) => b.binId === binId)

  if (!bin) {
    return <EmptyState icon={FiTrash2} title="Bin not found" description={`No bin with ID ${binId} exists.`} />
  }

  const handleSubmit = async (data) => {
    await editBin(binId, data)
    navigate(`/bins/${binId}`)
  }

  return (
    <div className="max-w-2xl">
      <Link to={`/bins/${binId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3">
        <FiArrowLeft size={14} /> Back to bin details
      </Link>
      <h2 className="font-display text-xl font-bold mb-1">Edit {bin.binId}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">Update location, assignment, or sensor configuration.</p>
      <div className="surface-card rounded-2xl p-5">
        <BinForm initial={bin} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
