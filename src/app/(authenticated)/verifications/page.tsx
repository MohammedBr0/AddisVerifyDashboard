'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/toast';

interface Verification {
  id: string;
  sessionId: string;
  verificationId: string;
  status: 'CREATED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'PENDING' | null;
  idType: {
    id: string;
    name: string;
    code: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
  workflowId?: string;
  tenantId: string;
  metadata?: any;
  results?: Array<{
    id: string;
    type: string;
    status: string;
    data: any;
    confidenceScore?: number;
    createdAt: string;
  }>;
}

interface VerificationsResponse {
  verifications: Verification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function VerificationsPage() {
  const { user, token } = useAuthStore();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    manualReview: 0
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/verifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }

      const data = await response.json();
      setVerifications(data.verifications || []);

      // Calculate stats
      const stats = {
        total: data.verifications?.length || 0,
        completed: data.verifications?.filter((v: Verification) => v.status === 'COMPLETED').length || 0,
        inProgress: data.verifications?.filter((v: Verification) => v.status === 'IN_PROGRESS' || v.status === 'STARTED').length || 0,
        pending: data.verifications?.filter((v: Verification) => v.status === 'CREATED').length || 0,
        approved: data.verifications?.filter((v: Verification) => v.decision === 'APPROVED').length || 0,
        rejected: data.verifications?.filter((v: Verification) => v.decision === 'REJECTED').length || 0,
        manualReview: data.verifications?.filter((v: Verification) => v.decision === 'MANUAL_REVIEW').length || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <Badge variant="secondary">Created</Badge>;
      case 'STARTED':
        return <Badge variant="default">Started</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'MANUAL_REVIEW':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Manual Review</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">No Decision</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = searchTerm === '' || 
      verification.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.idType?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    const matchesDecision = decisionFilter === 'all' || verification.decision === decisionFilter;

    return matchesSearch && matchesStatus && matchesDecision;
  });

  const getTabVerifications = (tab: string) => {
    switch (tab) {
      case 'completed':
        return filteredVerifications.filter(v => v.status === 'COMPLETED');
      case 'inProgress':
        return filteredVerifications.filter(v => v.status === 'IN_PROGRESS' || v.status === 'STARTED');
      case 'pending':
        return filteredVerifications.filter(v => v.status === 'CREATED');
      case 'approved':
        return filteredVerifications.filter(v => v.decision === 'APPROVED');
      case 'rejected':
        return filteredVerifications.filter(v => v.decision === 'REJECTED');
      case 'manualReview':
        return filteredVerifications.filter(v => v.decision === 'MANUAL_REVIEW');
      default:
        return filteredVerifications;
    }
  };

  const exportVerifications = () => {
    const csvContent = [
      ['Session ID', 'User', 'Email', 'ID Type', 'Status', 'Decision', 'Created', 'Completed'],
      ...getTabVerifications(activeTab).map(v => [
        v.sessionId,
        v.user?.name || 'N/A',
        v.user?.email || 'N/A',
        v.idType?.name || 'N/A',
        v.status,
        v.decision || 'N/A',
        formatDate(v.createdAt),
        v.completedAt ? formatDate(v.completedAt) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifications-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (verification: Verification) => {
    setSelectedVerification(verification);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verifications</h1>
          <p className="text-muted-foreground">
            View and manage all verification sessions
          </p>
        </div>
        <Button onClick={exportVerifications} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by session ID, user name, email, or ID type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="CREATED">Created</SelectItem>
                <SelectItem value="STARTED">Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="MANUAL_REVIEW">Manual Review</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="manualReview">Manual Review</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' && 'All Verifications'}
                {activeTab === 'completed' && 'Completed Verifications'}
                {activeTab === 'inProgress' && 'In Progress Verifications'}
                {activeTab === 'pending' && 'Pending Verifications'}
                {activeTab === 'approved' && 'Approved Verifications'}
                {activeTab === 'rejected' && 'Rejected Verifications'}
                {activeTab === 'manualReview' && 'Manual Review Verifications'}
              </CardTitle>
              <CardDescription>
                {getTabVerifications(activeTab).length} verification(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading verifications...</div>
                </div>
              ) : getTabVerifications(activeTab).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No verifications found</h3>
                  <p className="text-muted-foreground text-center">
                    {activeTab === 'all' && 'No verifications match your current filters'}
                    {activeTab === 'completed' && 'No completed verifications found'}
                    {activeTab === 'inProgress' && 'No in-progress verifications found'}
                    {activeTab === 'pending' && 'No pending verifications found'}
                    {activeTab === 'approved' && 'No approved verifications found'}
                    {activeTab === 'rejected' && 'No rejected verifications found'}
                    {activeTab === 'manualReview' && 'No manual review verifications found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getTabVerifications(activeTab).map((verification) => (
                    <div
                      key={verification.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Hash className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Session {verification.sessionId}
                            </p>
                            {getStatusBadge(verification.status)}
                            {verification.decision && getDecisionBadge(verification.decision)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{verification.user?.name || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{verification.idType?.name || 'Unknown ID Type'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {formatDate(verification.createdAt)}</span>
                            </div>
                            {verification.completedAt && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Completed: {formatDate(verification.completedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(verification)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Detailed information about verification session {selectedVerification?.sessionId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Session ID</label>
                      <p className="text-sm">{selectedVerification.sessionId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Decision</label>
                      <div className="mt-1">
                        {selectedVerification.decision ? getDecisionBadge(selectedVerification.decision) : 'No Decision'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID Type</label>
                      <p className="text-sm">{selectedVerification.idType?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm">{formatDate(selectedVerification.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Completed</label>
                      <p className="text-sm">
                        {selectedVerification.completedAt ? formatDate(selectedVerification.completedAt) : 'Not completed'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              {selectedVerification.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">{selectedVerification.user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedVerification.user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Results */}
              {selectedVerification.results && selectedVerification.results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedVerification.results.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{result.type.replace('_', ' ')}</h4>
                          <Badge variant={result.status === 'verified' || result.status === 'matched' || result.status === 'passed' ? 'default' : 'destructive'}>
                            {result.status}
                          </Badge>
                        </div>
                        {result.confidenceScore && (
                          <p className="text-sm text-gray-600 mb-2">
                            Confidence Score: {result.confidenceScore.toFixed(2)}%
                          </p>
                        )}
                        <div className="text-sm text-gray-600">
                          <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {selectedVerification.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedVerification.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
