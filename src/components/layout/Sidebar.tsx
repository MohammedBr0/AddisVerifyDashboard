"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, X, LogOut, Menu } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { SidebarNavigation } from "@/components/layout/SidebarNavigation"
import { SidebarUserProfile } from "@/components/layout/SidebarUserProfile"
import type { NavigationItem } from "@/components/layout/SidebarNavigation"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  items?: NavigationItem[]
}

export function Sidebar({ sidebarOpen, setSidebarOpen, isExpanded, setIsExpanded, items }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call backend logout API
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
      router.push('/auth/login')
    }
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${isExpanded ? 'w-64' : 'w-16'}`}>
      <div className="flex h-full flex-col">
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
            {isExpanded && (
              <span className="text-xl font-bold text-slate-900">AD-DIS Verify</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Expandable action button - only show on desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-4 w-4" />
            </Button>
            {/* Close button - only show on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNavigation isExpanded={isExpanded} items={items} />

        {/* User profile section */}
        <SidebarUserProfile user={user} onLogout={handleLogout} isExpanded={isExpanded} />
      </div>
    </div>
  )
} 