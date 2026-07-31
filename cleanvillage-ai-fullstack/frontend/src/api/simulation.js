import { api } from './client'

// Server-side "Auto Simulation" — nudges whatever real bins already exist
// in the database. It never creates bins; if the database is empty this
// is simply a no-op tick on the backend.
export const simulationApi = {
  status: () => api.get('/api/simulation/status'),
  start: () => api.post('/api/simulation/start'),
  stop: () => api.post('/api/simulation/stop'),
}
