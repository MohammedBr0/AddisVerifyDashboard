"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database, Search, Download, Upload, RefreshCw, Filter, Eye, Edit, Trash2 } from "lucide-react"

interface DatabaseRecord {
  id: string
  type: 'verification' | 'user' | 'document' | 'api_call'
  status: 'active' | 'archived' | 'deleted'
  createdAt: string
  updatedAt: string
  data: any
}

export default function DatabasePage() {
  const [records, setRecords] = useState<DatabaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setRecords([
        {
          id: "1",
          type: "verification",
          status: "active",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:35:00Z",
          data: {
            userId: "user123",
            documentType: "passport",
            verificationStatus: "completed"
          }
        },
        {
          id: "2",
          type: "user",
          status: "active",
          createdAt: "2024-01-14T09:15:00Z",
          updatedAt: "2024-01-14T09:15:00Z",
          data: {
            email: "john@example.com",
            role: "USER",
            tenantId: "tenant456"
          }
        },
        {
          id: "3",
          type: "document",
          status: "archived",
          createdAt: "2024-01-13T14:20:00Z",
          updatedAt: "2024-01-13T14:20:00Z",
          data: {
            documentId: "doc789",
            fileName: "passport.jpg",
            fileSize: "2.5MB"
          }
        },
        {
          id: "4",
          type: "api_call",
          status: "active",
          createdAt: "2024-01-15T11:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z",
          data: {
            endpoint: "/api/verify",
            responseTime: "150ms",
            statusCode: 200
          }
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || record.type === selectedType
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'verification':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      case 'document':
        return 'bg-purple-100 text-purple-800'
      case 'api_call':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading database records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Database Management</h1>
          <p className="text-slate-600 mt-1">View and manage your data records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{records.length}</p>
                <p className="text-sm text-slate-600">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600">Active Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Database className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {records.filter(r => r.status === 'archived').length}
                </p>
                <p className="text-sm text-slate-600">Archived Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {records.filter(r => r.type === 'verification').length}
                </p>
                <p className="text-sm text-slate-600">Verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Records</CardTitle>
          <CardDescription>Find specific records in your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Record Type</Label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="verification">Verification</option>
                <option value="user">User</option>
                <option value="document">Document</option>
                <option value="api_call">API Call</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Database Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {records.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-900">ID</th>
                  <th className="text-left p-3 font-medium text-slate-900">Type</th>
                  <th className="text-left p-3 font-medium text-slate-900">Status</th>
                  <th className="text-left p-3 font-medium text-slate-900">Created</th>
                  <th className="text-left p-3 font-medium text-slate-900">Updated</th>
                  <th className="text-left p-3 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-sm font-mono">{record.id}</td>
                    <td className="p-3">
                      <Badge className={getTypeColor(record.type)}>
                        {record.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No records found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>Perform maintenance and administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold">Backup & Restore</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Data Management</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Old Data
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Monitoring</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Performance Stats
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
