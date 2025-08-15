"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"

interface User {
  name?: string | null
  email?: string | null
  avatar?: string | null
}

interface SidebarUserProfileProps {
  user: User | null
  onLogout: () => Promise<void>
  isExpanded: boolean
}

export function SidebarUserProfile({ user, onLogout, isExpanded }: SidebarUserProfileProps) {
  // Helper function to get user initials
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || "U"
  }

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {getUserInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        {isExpanded && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => await onLogout()}
          className="text-slate-500 hover:text-slate-700 flex-shrink-0"
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 