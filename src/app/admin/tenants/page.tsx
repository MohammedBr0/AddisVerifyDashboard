"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building, Search, Eye } from "lucide-react"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

interface Tenant {
  id: string
  legal_name: string
  company_email: string
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE"
  createdAt: string
  owner?: {
    firstname: string
    lastname: string
    email: string
  }
  _count?: {
    users: number
    apiKeys: number
    verificationSessions: number
  }
}

interface TenantListResponse {
  tenants: Tenant[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const { user } = useAuthStore()

  useEffect(() => {
    fetchTenants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter])

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        return
      }

      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const resp = await fetch(`/api/admin/tenants?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resp.ok) {
        const data: TenantListResponse = await resp.json()
        setTenants(data.tenants)
        setPagination(prev => ({ ...prev, total: data.pagination.total, pages: data.pagination.pages }))
      }
    } catch (e) {
      console.error('Error fetching tenants:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTenants()
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
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>Manage all registered tenants and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant List ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Users</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">API Keys</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sessions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{tenant.legal_name}</div>
                          <div className="text-sm text-gray-500">{tenant.company_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {tenant.owner ? `${tenant.owner.firstname} ${tenant.owner.lastname}` : '-'}
                          </div>
                          <div className="text-gray-500">{tenant.owner?.email || '-'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{tenant._count?.users ?? '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{tenant._count?.apiKeys ?? '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{tenant._count?.verificationSessions ?? '-'}</td>
                      <td className="py-4 px-4">
                        <Link href={`/admin/tenants/${tenant.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tenants.length === 0 && (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tenants found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
