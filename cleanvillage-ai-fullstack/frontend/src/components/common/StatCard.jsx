import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, accent = 'teal', hint }) {
  const accents = {
    teal: { text: 'text-teal-600 dark:text-teal-300', bg: 'bg-teal-600/10' },
    success: { text: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success)]/10' },
    warn: { text: 'text-[var(--color-amber-warn)]', bg: 'bg-[var(--color-amber-warn)]/10' },
    danger: { text: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-danger)]/10' },
    slate: { text: 'text-slate-500', bg: 'bg-slate-500/10' },
  }
  const a = accents[accent] || accents.teal

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card rounded-2xl p-4 flex items-center gap-3.5"
    >
      <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${a.bg} ${a.text}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-secondary)] truncate">{label}</p>
        <p className="font-display text-2xl font-semibold leading-tight">{value}</p>
        {hint && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{hint}</p>}
      </div>
    </motion.div>
  )
}
