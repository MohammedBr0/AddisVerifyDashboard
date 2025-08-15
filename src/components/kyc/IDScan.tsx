'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, AlertCircle, Loader2, Sun, Upload, Monitor } from 'lucide-react';
import ImageCropper from './ImageCropper'
import Compressor from 'compressorjs'

interface IDScanProps {
  side: 'front' | 'back';
  onCapture: (file: File) => void;
  onBack: () => void;
  onRetry?: () => void;
}

export default function IDScan({ side, onCapture, onBack, onRetry }: IDScanProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [quality, setQuality] = useState<'good' | 'poor' | 'checking'>('checking');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasGlare, setHasGlare] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [cropperKey, setCropperKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if user is on mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);
    
    // For desktop users, show upload option after a delay
    if (!isMobileDevice) {
      const timer = setTimeout(() => {
        setShowUploadOption(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    startCamera();
    const qInterval = setInterval(() => {
      // Simulate real-time quality: alternate alignment and glare hints
      setIsAligned((prev) => !prev);
      setHasGlare((prev) => !prev && !isAligned);
      setQuality(isAligned && !hasGlare ? 'good' : 'checking');
    }, 1500);
    return () => {
      stopCamera();
      clearInterval(qInterval);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${side}_id.jpg`, { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        setTimeout(() => {
          setQuality('good');
          setIsCapturing(false);
          setIsProcessing(true);
          new Compressor(file, {
            quality: 0.8,
            convertSize: 500000, // convert large PNG to JPEG
            success: (compressed: File | Blob) => {
              const finalFile = compressed instanceof File ? compressed : new File([compressed], `${side}_id.jpg`, { type: 'image/jpeg' })
              setIsProcessing(false)
              onCapture(finalFile)
            },
            error: () => {
              setIsProcessing(false)
              onCapture(file)
            }
          })
        }, 800);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setIsProcessing(true);

      new Compressor(file, {
        quality: 0.8,
        convertSize: 500000,
        success: (compressed: File | Blob) => {
          const finalFile = compressed instanceof File ? compressed : new File([compressed], `${side}_id.jpg`, { type: 'image/jpeg' })
          setIsProcessing(false)
          onCapture(finalFile)
        },
        error: () => {
          setIsProcessing(false)
          onCapture(file)
        }
      });
    }
  };

  const retryCapture = () => {
    setCapturedImage(null);
    setQuality('checking');
    setIsCapturing(false);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getProgressPercentage = () => {
    switch (side) {
      case 'front': return 33;
      case 'back': return 50;
      default: return 33;
    }
  };

  const getSideTitle = () => {
    return side === 'front' ? 'Front of ID' : 'Back of ID';
  };

  const getSideDescription = () => {
    return side === 'front' 
      ? 'Position your ID card within the frame and ensure it\'s clearly visible'
      : 'Now flip your ID card and capture the back side';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">{getProgressPercentage()}% Complete</p>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getSideTitle()}
          </h1>
          <p className="text-gray-600">
            {getSideDescription()}
          </p>
        </div>

        {/* Camera Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {!capturedImage ? (
                <>
                  {/* Camera Feed */}
                  <div className="relative aspect-[4/3] bg-black">
                    {!isMobile ? (
                      // Desktop view with upload option
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium mb-2">Camera Access</p>
                          <p className="text-sm text-gray-300 mb-4">Allow camera access to capture your ID</p>
                          
                          {showUploadOption && (
                            <div className="mt-4 p-4 bg-white/10 rounded-lg">
                              <div className="flex items-center justify-center mb-2">
                                <Monitor className="h-4 w-4 mr-2" />
                                <span className="text-sm">Desktop Option</span>
                              </div>
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                size="sm"
                                className="bg-white text-gray-800 hover:bg-gray-100"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload ID Photo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Mobile camera view
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay Frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-80 h-48 rounded-lg relative ${isAligned ? 'ring-4 ring-green-400' : 'ring-2 ring-white/70'} transition-all`}>
                            <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white"></div>
                          </div>
                        </div>

                        {/* Quality Indicator */}
                        <div className="absolute top-4 right-4 space-y-2">
                          {quality === 'checking' && (
                            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Checking...
                            </div>
                          )}
                          {quality === 'good' && (
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Good Quality
                            </div>
                          )}
                          {hasGlare && (
                            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs flex items-center animate-pulse">
                              <Sun className="h-3 w-3 mr-1" />
                              Reduce glare / adjust angle
                            </div>
                          )}
                        </div>

                        {/* Capture Button */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <Button
                            onClick={captureImage}
                            disabled={isCapturing}
                            className="w-16 h-16 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Camera className="h-8 w-8 text-gray-700" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-gray-50">
                    {isMobile ? (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Align your ID within the frame. Avoid glare and blur.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Allow camera access or upload a photo of your ID</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Supported formats: JPG, PNG (max 10MB)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Captured Image Preview */}
                  <div className="relative aspect-[4/3] bg-black">
                    {!showCropper && (
                      <img
                        src={capturedImage!}
                        alt="Captured ID"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {showCropper && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <ImageCropper
                          key={`cropper-${side}-${cropperKey}`}
                          imageUrl={capturedImage!}
                          viewport={{ width: 320, height: 200, type: 'square' }}
                          boundary={{ width: 360, height: 260 }}
                          onCancel={() => setShowCropper(false)}
                          onCropped={({ blob }) => {
                            const croppedUrl = URL.createObjectURL(blob)
                            setCapturedImage(croppedUrl)
                            setShowCropper(false)
                          }}
                        />
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Processing image...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCropperKey(prev => prev + 1);
                        setShowCropper(true);
                      }}
                      className="flex-1"
                    >
                      Crop
                    </Button>
                    <Button
                      variant="outline"
                      onClick={retryCapture}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    {side === 'front' && (
                      <Button
                        onClick={() => {
                          if (!capturedImage) return
                          fetch(capturedImage).then(res => res.blob()).then((b) => {
                            const raw = new File([b], `${side}_id.jpg`, { type: b.type || 'image/jpeg' })
                            setIsProcessing(true)
                            new Compressor(raw, {
                              quality: 0.8,
                              convertSize: 500000,
                              success: (compressed: File | Blob) => {
                                const finalFile = compressed instanceof File ? compressed : new File([compressed], `${side}_id.jpg`, { type: 'image/jpeg' })
                                setIsProcessing(false)
                                onCapture(finalFile)
                              },
                              error: () => {
                                setIsProcessing(false)
                                onCapture(raw)
                              }
                            })
                          })
                        }}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Use This Photo
                          </>
                        )}
                      </Button>
                    )}
                    {side === 'back' && (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
