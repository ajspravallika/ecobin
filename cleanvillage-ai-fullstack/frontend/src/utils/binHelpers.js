// Central place for the fill-level -> status thresholds so the whole app
// (dashboard counters, notifications, bin cards, charts) agrees on one rule.

export const STATUS = {
  NORMAL: 'Normal',
  ALMOST_FULL: 'Almost Full',
  FULL: 'Full',
  OFFLINE: 'Offline',
}

export function getStatusFromFill(fillLevel) {
  if (fillLevel >= 90) return STATUS.FULL
  if (fillLevel >= 71) return STATUS.ALMOST_FULL
  return STATUS.NORMAL
}

export function getStatusColor(status) {
  switch (status) {
    case STATUS.FULL:
      return { bg: 'bg-[var(--color-danger)]', text: 'text-[var(--color-danger)]', ring: 'ring-[var(--color-danger)]/30', hex: '#d64545' }
    case STATUS.ALMOST_FULL:
      return { bg: 'bg-[var(--color-amber-warn)]', text: 'text-[var(--color-amber-warn)]', ring: 'ring-[var(--color-amber-warn)]/30', hex: '#e8a33d' }
    case STATUS.OFFLINE:
      return { bg: 'bg-slate-400', text: 'text-slate-400', ring: 'ring-slate-400/30', hex: '#94a3b8' }
    default:
      return { bg: 'bg-[var(--color-success)]', text: 'text-[var(--color-success)]', ring: 'ring-[var(--color-success)]/30', hex: '#2e9e6d' }
  }
}

// The only text that should ever be shown to a user for a bin's fill
// state: EMPTY at 0%, FULL at >=90%, otherwise the exact percentage.
// Never "Normal" / "Almost Full" / "Partial" / "Half" — those are internal
// bucket names (STATUS above) used for filtering, stats, and notification
// thresholds, not for display.
export function getDisplayStatus(fillLevel, offline = false) {
  if (offline) return 'OFFLINE'
  const fill = Math.max(0, Math.min(100, Math.round(fillLevel ?? 0)))
  if (fill === 0) return 'EMPTY'
  if (fill >= 90) return 'FULL'
  return `${fill}%`
}

export function priorityFromFill(fillLevel) {
  if (fillLevel >= 90) return 'High'
  if (fillLevel >= 71) return 'Medium'
  return 'Low'
}

export function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
