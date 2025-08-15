"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const systemServices = [
  { name: "API Service", status: "Operational" },
  { name: "Database", status: "Operational" },
  { name: "KYC Service", status: "Operational" },
]

export function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">System Status</CardTitle>
        <CardDescription>Current system health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {systemServices.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium">{service.name}</span>
              <Badge variant="default" className="text-xs">
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 