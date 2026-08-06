import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiTrash2, FiMapPin, FiUser, FiWifi, FiCpu, FiCopy, FiCheck } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import BinGauge from '../components/common/BinGauge'
import Badge from '../components/common/Badge'
import FillLevelSlider from '../components/common/FillLevelSlider'
import EmptyState from '../components/common/EmptyState'
import { timeAgo, priorityFromFill } from '../utils/binHelpers'

export default function BinDetails() {
  const { binId } = useParams()
  const { bins, applyFillLevel, markCollected, history } = useApp()
  const bin = bins.find((b) => b.binId === binId)
  const binHistory = history.filter((h) => h.binId === binId)
  const [copied, setCopied] = useState(false)

  if (!bin) {
    return <EmptyState icon={FiTrash2} title="Bin not found" description={`No bin with ID ${binId} exists in the registry.`} />
  }

  const firmwareSnippet = `const String BIN_ID = "${bin.binId}";
const float BIN_HEIGHT = ${bin.binHeightCm ?? 100};   // cm, empty-bin distance
const float FULL_DISTANCE = 3.0;    // cm, distance sensor reads when full
const char* SERVER_URL = "<your Render backend URL>/api/sensor/update";
const char* DEVICE_API_KEY = "<must match backend DEVICE_API_KEY>";`

  const copySnippet = () => {
    navigator.clipboard.writeText(firmwareSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const infoRows = [
    { icon: FiMapPin, label: 'Location', value: `${bin.landmark}, ${bin.village}` },
    { icon: FiMapPin, label: 'Ward / Mandal', value: `${bin.ward} · ${bin.mandal}` },
    { icon: FiUser, label: 'Assigned Worker', value: `${bin.assignedWorkerName} (${bin.assignedWorkerId})` },
    { icon: FiWifi, label: 'Sensor Status', value: bin.sensorStatus },
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/bins" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <FiArrowLeft size={14} /> Back to Bin Management
        </Link>
        <div className="flex gap-2">
          <Link to={`/bins/${binId}/edit`} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-sm font-medium hover:bg-[var(--bg-surface-2)]">
            <FiEdit2 size={14} /> Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-5 flex flex-col items-center text-center lg:col-span-1">
          <p className="font-mono-data text-lg font-bold">{bin.binId}</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">{bin.binType} · {bin.capacityLiters}L</p>
          <BinGauge fillLevel={bin.fillLevel} status={bin.status} size="lg" offline={bin.sensorStatus === 'Offline'} />
          <div className="mt-3"><Badge status={bin.status} fillLevel={bin.fillLevel} offline={bin.sensorStatus === 'Offline'} /></div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">Updated {timeAgo(bin.lastUpdated)}</p>
          <p className="text-xs text-[var(--text-secondary)]">Priority: {priorityFromFill(bin.fillLevel)}</p>

          <button
            onClick={() => markCollected(bin.binId)}
            disabled={bin.fillLevel === 0}
            className="mt-4 w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 text-white font-semibold py-2.5 text-sm"
          >
            Mark as Collected
          </button>
        </div>

        <div className="surface-card rounded-2xl p-5 lg:col-span-2 space-y-5">
          <div>
            <p className="font-display font-semibold text-sm mb-3">Bin Information</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-start gap-2.5 rounded-xl border border-[var(--border-soft)] p-3">
                  <row.icon size={15} className="mt-0.5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-[11px] text-[var(--text-secondary)]">{row.label}</p>
                    <p className="text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-soft)]">
            <p className="font-display font-semibold text-sm mb-1">Simulate Ultrasonic Sensor (ESP32)</p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Drag the slider to simulate <span className="font-mono-data">{'{"binId":"' + bin.binId + '","fillLevel": ' + bin.fillLevel + '}'}</span> being sent from the device.
            </p>
            <FillLevelSlider
              value={bin.fillLevel}
              onCommit={(v) => applyFillLevel(bin.binId, v)}
              disabled={bin.sensorStatus === 'Offline'}
            />
            {bin.sensorStatus === 'Offline' && (
              <p className="text-xs text-[var(--color-danger)] mt-2">This sensor is marked offline. Edit the bin to bring it back online.</p>
            )}
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <FiCpu size={15} className="text-[var(--text-secondary)]" />
          <p className="font-display font-semibold text-sm">ESP32 Firmware Setup for {bin.binId}</p>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          This is a database record only — it hasn't provisioned any physical hardware. To connect a
          real sensor to this bin: open your ESP32 sketch, replace the constants below with these values,
          fill in your WiFi credentials, then flash this exact sketch onto the ESP32 that will sit at this
          bin. Every physical bin needs its own ESP32 flashed with its own Bin ID this way.
        </p>
        <div className="relative">
          <pre className="rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-soft)] p-3.5 text-xs font-mono-data overflow-x-auto whitespace-pre">
{firmwareSnippet}
          </pre>
          <button
            onClick={copySnippet}
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--bg-surface-2)]"
          >
            {copied ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <p className="font-display font-semibold text-sm mb-3">Collection History for {bin.binId}</p>
        {binHistory.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No collections logged yet for this bin.</p>
        ) : (
          <div className="space-y-2">
            {binHistory.map((h) => (
              <div key={h._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] p-3 text-sm">
                <span>Collected by <strong>{h.worker}</strong> at {h.fillLevelBeforeCollection}% fill</span>
                <span className="text-xs text-[var(--text-secondary)]">{timeAgo(h.collectedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
