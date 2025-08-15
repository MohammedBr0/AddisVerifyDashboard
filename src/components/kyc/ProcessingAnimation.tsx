'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';

interface ProcessingAnimationProps {
  onComplete: () => void;
}

export default function ProcessingAnimation({ onComplete }: ProcessingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    'Analyzing document images...',
    'Extracting text data...',
    'Verifying document authenticity...',
    'Processing liveness detection...',
    'Cross-referencing information...',
    'Finalizing verification...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">{Math.round(progress)}% Complete</p>
        </div>

        {/* Processing Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Animated Shield */}
            <div className="mb-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                {/* Rotating ring */}
                <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isComplete ? 'Verification Complete!' : 'Verifying Your Identity'}
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {isComplete 
                ? 'Your identity has been successfully verified. You will receive a confirmation shortly.'
                : 'We\'re verifying your identity... This may take up to 30 seconds.'
              }
            </p>

            {/* Current Step */}
            {!isComplete && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700">{steps[currentStep]}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success Animation */}
            {isComplete && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">Verification successful!</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="text-xs text-gray-500">
              <p>Your data is encrypted and securely processed</p>
              <p className="mt-1">Bank-level security standards</p>
            </div>
          </CardContent>
        </Card>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-100 rounded-full opacity-30 animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
}
