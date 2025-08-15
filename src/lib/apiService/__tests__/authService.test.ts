import { authAPI, RegisterData, LoginCredentials } from '../authService'

// Mock the api module
jest.mock('../index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import api from '../index'

const mockApi = api as jest.Mocked<typeof api>

describe('authAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  describe('signUp', () => {
    it('should register a new user successfully', async () => {
      const registerData: RegisterData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'john.doe@example.com',
        email: 'john.doe@example.com',
        password: 'securePassword123',
      }

      const mockResponse = {
        user_id: 'user123',
        access_token: 'token123',
        expires_in: 3600,
      }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await authAPI.signUp(registerData)

      expect(mockApi.post).toHaveBeenCalledWith('/auth/sign-up', registerData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle registration errors', async () => {
      const registerData: RegisterData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'john.doe@example.com',
        email: 'john.doe@example.com',
        password: 'weak',
      }

      mockApi.post.mockRejectedValue({
        response: {
          data: {
            error: 'Password too weak'
          }
        }
      })

      await expect(authAPI.signUp(registerData)).rejects.toThrow('Password too weak')
      expect(mockApi.post).toHaveBeenCalledWith('/auth/sign-up', registerData)
    })

    it('should handle network errors', async () => {
      const registerData: RegisterData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'john.doe@example.com',
        email: 'john.doe@example.com',
        password: 'securePassword123',
      }

      mockApi.post.mockRejectedValue(new Error('Network error'))

      await expect(authAPI.signUp(registerData)).rejects.toThrow('Registration failed')
    })
  })

  describe('register', () => {
    it('should be equivalent to signUp', async () => {
      const registerData: RegisterData = {
        firstname: 'Jane',
        lastname: 'Smith',
        username: 'jane.smith@example.com',
        email: 'jane.smith@example.com',
        password: 'securePassword123',
      }

      const mockResponse = {
        user_id: 'user456',
        access_token: 'token456',
        expires_in: 3600,
      }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const signUpResult = await authAPI.signUp(registerData)
      
      // Reset mock to test register method
      mockApi.post.mockClear()
      mockApi.post.mockResolvedValue({ data: mockResponse })
      
      const registerResult = await authAPI.register(registerData)

      expect(signUpResult).toEqual(registerResult)
    })
  })

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const mockResponse = {
        user_id: 'user123',
        access_token: 'token123',
        expires_in: 3600,
      }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await authAPI.signIn('test@example.com', 'password123')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/sign-in', {
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('login', () => {
    it('should login a user successfully', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse = {
        user_id: 'user123',
        access_token: 'token123',
        expires_in: 3600,
      }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await authAPI.login(credentials)

      expect(mockApi.post).toHaveBeenCalledWith('/auth/sign-in', credentials)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockProfile = {
        data: {
          id: 'user123',
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe'
        }
      }

      mockApi.get.mockResolvedValue({ data: mockProfile })

      const result = await authAPI.getProfile()

      expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockProfile.data)
    })
  })

  describe('logout', () => {
    it('should logout successfully and clear tokens', async () => {
      const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
      mockApi.post.mockResolvedValue({})

      await authAPI.logout()

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    })

    it('should clear tokens even if API call fails', async () => {
      const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
      mockApi.post.mockRejectedValue(new Error('API Error'))

      await authAPI.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
      mockLocalStorage.getItem.mockReturnValue('refresh_token_123')

      const mockResponse = {
        data: {
          access_token: 'new_token_123'
        }
      }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await authAPI.refreshToken()

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('refresh_token')
      expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', { 
        refresh_token: 'refresh_token_123' 
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should throw error if no refresh token available', async () => {
      const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
      mockLocalStorage.getItem.mockReturnValue(null)

      await expect(authAPI.refreshToken()).rejects.toThrow('No refresh token available')
    })
  })
})