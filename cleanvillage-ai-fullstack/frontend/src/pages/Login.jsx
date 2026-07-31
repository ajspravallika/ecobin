import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PiRecycleBold } from 'react-icons/pi'
import { FiShield, FiUsers, FiTruck, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { useAuth, ROLES } from '../context/AuthContext'

const ROLE_CARDS = [
  { role: ROLES.ADMIN, icon: FiShield, desc: 'Full system access, bin registry, and settings.' },
  { role: ROLES.OFFICER, icon: FiUsers, desc: 'Monitor bins, review reports, dispatch workers.' },
  { role: ROLES.WORKER, icon: FiTruck, desc: "View today's collection tasks and mark bins done." },
]

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(ROLES.ADMIN)
  const [workerId, setWorkerId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register({
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              workerId: role === ROLES.WORKER ? workerId.trim() || null : null,
            })
      navigate(user.role === ROLES.WORKER ? '/worker' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40'
  const labelClass = 'text-xs font-medium text-[var(--text-secondary)]'

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-page)]">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-teal-950 text-white p-12">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-teal-600 grid place-items-center">
            <PiRecycleBold size={22} />
          </div>
          <div>
            <p className="font-display font-bold text-lg">CleanVillage AI</p>
            <p className="text-xs text-teal-200">Smart Waste Monitoring and Collection System</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">
            Every bin already knows where it is.
          </p>
          <p className="text-teal-200 mt-4 leading-relaxed">
            No GPS module, no manual mapping. Each ESP32 reports its Bin ID and fill
            percentage — your backend resolves the rest: village, ward, and landmark,
            instantly, straight from your own database.
          </p>
        </div>

        <p className="relative text-xs text-teal-300">Connected to your live backend and MongoDB Atlas database</p>
      </div>

      {/* Right: login/register form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white grid place-items-center">
              <PiRecycleBold size={19} />
            </div>
            <p className="font-display font-bold text-lg">CleanVillage AI</p>
          </div>

          <div className="flex rounded-xl bg-[var(--bg-surface-2)] p-1 mb-6 w-fit">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-teal-600 text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <h2 className="font-display text-2xl font-bold">
            {mode === 'login' ? 'Sign in to your dashboard' : 'Create your account'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            {mode === 'login'
              ? 'Use the email and password for your account on this deployment.'
              : "First time here? Create the account you'll use to manage your bins."}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] px-3.5 py-2.5 text-sm">
              <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === 'register' && (
              <div>
                <label className={labelClass}>Full name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="A. Chandra Sekhar" />
              </div>
            )}

            <div>
              <label className={labelClass}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="grid gap-2.5">
                  {ROLE_CARDS.map(({ role: r, icon: Icon, desc }) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`text-left flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                        role === r
                          ? 'border-teal-500 ring-2 ring-teal-500/25 bg-teal-600/5'
                          : 'border-[var(--border-soft)] hover:border-teal-300'
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${role === r ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {role === ROLES.WORKER && (
                  <div>
                    <label className={labelClass}>Worker ID</label>
                    <input
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      className={inputClass}
                      placeholder="WRK-01 (matches the Worker profile you created)"
                    />
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                      Create the Worker profile first via <code>POST /api/workers</code> if you haven't yet — this links your login to the bins assigned to that worker.
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 text-sm transition-colors"
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              {!submitting && <FiArrowRight size={15} />}
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-secondary)] mt-6 text-center">
            CleanVillage AI · Connected to your deployed backend and MongoDB Atlas database
          </p>
        </motion.div>
      </div>
    </div>
  )
}
