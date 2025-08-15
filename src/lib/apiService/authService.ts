import api from './index'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstname: string
  lastname: string
  username: string
  email: string
  password: string
  company_name?: string
  company_email?: string
  country_of_registration?: string
  registration_number?: string
  phone_number?: string
  doing_business_as?: string
  registered_address?: any
}

export interface AuthResponse {
  id?: string
  user_id: string
  access_token: string
  refresh_token?: string
  expires_in: number
  error?: string
  code?: string
}

export interface UserProfile {
  id?: string
  userprofileId?: string
  firstname?: string
  lastname?: string
  username?: string
  email?: string
  role?: string
  isActive?: boolean
  emailVerified?: boolean
  phoneNumber?: string
  profileImage?: string
  tenantId?: string
  data?: any
  user?: {
    id: string
    userprofileId: string
    firstname: string
    lastname: string
    username: string
    email: string
    role: string
    isActive: boolean
    emailVerified: boolean
    phoneNumber?: string
    profileImage?: string
    tenantId?: string
  }
  tenant?: {
    id: string
    legal_name: string
    company_email: string
    status: string
    onboarding_complete: boolean
  }
  stackAuth?: {
    profile_image_url?: string
  }
}

export const authAPI = {
  // Login user (signIn method for compatibility)
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/sign-in', { email, password })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  },

  // Login user (alternative method)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/sign-in', credentials)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  },

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/sign-up', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  },

  // Sign up user (alias for register method)
  async signUp(data: RegisterData): Promise<AuthResponse> {
    return this.register(data)
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/auth/me')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get profile')
    }
  },

  // Update user profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.put('/auth/profile', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile')
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still remove tokens even if API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ access_token: string }> {
    try {
      const refresh_token = localStorage.getItem('refresh_token')
      if (!refresh_token) {
        throw new Error('No refresh token available')
      }
      
      const response = await api.post('/auth/refresh', { refresh_token })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token refresh failed')
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send reset email')
    }
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password')
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to verify email')
    }
  }
} 