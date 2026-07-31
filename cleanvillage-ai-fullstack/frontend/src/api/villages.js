import { api } from './client'

export const villagesApi = {
  list: () => api.get('/api/villages'),
  create: (payload) => api.post('/api/villages', payload),
  update: (villageId, payload) => api.put(`/api/villages/${villageId}`, payload),
  remove: (villageId) => api.delete(`/api/villages/${villageId}`),
}
