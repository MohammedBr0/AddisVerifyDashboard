"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, Search, Settings } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { authAPI, apiKeysAPI } from "@/lib/api"
import { 
  DashboardStats, 
  RecentActivity, 
  QuickActions, 
  SystemStatus,
  DashboardNavigation,
  DashboardOverview
} from "@/components/dashboard"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const router = useRouter()

  // Check authentication and tenant status
  useEffect(() => {
    const checkAuthAndTenant = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        setError(null)
        // Check if user has a tenant
        const profileResponse = await authAPI.getProfile()
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data
          if (!userData.tenant) {
            // No tenant - redirect to onboarding
            router.push('/onboarding')
            return
          }
        }

        // Load API keys count
        try {
          const apiKeysResponse = await apiKeysAPI.getApiKeys()
          if (apiKeysResponse.success) {
            const activeKeys = apiKeysResponse.data.apiKeys?.filter((key: any) => key.isActive).length || 0
            setStats(prev => ({ ...prev, activeApiKeys: activeKeys }))
          }
        } catch (apiKeysError) {
          console.error('Error loading API keys:', apiKeysError)
          // Don't fail the dashboard if API keys fail to load
        }
      } catch (error) {
        console.error('Error checking tenant status:', error)
        setError('Failed to load user profile. Please try again.')
        // If there's an error, we'll still show the dashboard
      } finally {
        setIsLoading(false)
        // Simulate stats loading
        setTimeout(() => setStatsLoading(false), 1000)
      }
    }

    checkAuthAndTenant()
  }, [user, router])

  // Mock data for demonstration
  const [stats, setStats] = useState({
    totalUsers: 1247,
    pendingVerifications: 23,
    completedVerifications: 892,
    activeApiKeys: 0,
  })

  const mockOverviewData = {
    totalRevenue: 45678,
    revenueChange: 12.5,
    activeUsers: 1247,
    userChange: 8.2,
    pendingTasks: 23,
    completedTasks: 892,
    systemHealth: 'excellent' as const,
  }

  const mockActivity = [
    {
      id: "1",
      user: "John Doe",
      action: "Completed KYC verification",
      time: "2 minutes ago",
      status: "success" as const,
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "Uploaded new document",
      time: "5 minutes ago",
      status: "pending" as const,
    },
    {
      id: "3",
      user: "Mike Johnson",
      action: "Created new API key",
      time: "10 minutes ago",
      status: "info" as const,
    },
    {
      id: "4",
      user: "Sarah Wilson",
      action: "Updated company profile",
      time: "1 hour ago",
      status: "success" as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {user.firstname}! Here's what's happening with your account.
            {user.role === 'TENANT_ADMIN' && ' You have administrative access to manage your team.'}
            {user.role === 'USER' && ' You can view team members and access platform features.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {user.role === 'TENANT_ADMIN' && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Overview Section */}
      <DashboardOverview data={mockOverviewData} />

      {/* Quick Navigation Cards */}
      <DashboardNavigation />

      {/* Stats Cards */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Key Metrics</h2>
        <DashboardStats stats={stats} isLoading={statsLoading} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={mockActivity} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <SystemStatus />
        </div>
      </div>
    </>
  )
} 