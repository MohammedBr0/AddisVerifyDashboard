"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Eye, Plus, Settings } from "lucide-react"

interface BillingData {
  currentPlan: string
  nextBillingDate: string
  amount: number
  status: 'active' | 'past_due' | 'canceled'
  usage: {
    verifications: number
    apiCalls: number
    storage: number
  }
  limits: {
    verifications: number
    apiCalls: number
    storage: number
  }
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setBillingData({
        currentPlan: "Professional",
        nextBillingDate: "2024-02-15",
        amount: 99.00,
        status: 'active',
        usage: {
          verifications: 1250,
          apiCalls: 5000,
          storage: 2.5
        },
        limits: {
          verifications: 2000,
          apiCalls: 10000,
          storage: 10
        }
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load billing information</p>
        </div>
      </div>
    )
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-red-100 text-red-800'
      case 'canceled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Subscription</h1>
          <p className="text-slate-600 mt-1">Manage your subscription and billing information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Billing Settings
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{billingData.currentPlan} Plan</h3>
              <p className="text-slate-600">${billingData.amount}/month</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(billingData.status)}>
                {billingData.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Plan Details
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Next billing date: {new Date(billingData.nextBillingDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verifications</CardTitle>
            <CardDescription>Monthly verification usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{billingData.usage.verifications.toLocaleString()} / {billingData.limits.verifications.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage(billingData.usage.verifications, billingData.limits.verifications)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">
                {Math.round(getUsagePercentage(billingData.usage.verifications, billingData.limits.verifications))}% used
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Calls</CardTitle>
            <CardDescription>Monthly API call usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{billingData.usage.apiCalls.toLocaleString()} / {billingData.limits.apiCalls.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage(billingData.usage.apiCalls, billingData.limits.apiCalls)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">
                {Math.round(getUsagePercentage(billingData.usage.apiCalls, billingData.limits.apiCalls))}% used
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage</CardTitle>
            <CardDescription>Data storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{billingData.usage.storage}GB / {billingData.limits.storage}GB</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage(billingData.usage.storage, billingData.limits.storage)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">
                {Math.round(getUsagePercentage(billingData.usage.storage, billingData.limits.storage))}% used
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">January 2024</p>
                <p className="text-sm text-slate-600">Professional Plan</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium">$99.00</span>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">December 2023</p>
                <p className="text-sm text-slate-600">Professional Plan</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium">$99.00</span>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>Get more features and higher limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">Starter</h4>
              <p className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• 500 verifications/month</li>
                <li>• 2,000 API calls</li>
                <li>• 5GB storage</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">Current Plan</Button>
            </div>
            <div className="border rounded-lg p-4 border-blue-500 bg-blue-50">
              <h4 className="font-semibold">Professional</h4>
              <p className="text-2xl font-bold">$99<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• 2,000 verifications/month</li>
                <li>• 10,000 API calls</li>
                <li>• 10GB storage</li>
              </ul>
              <Button className="w-full mt-4">Current Plan</Button>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">Enterprise</h4>
              <p className="text-2xl font-bold">$299<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• Unlimited verifications</li>
                <li>• Unlimited API calls</li>
                <li>• 100GB storage</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">Upgrade</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
