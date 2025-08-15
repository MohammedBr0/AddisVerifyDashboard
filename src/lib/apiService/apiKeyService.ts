import api from './index'

// API Keys API - Based on actual backend routes
export const apiKeysAPI = {
  // Create API key (POST /tenant/api-keys)
  createApiKey: async (apiKeyData: {
    name: string;
    description?: string;
    expires_at_millis?: number;
    is_public?: boolean;
  }) => {
    const response = await api.post('/tenant/api-keys', apiKeyData);
    return response.data;
  },

  // Get API keys (GET /tenant/api-keys)
  getApiKeys: async () => {
    const response = await api.get('/tenant/api-keys');
    return response.data;
  },

  // Update API key (PATCH /tenant/api-keys/:id)
  updateApiKey: async (id: string, updateData: {
    description?: string;
    revoked?: boolean;
  }) => {
    const response = await api.patch(`/tenant/api-keys/${id}`, updateData);
    return response.data;
  },

  // Delete API key (DELETE /tenant/api-keys/:id)
  deleteApiKey: async (id: string) => {
    const response = await api.delete(`/tenant/api-keys/${id}`);
    return response.data;
  },
}; 