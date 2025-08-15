"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ToastContainer } from "@/components/ui/toast"
import { useAuthInitialization } from "@/hooks/useAuthInitialization"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isInitialized, isAuthenticated, user, isLoading } = useAuthInitialization()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after initialization is complete
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isInitialized, isAuthenticated, router])

  // Show loading while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading if not authenticated but still initializing
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {children}
      </DashboardLayout>
      <ToastContainer />
    </>
  )
} 