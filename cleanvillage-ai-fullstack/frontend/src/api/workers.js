import { api } from './client'

export const workersApi = {
  list: () => api.get('/api/workers'),
  getById: (workerId) => api.get(`/api/workers/${workerId}`),
  getBins: (workerId) => api.get(`/api/workers/${workerId}/bins`),
  create: (payload) => api.post('/api/workers', payload),
  update: (workerId, payload) => api.put(`/api/workers/${workerId}`, payload),
  remove: (workerId) => api.delete(`/api/workers/${workerId}`),
}
