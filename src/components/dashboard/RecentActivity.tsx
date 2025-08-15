"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  user: string
  action: string
  time: string
  status: 'success' | 'pending' | 'info'
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest activities from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{activity.user}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {activity.time}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 