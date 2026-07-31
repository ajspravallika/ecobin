import { getStatusColor, getStatusFromFill } from '../../utils/binHelpers'

export default function FillLevelSlider({ value, onChange, disabled = false }) {
  const status = getStatusFromFill(value)
  const color = getStatusColor(status)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">Simulated ultrasonic reading</span>
        <span className="font-mono-data text-sm font-semibold" style={{ color: color.hex }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, ${color.hex} ${value}%, var(--bg-surface-2) ${value}%)`,
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
