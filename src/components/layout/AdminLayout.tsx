"use client"

import { ReactNode } from 'react'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getAdminLoginUrl } from '@/lib/utils/urlUtils'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Tenants', href: '/admin/tenants', icon: Building },
    { name: 'Users', href: '/admin/users', icon: Users },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    setIsLoggingOut(true)
    
    try {
      // Call backend logout API (same as tenant admin)
      const token = localStorage.getItem('access_token')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'x-stack-access-token': token,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with logout even if API call fails
    } finally {
      logout()
      const adminLoginUrl = getAdminLoginUrl()
      router.push(adminLoginUrl)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Super Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Super Administrator</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className={`mr-2 h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <div className="flex h-16 items-center px-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Super Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Super Administrator</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className={`mr-2 h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1"></div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
                
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name || 'Super Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
