'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Eye, FileText, User, Shield } from 'lucide-react';

interface ReviewData {
  idFront: string;
  idBack: string;
  selfie: string;
  ocrData: {
    fullName: string;
    fullNameAmharic?: string;
    dateOfBirth: string;
    dateOfBirthEthiopian?: string;
    dateOfIssue?: string;
    dateOfIssueEthiopian?: string;
    dateOfExpiry: string;
    dateOfExpiryEthiopian?: string;
    gender: string;
    idNumber: string;
    documentType?: string;
    issuingAuthority: string;
    // Additional fields from API response
    documentId?: string;
    sex?: string;
    documentStatus?: {
      is_valid: boolean;
      is_older_than_18: boolean;
      is_document_accepted: boolean;
    };
  };
}

interface ReviewAndConfirmProps {
  data: ReviewData;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ReviewAndConfirm({ data, onConfirm, onBack }: ReviewAndConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-[90%] transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">90% Complete</p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review & Confirm
          </h1>
          <p className="text-gray-600">
            Please review all information before submitting your verification
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - ID Images */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  ID Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Front of ID</h4>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={data.idFront}
                      alt="ID Front"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Back of ID</h4>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={data.idBack}
                      alt="ID Back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - OCR Data */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Extracted Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <span className="text-sm font-medium">{data.ocrData.fullName}</span>
                  </div>
                  {data.ocrData.fullNameAmharic && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Full Name (Amharic):</span>
                      <span className="text-sm font-medium">{data.ocrData.fullNameAmharic}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date of Birth:</span>
                    <span className="text-sm font-medium">{data.ocrData.dateOfBirth}</span>
                  </div>
                  {data.ocrData.dateOfBirthEthiopian && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date of Birth (Ethiopian):</span>
                      <span className="text-sm font-medium">{data.ocrData.dateOfBirthEthiopian}</span>
                    </div>
                  )}
                  {data.ocrData.dateOfIssue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date of Issue:</span>
                      <span className="text-sm font-medium">{data.ocrData.dateOfIssue}</span>
                    </div>
                  )}
                  {data.ocrData.dateOfIssueEthiopian && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date of Issue (Ethiopian):</span>
                      <span className="text-sm font-medium">{data.ocrData.dateOfIssueEthiopian}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expiry Date:</span>
                    <span className="text-sm font-medium">{data.ocrData.dateOfExpiry}</span>
                  </div>
                  {data.ocrData.dateOfExpiryEthiopian && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expiry Date (Ethiopian):</span>
                      <span className="text-sm font-medium">{data.ocrData.dateOfExpiryEthiopian}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gender:</span>
                    <span className="text-sm font-medium">{data.ocrData.gender}</span>
                  </div>
                  {data.ocrData.sex && data.ocrData.sex !== data.ocrData.gender && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sex:</span>
                      <span className="text-sm font-medium">{data.ocrData.sex}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID Number:</span>
                    <span className="text-sm font-medium">{data.ocrData.idNumber}</span>
                  </div>
                  {data.ocrData.documentId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document ID:</span>
                      <span className="text-sm font-medium">{data.ocrData.documentId}</span>
                    </div>
                  )}
                  {data.ocrData.documentType && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document Type:</span>
                      <span className="text-sm font-medium">{data.ocrData.documentType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Issuing Authority:</span>
                    <span className="text-sm font-medium">{data.ocrData.issuingAuthority}</span>
                  </div>
                  {data.ocrData.documentStatus && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Document Status</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${data.ocrData.documentStatus.is_valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600">
                            {data.ocrData.documentStatus.is_valid ? 'Valid Document' : 'Invalid Document'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${data.ocrData.documentStatus.is_older_than_18 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600">
                            {data.ocrData.documentStatus.is_older_than_18 ? 'Age 18+' : 'Under 18'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${data.ocrData.documentStatus.is_document_accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600">
                            {data.ocrData.documentStatus.is_document_accepted ? 'Document Accepted' : 'Document Rejected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selfie */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Selfie Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={data.selfie}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Liveness Verified
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Security & Privacy</h3>
                <p className="text-sm text-gray-600">
                  All your information is encrypted and securely transmitted. We use bank-level security 
                  to protect your data and comply with all privacy regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm & Submit
              </>
            )}
          </Button>
        </div>

        {/* Terms Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By submitting, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}
