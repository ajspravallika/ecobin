import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import * as binsService from '../firebase/binsService'
import { getStatusFromFill, priorityFromFill, STATUS } from '../utils/binHelpers'

const AppContext = createContext(null)

let notifSeq = 1
let historySeq = 1

export function AppProvider({ children }) {
  const [bins, setBins] = useState([])
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoSimulation, setAutoSimulation] = useState(false)

  const intervalRef = useRef(null)
  const binsRef = useRef([])

  useEffect(() => {
    binsRef.current = bins
  }, [bins])

  useEffect(() => {
    binsService.getBins().then((data) => {
      setBins(data)
      setLoading(false)
    })
  }, [])

  const pushNotification = useCallback((bin) => {
    setNotifications((prev) => [
      {
        id: `NTF-${notifSeq++}`,
        binId: bin.binId,
        village: bin.village,
        location: bin.landmark,
        ward: bin.ward,
        fillLevel: bin.fillLevel,
        status: bin.status,
        priority: priorityFromFill(bin.fillLevel),
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ].slice(0, 200))
  }, [])

  // Central mutator: apply a new fill level to a bin, recompute status, and
  // fire a notification whenever the bin crosses into Almost Full / Full
  // territory (mirrors: ESP32 sends {binId, fillLevel} -> backend resolves
  // location by Bin ID -> notification generated -> dashboard updates).
  const applyFillLevel = useCallback((binId, fillLevel) => {
    setBins((prev) => {
      const next = prev.map((b) => {
        if (b.binId !== binId) return b
        const clamped = Math.max(0, Math.min(100, Math.round(fillLevel)))
        const prevStatus = b.status
        const newStatus = getStatusFromFill(clamped)
        const updated = {
          ...b,
          fillLevel: clamped,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        }
        const crossedUp =
          (newStatus === STATUS.FULL && prevStatus !== STATUS.FULL) ||
          (newStatus === STATUS.ALMOST_FULL && prevStatus === STATUS.NORMAL)
        if (crossedUp) {
          queueMicrotask(() => pushNotification(updated))
        }
        return updated
      })
      return next
    })
  }, [pushNotification])

  const setSensorStatus = useCallback((binId, sensorStatus) => {
    setBins((prev) => prev.map((b) => (b.binId === binId ? { ...b, sensorStatus } : b)))
  }, [])

  const markCollected = useCallback((binId, workerName) => {
    setBins((prev) => {
      const bin = prev.find((b) => b.binId === binId)
      if (bin) {
        setHistory((h) => [
          {
            id: `HIST-${historySeq++}`,
            binId: bin.binId,
            village: bin.village,
            location: bin.landmark,
            ward: bin.ward,
            worker: workerName || bin.assignedWorkerName,
            fillLevelBeforeCollection: bin.fillLevel,
            collectedAt: new Date().toISOString(),
          },
          ...h,
        ])
      }
      return prev.map((b) =>
        b.binId === binId
          ? { ...b, fillLevel: 0, status: STATUS.NORMAL, lastUpdated: new Date().toISOString() }
          : b
      )
    })
    setNotifications((prev) => prev.filter((n) => n.binId !== binId))
  }, [])

  const addBin = useCallback(async (bin) => {
    const saved = await binsService.addBin(bin)
    setBins((prev) => [...prev, saved])
    return saved
  }, [])

  const editBin = useCallback(async (binId, updates) => {
    const saved = await binsService.updateBin(binId, updates)
    setBins((prev) => prev.map((b) => (b.binId === binId ? saved : b)))
    return saved
  }, [])

  const removeBin = useCallback(async (binId) => {
    await binsService.deleteBin(binId)
    setBins((prev) => prev.filter((b) => b.binId !== binId))
    setNotifications((prev) => prev.filter((n) => n.binId !== binId))
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Auto Simulation mode: every tick, nudge a handful of random online bins
  // upward so the dashboard looks "live" during a demo, exactly like real
  // ultrasonic sensors reporting gradually rising fill levels.
  useEffect(() => {
    if (!autoSimulation) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      const onlineBins = binsRef.current.filter((b) => b.sensorStatus === 'Online' && b.fillLevel < 100)
      if (!onlineBins.length) return
      const sampleSize = Math.min(4, onlineBins.length)
      const shuffled = [...onlineBins].sort(() => Math.random() - 0.5).slice(0, sampleSize)
      // apply through the same crossing-detection path used by the manual slider
      shuffled.forEach((b) => {
        applyFillLevel(b.binId, Math.min(100, b.fillLevel + Math.ceil(Math.random() * 9)))
      })
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [autoSimulation, applyFillLevel])

  const stats = useMemo(() => {
    const total = bins.length
    const normal = bins.filter((b) => b.status === STATUS.NORMAL).length
    const almostFull = bins.filter((b) => b.status === STATUS.ALMOST_FULL).length
    const full = bins.filter((b) => b.status === STATUS.FULL).length
    const offline = bins.filter((b) => b.sensorStatus === 'Offline').length
    const collectedToday = history.filter(
      (h) => new Date(h.collectedAt).toDateString() === new Date().toDateString()
    ).length
    const pendingCollection = almostFull + full
    return { total, normal, almostFull, full, offline, collectedToday, pendingCollection }
  }, [bins, history])

  const value = {
    bins,
    notifications,
    history,
    loading,
    stats,
    autoSimulation,
    setAutoSimulation,
    applyFillLevel,
    setSensorStatus,
    markCollected,
    addBin,
    editBin,
    removeBin,
    dismissNotification,
    markAllNotificationsRead,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
