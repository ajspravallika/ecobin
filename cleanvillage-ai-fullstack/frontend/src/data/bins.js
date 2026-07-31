import { VILLAGES, LANDMARKS } from './villages'
import { WORKERS } from './workers'
import { getStatusFromFill } from '../utils/binHelpers'

const BINS_PER_VILLAGE = 20

// Deterministic-ish pseudo-random so the demo dataset looks the same on
// every reload (no jarring re-shuffle), but still feels organic.
function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function buildInitialBins() {
  const bins = []
  let globalIndex = 1
  const rand = seededRandom(42)

  VILLAGES.forEach((village, vIdx) => {
    const eligibleWorkers = WORKERS.filter((w) => w.villages.includes(village.id))
    for (let i = 0; i < BINS_PER_VILLAGE; i++) {
      const binNumber = String(globalIndex).padStart(3, '0')
      const binId = `BIN-${binNumber}`
      const landmark = LANDMARKS[(vIdx * BINS_PER_VILLAGE + i) % LANDMARKS.length]
      const worker = eligibleWorkers.length
        ? eligibleWorkers[i % eligibleWorkers.length]
        : WORKERS[globalIndex % WORKERS.length]

      // Weighted distribution: mostly normal, some almost-full, a few full
      const roll = rand()
      let fillLevel
      if (roll > 0.93) fillLevel = 90 + Math.floor(rand() * 10) // full
      else if (roll > 0.75) fillLevel = 71 + Math.floor(rand() * 19) // almost full
      else fillLevel = Math.floor(rand() * 70) // normal

      const isOffline = rand() > 0.95
      const minutesAgo = Math.floor(rand() * 600)

      bins.push({
        binId,
        villageId: village.id,
        village: village.name,
        mandal: village.mandal,
        ward: village.ward,
        landmark,
        assignedWorkerId: worker.id,
        assignedWorkerName: worker.name,
        sensorStatus: isOffline ? 'Offline' : 'Online',
        fillLevel: isOffline ? fillLevel : fillLevel,
        status: isOffline ? 'Offline' : getStatusFromFill(fillLevel),
        lastUpdated: new Date(Date.now() - minutesAgo * 60000).toISOString(),
        binType: i % 5 === 0 ? 'Bulk Community Bin' : 'Household Cluster Bin',
        capacityLiters: i % 5 === 0 ? 500 : 120,
      })
      globalIndex++
    }
  })

  return bins
}

export const INITIAL_BINS = buildInitialBins()
