import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search Bin ID, village, location...' }) {
  return (
    <div className="relative flex-1 max-w-md">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 placeholder:text-[var(--text-secondary)]"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  )
}
