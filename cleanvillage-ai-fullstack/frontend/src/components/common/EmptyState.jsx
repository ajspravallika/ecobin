export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-surface-2)] grid place-items-center text-[var(--text-secondary)] mb-4">
          <Icon size={24} />
        </div>
      )}
      <p className="font-display font-semibold text-base">{title}</p>
      {description && <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">{description}</p>}
    </div>
  )
}
