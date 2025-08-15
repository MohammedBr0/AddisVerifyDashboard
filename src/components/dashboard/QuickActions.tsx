"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, FileText, Key, Settings, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

export function QuickActions() {
  const router = useRouter()
  const { user } = useAuthStore()

  // Different actions based on user role
  const getQuickActions = () => {
    const baseActions = [
      { icon: FileText, label: "Start KYC Verification", action: () => router.push('/kyc') },
      { icon: Key, label: "Manage API Keys", action: () => router.push('/api-keys') },
      { icon: Settings, label: "Company Settings", action: () => router.push('/settings') },
    ]

    if (user?.role === 'TENANT_ADMIN') {
      return [
        { icon: User, label: "Add New User", action: () => router.push('/users') },
        ...baseActions
      ]
    } else if (user?.role === 'USER') {
      return [
        { icon: Users, label: "View Team Members", action: () => router.push('/users') },
        ...baseActions
      ]
    }

    return baseActions
  }

  const quickActions = getQuickActions()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          {user?.role === 'TENANT_ADMIN' 
            ? 'Common administrative tasks and shortcuts'
            : 'Common tasks and shortcuts'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            className="w-full justify-start"
            variant="outline"
            onClick={action.action}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
} 