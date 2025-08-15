import api from './index'

// Dashboard API - Using existing endpoints for stats
export const dashboardAPI = {
  // Get user stats for dashboard
  getStats: async () => {
    const response = await api.get('/auth/user/stats')
    return response.data
  },

  // Get recent activity (can be derived from user stats or activity logs)
  getRecentActivity: async () => {
    // This might need to be implemented on the backend
    const response = await api.get('/auth/user/activity')
    return response.data
  },
} 