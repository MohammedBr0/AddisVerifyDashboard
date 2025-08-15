import api from './index'

export interface IdTypeFilters {
  search?: string
  country?: string
  isActive?: boolean
}

export interface CreateIdTypeRequest {
  name: string
  code: string
  country: string
  requiresFront: boolean
  requiresBack: boolean
  requiresSelfie: boolean
  description?: string
  validationRules?: any
}

export interface UpdateIdTypeRequest {
  name?: string
  code?: string
  country?: string
  requiresFront?: boolean
  requiresBack?: boolean
  requiresSelfie?: boolean
  description?: string
  validationRules?: any
  isActive?: boolean
}

export interface IIdType {
  id: string
  name: string
  code: string
  country: string
  requiresFront: boolean
  requiresBack: boolean
  requiresSelfie: boolean
  isActive: boolean
  description?: string
  validationRules?: any
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const idTypeAPI = {
  // Get all ID types for the authenticated user's tenant
  getIdTypes: async (page = 1, limit = 10, filters?: IdTypeFilters) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.country && { country: filters.country }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() })
    })

    const url = `/api/id-types?${params}`
    const response = await api.get(url)
    return response.data
  },

  // Get active ID types for the authenticated user's tenant
  getActiveIdTypes: async () => {
    const response = await api.get(`/api/id-types/active`)
    return response.data
  },

  // Get all active ID types for tenant (enhanced version)
  getTenantIdTypes: async (token?: string) => {
    try {
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/id-types', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch ID types' }))
        throw new Error(errorData.error || 'Failed to fetch ID types')
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Error fetching tenant ID types:', error)
      throw error
    }
  },

  // Get ID types for KYC session using session token
  getSessionIdTypes: async (sessionId: string, sessionToken: string) => {
    try {
      const response = await fetch(`/api/kyc/public/session/${sessionId}/id-types?token=${sessionToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch session ID types' }))
        throw new Error(errorData.error || 'Failed to fetch session ID types')
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Error fetching session ID types:', error)
      throw error
    }
  },

  // Get specific ID type
  getIdType: async (idTypeId: string) => {
    const response = await api.get(`/api/id-types/${idTypeId}`)
    return response.data
  },

  // Create new ID type
  createIdType: async (data: CreateIdTypeRequest) => {
    const response = await api.post(`/api/id-types`, data)
    return response.data
  },

  // Update ID type
  updateIdType: async (idTypeId: string, data: UpdateIdTypeRequest) => {
    const response = await api.put(`/api/id-types/${idTypeId}`, data)
    return response.data
  },

  // Delete ID type
  deleteIdType: async (idTypeId: string) => {
    const response = await api.delete(`/api/id-types/${idTypeId}`)
    return response.data
  },

  // Toggle ID type status
  toggleIdTypeStatus: async (idTypeId: string) => {
    const response = await api.patch(`/api/id-types/${idTypeId}/toggle`)
    return response.data
  }
} 