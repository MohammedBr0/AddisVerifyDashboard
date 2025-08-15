import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/apiService/authService'

export const useAuthInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const { user, isAuthenticated, token, login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      
      try {
        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('access_token')
        
        if (!storedToken) {
          // No token found, ensure clean state
          if (isAuthenticated) {
            logout()
          }
          setIsInitialized(true)
          setLoading(false)
          return
        }

        // If store doesn't have token but localStorage does, try to restore auth state
        if (!token || !isAuthenticated || !user) {
          try {
            // Validate token by fetching user profile
            const profileResponse = await authAPI.getProfile()
            
            if (profileResponse?.data || profileResponse?.user) {
              // Handle different response structures
              const userData = profileResponse.data || profileResponse.user || profileResponse
              
              // Create user object in expected format
              const userObj = {
                id: userData.id || 'unknown',
                name: userData.name || `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || userData.email,
                email: userData.email,
                role: userData.role || 'USER',
                company: userData.company || 'Unknown',
                firstname: userData.firstname,
                lastname: userData.lastname,
                tenantId: userData.tenantId
              }
              
              // Token is valid, restore auth state
              login(userObj, storedToken)
            } else {
              // Invalid response structure
              localStorage.removeItem('access_token')
              logout()
            }
          } catch (error: any) {
            // Token is invalid or expired
            localStorage.removeItem('access_token')
            logout()
          }
        }
      } catch (error) {
        // General error, logout
        logout()
      } finally {
        setIsInitialized(true)
        setLoading(false)
      }
    }

    initializeAuth()
  }, []) // Only run once on mount

  return {
    isInitialized,
    isAuthenticated: isAuthenticated && !!user && !!token,
    user,
    token,
    isLoading: useAuthStore(state => state.isLoading)
  }
}