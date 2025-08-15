"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/apiService/authService'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const { login, logout, setLoading, token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Wait for hydration from persisted storage
    const hydrateAuth = async () => {
      try {
        // Small delay to allow Zustand persist to hydrate
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const storedToken = localStorage.getItem('access_token')
        
        if (storedToken && (!token || !isAuthenticated)) {
          setLoading(true)
          
          try {
            // Validate token with backend
            const profileResponse = await authAPI.getProfile()
            
            if (profileResponse?.data) {
              // Token is valid, update auth state
              login(profileResponse.data, storedToken)
            } else {
              // Token invalid, clear everything
              localStorage.removeItem('access_token')
              logout()
            }
          } catch (error: any) {
            // Token validation failed
            localStorage.removeItem('access_token')
            logout()
          } finally {
            setLoading(false)
          }
        } else if (!storedToken && isAuthenticated) {
          // No token in localStorage but store thinks we're authenticated
          logout()
        }
      } finally {
        setIsHydrated(true)
      }
    }

    hydrateAuth()
  }, [])

  // Show nothing until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600 text-sm">Loading application...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}