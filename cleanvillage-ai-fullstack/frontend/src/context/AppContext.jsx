import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { binsApi } from '../api/bins'
import { villagesApi } from '../api/villages'
import { workersApi } from '../api/workers'
import { notificationsApi } from '../api/notifications'
import { historyApi } from '../api/history'
import { dashboardApi } from '../api/dashboard'
import { simulationApi } from '../api/simulation'
import { getSocket, disconnectSocket } from '../lib/socket'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

const EMPTY_STATS = {
  total: 0,
  normal: 0,
  almostFull: 0,
  full: 0,
  offline: 0,
  collectedToday: 0,
  pendingCollection: 0,
}

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [bins, setBins] = useState([])
  const [villages, setVillages] = useState([])
  const [workers, setWorkers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [autoSimulation, setAutoSimulation] = useState(false)
  const [error, setError] = useState(null)

  // Everything here comes straight from MongoDB Atlas via the Express API.
  // If the collections are empty, these arrays stay empty and `stats`
  // reports zeros — there is no local fallback dataset.
  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [binsRes, villagesRes, workersRes, notifRes, historyRes, statsRes, simRes] = await Promise.all([
        binsApi.list(),
        villagesApi.list(),
        workersApi.list(),
        notificationsApi.list(),
        historyApi.list(),
        dashboardApi.stats(),
        simulationApi.status().catch(() => ({ running: false })),
      ])
      setBins(binsRes.data)
      setVillages(villagesRes.data)
      setWorkers(workersRes.data)
      setNotifications(notifRes.data)
      setHistory(historyRes.data)
      setStats(statsRes.data)
      setAutoSimulation(!!simRes.running)
    } catch (err) {
      setError(err.message || 'Failed to load data from the server')
      setBins([])
      setVillages([])
      setWorkers([])
      setNotifications([])
      setHistory([])
      setStats(EMPTY_STATS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setBins([])
      setVillages([])
      setWorkers([])
      setNotifications([])
      setHistory([])
      setStats(EMPTY_STATS)
      disconnectSocket()
      return
    }
    refreshAll()

    const socket = getSocket()
    if (!socket) return undefined
    socket.connect()

    // Real-time push from the backend (see backend/src/socket/index.js).
    // These replace the old client-only simulation entirely — every event
    // here originates from a change that actually happened in Atlas.
    const onBinUpdate = (bin) => {
      setBins((prev) => {
        const exists = prev.some((b) => b.binId === bin.binId)
        return exists ? prev.map((b) => (b.binId === bin.binId ? bin : b)) : [...prev, bin]
      })
    }
    const onNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 200))
    }
    const onStats = (nextStats) => setStats(nextStats)

    socket.on('bin:update', onBinUpdate)
    socket.on('notification:new', onNotification)
    socket.on('stats:update', onStats)

    return () => {
      socket.off('bin:update', onBinUpdate)
      socket.off('notification:new', onNotification)
      socket.off('stats:update', onStats)
    }
  }, [isAuthenticated, refreshAll])

  // ---- Mutations: every one of these hits the real API. ----

  const applyFillLevel = useCallback(async (binId, fillLevel) => {
    const res = await binsApi.setFillLevel(binId, fillLevel)
    setBins((prev) => prev.map((b) => (b.binId === binId ? res.data : b)))
    if (res.notification) setNotifications((prev) => [res.notification, ...prev])
    return res.data
  }, [])

  const setSensorStatus = useCallback(async (binId, sensorStatus) => {
    const res = await binsApi.setSensorStatus(binId, sensorStatus)
    setBins((prev) => prev.map((b) => (b.binId === binId ? res.data : b)))
    return res.data
  }, [])

  const markCollected = useCallback(async (binId, workerName) => {
    const res = await binsApi.collect(binId, workerName)
    setBins((prev) => prev.map((b) => (b.binId === binId ? res.data : b)))
    setHistory((prev) => [res.history, ...prev])
    setNotifications((prev) => prev.filter((n) => n.binId !== binId))
    return res.data
  }, [])

  const addBin = useCallback(async (bin) => {
    const res = await binsApi.create(bin)
    setBins((prev) => [...prev, res.data])
    return res.data
  }, [])

  const editBin = useCallback(async (binId, updates) => {
    const res = await binsApi.update(binId, updates)
    setBins((prev) => prev.map((b) => (b.binId === binId ? res.data : b)))
    return res.data
  }, [])

  const removeBin = useCallback(async (binId) => {
    await binsApi.remove(binId)
    setBins((prev) => prev.filter((b) => b.binId !== binId))
    setNotifications((prev) => prev.filter((n) => n.binId !== binId))
  }, [])

  const addVillage = useCallback(async (village) => {
    const res = await villagesApi.create(village)
    setVillages((prev) => [...prev, res.data])
    return res.data
  }, [])
const removeVillage = useCallback(async (villageId) => {
  await villagesApi.remove(villageId)
  setVillages((prev) => prev.filter((v) => v.villageId !== villageId))
}, [])
  const dismissNotification = useCallback(async (id) => {
    await notificationsApi.dismiss(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Auto Simulation now runs server-side (see POST /api/simulation/start)
  // so it only ever nudges bins that genuinely exist in Atlas — it cannot
  // create bins, and does nothing at all if the collection is empty.
  const toggleAutoSimulation = useCallback(async () => {
    if (autoSimulation) {
      await simulationApi.stop()
      setAutoSimulation(false)
    } else {
      await simulationApi.start()
      setAutoSimulation(true)
    }
  }, [autoSimulation])

  const villageMap = useMemo(
    () => Object.fromEntries(villages.map((v) => [v.villageId, v])),
    [villages]
  )

  const value = {
    bins,
    villages,
    workers,
    villageMap,
    notifications,
    history,
    loading,
    error,
    stats,
    autoSimulation,
    setAutoSimulation: toggleAutoSimulation,
    applyFillLevel,
    setSensorStatus,
    markCollected,
    addBin,
    editBin,
    addVillage,
    removeVillage,
    removeBin,
    dismissNotification,
    markAllNotificationsRead,
    refreshAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
