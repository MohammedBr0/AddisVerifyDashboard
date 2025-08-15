'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, AlertCircle, Loader2, Eye, Smile } from 'lucide-react';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';
import ImageCropper from './ImageCropper'
import Compressor from 'compressorjs'

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  onBack: () => void;
  onRetry?: () => void;
}

export default function SelfieCapture({ onCapture, onBack, onRetry }: SelfieCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<'checking' | 'detected' | 'failed'>('checking');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('Look directly at the camera');
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [hasFace, setHasFace] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [isCloseEnough, setIsCloseEnough] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    loadModel();
    startLivenessDetection();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    try {
      const m = await blazeface.load();
      setModel(m);
    } catch (e) {
      console.error('Failed to load BlazeFace model', e);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
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

  const startLivenessDetection = () => {
    const prompts = [
      'Look directly at the camera',
      'Blink your eyes',
      'Turn your head slightly left',
      'Turn your head slightly right'
    ];

    let promptIndex = 0;
    let livenessChecks = 0;
    const promptInterval = setInterval(() => {
      setCurrentPrompt(prompts[promptIndex]);
      promptIndex = (promptIndex + 1) % prompts.length;
      livenessChecks++;
      
      // Complete liveness detection after 4 prompts (12 seconds)
      if (livenessChecks >= 4) {
        setLivenessStatus('detected');
        clearInterval(promptInterval);
      }
    }, 3000);

    // Start face detection loop
    const detectLoop = async () => {
      if (!videoRef.current || !model) {
        requestAnimationFrame(detectLoop);
        return;
      }
      try {
        const predictions = await model.estimateFaces(videoRef.current, false);
        if (predictions && predictions.length > 0) {
          setHasFace(true);
          const face = predictions[0];
          
          // Compute bounding box center and size heuristics
          const [x, y, w, h] = face as any;
          const bbox = (face as any).topLeft && (face as any).bottomRight
            ? [ (face as any).topLeft[0], (face as any).topLeft[1], (face as any).bottomRight[0] - (face as any).topLeft[0], (face as any).bottomRight[1] - (face as any).topLeft[1] ]
            : [x, y, w, h];
          const [bx, by, bw, bh] = bbox;
          const cx = bx + bw / 2;
          const cy = by + bh / 2;
          const vw = videoRef.current.videoWidth;
          const vh = videoRef.current.videoHeight;
          
          const isCenteredNow = Math.abs(cx - vw / 2) < vw * 0.1 && Math.abs(cy - vh / 2) < vh * 0.1;
          const isCloseEnoughNow = bw / vw > 0.2 && bh / vh > 0.2;
          
          setIsCentered(isCenteredNow);
          setIsCloseEnough(isCloseEnoughNow);
          
          // Calculate liveness score based on face position and size
          let score = 0;
          if (isCenteredNow) score += 0.4;
          if (isCloseEnoughNow) score += 0.4;
          if (livenessStatus === 'detected') score += 0.2;
          
          setLivenessScore(score);
        } else {
          setHasFace(false);
          setIsCentered(false);
          setIsCloseEnough(false);
          setLivenessScore(0);
        }
      } catch (e) {
        // ignore sporadic errors
      }
      requestAnimationFrame(detectLoop);
    };
    requestAnimationFrame(detectLoop);
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Apply mirror effect to the captured image
    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        setIsCapturing(false);
        setIsProcessing(true);
        
        setTimeout(() => {
          new Compressor(file, {
            quality: 0.8,
            convertSize: 500000,
            success: (compressed: File | Blob) => {
              const finalFile = compressed instanceof File ? compressed : new File([compressed], 'selfie.jpg', { type: 'image/jpeg' })
              setIsProcessing(false)
              onCapture(finalFile)
            },
            error: () => {
              setIsProcessing(false)
              onCapture(file)
            }
          })
        }, 1000);
      }
    }, 'image/jpeg', 0.9);
  };

  const retryCapture = () => {
    setCapturedImage(null);
    setLivenessStatus('checking');
    setLivenessScore(0);
    setIsCapturing(false);
    setIsProcessing(false);
    startLivenessDetection();
  };

  const getLivenessIcon = () => {
    switch (livenessStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'detected':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getLivenessColor = () => {
    switch (livenessStatus) {
      case 'checking':
        return 'bg-blue-500';
      case 'detected':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-5/6 transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">83% Complete</p>
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
            Take a Selfie
          </h1>
          <p className="text-gray-600">
            Position your face within the circle and capture when ready
          </p>
        </div>

        {/* Camera Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {!capturedImage ? (
                <>
                  {/* Camera Feed */}
                  <div className="relative aspect-square bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Hidden canvas used for capturing the current video frame */}
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Face Outline Overlay and Guidance */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-64 h-64 rounded-full relative ${hasFace ? 'border-4' : 'border-2'} ${isCentered && isCloseEnough ? 'border-green-400' : 'border-white/70'} transition-colors`}></div>
                    </div>

                    {/* Dynamic Guidance Chips */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-2 justify-center">
                      {hasFace && (
                        <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Face detected
                        </div>
                      )}
                      {isCentered && (
                        <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Centered
                        </div>
                      )}
                      {isCloseEnough && (
                        <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Good distance
                        </div>
                      )}
                      {livenessScore >= 0.8 && (
                        <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Liveness verified
                        </div>
                      )}
                    </div>

                    {/* Liveness Status */}
                    <div className="absolute top-4 right-4">
                      <div className={`${getLivenessColor()} text-white px-3 py-1 rounded-full text-xs flex items-center`}>
                        {getLivenessIcon()}
                        <span className="ml-1">
                          {livenessStatus === 'checking' && 'Checking...'}
                          {livenessStatus === 'detected' && 'Liveness Detected'}
                          {livenessStatus === 'failed' && 'Liveness Failed'}
                        </span>
                      </div>
                    </div>

                    {/* Current Prompt */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {currentPrompt}
                      </div>
                    </div>

                    {/* Capture Button */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        onClick={captureSelfie}
                        disabled={isCapturing}
                        className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50"
                      >
                        <Camera className="h-8 w-8 text-gray-700" />
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Smile className="h-4 w-4 text-blue-500" />
                      <span>Liveness detection running in background</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Ensure good lighting and your face is clearly visible</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 mt-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>You can capture anytime - liveness will be verified</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Captured Selfie Preview */}
                  <div className="relative aspect-square bg-black">
                    {!showCropper && (
                      <img
                        src={capturedImage!}
                        alt="Captured Selfie"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {showCropper && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <ImageCropper
                          imageUrl={capturedImage!}
                          viewport={{ width: 280, height: 280, type: 'circle' }}
                          boundary={{ width: 320, height: 320 }}
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
                          <p>Processing selfie...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCropper(true)}
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
                    <Button
                      onClick={() => {
                        if (!capturedImage) return
                        fetch(capturedImage).then(res => res.blob()).then((b) => {
                          const raw = new File([b], 'selfie.jpg', { type: b.type || 'image/jpeg' })
                          setIsProcessing(true)
                          new Compressor(raw, {
                            quality: 0.8,
                            convertSize: 500000,
                            success: (compressed: File | Blob) => {
                              const finalFile = compressed instanceof File ? compressed : new File([compressed], 'selfie.jpg', { type: 'image/jpeg' })
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
                          Use Photo
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
