import { api } from './client'

export const binsApi = {
  list: () => api.get('/api/bins?limit=200'),
  getById: (binId) => api.get(`/api/bins/${binId}`),
  create: (payload) => api.post('/api/bins', payload),
  update: (binId, payload) => api.put(`/api/bins/${binId}`, payload),
  remove: (binId) => api.delete(`/api/bins/${binId}`),
  setFillLevel: (binId, fillLevel) => api.patch(`/api/bins/${binId}/fill`, { fillLevel }),
  setSensorStatus: (binId, sensorStatus) => api.patch(`/api/bins/${binId}/sensor-status`, { sensorStatus }),
  collect: (binId, workerName) => api.patch(`/api/bins/${binId}/collect`, { workerName }),
}
