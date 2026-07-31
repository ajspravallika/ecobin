import { Link } from 'react-router-dom'
import { FiAlertCircle } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg-page)] p-6">
      <div className="text-center">
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4 text-[var(--text-secondary)]">
          <FiAlertCircle size={24} />
        </div>
        <h1 className="font-display text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="inline-block mt-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
