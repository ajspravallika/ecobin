import { useEffect, useState } from 'react'
import { getStatusColor, getStatusFromFill } from '../../utils/binHelpers'

// `value` is the committed value (from the server/AppContext). We track a
// local value while dragging so the UI feels instant, but only call
// `onCommit` — which triggers a real PATCH /api/bins/:binId/fill request —
// once the user releases the slider, instead of on every drag tick.
export default function FillLevelSlider({ value, onCommit, disabled = false }) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const status = getStatusFromFill(localValue)
  const color = getStatusColor(status)

  const commit = () => {
    if (localValue !== value) onCommit(localValue)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">Simulated ultrasonic reading</span>
        <span className="font-mono-data text-sm font-semibold" style={{ color: color.hex }}>{localValue}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={localValue}
        disabled={disabled}
        onChange={(e) => setLocalValue(Number(e.target.value))}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
        className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, ${color.hex} ${localValue}%, var(--bg-surface-2) ${localValue}%)`,
          accentColor: color.hex,
        }}
      />
      <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
        <span>0% Empty</span>
        <span>71% Almost Full</span>
        <span>90% Full</span>
      </div>
    </div>
  )
}
