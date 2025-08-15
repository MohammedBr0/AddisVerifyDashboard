"use client"

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  TestTube, 
  RefreshCw, 
  Webhook, 
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit,
  Save,
  Power,
  Send,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { webhooksAPI } from '@/lib/apiService/api'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: string
  lastDelivery?: {
    status: string
    timestamp: string
  }
}

interface WebhookDelivery {
  id: string
  status: string
  responseCode: number
  responseTime: number
  timestamp: string
  error?: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [testPayload, setTestPayload] = useState('')
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await webhooksAPI.getWebhooks()
      setWebhooks(response.data || [])
    } catch (error: any) {
      console.error('Failed to load webhooks:', error)
      setError(error.response?.data?.message || 'Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  const loadWebhookDeliveries = async (webhookId: string) => {
    try {
      const response = await webhooksAPI.getWebhookDeliveries(webhookId)
      setDeliveries(response.data || [])
    } catch (error: any) {
      console.error('Failed to load webhook deliveries:', error)
      setError(error.response?.data?.message || 'Failed to load deliveries')
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      setIsTesting(webhookId)
      setError(null)
      setTestResult(null)
      
      const response = await webhooksAPI.testWebhook(webhookId)
      
      setTestResult({
        success: true,
        message: 'Test webhook sent successfully',
        timestamp: new Date().toISOString()
      })
      
      setSuccessMessage('Test webhook sent successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Reload deliveries to show the test delivery
      if (selectedWebhook) {
        loadWebhookDeliveries(selectedWebhook.id)
      }
    } catch (error: any) {
      console.error('Failed to test webhook:', error)
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to test webhook',
        timestamp: new Date().toISOString()
      })
      setError(error.response?.data?.message || 'Failed to test webhook')
    } finally {
      setIsTesting(null)
    }
  }

  const handleRetryDelivery = async (deliveryId: string) => {
    try {
      setIsRetrying(deliveryId)
      setError(null)
      await webhooksAPI.retryWebhookDelivery(deliveryId)
      setSuccessMessage('Delivery retry initiated')
      setTimeout(() => setSuccessMessage(null), 3000)
      if (selectedWebhook) {
        loadWebhookDeliveries(selectedWebhook.id)
      }
    } catch (error: any) {
      console.error('Failed to retry delivery:', error)
      setError(error.response?.data?.message || 'Failed to retry delivery')
    } finally {
      setIsRetrying(null)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      setIsDeleting(webhookId)
      setError(null)
      await webhooksAPI.deleteWebhook(webhookId)
      setWebhooks(prev => prev.filter(w => w.id !== webhookId))
      if (selectedWebhook?.id === webhookId) {
        setSelectedWebhook(null)
        setDeliveries([])
      }
      setSuccessMessage('Webhook deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Failed to delete webhook:', error)
      setError(error.response?.data?.message || 'Failed to delete webhook')
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'retrying':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'retrying':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4" />
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

  const openTestModal = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setTestPayload(JSON.stringify({
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook from AddisVerify',
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id,
        test: true
      },
      timestamp: new Date().toISOString()
    }, null, 2))
    setTestResult(null)
    setShowTestModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Webhooks</h1>
          <p className="text-slate-600 mt-1">Manage your webhook endpoints and monitor delivery status.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>
                Configure webhook endpoints to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Webhook className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2 font-medium">No webhooks configured</p>
                      <p className="text-sm text-slate-500">Create your first webhook to start receiving notifications</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <Card 
                      key={webhook.id} 
                      className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                        selectedWebhook?.id === webhook.id
                          ? 'ring-2 ring-blue-500 bg-blue-50/30'
                          : 'border-slate-200'
                      }`}
                      onClick={() => {
                        setSelectedWebhook(webhook)
                        loadWebhookDeliveries(webhook.id)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Webhook className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 text-lg">{webhook.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Globe className="h-4 w-4 text-slate-500" />
                                  <p className="text-sm text-slate-600 truncate">{webhook.url}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Toggle webhook active status
                                  }}
                                  disabled={isDeleting === webhook.id}
                                  className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    ${webhook.isActive 
                                      ? 'bg-blue-600 hover:bg-blue-700' 
                                      : 'bg-slate-200 hover:bg-slate-300'
                                    }
                                    ${isDeleting === webhook.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  `}
                                >
                                  <span
                                    className={`
                                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                                      ${webhook.isActive ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                  />
                                </button>
                                <span className="text-sm text-slate-600">
                                  {webhook.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-slate-500">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{formatDate(webhook.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="outline" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openTestModal(webhook)
                              }}
                              disabled={isTesting === webhook.id}
                              className="border-slate-200 hover:bg-slate-50"
                            >
                              {isTesting === webhook.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedWebhook(webhook)
                                setShowEditModal(true)
                              }}
                              className="border-slate-200 hover:bg-slate-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteWebhook(webhook.id)
                              }}
                              disabled={isDeleting === webhook.id}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            >
                              {isDeleting === webhook.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-1">
          {selectedWebhook ? (
            <Card>
              <CardHeader>
                <CardTitle>Webhook Details</CardTitle>
                <CardDescription>
                  Details and delivery history for {selectedWebhook.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <Label className="text-slate-600">URL</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-slate-900 break-all flex-1">{selectedWebhook.url}</p>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-600">Events</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedWebhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-600">Status</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() => {
                              // Toggle webhook status
                            }}
                            className={`
                              relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                              ${selectedWebhook.isActive 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-slate-200 hover:bg-slate-300'
                              }
                            `}
                          >
                            <span
                              className={`
                                inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                                ${selectedWebhook.isActive ? 'translate-x-5' : 'translate-x-1'}
                              `}
                            />
                          </button>
                          <span className="text-sm text-slate-600">
                            {selectedWebhook.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">Recent Deliveries</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadWebhookDeliveries(selectedWebhook.id)}
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {deliveries.length === 0 ? (
                        <div className="text-center py-6">
                          <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No deliveries yet</p>
                        </div>
                      ) : (
                        deliveries.map((delivery) => (
                          <Card key={delivery.id} className="border-slate-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(delivery.status)}
                                  <Badge className={getStatusColor(delivery.status)}>
                                    {delivery.status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-slate-500">
                                  {formatDate(delivery.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600 space-y-1">
                                <div>Response: {delivery.responseCode}</div>
                                <div>Time: {delivery.responseTime}ms</div>
                                {delivery.error && (
                                  <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
                                    {delivery.error}
                                  </div>
                                )}
                              </div>
                              {delivery.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3 w-full"
                                  onClick={() => handleRetryDelivery(delivery.id)}
                                  disabled={isRetrying === delivery.id}
                                >
                                  {isRetrying === delivery.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                  )}
                                  Retry
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Webhook Details</CardTitle>
                <CardDescription>
                  Select a webhook to view details and delivery history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Select a webhook to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadWebhooks()
          }}
        />
      )}

      {/* Edit Webhook Modal */}
      {showEditModal && selectedWebhook && (
        <EditWebhookModal
          webhook={selectedWebhook}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            loadWebhooks()
          }}
        />
      )}

      {/* Test Webhook Modal */}
      {showTestModal && selectedWebhook && (
        <TestWebhookModal
          webhook={selectedWebhook}
          testPayload={testPayload}
          setTestPayload={setTestPayload}
          testResult={testResult}
          onClose={() => setShowTestModal(false)}
          onTest={() => {
            handleTestWebhook(selectedWebhook.id)
          }}
          isTesting={isTesting === selectedWebhook.id}
        />
      )}
    </div>
  )
}

// Test Webhook Modal Component
function TestWebhookModal({ 
  webhook, 
  testPayload, 
  setTestPayload, 
  testResult, 
  onClose, 
  onTest, 
  isTesting 
}: { 
  webhook: Webhook; 
  testPayload: string;
  setTestPayload: (payload: string) => void;
  testResult: any;
  onClose: () => void; 
  onTest: () => void;
  isTesting: boolean;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>
            Send a test payload to "{webhook.name}" to verify it's working correctly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Test Payload</Label>
            <div className="relative">
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full h-48 p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter test payload (JSON format)"
              />
            </div>
            <p className="text-xs text-slate-500">
              This payload will be sent to your webhook endpoint for testing.
            </p>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(testResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Test Information</p>
                <ul className="space-y-1 text-xs">
                  <li>• The test will send a POST request to your webhook URL</li>
                  <li>• Check your webhook endpoint logs to verify receipt</li>
                  <li>• The delivery will appear in the Recent Deliveries section</li>
                  <li>• Make sure your endpoint returns a 200 status code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="border-slate-200">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onTest} 
            disabled={isTesting || !testPayload.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Test...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Webhook
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Create Webhook Modal Component
function CreateWebhookModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    retryCount: 3,
    timeout: 30000,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableEvents = [
    'verification.session.created',
    'verification.session.started',
    'verification.session.completed',
    'verification.session.failed',
    'verification.session.expired',
    'verification.completed',
    'verification.document.verified',
    'verification.face.match',
    'verification.liveness.passed',
    'verification.liveness.failed',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await webhooksAPI.createWebhook(formData)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to create webhook:', error)
      setError(error.response?.data?.message || 'Failed to create webhook')
    } finally {
      setLoading(false)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Configure a new webhook endpoint to receive real-time notifications.
          </DialogDescription>
        </DialogHeader>
        
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Webhook Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter webhook name"
                className="border-slate-200 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-slate-700">Webhook URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
                className="border-slate-200 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Events *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="secret" className="text-sm font-medium text-slate-700">Secret (Optional)</Label>
              <Input
                id="secret"
                type="text"
                value={formData.secret}
                onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                placeholder="Webhook secret for signature verification"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retryCount" className="text-sm font-medium text-slate-700">Retry Count</Label>
              <Input
                id="retryCount"
                type="number"
                value={formData.retryCount}
                onChange={(e) => setFormData(prev => ({ ...prev, retryCount: parseInt(e.target.value) }))}
                className="border-slate-200 focus:border-blue-500"
                min="1"
                max="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-sm font-medium text-slate-700">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                className="border-slate-200 focus:border-blue-500"
                min="5000"
                max="60000"
                step="1000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Webhook Modal Component
function EditWebhookModal({ 
  webhook, 
  onClose, 
  onSuccess 
}: { 
  webhook: Webhook; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    name: webhook.name,
    url: webhook.url,
    events: webhook.events,
    isActive: webhook.isActive,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableEvents = [
    'verification.session.created',
    'verification.session.started',
    'verification.session.completed',
    'verification.session.failed',
    'verification.session.expired',
    'verification.completed',
    'verification.document.verified',
    'verification.face.match',
    'verification.liveness.passed',
    'verification.liveness.failed',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await webhooksAPI.updateWebhook(webhook.id, formData)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to update webhook:', error)
      setError(error.response?.data?.message || 'Failed to update webhook')
    } finally {
      setLoading(false)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>
            Update the configuration for "{webhook.name}".
          </DialogDescription>
        </DialogHeader>
        
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Webhook Name *</Label>
              <Input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter webhook name"
                className="border-slate-200 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-sm font-medium text-slate-700">Webhook URL *</Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
                className="border-slate-200 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Events *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}