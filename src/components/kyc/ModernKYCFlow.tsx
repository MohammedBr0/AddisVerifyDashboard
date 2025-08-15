'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import KYCWelcome from './KYCWelcome';
import IDTypeSelection from './IDTypeSelection';
import IDScan from './IDScan';
import OCRDataPreview from './OCRDataPreview';
import SelfieCapture from './SelfieCapture';
import ReviewAndConfirm from './ReviewAndConfirm';
import ProcessingAnimation from './ProcessingAnimation';
import ResultScreen from './ResultScreen';
import { kycAPI } from '@/lib/apiService/kycService';
import { OCRFieldMapping, mapExtractedFields } from '@/lib/utils/ocrDataUtils';

type KYCStep = 
  | 'welcome'
  | 'idTypeSelection'
  | 'idScanFront'
  | 'idScanBack'
  | 'ocrPreview'
  | 'selfie'
  | 'review'
  | 'processing'
  | 'result';

interface KYCData {
  idType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  ocrData: OCRFieldMapping;
}

export interface ModernKYCFlowProps {
  session?: any;
  sessionToken?: string | null;
  sessionId?: string | null;
}

export default function ModernKYCFlow({ session, sessionToken, sessionId }: ModernKYCFlowProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>('welcome');
  const [kycData, setKycData] = useState<KYCData>({
    idType: '',
    idFront: null,
    idBack: null,
    selfie: null,
    ocrData: {
      fullName: session?.piiData ? `${session.piiData.firstName ?? ''} ${session.piiData.lastName ?? ''}`.trim() : 'John Doe',
      dateOfBirth: session?.piiData?.dateOfBirth ?? '1990-01-01',
      gender: 'Male',
      idNumber: '',
      dateOfExpiry: '2025-12-31',
      issuingAuthority: 'Government of Ethiopia'
    }
  });

  const [capturedImages, setCapturedImages] = useState<{
    idFront: string;
    idBack: string;
    selfie: string;
  }>({
    idFront: '',
    idBack: '',
    selfie: ''
  });

  const [verificationResult, setVerificationResult] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const goToStep = (step: KYCStep) => {
    setCurrentStep(step);
  };

  const handleWelcomeStart = () => {
    goToStep('idTypeSelection');
  };

  const handleIDTypeSelect = (idType: string) => {
    setKycData(prev => ({ ...prev, idType }));
    goToStep('idScanFront');
  };

  const handleIDScanBack = () => {
    goToStep('idTypeSelection');
  };

  const handleIDFrontCapture = (file: File) => {
    setKycData(prev => ({ ...prev, idFront: file }));
    const imageUrl = URL.createObjectURL(file);
    setCapturedImages(prev => ({ ...prev, idFront: imageUrl }));
    goToStep('idScanBack');
  };

  const handleIDBackCapture = async (file: File) => {
    setKycData(prev => ({ ...prev, idBack: file }));
    const imageUrl = URL.createObjectURL(file);
    setCapturedImages(prev => ({ ...prev, idBack: imageUrl }));
    
    // Call ID verification endpoint to extract data
    if (kycData.idFront && sessionId) {
      setIsProcessingOCR(true);
      try {
        // Map ID type to document type for API
        const documentTypeMap: { [key: string]: string } = {
          'passport': 'passport',
          'national_id': 'national_id',
          'resident_id': 'resident_id',
          'driver_license': 'driver_license'
        };
        
        const documentType = documentTypeMap[kycData.idType] || 'national_id';
        
        // Step 1: Validate machine-readable area (MRZ/QR code)
        console.log('Validating machine-readable area...');
        console.log('Session ID:', sessionId);
        console.log('Document Type:', documentType);
        
        const validationResult = await kycAPI.validateMachineArea(
          sessionId || 'session-' + Date.now(),
          documentType,
          file
        );
        
        console.log('Machine validation result:', validationResult);
        
        if (!validationResult.session_id) {
          throw new Error('Machine validation failed: No session ID returned');
        }
        
        // Step 2: Process document with the same session ID
        console.log('Processing document with validated session...');
        console.log('Using session ID:', validationResult.session_id);
        
        const result = await kycAPI.processIDDocument(
          validationResult.session_id,
          documentType,
          kycData.idFront,
          file
        );

        // Extract and auto-fill OCR data using the new mapping utility
        if (result?.fields_extracted) {
          const extractedFields = result.fields_extracted;
          
          // Use the new mapping utility for better field extraction
          const updatedOcrData = mapExtractedFields(extractedFields, kycData.ocrData);

          setKycData(prev => ({ ...prev, ocrData: updatedOcrData }));
          
          toast.success('Document information extracted successfully!');
        } else {
          toast.warning('Could not extract all information. Please review manually.');
        }
      } catch (error) {
        console.error('Error processing ID document:', error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('Machine validation failed')) {
            toast.error('Machine validation failed. Please ensure the back of your document is clearly visible and try again.');
          } else if (error.message.includes('Session not found')) {
            toast.error('Verification session expired. Please refresh the page and try again.');
          } else {
            toast.error(`Failed to extract document information: ${error.message}`);
          }
        } else {
          toast.error('Failed to extract document information. Please continue with manual entry.');
        }
      } finally {
        setIsProcessingOCR(false);
      }
    }
    
    goToStep('ocrPreview');
  };

  const handleOCRConfirm = async (data: OCRFieldMapping) => {
    setKycData(prev => ({ ...prev, ocrData: data }));
    goToStep('selfie');
  };

  const handleOCRBack = () => {
    goToStep('idScanBack');
  };

  const handleSelfieCapture = async (file: File) => {
    setKycData(prev => ({ ...prev, selfie: file }));
    const imageUrl = URL.createObjectURL(file);
    setCapturedImages(prev => ({ ...prev, selfie: imageUrl }));
    
    // Call face verification endpoint
    if (kycData.idFront && sessionId) {
      try {
        const faceResult = await kycAPI.verifyFace(
          sessionId,
          kycData.idFront,
          file
        );
        
        if (faceResult?.match_found) {
          toast.success(`Face verification successful! Similarity: ${(faceResult.similarity * 100).toFixed(1)}%`);
        } else {
          toast.warning('Face verification failed. Please ensure the selfie matches your ID photo.');
        }
      } catch (error) {
        console.error('Error verifying face:', error);
        toast.error('Face verification failed. Please try again.');
      }
    }
    
    goToStep('review');
  };

  const handleSelfieBack = () => {
    goToStep('ocrPreview');
  };

  const handleReviewConfirm = async () => {
    goToStep('processing');
    
    // Get combined verification results
    if (sessionId) {
      try {
        const combinedResult = await kycAPI.getCombinedResult(sessionId);
        console.log('Combined verification result:', combinedResult);
        
        // Determine verification status based on results
        if (combinedResult?.result?.overall_status === 'verified') {
          setVerificationResult('approved');
        } else if (combinedResult?.result?.review_required) {
          setVerificationResult('pending');
        } else {
          setVerificationResult('rejected');
        }
      } catch (error) {
        console.error('Error getting combined results:', error);
        setVerificationResult('pending');
      }
    }
    
    // Simulate processing time
    setTimeout(() => {
      handleProcessingComplete();
    }, 3000);
  };

  const handleReviewBack = () => {
    goToStep('selfie');
  };

  const handleProcessingComplete = () => {
    goToStep('result');
  };

  const handleDownloadReceipt = () => {
    // Implement download functionality
    console.log('Downloading receipt...');
  };

  const handleEmailReceipt = () => {
    // Implement email functionality
    console.log('Emailing receipt...');
  };

  const handleRetry = () => {
    setKycData({
      idType: '',
      idFront: null,
      idBack: null,
      selfie: null,
      ocrData: {
        fullName: session?.piiData ? `${session.piiData.firstName ?? ''} ${session.piiData.lastName ?? ''}`.trim() : 'John Doe',
        dateOfBirth: session?.piiData?.dateOfBirth ?? '1990-01-01',
        gender: 'Male',
        idNumber: '',
        dateOfExpiry: '2025-12-31',
        issuingAuthority: 'Government of Ethiopia'
      }
    });
    setCapturedImages({
      idFront: '',
      idBack: '',
      selfie: ''
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <KYCWelcome onStart={handleWelcomeStart} />;

      case 'idTypeSelection':
        return (
          <IDTypeSelection
            onSelect={handleIDTypeSelect}
            onBack={() => goToStep('welcome')}
            sessionToken={sessionToken}
            sessionId={sessionId}
            fallbackOptions={session?.idType ? [{
              id: session.idType.id ?? session.idType.code,
              name: session.idType.name,
              code: session.idType.code,
              requiresFront: session.idType.requiresFront,
              requiresBack: session.idType.requiresBack,
              requiresSelfie: session.idType.requiresSelfie,
            }] : []}
          />
        );

      case 'idScanFront':
        return (
          <IDScan
            side="front"
            onCapture={handleIDFrontCapture}
            onBack={handleIDScanBack}
          />
        );

      case 'idScanBack':
        return (
          <IDScan
            side="back"
            onCapture={handleIDBackCapture}
            onBack={() => goToStep('idScanFront')}
          />
        );

              case 'ocrPreview':
          return (
            <OCRDataPreview
              data={kycData.ocrData}
              onConfirm={handleOCRConfirm}
              onBack={handleOCRBack}
              isProcessing={isProcessingOCR}
              sessionId={sessionId || undefined}
              sessionToken={sessionToken || undefined}
            />
          );

      case 'selfie':
        return (
          <SelfieCapture
            onCapture={handleSelfieCapture}
            onBack={handleSelfieBack}
          />
        );

      case 'review':
        return (
          <ReviewAndConfirm
            data={{
              idFront: capturedImages.idFront,
              idBack: capturedImages.idBack,
              selfie: capturedImages.selfie,
              ocrData: kycData.ocrData
            }}
            onConfirm={handleReviewConfirm}
            onBack={handleReviewBack}
          />
        );

      case 'processing':
        return (
          <ProcessingAnimation
            onComplete={handleProcessingComplete}
          />
        );

      case 'result':
        return (
          <ResultScreen
            status={verificationResult}
            onDownload={handleDownloadReceipt}
            onEmail={handleEmailReceipt}
            onRetry={handleRetry}
          />
        );

      default:
        return <KYCWelcome onStart={handleWelcomeStart} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentStep()}
    </div>
  );
}
