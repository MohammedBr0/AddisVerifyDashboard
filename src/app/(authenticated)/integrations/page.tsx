"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Zap, Plus, Settings, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  type: 'api' | 'webhook' | 'oauth' | 'sdk'
  status: 'active' | 'inactive' | 'error' | 'pending'
  isEnabled: boolean
  lastSync?: string
  icon: string
  category: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setIntegrations([
        {
          id: "1",
          name: "Stripe Payment",
          description: "Process payments and subscriptions",
          type: "api",
          status: "active",
          isEnabled: true,
          lastSync: "2024-01-15T10:30:00Z",
          icon: "💳",
          category: "Payment"
        },
        {
          id: "2",
          name: "Slack Notifications",
          description: "Send verification notifications to Slack",
          type: "webhook",
          status: "active",
          isEnabled: true,
          lastSync: "2024-01-15T09:15:00Z",
          icon: "💬",
          category: "Communication"
        },
        {
          id: "3",
          name: "Google Workspace",
          description: "Single sign-on with Google Workspace",
          type: "oauth",
          status: "inactive",
          isEnabled: false,
          icon: "🔐",
          category: "Authentication"
        },
        {
          id: "4",
          name: "AWS S3 Storage",
          description: "Store documents in AWS S3",
          type: "api",
          status: "error",
          isEnabled: true,
          lastSync: "2024-01-14T16:45:00Z",
          icon: "☁️",
          category: "Storage"
        },
        {
          id: "5",
          name: "Zapier Automation",
          description: "Automate workflows with Zapier",
          type: "webhook",
          status: "pending",
          isEnabled: false,
          icon: "⚡",
          category: "Automation"
        },
        {
          id: "6",
          name: "React SDK",
          description: "Frontend SDK for React applications",
          type: "sdk",
          status: "active",
          isEnabled: true,
          icon: "⚛️",
          category: "Development"
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, isEnabled: !integration.isEnabled }
          : integration
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'bg-blue-100 text-blue-800'
      case 'webhook':
        return 'bg-purple-100 text-purple-800'
      case 'oauth':
        return 'bg-green-100 text-green-800'
      case 'sdk':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integrations</h1>
          <p className="text-slate-600 mt-1">Connect with third-party services and tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Integration Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{integrations.length}</p>
                <p className="text-sm text-slate-600">Total Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
                <p className="text-sm text-slate-600">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {integrations.filter(i => i.status === 'pending').length}
                </p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect with popular services and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="text-sm">{integration.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={integration.isEnabled}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getTypeColor(integration.type)}>
                      {integration.type.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1">{integration.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-3">
                    Category: {integration.category}
                  </div>
                  
                  {integration.lastSync && (
                    <div className="text-xs text-slate-500 mb-3">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Integrations</CardTitle>
          <CardDescription>Quickly connect with commonly used services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Stripe", icon: "💳", category: "Payment" },
              { name: "Slack", icon: "💬", category: "Communication" },
              { name: "Google", icon: "🔐", category: "Authentication" },
              { name: "AWS", icon: "☁️", category: "Cloud" },
              { name: "Zapier", icon: "⚡", category: "Automation" },
              { name: "HubSpot", icon: "📊", category: "CRM" },
              { name: "Mailchimp", icon: "📧", category: "Email" },
              { name: "Jira", icon: "📋", category: "Project Management" }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-slate-600">{service.category}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Connect with external APIs and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.filter(i => i.type === 'api').map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{integration.icon}</span>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-slate-600">{integration.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Integrations</CardTitle>
            <CardDescription>Set up webhooks for real-time notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.filter(i => i.type === 'webhook').map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{integration.icon}</span>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-slate-600">{integration.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Documentation</CardTitle>
          <CardDescription>Learn how to set up and configure integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold">Getting Started</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Integration Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Webhook Setup
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">SDKs & Libraries</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  React SDK
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Node.js SDK
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Python SDK
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Troubleshooting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Community Forum
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
