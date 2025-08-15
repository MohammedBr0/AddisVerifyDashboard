"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Edit, 
  Eye, 
  Camera, 
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Activity,
  Pause,
  Play,
  CheckCircle
} from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { idTypeAPI, IdType, CreateIdTypeRequest, UpdateIdTypeRequest } from "@/lib/apiService/idTypeService"
import { toast } from "@/lib/toast"
import { healthCheck } from "@/lib/apiService"
import { ETHIOPIA_ID_TYPES, getAllCategories, getIdTypesByCategory } from "@/lib/constants/ethiopianIdTypes"

export default function IdTypesPage() {
  const { user } = useAuthStore()
  const [idTypes, setIdTypes] = useState<IdType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false)
  const [selectedQuickAddTypes, setSelectedQuickAddTypes] = useState<string[]>([])
  const [editingIdType, setEditingIdType] = useState<IdType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const [formData, setFormData] = useState<CreateIdTypeRequest>({
    name: "",
    code: "",
    country: "Ethiopia",
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: true,
    description: ""
  })

  // Initialize page and check backend connectivity
  useEffect(() => {
    healthCheck().catch(() => {
      toast.error('Backend service is not accessible. Please try again later.')
    })
  }, [])

  // Load ID types when component mounts
  useEffect(() => {
    loadIdTypes(1)
  }, [])

  // Reload when search term or filter changes
  useEffect(() => {
    if (searchTerm || filterActive !== undefined) {
      const timeoutId = setTimeout(() => {
        loadIdTypes(1)
      }, 500) // Debounce search
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, filterActive])

  const loadIdTypes = async (page = currentPage) => {
    try {
      setLoading(true)
      
      const response = await idTypeAPI.getIdTypes(page, itemsPerPage, {
        search: searchTerm || undefined,
        isActive: filterActive
      })
      
      setIdTypes(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalItems(response.pagination?.total || 0)
      setCurrentPage(page)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to load ID types"
      toast.error(errorMessage)
      
      // If it's an authentication error, clear the state
      if (error.response?.status === 401) {
        setIdTypes([])
        setTotalItems(0)
        setTotalPages(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIdType = async () => {
    try {
      await idTypeAPI.createIdType(formData)
      toast.success("ID type created successfully")
      setShowCreateDialog(false)
      resetForm()
      loadIdTypes()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create ID type"
      toast.error(errorMessage)
    }
  }

  const handleUpdateIdType = async () => {
    if (!editingIdType) return

    try {
      await idTypeAPI.updateIdType(editingIdType.id, formData)
      toast.success("ID type updated successfully")
      setEditingIdType(null)
      resetForm()
      loadIdTypes()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update ID type"
      toast.error(errorMessage)
    }
  }



  const handleToggleStatus = async (idTypeId: string) => {
    try {
      await idTypeAPI.toggleIdTypeStatus(idTypeId)
      toast.success("ID type status updated successfully")
      loadIdTypes()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update ID type status"
      toast.error(errorMessage)
    }
  }

  const handleQuickAdd = async () => {
    if (selectedQuickAddTypes.length === 0) {
      toast.error("Please select at least one ID type to add")
      return
    }

    try {
      const promises = selectedQuickAddTypes.map(typeKey => {
        const idType = ETHIOPIA_ID_TYPES[typeKey as keyof typeof ETHIOPIA_ID_TYPES]
        return idTypeAPI.createIdType({
          name: idType.name,
          code: idType.code,
          country: idType.country,
          requiresFront: idType.requiresFront,
          requiresBack: idType.requiresBack,
          requiresSelfie: idType.requiresSelfie,
          description: idType.description
        })
      })

      await Promise.all(promises)
      toast.success(`Successfully added ${selectedQuickAddTypes.length} Ethiopian ID type(s)`)
      setShowQuickAddDialog(false)
      setSelectedQuickAddTypes([])
      loadIdTypes()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to add Ethiopian ID types"
      toast.error(errorMessage)
    }
  }

  const handleQuickAddTypeToggle = (typeKey: string) => {
    setSelectedQuickAddTypes(prev => 
      prev.includes(typeKey) 
        ? prev.filter(key => key !== typeKey)
        : [...prev, typeKey]
    )
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      country: "Ethiopia",
      requiresFront: true,
      requiresBack: false,
      requiresSelfie: true,
      description: ""
    })
  }

  const handleEdit = (idType: IdType) => {
    setEditingIdType(idType)
    setFormData({
      name: idType.name,
      code: idType.code,
      country: idType.country,
      requiresFront: idType.requiresFront,
      requiresBack: idType.requiresBack,
      requiresSelfie: idType.requiresSelfie,
      description: idType.description || ""
    })
  }

  const handleSubmit = () => {
    if (editingIdType) {
      handleUpdateIdType()
    } else {
      handleCreateIdType()
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-green-700">Active</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-600">Inactive</span>
      </div>
    )
  }

  const getRequirementsBadges = (idType: IdType) => {
    const badges = []
    if (idType.requiresFront) {
      badges.push(
        <Badge key="front" variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
          <Eye className="h-3 w-3 mr-1" />
          Front
        </Badge>
      )
    }
    if (idType.requiresBack) {
      badges.push(
        <Badge key="back" variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
          <Eye className="h-3 w-3 mr-1" />
          Back
        </Badge>
      )
    }
    if (idType.requiresSelfie) {
      badges.push(
        <Badge key="selfie" variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
          <Camera className="h-3 w-3 mr-1" />
          Selfie
        </Badge>
      )
    }
    return badges
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">ID Types</h1>
            <p className="text-gray-600">Manage ID types and their verification requirements</p>
          </div>
           <div className="flex gap-2">
             <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
               <DialogTrigger asChild>
                 <Button className="bg-blue-600 hover:bg-blue-700">
                   <Plus className="h-4 w-4 mr-2" />
                   Add ID Type
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create New ID Type</DialogTitle>
                <DialogDescription>
                  Add a new ID type with specific verification requirements
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Ethiopian Passport"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., ETH_PASSPORT"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description of the ID type"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Verification Requirements</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Switch
                        id="requiresFront"
                        checked={formData.requiresFront}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresFront: checked })}
                      />
                      <Label htmlFor="requiresFront" className="text-sm">Front Side</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Switch
                        id="requiresBack"
                        checked={formData.requiresBack}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresBack: checked })}
                      />
                      <Label htmlFor="requiresBack" className="text-sm">Back Side</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Switch
                        id="requiresSelfie"
                        checked={formData.requiresSelfie}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresSelfie: checked })}
                      />
                      <Label htmlFor="requiresSelfie" className="text-sm">Selfie</Label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  Create ID Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Shield className="h-4 w-4 mr-2" />
                Quick Add Ethiopian
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Quick Add Ethiopian ID Types</DialogTitle>
                <DialogDescription>
                  Select from predefined Ethiopian ID types to add to your tenant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {getAllCategories().map(category => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getIdTypesByCategory(category).map((idType) => (
                        <div
                          key={idType.key}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedQuickAddTypes.includes(idType.key)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleQuickAddTypeToggle(idType.key)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{idType.icon}</span>
                                <div>
                                  <h4 className="font-medium text-gray-900">{idType.name}</h4>
                                  <p className="text-sm text-gray-600">{idType.code}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{idType.description}</p>
                              <div className="flex gap-2">
                                {idType.requiresFront && (
                                  <Badge variant="outline" className="text-xs">Front</Badge>
                                )}
                                {idType.requiresBack && (
                                  <Badge variant="outline" className="text-xs">Back</Badge>
                                )}
                                {idType.requiresSelfie && (
                                  <Badge variant="outline" className="text-xs">Selfie</Badge>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedQuickAddTypes.includes(idType.key) ? (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowQuickAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleQuickAdd}
                  disabled={selectedQuickAddTypes.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Selected ({selectedQuickAddTypes.length})
                </Button>
              </div>
            </DialogContent>
                     </Dialog>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total ID Types</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Types</p>
                <p className="text-2xl font-bold text-gray-900">{idTypes.filter(t => t.isActive).length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Types</p>
                <p className="text-2xl font-bold text-gray-900">{idTypes.filter(t => !t.isActive).length}</p>
              </div>
              <Pause className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Selfie</p>
                <p className="text-2xl font-bold text-gray-900">{idTypes.filter(t => t.requiresSelfie).length}</p>
              </div>
              <Camera className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search ID Types</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="filterActive"
                checked={filterActive === true}
                onCheckedChange={(checked) => setFilterActive(checked ? true : undefined)}
              />
              <Label htmlFor="filterActive" className="text-sm font-medium">Active Only</Label>
            </div>
            <Button 
              variant="outline" 
              onClick={() => loadIdTypes()}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* ID Types List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ID Types ({totalItems})</h2>
                <p className="text-sm text-gray-600">Manage ID types and their verification requirements</p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadIdTypes(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadIdTypes(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading ID types...</span>
                </div>
              </div>
            ) : idTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Shield className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm || filterActive !== undefined 
                        ? "No ID types found matching your criteria" 
                        : "No ID types configured yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {!searchTerm && filterActive === undefined 
                        ? "Get started by adding your first ID type" 
                        : "Try adjusting your search or filter criteria"}
                    </p>
                    {!searchTerm && filterActive === undefined && (
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First ID Type
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              idTypes.map((idType) => (
                <div key={idType.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{idType.name}</div>
                          {idType.description && (
                            <div className="text-sm text-gray-600">{idType.description}</div>
                          )}
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {idType.code}
                        </Badge>
                        <div className="flex gap-1">
                          {getRequirementsBadges(idType)}
                        </div>
                        {getStatusIcon(idType.isActive)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(idType)}
                        title="Edit ID Type"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" title="More Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(idType.id)}
                            className="flex items-center gap-2"
                          >
                            {idType.isActive ? (
                              <>
                                <Pause className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                                             
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingIdType} onOpenChange={() => setEditingIdType(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit ID Type</DialogTitle>
              <DialogDescription>
                Update the ID type configuration and verification requirements
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code" className="text-sm font-medium">Code</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium">Verification Requirements</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Switch
                      id="edit-requiresFront"
                      checked={formData.requiresFront}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresFront: checked })}
                    />
                    <Label htmlFor="edit-requiresFront" className="text-sm">Front Side</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Switch
                      id="edit-requiresBack"
                      checked={formData.requiresBack}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresBack: checked })}
                    />
                    <Label htmlFor="edit-requiresBack" className="text-sm">Back Side</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Switch
                      id="edit-requiresSelfie"
                      checked={formData.requiresSelfie}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresSelfie: checked })}
                    />
                    <Label htmlFor="edit-requiresSelfie" className="text-sm">Selfie</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingIdType(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                Update ID Type
              </Button>
            </div>
          </DialogContent>
                 </Dialog>


       </div>
     </div>
   )
 } 