'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, Download, Mail, Copy, Shield } from 'lucide-react';

type VerificationStatus = 'approved' | 'pending' | 'rejected';

interface ResultScreenProps {
  status: VerificationStatus;
  referenceNumber?: string;
  onDownload?: () => void;
  onEmail?: () => void;
  onRetry?: () => void;
}

export default function ResultScreen({ 
  status, 
  referenceNumber = 'REF-2024-001234', 
  onDownload, 
  onEmail, 
  onRetry 
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyReference = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: 'Verification Approved!',
          message: 'Your identity has been successfully verified. You can now proceed with your account.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-600" />,
          title: 'Verification Pending',
          message: 'Your verification is being reviewed. We will notify you once the process is complete.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          title: 'Verification Failed',
          message: 'We were unable to verify your identity. Please check your documents and try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-full transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">100% Complete</p>
        </div>

        {/* Result Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Status Icon */}
            <div className="mb-6">
              <div className={`w-24 h-24 mx-auto ${config.bgColor} ${config.borderColor} border-2 rounded-full flex items-center justify-center`}>
                {config.icon}
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-2xl font-bold ${config.color} mb-4`}>
              {config.title}
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {config.message}
            </p>

            {/* Reference Number */}
            {status === 'approved' && (
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Reference Number</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-mono text-lg font-semibold text-gray-900">
                      {referenceNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReference}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === 'approved' && (
                <>
                  <Button
                    onClick={onDownload}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onEmail}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Receipt
                  </Button>
                </>
              )}

              {status === 'rejected' && onRetry && (
                <Button
                  onClick={onRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Try Again
                </Button>
              )}

              {status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      We'll notify you via email when the review is complete
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Bank-level security & encryption</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {status === 'approved' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Keep your reference number for future reference
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="mt-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-red-800 mb-2">Common Issues:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Blurry or unclear document images</li>
                  <li>• Expired identification documents</li>
                  <li>• Poor lighting during capture</li>
                  <li>• Document not fully visible in frame</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
