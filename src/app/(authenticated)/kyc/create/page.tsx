'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/toast';

interface PIIData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export default function CreateKYCPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [piiData, setPiiData] = useState<PIIData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
  });

  const handlePiiChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPiiData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PIIData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setPiiData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/kyc/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          piiData,
          metadata: {
            source: 'web_dashboard',
            createdBy: 'user'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create KYC session');
      }

      const data = await response.json();
      
      toast.success('KYC session created successfully');
      
      // Redirect to the verification URL or session details
      if (data.data?.verificationUrl) {
        window.open(data.data.verificationUrl, '_blank');
      }
      
      // Redirect back to KYC dashboard
      window.location.href = '/kyc';
    } catch (error: any) {
      console.error('Error creating KYC session:', error);
      toast.error(error.message || 'Failed to create KYC session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/kyc">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to KYC
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create KYC Session</h1>
            <p className="text-muted-foreground">
              Create a new KYC verification session for user verification
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PII Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Enter the personal information for the person being verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={piiData.firstName}
                  onChange={(e) => handlePiiChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={piiData.lastName}
                  onChange={(e) => handlePiiChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={piiData.email}
                  onChange={(e) => handlePiiChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={piiData.phone}
                  onChange={(e) => handlePiiChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={piiData.dateOfBirth}
                  onChange={(e) => handlePiiChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={piiData.nationality}
                  onChange={(e) => handlePiiChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Address Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={piiData.address?.street}
                    onChange={(e) => handlePiiChange('address.street', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={piiData.address?.city}
                    onChange={(e) => handlePiiChange('address.city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={piiData.address?.state}
                    onChange={(e) => handlePiiChange('address.state', e.target.value)}
                    placeholder="Enter state or province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={piiData.address?.postalCode}
                    onChange={(e) => handlePiiChange('address.postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/kyc">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Session...' : 'Create KYC Session'}
          </Button>
        </div>
      </form>
    </div>
  );
} 