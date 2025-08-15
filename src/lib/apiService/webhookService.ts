import api from './index'

// Webhook Management API - Based on webhook management documentation
export const webhooksAPI = {
  // Create webhook (POST /tenant/webhooks)
  createWebhook: async (webhookData: {
    name: string
    url: string
    events: string[]
    secret?: string
    headers?: Record<string, string>
    retryCount?: number
    timeout?: number
  }) => {
    const response = await api.post('/tenant/webhooks', webhookData)
    return response.data
  },

  // Get webhooks (GET /tenant/webhooks)
  getWebhooks: async () => {
    const response = await api.get('/tenant/webhooks')
    return response.data
  },

  // Get webhook by ID (GET /tenant/webhooks/:id)
  getWebhook: async (id: string) => {
    const response = await api.get(`/tenant/webhooks/${id}`)
    return response.data
  },

  // Update webhook (PUT /tenant/webhooks/:id)
  updateWebhook: async (id: string, webhookData: {
    name?: string
    url?: string
    events?: string[]
    secret?: string
    headers?: Record<string, string>
    retryCount?: number
    timeout?: number
    isActive?: boolean
  }) => {
    const response = await api.put(`/tenant/webhooks/${id}`, webhookData)
    return response.data
  },

  // Delete webhook (DELETE /tenant/webhooks/:id)
  deleteWebhook: async (id: string) => {
    const response = await api.delete(`/tenant/webhooks/${id}`)
    return response.data
  },

  // Get webhook deliveries (GET /tenant/webhooks/:id/deliveries)
  getWebhookDeliveries: async (id: string, page = 1, limit = 10) => {
    const response = await api.get(`/tenant/webhooks/${id}/deliveries?page=${page}&limit=${limit}`)
    return response.data
  },

  // Retry failed delivery (POST /tenant/webhooks/deliveries/:deliveryId/retry)
  retryWebhookDelivery: async (deliveryId: string) => {
    const response = await api.post(`/tenant/webhooks/deliveries/${deliveryId}/retry`)
    return response.data
  },

  // Test webhook (POST /tenant/webhooks/:id/test)
  testWebhook: async (id: string) => {
    const response = await api.post(`/tenant/webhooks/${id}/test`)
    return response.data
  },
} 