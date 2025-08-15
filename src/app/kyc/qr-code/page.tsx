'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Smartphone, Copy, ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast';
// @ts-ignore
import QRCode from 'qrcode';

export default function QRCodePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);

    // Generate QR code
    if (url) {
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then((dataUrl: string) => {
        setQrCodeDataUrl(dataUrl);
      })
      .catch((error: Error) => {
        console.error('Error generating QR code:', error);
        toast.error('Failed to generate QR code');
      });
    }
  }, [url]);

  const copyToClipboard = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleContinueWithDesktop = () => {
    if (url) {
      // Extract sessionId and token from the URL
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const sessionId = pathParts[pathParts.length - 1];
        const token = urlObj.searchParams.get('token');
        
        if (sessionId && token) {
          // Navigate directly to the verification process with desktop flow
          window.location.href = `/kyc/verify/${sessionId}?token=${token}&desktop=true`;
        } else {
          // Fallback to the original URL
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
        // Fallback to the original URL
        window.location.href = url;
      }
    }
  };

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-red-500" />
              Invalid QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No verification URL provided.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                Scan QR Code
              </CardTitle>
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <CardDescription>
              Use your mobile device's camera to scan this QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for mobile verification"
                  className="w-64 h-64 border rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-gray-500">Generating QR code...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Options */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or copy the link below:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Open your mobile device's camera app</li>
                <li>2. Point the camera at the QR code above</li>
                <li>3. Tap the notification that appears</li>
                <li>4. Complete your verification on mobile</li>
              </ol>
            </div>

            {/* Continue with Desktop Button */}
            <Button 
              onClick={handleContinueWithDesktop}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              continue with desktop
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
