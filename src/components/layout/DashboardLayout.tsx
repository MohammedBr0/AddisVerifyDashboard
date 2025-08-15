"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import type { NavigationItem } from "@/components/layout/SidebarNavigation"

interface DashboardLayoutProps {
  children: ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  navItems?: NavigationItem[]
  headerRightSlot?: ReactNode
}

export function DashboardLayout({ children, sidebarOpen, setSidebarOpen, navItems, headerRightSlot }: DashboardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        items={navItems}
      />

      {/* Header - Full width from left edge */}
      <Header 
        setSidebarOpen={setSidebarOpen}
        rightSlot={headerRightSlot}
      />

      {/* Main content area */}
      <div className={`pt-16 transition-all duration-300 ease-in-out ${
        isExpanded ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* Main content - Scrollable */}
        <main className="min-h-screen">
          <div className="px-6 pb-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 