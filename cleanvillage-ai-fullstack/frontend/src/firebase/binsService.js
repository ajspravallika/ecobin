// Simulated Firestore-style data access layer. Every exported function
// mirrors what the real Firestore call would look like so swapping in a
// live project later (see firebaseConfig.js) is a body-only change.
//
// e.g. getBins() today reads an in-memory array; tomorrow it becomes
//      const snap = await getDocs(collection(db, 'bins')) ...

import { INITIAL_BINS } from '../data/bins'

const STORE_KEY = '__cleanvillage_bins_store__'

function loadStore() {
  if (!window[STORE_KEY]) {
    window[STORE_KEY] = INITIAL_BINS.map((b) => ({ ...b }))
  }
  return window[STORE_KEY]
}

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function getBins() {
  await delay(150)
  return loadStore().map((b) => ({ ...b }))
}

export async function getBinById(binId) {
  await delay(100)
  const bin = loadStore().find((b) => b.binId === binId)
  return bin ? { ...bin } : null
}

export async function addBin(bin) {
  await delay(200)
  const store = loadStore()
  store.push(bin)
  return { ...bin }
}

export async function updateBin(binId, updates) {
  await delay(150)
  const store = loadStore()
  const idx = store.findIndex((b) => b.binId === binId)
  if (idx === -1) throw new Error(`Bin ${binId} not found`)
  store[idx] = { ...store[idx], ...updates }
  return { ...store[idx] }
}

export async function deleteBin(binId) {
  await delay(150)
  const store = loadStore()
  const idx = store.findIndex((b) => b.binId === binId)
  if (idx !== -1) store.splice(idx, 1)
  return true
}
