import { getStatusColor, getDisplayStatus } from '../../utils/binHelpers'

// Displays ONLY: EMPTY, FULL, an exact percentage (e.g. "35%"), or OFFLINE.
// Never "Normal" / "Almost Full" / "Partial" / "Half". `status` still
// drives the badge color (internal bucket), but the label always comes
// from the live fillLevel so it can never drift out of sync with the
// sensor reading.
export default function Badge({ status, fillLevel, offline = false, children }) {
  const color = getStatusColor(status)
  const label = children ?? (fillLevel !== undefined ? getDisplayStatus(fillLevel, offline) : status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color.ring}`}
      style={{ color: color.hex, background: `${color.hex}18` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color.hex }} />
      {label}
    </span>
  )
}
