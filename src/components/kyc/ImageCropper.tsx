"use client";

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, X, Check } from 'lucide-react'

export interface ImageCropperProps {
  imageUrl: string
  viewport?: { width: number; height: number; type?: 'square' | 'circle' }
  boundary?: { width: number; height: number }
  onCancel: () => void
  onCropped: (result: { blob: Blob; base64: string }) => void
}

export default function ImageCropper({ 
  imageUrl, 
  viewport = { width: 280, height: 180, type: 'square' }, 
  boundary = { width: 320, height: 240 }, 
  onCancel, 
  onCropped 
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const croppieRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cleanup function
  const cleanupCroppie = useCallback(() => {
    if (croppieRef.current) {
      try {
        croppieRef.current.destroy()
        croppieRef.current = null
      } catch (e) {
        console.warn('Error destroying Croppie instance:', e)
      }
    }
    isInitializedRef.current = false
    setReady(false)
  }, [])

  useEffect(() => {
    let CroppieLib: any = null
    let isMounted = true
    
    const initializeCroppie = async () => {
      try {
        // Prevent multiple initializations
        if (isInitializedRef.current || !isMounted) {
          return
        }

        setLoading(true)
        setError(null)
        
        // Dynamic import of Croppie
        if (typeof window !== 'undefined') {
          CroppieLib = await import('croppie').then(module => module.default || module)
        }
        
        if (!CroppieLib || !containerRef.current || !isMounted) {
          throw new Error('Failed to load Croppie library')
        }

        // Cleanup any existing instance
        cleanupCroppie()

        // Create new Croppie instance
        const croppie = new CroppieLib(containerRef.current, {
          viewport: {
            width: viewport.width,
            height: viewport.height,
            type: viewport.type || 'square'
          },
          boundary: {
            width: boundary.width,
            height: boundary.height
          },
          showZoomer: true,
          enableExif: true,
          enableOrientation: true,
          mouseWheelZoom: true,
          enableResize: true,
          enableZoom: true,
          zoom: 0.5,
          maxZoom: 3,
          minZoom: 0.1
        })

        if (!isMounted) {
          croppie.destroy()
          return
        }

        croppieRef.current = croppie
        isInitializedRef.current = true

        // Bind the image
        await croppie.bind({
          url: imageUrl
        })

        if (isMounted) {
          setReady(true)
          setLoading(false)
        }
      } catch (err) {
        console.error('Croppie initialization error:', err)
        if (isMounted) {
          setError('Failed to initialize image cropper')
          setLoading(false)
        }
      }
    }

    // Only initialize if not already initialized
    if (!isInitializedRef.current) {
      initializeCroppie()
    }

    return () => {
      isMounted = false
      cleanupCroppie()
    }
  }, [imageUrl]) // Only depend on imageUrl to prevent unnecessary re-initializations

  const handleCrop = async () => {
    if (!croppieRef.current || !ready) return
    
    try {
      setLoading(true)
      
      const result = await croppieRef.current.result({
        type: 'base64',
        size: 'viewport',
        format: 'jpeg',
        quality: 0.9
      })
      
      const response = await fetch(result)
      const blob = await response.blob()
      
      onCropped({ blob, base64: result })
    } catch (err) {
      console.error('Crop error:', err)
      setError('Failed to crop image')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Card className="shadow-xl">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <X className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={onCancel} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl">
      <CardContent className="p-4">
        <div className="w-full flex flex-col items-center">
          <div className="w-full" style={{ width: boundary.width, height: boundary.height }}>
            <div ref={containerRef} className="croppie-container" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading cropper...</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex w-full gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleCrop} 
              disabled={!ready || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Crop & Use
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
