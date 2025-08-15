"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building,
  Users,
  ArrowLeft,
  Edit,
  Save,
  X,
  Eye,
  Key,
  Activity,
  Calendar,
  Mail,
  Phone
} from "lucide-react"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

interface Tenant {
  id: string
  legal_name: string
  company_email: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  country_of_registration: string
  registration_date: string
  registration_number: string
  phone_number: string
  doing_business_as?: string
  registered_address: any
  createdAt: string
  owner: {
    id: string
    firstname: string
    lastname: string
    email: string
    phoneNumber?: string
  }
  users: Array<{
    id: string
    firstname: string
    lastname: string
    email: string
    role: string
    isActive: boolean
    lastLoginAt?: string
  }>
  apiKeys: Array<{
    id: string
    name: string
    isActive: boolean
    lastUsedAt?: string
    createdAt: string
  }>
  verificationSessions: Array<{
    id: string
    sessionId: string
    status: string
    decision?: string
    createdAt: string
  }>
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    legal_name: "",
    company_email: "",
    phone_number: "",
    status: "",
    country_of_registration: "",
    registration_number: ""
  })

  useEffect(() => {
    fetchTenantData()
  }, [params.id])

  const fetchTenantData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        return
      }

      const response = await fetch(`/api/admin/tenants/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTenant(data)
        setEditData({
          legal_name: data.legal_name,
          company_email: data.company_email,
          phone_number: data.phone_number,
          status: data.status,
          country_of_registration: data.country_of_registration,
          registration_number: data.registration_number
        })
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTenant = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/admin/tenants/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const updatedTenant = await response.json()
        setTenant(updatedTenant)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating tenant:', error)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    if (tenant) {
      setEditData({
        legal_name: tenant.legal_name,
        company_email: tenant.company_email,
        phone_number: tenant.phone_number,
        status: tenant.status,
        country_of_registration: tenant.country_of_registration,
        registration_number: tenant.registration_number
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tenant not found</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/tenants">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tenants
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.legal_name}</h1>
              <p className="text-gray-600">Tenant ID: {tenant.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <Button onClick={updateTenant} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="bg-red-600 hover:bg-red-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Tenant
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tenant Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Legal Name</Label>
                    {editing ? (
                      <Input
                        value={editData.legal_name}
                        onChange={(e) => setEditData({...editData, legal_name: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{tenant.legal_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center space-x-2">
                      {editing ? (
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({...editData, status: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      ) : (
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Company Email</Label>
                    {editing ? (
                      <Input
                        value={editData.company_email}
                        onChange={(e) => setEditData({...editData, company_email: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{tenant.company_email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    {editing ? (
                      <Input
                        value={editData.phone_number}
                        onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{tenant.phone_number}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Registration Number</Label>
                    {editing ? (
                      <Input
                        value={editData.registration_number}
                        onChange={(e) => setEditData({...editData, registration_number: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{tenant.registration_number}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Country</Label>
                    {editing ? (
                      <Input
                        value={editData.country_of_registration}
                        onChange={(e) => setEditData({...editData, country_of_registration: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{tenant.country_of_registration}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Owner Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Name</Label>
                    <p className="text-gray-900 font-medium">
                      {tenant.owner.firstname} {tenant.owner.lastname}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-gray-900">{tenant.owner.email}</p>
                  </div>
                  {tenant.owner.phoneNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{tenant.owner.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Users ({tenant.users.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-medium">{tenant.users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Keys</span>
                  <span className="font-medium">{tenant.apiKeys.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Sessions</span>
                  <span className="font-medium">{tenant.verificationSessions.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.apiKeys.slice(0, 3).map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{apiKey.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.verificationSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="p-2 border rounded">
                      <p className="text-sm font-medium">{session.sessionId}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{session.status}</Badge>
                        {session.decision && (
                          <Badge className={session.decision === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {session.decision}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
