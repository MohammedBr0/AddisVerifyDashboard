'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';

interface KYCSessionDetail {
  id: string;
  sessionId: string;
  verificationId: string;
  status: string;
  decision: string;
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
  piiData?: any;
  metadata?: any;
  results?: any[];
}

export default function KYCSessionDetailPage() {
  const { sessionId } = useParams();
  const { token } = useAuthStore();
  const [session, setSession] = useState<KYCSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && token) {
      fetchSessionDetails();
    }
  }, [sessionId, token]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kyc/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();
      setSession(data.data);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CREATED: { label: 'Created', variant: 'secondary' as const },
      STARTED: { label: 'Started', variant: 'default' as const },
      COMPLETED: { label: 'Completed', variant: 'default' as const },
      EXPIRED: { label: 'Expired', variant: 'destructive' as const },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    const decisionConfig = {
      APPROVED: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      PENDING: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      REVIEW: { label: 'Under Review', variant: 'outline' as const, icon: AlertCircle }
    };

    const config = decisionConfig[decision as keyof typeof decisionConfig] || { label: decision, variant: 'secondary' as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading session details...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Session not found</h3>
          <p className="text-muted-foreground text-center mb-4">
            The requested KYC session could not be found
          </p>
          <Link href="/kyc">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to KYC Sessions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/kyc">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to KYC Sessions
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Session Details</h1>
          <p className="text-muted-foreground">KYC Session {session.sessionId}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(session.status)}
          {session.decision && getDecisionBadge(session.decision)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Session Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                  <p className="text-sm">{session.sessionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification ID</label>
                  <p className="text-sm">{session.verificationId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Type</label>
                  <p className="text-sm">{session.idType?.name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(session.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          {session.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{session.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{session.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PII Data */}
          {session.piiData && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Extracted personal information from documents</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(session.piiData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Verification Results */}
          {session.results && session.results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Results</CardTitle>
                <CardDescription>Results from the verification process</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(session.results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Session Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</p>
                  </div>
                </div>
                {session.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Session Completed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(session.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Download Report
              </Button>
              <Button className="w-full" variant="outline">
                Share Session
              </Button>
              {session.status === 'COMPLETED' && !session.decision && (
                <Button className="w-full" variant="default">
                  Review & Decide
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {session.metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {JSON.stringify(session.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
