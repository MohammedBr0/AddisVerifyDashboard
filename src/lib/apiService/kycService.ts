import api from './index'

// Python API base URL for verification endpoints
const PYTHON_API_BASE_URL = process.env.NEXT_PUBLIC_VERIFICATION_API_URL || 'https://addis-verify-service-570647851152.europe-west1.run.app'

// KYC API - Placeholder for future KYC endpoints
export const kycAPI = {
  // Get KYC verifications
  getVerifications: async () => {
    const response = await api.get('/kyc/verifications')
    return response.data
  },

  // Get verification by ID
  getVerification: async (id: string) => {
    const response = await api.get(`/kyc/verifications/${id}`)
    return response.data
  },

  // Update verification status
  updateVerification: async (id: string, status: string, notes?: string) => {
    const response = await api.put(`/kyc/verifications/${id}`, { status, notes })
    return response.data
  },

  // Upload document
  uploadDocument: async (verificationId: string, file: File) => {
    const formData = new FormData()
    formData.append('document', file)
    
    const response = await api.post(`/kyc/verifications/${verificationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Validate machine-readable area (MRZ/QR code) - Step 1
  validateMachineArea: async (
    sessionId: string,
    documentType: string,
    backImage: File
  ) => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('document_type', documentType)
    formData.append('back_image', backImage)

    const url = `${PYTHON_API_BASE_URL}/api/v1/public/id_verification/validate-machine-area`
    console.log('Calling machine validation API:', url)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Machine validation API Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    return await response.json()
  },

  // Process ID document and extract information - Step 2
  processIDDocument: async (
    sessionId: string,
    documentType: string,
    frontImage: File,
    backImage?: File
  ) => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('document_type', documentType)
    formData.append('front_image', frontImage)
    
    if (backImage) {
      formData.append('back_image', backImage)
    }

    const url = `${PYTHON_API_BASE_URL}/api/v1/public/id_verification/process-document`
    console.log('Calling Python API:', url)
    console.log('Session ID:', sessionId)
    console.log('Environment variable:', process.env.NEXT_PUBLIC_VERIFICATION_API_URL)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    return await response.json()
  },

  // Verify face match between ID and selfie
  verifyFace: async (
    sessionId: string,
    idImage: File,
    selfieImage: File
  ) => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('id_image', idImage)
    formData.append('selfie_image', selfieImage)

    const url = `${PYTHON_API_BASE_URL}/api/v1/public/face/verify-face`
    console.log('Calling face verification API:', url)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Face verification API Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    return await response.json()
  },

  // Get combined verification results
  getCombinedResult: async (sessionId: string) => {
    const url = `${PYTHON_API_BASE_URL}/api/v1/public/user_verification/get-combined-result/${sessionId}`
    console.log('Calling combined result API:', url)

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Combined result API Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    return await response.json()
  }
} 