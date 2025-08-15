"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import { 
  Plus, 
  Key, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  Calendar,
  MoreVertical,
  Edit,
  Save
} from "lucide-react"
import { apiKeysAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface ApiKey {
  id: string
  name: string
  key: string
  isActive: boolean
  createdAt: string
  description?: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [apiKeyToEdit, setApiKeyToEdit] = useState<ApiKey | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const { user } = useAuthStore()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadApiKeys()
  }, [user, router])

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiKeysAPI.getApiKeys()
      if (response.success) {
        setApiKeys(response.data.apiKeys || [])
      }
    } catch (err: any) {
      console.error('Failed to load API keys:', err)
      setError(err.response?.data?.message || 'Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('API key name is required')
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      
      const apiKeyData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      }

      const response = await apiKeysAPI.createApiKey(apiKeyData)
      
      if (response.success) {
        setApiKeys(prev => [response.data, ...prev])
        setShowCreateForm(false)
        setFormData({ name: "", description: "" })
        setShowKey(prev => ({ ...prev, [response.data.id]: true }))
        setSuccessMessage('API key created successfully! Copy it now as it won\'t be shown again.')
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (err: any) {
      console.error('Failed to create API key:', err)
      setError(err.response?.data?.message || 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const openDeleteDialog = (apiKey: ApiKey) => {
    setApiKeyToDelete(apiKey)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setApiKeyToDelete(null)
  }

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) return

    try {
      setIsDeleting(true)
      const response = await apiKeysAPI.deleteApiKey(apiKeyToDelete.id)
      if (response.success) {
        setApiKeys(prev => prev.filter(key => key.id !== apiKeyToDelete.id))
        closeDeleteDialog()
        setSuccessMessage('API key deleted successfully')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Failed to delete API key:', err)
      setError(err.response?.data?.message || 'Failed to delete API key')
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (apiKey: ApiKey) => {
    setApiKeyToEdit(apiKey)
    setEditFormData({
      name: apiKey.name,
      description: apiKey.description || ""
    })
    setEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setEditDialogOpen(false)
    setApiKeyToEdit(null)
    setEditFormData({ name: "", description: "" })
  }

  const handleUpdateApiKey = async () => {
    if (!apiKeyToEdit) return

    if (!editFormData.name.trim()) {
      setError('API key name is required')
      return
    }

    try {
      setIsUpdating(true)
      setError(null)
      
      const updateData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || undefined
      }

      const response = await apiKeysAPI.updateApiKey(apiKeyToEdit.id, updateData)
      
      if (response.success) {
        setApiKeys(prev => prev.map(key => 
          key.id === apiKeyToEdit.id 
            ? { ...key, ...response.data }
            : key
        ))
        closeEditDialog()
        setSuccessMessage(`API key "${apiKeyToEdit.name}" updated successfully`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Failed to update API key:', err)
      setError(err.response?.data?.message || 'Failed to update API key')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleActive = async (apiKey: ApiKey) => {
    try {
      setIsToggling(apiKey.id)
      setError(null)
      
      const updateData = {
        revoked: !apiKey.isActive
      }

      const response = await apiKeysAPI.updateApiKey(apiKey.id, updateData)
      
      if (response.success) {
        setApiKeys(prev => prev.map(key => 
          key.id === apiKey.id 
            ? { ...key, isActive: !key.isActive }
            : key
        ))
        setSuccessMessage(`API key "${apiKey.name}" ${!apiKey.isActive ? 'activated' : 'deactivated'} successfully`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      console.error('Failed to toggle API key status:', err)
      setError(err.response?.data?.message || 'Failed to update API key status')
    } finally {
      setIsToggling(null)
    }
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">API Keys</h1>
          <p className="text-slate-600 mt-1">Manage your API keys for platform access.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
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

      {/* Create API Key Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-blue-900">Create New API Key</CardTitle>
            <CardDescription className="text-blue-700">
              Create a new API key to access the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateApiKey} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter API key name"
                    className="border-slate-200 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Key className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2 font-medium">No API keys found</p>
                <p className="text-sm text-slate-500">Create your first API key to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="hover:shadow-md transition-shadow duration-200 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Key className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">{apiKey.name}</h3>
                            {apiKey.description && (
                              <p className="text-slate-600 text-sm">{apiKey.description}</p>
                            )}
                          </div>
                        </div>
                                                 <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-2">
                             <button
                              onClick={() => handleToggleActive(apiKey)}
                              disabled={isToggling === apiKey.id}
                              className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                ${apiKey.isActive 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'bg-slate-200 hover:bg-slate-300'
                                }
                                ${isToggling === apiKey.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <span
                                className={`
                                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                                  ${apiKey.isActive ? 'translate-x-6' : 'translate-x-1'}
                                `}
                              />
                            </button>
                            <span className="text-sm text-slate-600">
                              {isToggling === apiKey.id ? "Updating..." : (apiKey.isActive ? "Active" : "Inactive")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{formatDate(apiKey.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* API Key Display */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">API Key</Label>
                        <div className="relative">
                          <Input
                            value={showKey[apiKey.id] ? apiKey.key : "••••••••••••••••••••••••••••••••"}
                            readOnly
                            className="font-mono text-sm bg-slate-50 border-slate-200"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                              className="h-8 w-8 p-0 hover:bg-slate-200"
                            >
                              {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                              className="h-8 w-8 p-0 hover:bg-slate-200"
                            >
                              {copiedKey === apiKey.id ? (
                                <span className="text-xs text-green-600">✓</span>
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(apiKey)}
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(apiKey)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key "{apiKeyToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApiKey}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the details for "{apiKeyToEdit?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter API key name"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditDialog}
              disabled={isUpdating}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateApiKey}
              disabled={isUpdating || !editFormData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 