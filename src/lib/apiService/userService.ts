import api from './index'

// Users API - Based on actual backend routes
export const usersAPI = {
  // Get all users (GET /auth/user)
  getUsers: async () => {
    const response = await api.get('/auth/user')
    return response.data
  },

  // Get user by ID (GET /auth/user/:id)
  getUser: async (id: string) => {
    const response = await api.get(`/auth/user/${id}`)
    return response.data
  },

  // Create user (POST /auth/user)
  createUser: async (userData: {
    email: string
    password: string
    firstname: string
    lastname: string
  }) => {
    const response = await api.post('/auth/user', userData)
    return response.data
  },

  // Update user (PUT /auth/user/:id)
  updateUser: async (id: string, userData: {
    firstname?: string
    lastname?: string
    email?: string
    isActive?: boolean
  }) => {
    const response = await api.put(`/auth/user/${id}`, userData)
    return response.data
  },

  // Delete user (DELETE /auth/user/:id)
  deleteUser: async (id: string) => {
    const response = await api.delete(`/auth/user/${id}`)
    return response.data
  },

  // Deactivate user (PATCH /auth/user/:id/deactivate)
  deactivateUser: async (id: string) => {
    const response = await api.patch(`/auth/user/${id}/deactivate`)
    return response.data
  },

  // Get user stats (GET /auth/user/stats)
  getUserStats: async () => {
    const response = await api.get('/auth/user/stats')
    return response.data
  },
}

// User Management API - Based on actual backend routes
export const userManagementAPI = {
  // Create user (POST /users/team)
  createUser: async (userData: {
    firstname: string;
    lastname: string;
    email: string;
  }) => {
    const response = await api.post('/users/team', userData);
    return response.data;
  },

  // Get tenant users (GET /users/team)
  getTenantUsers: async () => {
    const response = await api.get('/users/team');
    return response.data;
  },

  // Remove user from team (DELETE /users/team/{userId}/remove)
  removeUserFromTeam: async (userId: string) => {
    const response = await api.delete(`/users/team/${userId}/remove`);
    return response.data;
  },

  // Update user role (PATCH /users/team/{userId}/role)
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.patch(`/users/team/${userId}/role`, { role });
    return response.data;
  },
}; 