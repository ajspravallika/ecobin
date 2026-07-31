import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PiRecycleBold } from 'react-icons/pi'
import { FiShield, FiUsers, FiTruck, FiArrowRight } from 'react-icons/fi'
import { useAuth, ROLES } from '../context/AuthContext'
import { WORKERS } from '../data/workers'

const ROLE_CARDS = [
  { role: ROLES.ADMIN, icon: FiShield, desc: 'Full system access, bin registry, and settings.' },
  { role: ROLES.OFFICER, icon: FiUsers, desc: 'Monitor bins, review reports, dispatch workers.' },
  { role: ROLES.WORKER, icon: FiTruck, desc: "View today's collection tasks and mark bins done." },
]

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN)
  const [workerId, setWorkerId] = useState(WORKERS[0].id)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    login(selectedRole, workerId)
    navigate(selectedRole === ROLES.WORKER ? '/worker' : '/dashboard')
  }

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
            percentage — the Panchayat office resolves the rest: village, ward, and
            landmark, instantly.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['100', 'Bins live'], ['5', 'Villages'], ['24/7', 'Monitoring']].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="font-display text-xl font-bold">{n}</p>
                <p className="text-[11px] text-teal-200 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-teal-300">Ravulapalem Mandal Pilot Program · Government Deployment</p>
      </div>

      {/* Right: login form */}
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

          <h2 className="font-display text-2xl font-bold">Sign in to your dashboard</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Choose your role for this demo session. This is a simulated login — no
            password required for the prototype.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid gap-2.5">
              {ROLE_CARDS.map(({ role, icon: Icon, desc }) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`text-left flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    selectedRole === role
                      ? 'border-teal-500 ring-2 ring-teal-500/25 bg-teal-600/5'
                      : 'border-[var(--border-soft)] hover:border-teal-300'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${selectedRole === role ? 'bg-teal-600 text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{role}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedRole === ROLES.WORKER && (
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Worker profile</label>
                <select
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  {WORKERS.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} — {w.id}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 text-sm transition-colors"
            >
              Continue as {selectedRole} <FiArrowRight size={15} />
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-secondary)] mt-6 text-center">
            CleanVillage AI · Government Pilot Deployment · Data shown is simulated
          </p>
        </motion.div>
      </div>
    </div>
  )
}
