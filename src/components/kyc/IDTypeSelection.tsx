'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { idTypeAPI } from '@/lib/apiService/idTypeService';

interface IdTypeOption {
  id: string;
  name: string;
  code: string;
  requiresFront?: boolean;
  requiresBack?: boolean;
  requiresSelfie?: boolean;
  description?: string;
}

interface IDTypeSelectionProps {
  onSelect: (idType: string) => void;
  onBack: () => void;
  sessionToken?: string | null;
  sessionId?: string | null;
  fallbackOptions?: IdTypeOption[];
}

export default function IDTypeSelection({ onSelect, onBack, sessionToken, sessionId, fallbackOptions = [] }: IDTypeSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<IdTypeOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If no session token is available, use fallback options
        if (!sessionToken || !sessionId) {
          if (fallbackOptions.length > 0) {
            setOptions(fallbackOptions);
            setError(null);
          } else {
            setError('Session token required to fetch ID types');
          }
          return;
        }

        // Use the session-specific service function
        const response = await idTypeAPI.getSessionIdTypes(sessionId, sessionToken);
        
        // Handle different response formats
        let items: any[] = [];
        if (Array.isArray(response?.data)) {
          items = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (Array.isArray(response)) {
          items = response;
        }

        if (items.length === 0 && fallbackOptions.length > 0) {
          setOptions(fallbackOptions);
          setError(null);
        } else {
          setOptions(items.map((d: any) => ({
            id: d.id ?? d._id ?? d.code,
            name: d.name,
            code: d.code,
            requiresFront: d.requiresFront,
            requiresBack: d.requiresBack,
            requiresSelfie: d.requiresSelfie,
            description: d.description,
          })));
        }
      } catch (e: any) {
        console.error('Error fetching ID types:', e);
        if (fallbackOptions.length > 0) {
          setOptions(fallbackOptions);
          setError(null);
        } else {
          setError(e.message || 'Unable to fetch ID types');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdTypes();
  }, [sessionToken, sessionId, fallbackOptions]);

  const handleContinue = () => {
    if (!selectedId) return;
    setIsTransitioning(true);
    setTimeout(() => onSelect(selectedId), 300);
  };

  const getSelectedIdType = () => {
    return options.find(opt => opt.id === selectedId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-1/6 transition-all duration-500 ease-out"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">17% Complete</p>
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
            Choose Your ID Type
          </h1>
          <p className="text-gray-600">
            Select the type of identification document you'll be using
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-600">Loading ID types...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-red-600">{error}</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                  <Select value={selectedId ?? ''} onValueChange={(v: string) => setSelectedId(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{opt.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({opt.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show selected ID type details */}
                {selectedId && getSelectedIdType() && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2 text-blue-900">
                      {getSelectedIdType()?.name}
                    </h4>
                    {getSelectedIdType()?.description && (
                      <p className="text-sm text-blue-700 mb-3">
                        {getSelectedIdType()?.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getSelectedIdType()?.requiresFront && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Front of document
                        </span>
                      )}
                      {getSelectedIdType()?.requiresBack && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Back of document
                        </span>
                      )}
                      {getSelectedIdType()?.requiresSelfie && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Selfie photo
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedId || isTransitioning}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isTransitioning ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Continuing...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
