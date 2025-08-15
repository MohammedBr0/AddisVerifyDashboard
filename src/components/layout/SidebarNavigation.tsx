"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, Users, UserCheck, Key, CreditCard, Database, Zap, Webhook, FileText, FileCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store"

const navigationItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Users", icon: Users, href: "/users", requiresAuth: true },
  { name: "ID Types", icon: FileText, href: "/id-types", requiresAuth: true },
  { name: "KYC Verifications", icon: UserCheck, href: "/kyc" },
  { name: "Verifications", icon: FileCheck, href: "/verifications" },
  { name: "API Keys", icon: Key, href: "/api-keys" },
  { name: "Webhooks", icon: Webhook, href: "/webhooks" },
  { name: "Billing", icon: CreditCard, href: "/billing" },
  { name: "Database", icon: Database, href: "/database" },
  { name: "Integrations", icon: Zap, href: "/integrations" },
]

interface SidebarNavigationProps {
  isExpanded: boolean
}

export function SidebarNavigation({ isExpanded }: SidebarNavigationProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.requiresAuth) {
      // Users link requires either TENANT_ADMIN or USER role
      if (item.name === "Users") {
        return user?.role === 'TENANT_ADMIN' || user?.role === 'USER'
      }
      // ID Types link requires TENANT_ADMIN role
      if (item.name === "ID Types") {
        return user?.role === 'TENANT_ADMIN'
      }
    }
    return true
  })

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {filteredNavigationItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={!isExpanded ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && (
              <span className="ml-3 truncate">{item.name}</span>
            )}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )
} 