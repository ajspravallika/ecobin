import { api } from './client'

export const historyApi = {
  list: () => api.get('/api/history?limit=200'),
}
