"use client"

import { ReactNode, useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { getAdminLoginUrl } from '@/lib/utils/urlUtils'

interface AdminRouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminRouteGuard({ children, fallback }: AdminRouteGuardProps) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      const adminLoginUrl = getAdminLoginUrl()
      
      try {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          router.push(adminLoginUrl)
          return
        }

        // Check if user has super admin role
        if (user.role !== 'SUPER_ADMIN') {
          router.push(adminLoginUrl)
          return
        }

        // Verify admin access with backend
        const token = localStorage.getItem('access_token')
        if (!token) {
          router.push(adminLoginUrl)
          return
        }

        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          router.push(adminLoginUrl)
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Admin access verification failed:', error)
        router.push(adminLoginUrl)
      }
    }

    checkAdminAccess()
  }, [isAuthenticated, user, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message
  if (!isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <p className="text-sm text-gray-500">Super admin privileges required.</p>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}
