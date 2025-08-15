'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/toast';

interface KYCSession {
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
}

interface KYCSessionsResponse {
  sessions: KYCSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function KYCPage() {
  const { user, token } = useAuthStore();
  const [sessions, setSessions] = useState<KYCSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchKYCSessions();
  }, []);

  const fetchKYCSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kyc/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch KYC sessions');
      }

      const responseData = await response.json();
      const data = responseData.data; // Extract the actual data from the response
      
      if (!data || !data.sessions || !data.pagination) {
        throw new Error('Invalid response structure from server');
      }
      
      setSessions(data.sessions);

      // Calculate stats
      const stats = {
        total: data.pagination.total || 0,
        completed: data.sessions.filter((s: KYCSession) => s.status === 'COMPLETED').length,
        pending: data.sessions.filter((s: KYCSession) => s.status === 'CREATED' || s.status === 'STARTED').length,
        approved: data.sessions.filter((s: KYCSession) => s.decision === 'APPROVED').length,
        rejected: data.sessions.filter((s: KYCSession) => s.decision === 'REJECTED').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching KYC sessions:', error);
      toast.error('Failed to fetch KYC sessions');
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
        return <Badge variant="default">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
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
        return <Badge variant="secondary">{decision}</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Management</h1>
          <p className="text-muted-foreground">
            Manage Know Your Customer verification sessions
          </p>
        </div>
        <Link href="/kyc/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create KYC Session
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent KYC Sessions</CardTitle>
          <CardDescription>
            View and manage your KYC verification sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading sessions...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KYC sessions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first KYC session to start verifying users
              </p>
              <Link href="/kyc/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">Session {session.sessionId}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.user?.name || 'Unknown User'} • {session.idType?.name || 'Unknown ID Type'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(session.createdAt)}
                        {session.completedAt && ` • Completed: ${formatDate(session.completedAt)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(session.status)}
                    {session.decision && getDecisionBadge(session.decision)}
                    <Link href={`/kyc/sessions/${session.sessionId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Verifications</CardTitle>
          <CardDescription>
            Recently completed verifications submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading submitted verifications...</div>
            </div>
          ) : (
            (() => {
              const submitted = sessions.filter((s) => s.status === 'COMPLETED');
              if (submitted.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No submitted verifications</h3>
                    <p className="text-muted-foreground text-center">
                      Completed verifications will appear here once users finish their flow
                    </p>
                  </div>
                );
              }
              const recent = submitted.slice(0, 5);
              return (
                <div className="space-y-3">
                  {recent.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">Session {s.sessionId}</div>
                        <div className="text-sm text-muted-foreground">
                          {s.user?.name || 'Unknown User'} • {s.idType?.name || 'Unknown ID Type'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {s.completedAt ? formatDate(s.completedAt) : '—'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDecisionBadge(s.decision)}
                        {getStatusBadge(s.status)}
                        {/* Detail view can be added when page exists */}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
} 