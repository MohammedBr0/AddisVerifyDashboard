'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Shield, Camera, CreditCard } from 'lucide-react';

interface KYCWelcomeProps {
  onStart: () => void;
}

export default function KYCWelcome({ onStart }: KYCWelcomeProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-0 transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">0% Complete</p>
        </div>

        {/* Welcome Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Identity Verification
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Complete your verification in just a few simple steps. 
              Your information is protected with bank-level security.
            </p>

            {/* Steps Overview */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Choose your ID type</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Scan ID front & back</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Take a selfie</span>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              onClick={handleStart}
              disabled={isStarting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isStarting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Start Verification
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              By continuing, you agree to our privacy policy and terms of service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
