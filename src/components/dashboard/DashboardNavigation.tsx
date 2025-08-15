"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Key, BarChart3, CreditCard, Database, Zap, ArrowRight, FileCheck } from "lucide-react"
import Link from "next/link"

const navigationCards = [
  {
    title: "User Management",
    description: "Manage users and permissions",
    icon: Users,
    href: "/users",
    count: 1247,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    title: "KYC Verifications",
    description: "Review and process verifications",
    icon: UserCheck,
    href: "/kyc",
    count: 23,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badge: "Pending"
  },
  {
    title: "Verifications",
    description: "View completed and in-progress verifications",
    icon: FileCheck,
    href: "/verifications",
    count: 156,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    title: "API Keys",
    description: "Manage API access and keys",
    icon: Key,
    href: "/api-keys",
    count: 5,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    title: "Analytics",
    description: "View detailed analytics and reports",
    icon: BarChart3,
    href: "/analytics",
    count: 892,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    title: "Billing",
    description: "Manage billing and subscriptions",
    icon: CreditCard,
    href: "/billing",
    count: 1,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    title: "Database",
    description: "Access and manage data",
    icon: Database,
    href: "/database",
    count: 3,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
]

export function DashboardNavigation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Navigation</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {navigationCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer border ${card.borderColor} hover:scale-105`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-sm">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{card.count.toLocaleString()}</span>
                    {card.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 