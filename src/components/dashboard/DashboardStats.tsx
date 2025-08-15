"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, CheckCircle, Key } from "lucide-react"

interface StatsData {
  totalUsers: number
  pendingVerifications: number
  completedVerifications: number
  activeApiKeys: number
}

interface DashboardStatsProps {
  stats: StatsData
  isLoading?: boolean
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "+12% from last month",
      color: "text-blue-600"
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications.toString(),
      icon: Clock,
      change: "Requires attention",
      color: "text-orange-600"
    },
    {
      title: "Completed KYC",
      value: stats.completedVerifications.toLocaleString(),
      icon: CheckCircle,
      change: "+8% from last month",
      color: "text-green-600"
    },
    {
      title: "Active API Keys",
      value: stats.activeApiKeys.toString(),
      icon: Key,
      change: "In use",
      color: "text-purple-600"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {item.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 