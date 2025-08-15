"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Users, 
  UserPlus, 
  UserMinus, 
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
  Copy,
  Search,
  Filter,
  MoreHorizontal,
  Shield
} from "lucide-react"
import { userManagementAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface User {
  id: string
  firstname: string
  lastname: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  userprofileId: string
}

interface CreatedUser extends User {
  generatedPassword?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState<User | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const { user: currentUser } = useAuthStore()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: ""
  })

  // Check if user can manage users (only TENANT_ADMIN)
  const canManageUsers = currentUser?.role === 'TENANT_ADMIN'
  
  // Check if user can view users (both TENANT_ADMIN and USER)
  const canViewUsers = currentUser?.role === 'TENANT_ADMIN' || currentUser?.role === 'USER'

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    // Debug: Log current user information
    console.log('Current user:', currentUser)
    console.log('Current user role:', currentUser.role)
    console.log('Current user tenant:', (currentUser as any).tenant)
    
    // Check if user can view users
    if (!canViewUsers) {
      setError('Access denied. Only tenant users and administrators can view users.')
      return
    }
    
    loadUsers()
  }, [currentUser, router, canViewUsers])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading users...')
      
      // First, test if the backend is accessible
      try {
        const healthResponse = await fetch('http://localhost:3000/health')
        console.log('Backend health check:', healthResponse.status)
      } catch (healthError) {
        console.error('Backend not accessible:', healthError)
        setError('Backend server is not running. Please start the backend server.')
        setIsLoading(false)
        return
      }
      
      const response = await userManagementAPI.getTenantUsers()
      console.log('Users response:', response)
      if (response.success) {
        setUsers(response.data.users || [])
      } else {
        setError(response.message || 'Failed to load users')
      }
    } catch (err: any) {
      console.error('Failed to load users:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim()) {
      setError('All fields are required')
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      
      const userData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase()
      }

      const response = await userManagementAPI.createUser(userData)
      
      if (response.success) {
        setUsers(prev => [response.data, ...prev])
        setShowCreateDialog(false)
        setFormData({ firstname: "", lastname: "", email: "" })
        setCreatedUser(response.data)
        setSuccessMessage('User created successfully!')
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (err: any) {
      console.error('Failed to create user:', err)
      setError(err.response?.data?.message || 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const openRemoveDialog = (user: User) => {
    setUserToRemove(user)
    setRemoveDialogOpen(true)
  }

  const closeRemoveDialog = () => {
    setRemoveDialogOpen(false)
    setUserToRemove(null)
  }

  const openRoleDialog = (user: User) => {
    setUserToUpdateRole(user)
    setRoleDialogOpen(true)
  }

  const closeRoleDialog = () => {
    setRoleDialogOpen(false)
    setUserToUpdateRole(null)
  }

  const handleRemoveUser = async () => {
    if (!userToRemove) return

    try {
      setIsRemoving(true)
      const response = await userManagementAPI.removeUserFromTeam(userToRemove.id)
      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== userToRemove.id))
        closeRemoveDialog()
        setSuccessMessage('User removed from team successfully')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Failed to remove user:', err)
      setError(err.response?.data?.message || 'Failed to remove user')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!userToUpdateRole) return

    try {
      setIsUpdatingRole(true)
      const response = await userManagementAPI.updateUserRole(userToUpdateRole.id, newRole)
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userToUpdateRole.id ? { ...u, role: newRole } : u
        ))
        closeRoleDialog()
        setSuccessMessage(`User role updated to ${newRole === 'TENANT_ADMIN' ? 'Admin' : 'User'} successfully`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Failed to update user role:', err)
      setError(err.response?.data?.message || 'Failed to update user role')
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccessMessage('Copied to clipboard!')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'default'
      case 'USER':
        return 'secondary'
      case 'API_KEY':
        return 'outline'
      case 'SUPER_ADMIN':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'Admin'
      case 'USER':
        return 'User'
      case 'API_KEY':
        return 'API Key'
      case 'SUPER_ADMIN':
        return 'Super Admin'
      default:
        return role.replace('_', ' ')
    }
  }

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  // Check if user can view users
  if (currentUser && !canViewUsers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">
              Only tenant users and administrators can view user lists.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Team Members</h1>
          <p className="text-slate-600 mt-1">
            {canManageUsers 
              ? "Manage users in your team." 
              : "View users in your team."
            }
          </p>
        </div>
        {canManageUsers && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and add them to your team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name *</Label>
                    <Input
                      id="firstname"
                      value={formData.firstname}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name *</Label>
                    <Input
                      id="lastname"
                      value={formData.lastname}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Inactive</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => !u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Admins</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'TENANT_ADMIN').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="TENANT_ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Created User Password Modal */}
      {createdUser && createdUser.generatedPassword && (
        <Dialog open={!!createdUser} onOpenChange={() => setCreatedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Created Successfully</DialogTitle>
              <DialogDescription>
                User "{createdUser.firstname} {createdUser.lastname}" has been created. Here are their login credentials:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="flex items-center space-x-2">
                  <Input value={createdUser.email} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdUser.email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Password</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={createdUser.generatedPassword}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdUser.generatedPassword!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Make sure to share these credentials securely with the user. The password cannot be retrieved later.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCreatedUser(null)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg border">
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No users found</p>
              <p className="text-sm text-slate-500">
                {canManageUsers 
                  ? "Add your first team member to get started" 
                  : "No team members have been added yet"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {user.firstname} {user.lastname}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">Joined {formatDate(user.createdAt)}</span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">Last login {formatDate(user.lastLoginAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    {canManageUsers && user.id !== currentUser?.id && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRemoveDialog(user)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove User Confirmation Dialog - Only show for admins */}
      {canManageUsers && (
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove User from Team</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove "{userToRemove?.firstname} {userToRemove?.lastname}" from your team? This action will deactivate their account and remove their access to the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeRemoveDialog}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveUser}
                disabled={isRemoving}
              >
                {isRemoving ? "Removing..." : "Remove User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Update User Role Dialog - Only show for admins */}
      {canManageUsers && (
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for "{userToUpdateRole?.firstname} {userToUpdateRole?.lastname}". This will affect their permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Role</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(userToUpdateRole?.role || '')}>
                    {getRoleDisplayName(userToUpdateRole?.role || '')}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Role</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={userToUpdateRole?.role === 'USER' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateRole('USER')}
                    disabled={isUpdatingRole || userToUpdateRole?.role === 'USER'}
                    className="flex-1"
                  >
                    User
                  </Button>
                  <Button
                    variant={userToUpdateRole?.role === 'TENANT_ADMIN' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateRole('TENANT_ADMIN')}
                    disabled={isUpdatingRole || userToUpdateRole?.role === 'TENANT_ADMIN'}
                    className="flex-1"
                  >
                    Admin
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Users can view and manage basic features. Admins have full access to all features including user management.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeRoleDialog}
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 