import { getStatusColor } from '../../utils/binHelpers'

export default function Badge({ status, children }) {
  const color = getStatusColor(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color.ring}`}
      style={{ color: color.hex, background: `${color.hex}18` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color.hex }} />
      {children || status}
    </span>
  )
}
