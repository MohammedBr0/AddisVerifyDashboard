'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, CheckCircle, QrCode, Smartphone, Monitor } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ModernKYCFlow } from '@/components/kyc';
import { use } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nodejsToPythonCode, getIdTypeMappingByNodejsCode } from '@/lib/constants/idTypeMapping';

interface IdType {
  id: string;
  name: string;
  code: string;
  requiresFront: boolean;
  requiresBack: boolean;
  requiresSelfie: boolean;
  description?: string;
}

interface VerificationSession {
  sessionId: string;
  verificationId: string;
  status: string;
  piiData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  idType: {
    id: string;
    name: string;
    code: string;
    requiresFront?: boolean;
    requiresBack?: boolean;
    requiresSelfie?: boolean;
  };
  expiresAt: string;
}

export default function KYCVerificationPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const desktop = searchParams.get('desktop');
  const { sessionId } = use(params);
  
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [idTypes, setIdTypes] = useState<IdType[]>([]);
  const [selectedIdType, setSelectedIdType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [idTypeLoading, setIdTypeLoading] = useState(false);
  const [useModernFlow, setUseModernFlow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (sessionId && token) {
      fetchSession();
      fetchIdTypes();
      checkDeviceType();
    }
  }, [sessionId, token]);

  const checkDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);
  };

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/kyc/public/session/${sessionId}?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data.data);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load verification session');
    } finally {
      setLoading(false);
    }
  };

  const fetchIdTypes = async () => {
    try {
      setIdTypeLoading(true);
      const response = await fetch(`/api/kyc/public/session/${sessionId}/id-types?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ID types');
      }

      const data = await response.json();
      setIdTypes(data.data || []);
    } catch (error) {
      console.error('Error fetching ID types:', error);
      toast.error('Failed to load available ID types');
    } finally {
      setIdTypeLoading(false);
    }
  };

  const handleIdTypeSelection = async (idTypeId: string) => {
    try {
      const response = await fetch(`/api/kyc/public/session/${sessionId}/id-type?token=${token}&idTypeId=${idTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update session ID type');
      }

      setSelectedIdType(idTypeId);
      toast.success('ID type selected successfully');
      
      // Example of using the mapping system
      const selectedIdType = idTypes.find(type => type.id === idTypeId);
      if (selectedIdType) {
        const pythonCode = nodejsToPythonCode(selectedIdType.code);
        const mappingInfo = getIdTypeMappingByNodejsCode(selectedIdType.code);
        
        console.log('Selected ID type:', selectedIdType.name);
        console.log('Python service code:', pythonCode);
        console.log('Mapping info:', mappingInfo);
      }
      
      // Refresh session data to get updated ID type
      await fetchSession();
    } catch (error) {
      console.error('Error updating ID type:', error);
      toast.error('Failed to select ID type');
    }
  };

  const handleContinueOnDesktop = () => {
    // Skip device selection and go directly to modern flow
    setUseModernFlow(true);
  };

  const handleShowQRCode = () => {
    // Redirect to QR code page
    const verificationUrl = `${window.location.origin}/kyc/verify/${sessionId}?token=${token}`;
    window.location.href = `/kyc/qr-code?url=${encodeURIComponent(verificationUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading verification session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Session Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The verification session could not be found or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(session.expiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Session Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This verification session has expired. Please request a new verification link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For desktop users who haven't chosen to continue with desktop, redirect to QR code page
  if (!isMobile && !desktop && (!session.idType.id || session.idType.code === 'select')) {
    handleShowQRCode();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to QR code page...</p>
        </div>
      </div>
    );
  }

  // Show ID type selection if no ID type is selected (for mobile users or desktop users who chose to continue)
  if (!session.idType.id || session.idType.code === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
            <p className="text-muted-foreground mt-2">
              Please select the type of identification document you will use for verification
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Session Information */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
                <CardDescription>Information about your verification session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.piiData.firstName} {session.piiData.lastName}
                  </p>
                  {session.piiData.email && (
                    <p className="text-sm text-muted-foreground">{session.piiData.email}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium">Session Status</h3>
                  <Badge variant="secondary" className="capitalize">
                    {session.status.toLowerCase()}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium">Expires At</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.expiresAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ID Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select ID Type</CardTitle>
                <CardDescription>
                  Choose the type of identification document you will use
                </CardDescription>
              </CardHeader>
              <CardContent>
                {idTypeLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading ID types...</span>
                  </div>
                ) : idTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No ID types available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select onValueChange={handleIdTypeSelection} value={selectedIdType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        {idTypes.map((idType) => (
                          <SelectItem key={idType.id} value={idType.id}>
                            <div className="flex items-center space-x-2">
                              <span>{idType.name}</span>
                              <div className="flex space-x-1">
                                {idType.requiresFront && (
                                  <Badge variant="secondary" className="text-xs">
                                    Front
                                  </Badge>
                                )}
                                {idType.requiresBack && (
                                  <Badge variant="secondary" className="text-xs">
                                    Back
                                  </Badge>
                                )}
                                {idType.requiresSelfie && (
                                  <Badge variant="secondary" className="text-xs">
                                    Selfie
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedIdType && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Requirements for selected ID type:</h4>
                        <div className="flex flex-wrap gap-2">
                          {idTypes.find(t => t.id === selectedIdType)?.requiresFront && (
                            <Badge variant="secondary">Front of document</Badge>
                          )}
                          {idTypes.find(t => t.id === selectedIdType)?.requiresBack && (
                            <Badge variant="secondary">Back of document</Badge>
                          )}
                          {idTypes.find(t => t.id === selectedIdType)?.requiresSelfie && (
                            <Badge variant="secondary">Selfie photo</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Use the modern KYC flow once ID type is selected
  if (useModernFlow) {
    return <ModernKYCFlow session={session} sessionToken={token} sessionId={sessionId} />;
  }

  // Fallback to legacy flow (keeping for reference)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
          <p className="text-muted-foreground mt-2">
            Please complete your identity verification by uploading the required documents
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
              <CardDescription>Information about your verification session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  {session.piiData.firstName} {session.piiData.lastName}
                </p>
                {session.piiData.email && (
                  <p className="text-sm text-muted-foreground">{session.piiData.email}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium">Document Type</h3>
                <p className="text-sm text-muted-foreground">{session.idType.name}</p>
              </div>

              <div>
                <h3 className="font-medium">Session Status</h3>
                <Badge variant="secondary" className="capitalize">
                  {session.status.toLowerCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium">Expires At</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legacy Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Upload clear photos of your identification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This is the legacy upload form. The modern KYC flow is now active.
              </p>
              <Button 
                onClick={() => setUseModernFlow(true)}
                className="w-full"
              >
                Use Modern KYC Flow
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 