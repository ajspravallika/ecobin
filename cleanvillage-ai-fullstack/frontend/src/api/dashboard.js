import { api } from './client'

export const dashboardApi = {
  stats: () => api.get('/api/dashboard/stats'),
  statusDistribution: () => api.get('/api/dashboard/charts/status-distribution'),
  villageBreakdown: () => api.get('/api/dashboard/charts/village-breakdown'),
  collectionTrend: (days = 7) => api.get(`/api/dashboard/charts/collection-trend?days=${days}`),
}
