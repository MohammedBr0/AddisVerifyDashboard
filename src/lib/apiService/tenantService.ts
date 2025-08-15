import api from './index'

// Tenants API - Based on actual backend routes
export const tenantsAPI = {
  // Create tenant (POST /client/tenant)
  createTenant: async (tenantData: {
    legal_name: string
    company_email: string
    country_of_registration: string
    registration_date: string
    registration_number: string
    phone_number: string
    doing_business_as?: string
    registered_address: {
      street: string
      city: string
      state: string
      country: string
      postal_code: string
    }
  }) => {
    const response = await api.post('/client/tenant', tenantData)
    return response.data
  },

  // Get tenant (GET /client/tenant)
  getTenant: async () => {
    const response = await api.get('/client/tenant')
    return response.data
  },

  // Update tenant (PUT /client/tenant)
  updateTenant: async (tenantData: {
    legal_name?: string
    company_email?: string
    country_of_registration?: string
    registration_date?: string
    registration_number?: string
    phone_number?: string
    doing_business_as?: string
    registered_address?: {
      street: string
      city: string
      state: string
      country: string
      postal_code: string
    }
  }) => {
    const response = await api.put('/client/tenant', tenantData)
    return response.data
  },

  // Delete tenant (DELETE /client/tenant)
  deleteTenant: async () => {
    const response = await api.delete('/client/tenant')
    return response.data
  },

  // List tenants (GET /admin/tenant) - Admin only
  listTenants: async () => {
    const response = await api.get('/admin/tenant')
    return response.data
  },
} 