import { motion } from 'framer-motion'
import { getStatusColor } from '../../utils/binHelpers'

const SIZES = {
  sm: { w: 34, h: 44, showLabel: false },
  md: { w: 56, h: 72, showLabel: true },
  lg: { w: 96, h: 124, showLabel: true },
}

// The recurring visual signature of the product: every bin is drawn as a
// small silhouette that fills like liquid, coloured by status. Used in stat
// cards, bin cards/tables, and bin detail pages so fill level always reads
// the same way, everywhere, at a glance.
export default function BinGauge({ fillLevel = 0, status = 'Normal', size = 'md', offline = false }) {
  const { w, h, showLabel } = SIZES[size] || SIZES.md
  const color = getStatusColor(status)
  const clampedFill = Math.max(0, Math.min(100, fillLevel))
  const clipId = `bin-clip-${Math.random().toString(36).slice(2, 9)}`
  const liquidTop = h * (1 - clampedFill / 100)

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: w }}>
      <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="overflow-visible">
        {/* bin lid */}
        <rect x={w * 0.08} y={0} width={w * 0.84} height={h * 0.09} rx={2} fill="var(--border-soft)" />
        {/* bin body outline */}
        <clipPath id={clipId}>
          <path
            d={`M ${w * 0.12} ${h * 0.13}
                L ${w * 0.88} ${h * 0.13}
                L ${w * 0.8} ${h + 4}
                L ${w * 0.2} ${h + 4}
                Z`}
          />
        </clipPath>
        <path
          d={`M ${w * 0.12} ${h * 0.13}
              L ${w * 0.88} ${h * 0.13}
              L ${w * 0.8} ${h + 4}
              L ${w * 0.2} ${h + 4}
              Z`}
          fill="var(--bg-surface-2)"
          stroke="var(--border-soft)"
          strokeWidth="1.5"
        />
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={0}
            width={w}
            height={h + 10}
            fill={offline ? '#94a3b8' : color.hex}
            fillOpacity={offline ? 0.35 : 0.85}
            initial={false}
            animate={{ y: liquidTop }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          />
          {!offline && (
            <motion.g animate={{ y: liquidTop }} transition={{ type: 'spring', stiffness: 90, damping: 16 }}>
              <g className="wave-anim">
                <path
                  d={`M 0 0 Q ${w * 0.25} -4 ${w * 0.5} 0 T ${w} 0 T ${w * 1.5} 0 V 6 H 0 Z`}
                  fill={color.hex}
                  fillOpacity={0.55}
                  transform={`translate(0, -2)`}
                />
              </g>
            </motion.g>
          )}
        </g>
        <path
          d={`M ${w * 0.12} ${h * 0.13}
              L ${w * 0.88} ${h * 0.13}
              L ${w * 0.8} ${h + 4}
              L ${w * 0.2} ${h + 4}
              Z`}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth="1.5"
        />
      </svg>
      {showLabel && (
        <span className={`font-mono-data text-xs font-semibold ${offline ? 'text-slate-400' : color.text}`}>
          {offline ? '—' : `${clampedFill}%`}
        </span>
      )}
    </div>
  )
}
