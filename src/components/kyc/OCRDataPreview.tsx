'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Edit3, Save, AlertCircle } from 'lucide-react';
import { 
  OCRFieldMapping, 
  mapExtractedFields, 
  validateOCRData, 
  cleanOCRData,
  formatDateForDisplay,
  formatDateForInput,
  convertGregorianToEthiopian
} from '@/lib/utils/ocrDataUtils';
import { toast } from '@/lib/toast';

interface OCRDataPreviewProps {
  data: OCRFieldMapping;
  onConfirm: (data: OCRFieldMapping) => void;
  onBack: () => void;
  isProcessing?: boolean;
  sessionId?: string;
  sessionToken?: string;
}

export default function OCRDataPreview({ 
  data, 
  onConfirm, 
  onBack, 
  isProcessing = false,
  sessionId,
  sessionToken
}: OCRDataPreviewProps) {
  const [formData, setFormData] = useState<OCRFieldMapping>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update form data when props change
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (field: keyof OCRFieldMapping, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-generate Ethiopian dates when Gregorian dates change
      if (field === 'dateOfBirth' && value) {
        const ethiopianDate = convertGregorianToEthiopian(value);
        updated.dateOfBirthEthiopian = ethiopianDate;
      } else if (field === 'dateOfIssue' && value) {
        const ethiopianDate = convertGregorianToEthiopian(value);
        updated.dateOfIssueEthiopian = ethiopianDate;
      } else if (field === 'dateOfExpiry' && value) {
        const ethiopianDate = convertGregorianToEthiopian(value);
        updated.dateOfExpiryEthiopian = ethiopianDate;
      }

      return updated;
    });
  };

  const handleConfirm = async () => {
    // Validate data before proceeding
    const validation = validateOCRData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors before continuing');
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      // Clean the data before saving
      const cleanedData = cleanOCRData(formData);
      
      // Save OCR data to database if session info is available
      if (sessionId && sessionToken) {
        const response = await fetch(`/api/kyc/public/save-ocr/${sessionId}?token=${sessionToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ocrData: cleanedData,
            sessionId: sessionId,
            sessionToken: sessionToken
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save OCR data');
        }

        toast.success('Document information saved successfully!');
      }

      // Call the onConfirm callback with cleaned data
      onConfirm(cleanedData);
    } catch (error) {
      console.error('Error saving OCR data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save document information');
      setIsSubmitting(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // When saving, validate the data
      const validation = validateOCRData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Please fix the validation errors');
        return;
      }
      setValidationErrors([]);
    }
  };

  const saveChanges = () => {
    const validation = validateOCRData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors before saving');
      return;
    }
    
    setValidationErrors([]);
    setIsEditing(false);
    toast.success('Changes saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-2/3 transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">67% Complete</p>
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
            Review Your Information
          </h1>
          <p className="text-gray-600">
            {isProcessing 
              ? 'Extracting information from your ID...'
              : 'We\'ve extracted the following information from your ID. Please review and edit if needed.'
            }
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* OCR Data Card */}
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              {isProcessing ? 'Processing Document...' : 'Extracted Information'}
            </CardTitle>
            {!isProcessing && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEdit}
                className="flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Extracting information from your ID document...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                    placeholder="Enter full name"
                  />
                </div>

                {/* Full Name in Amharic */}
                {formData.fullNameAmharic && (
                  <div className="space-y-2">
                    <Label htmlFor="fullNameAmharic" className="text-sm font-medium text-gray-700">
                      Full Name (Amharic)
                    </Label>
                    <Input
                      id="fullNameAmharic"
                      value={formData.fullNameAmharic}
                      onChange={(e) => handleInputChange('fullNameAmharic', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="Enter name in Amharic"
                    />
                  </div>
                )}

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formatDateForInput(formData.dateOfBirth)}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                  />
                  {formData.dateOfBirth && !isEditing && (
                    <p className="text-xs text-gray-500">
                      {formatDateForDisplay(formData.dateOfBirth)}
                    </p>
                  )}
                </div>

                {/* Date of Birth (Ethiopian) */}
                {formData.dateOfBirthEthiopian && (
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirthEthiopian" className="text-sm font-medium text-gray-700">
                      Date of Birth (Ethiopian)
                    </Label>
                    <Input
                      id="dateOfBirthEthiopian"
                      value={formData.dateOfBirthEthiopian}
                      onChange={(e) => handleInputChange('dateOfBirthEthiopian', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                )}

                {/* Date of Issue */}
                {formData.dateOfIssue && (
                  <div className="space-y-2">
                    <Label htmlFor="dateOfIssue" className="text-sm font-medium text-gray-700">
                      Date of Issue
                    </Label>
                    <Input
                      id="dateOfIssue"
                      type="date"
                      value={formatDateForInput(formData.dateOfIssue)}
                      onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                    {!isEditing && (
                      <p className="text-xs text-gray-500">
                        {formatDateForDisplay(formData.dateOfIssue)}
                      </p>
                    )}
                  </div>
                )}

                {/* Date of Issue (Ethiopian) */}
                {formData.dateOfIssueEthiopian && (
                  <div className="space-y-2">
                    <Label htmlFor="dateOfIssueEthiopian" className="text-sm font-medium text-gray-700">
                      Date of Issue (Ethiopian)
                    </Label>
                    <Input
                      id="dateOfIssueEthiopian"
                      value={formData.dateOfIssueEthiopian}
                      onChange={(e) => handleInputChange('dateOfIssueEthiopian', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                )}

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfExpiry" className="text-sm font-medium text-gray-700">
                    Expiry Date *
                  </Label>
                  <Input
                    id="dateOfExpiry"
                    type="date"
                    value={formatDateForInput(formData.dateOfExpiry)}
                    onChange={(e) => handleInputChange('dateOfExpiry', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                  />
                  {formData.dateOfExpiry && !isEditing && (
                    <p className="text-xs text-gray-500">
                      {formatDateForDisplay(formData.dateOfExpiry)}
                    </p>
                  )}
                </div>

                {/* Expiry Date (Ethiopian) */}
                {formData.dateOfExpiryEthiopian && (
                  <div className="space-y-2">
                    <Label htmlFor="dateOfExpiryEthiopian" className="text-sm font-medium text-gray-700">
                      Expiry Date (Ethiopian)
                    </Label>
                    <Input
                      id="dateOfExpiryEthiopian"
                      value={formData.dateOfExpiryEthiopian}
                      onChange={(e) => handleInputChange('dateOfExpiryEthiopian', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                )}

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Gender *
                  </Label>
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                    placeholder="Male/Female"
                  />
                </div>

                {/* Sex (if different from gender) */}
                {formData.sex && formData.sex !== formData.gender && (
                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
                      Sex
                    </Label>
                    <Input
                      id="sex"
                      value={formData.sex}
                      onChange={(e) => handleInputChange('sex', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="Male/Female"
                    />
                  </div>
                )}

                {/* ID Number */}
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700">
                    ID Number *
                  </Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                    placeholder="Enter ID number"
                  />
                </div>

                {/* Document ID */}
                {formData.documentId && (
                  <div className="space-y-2">
                    <Label htmlFor="documentId" className="text-sm font-medium text-gray-700">
                      Document ID
                    </Label>
                    <Input
                      id="documentId"
                      value={formData.documentId}
                      onChange={(e) => handleInputChange('documentId', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="Enter document ID"
                    />
                  </div>
                )}

                {/* Document Type */}
                {formData.documentType && (
                  <div className="space-y-2">
                    <Label htmlFor="documentType" className="text-sm font-medium text-gray-700">
                      Document Type
                    </Label>
                    <Input
                      id="documentType"
                      value={formData.documentType}
                      onChange={(e) => handleInputChange('documentType', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-gray-50'}
                      placeholder="Enter document type"
                    />
                  </div>
                )}

                {/* Issuing Authority */}
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority" className="text-sm font-medium text-gray-700">
                    Issuing Authority *
                  </Label>
                  <Input
                    id="issuingAuthority"
                    value={formData.issuingAuthority}
                    onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                    placeholder="Enter issuing authority"
                  />
                </div>
              </div>

              {/* Document Status Section */}
              {formData.documentStatus && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Document Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${formData.documentStatus.is_valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {formData.documentStatus.is_valid ? 'Valid Document' : 'Invalid Document'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${formData.documentStatus.is_older_than_18 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {formData.documentStatus.is_older_than_18 ? 'Age 18+' : 'Under 18'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${formData.documentStatus.is_document_accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {formData.documentStatus.is_document_accepted ? 'Document Accepted' : 'Document Rejected'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Save Changes Button (when editing) */}
            {isEditing && !isProcessing && (
              <div className="pt-4 border-t">
                <Button
                  onClick={saveChanges}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
            </>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        {!isProcessing && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || validationErrors.length > 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Continue to Selfie
                </>
              )}
            </Button>
          </div>
        )}

        {/* Information Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All information is encrypted and securely transmitted
          </p>
        </div>
      </div>
    </div>
  );
}
