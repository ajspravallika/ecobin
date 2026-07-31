import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BinForm from '../components/common/BinForm'
import { getStatusFromFill } from '../utils/binHelpers'

export default function AddBin() {
  const { addBin, bins } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (data) => {
    const binId = data.binId?.trim() || `BIN-${String(bins.length + 1).padStart(3, '0')}`
    await addBin({
      ...data,
      binId,
      fillLevel: 0,
      status: getStatusFromFill(0),
      lastUpdated: new Date().toISOString(),
    })
    navigate('/bins')
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold mb-1">Add Bin</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        Register a new smart bin. Once the ESP32 is provisioned with this Bin ID, its
        readings will resolve automatically to the location entered here.
      </p>
      <div className="surface-card rounded-2xl p-5">
        <BinForm onSubmit={handleSubmit} submitLabel="Register Bin" />
      </div>
    </div>
  )
}
