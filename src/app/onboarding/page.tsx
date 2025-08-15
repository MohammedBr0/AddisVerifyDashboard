"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Building2, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { tenantsAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { user, logout } = useAuthStore()

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const tenantData = {
      legal_name: formData.get("legal_name") as string,
      company_email: formData.get("company_email") as string,
      country_of_registration: formData.get("country_of_registration") as string,
      registration_date: formData.get("registration_date") as string,
      registration_number: formData.get("registration_number") as string,
      phone_number: formData.get("phone_number") as string,
      doing_business_as: formData.get("doing_business_as") as string || undefined,
      registered_address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        postal_code: formData.get("postal_code") as string,
      }
    }

    try {
      const response = await tenantsAPI.createTenant(tenantData)
      
      if (response.success) {
        setStep(2)
      }
    } catch (err: any) {
      console.error('Tenant creation error:', err)
      setError(err.response?.data?.message || 'Failed to create tenant. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Setup Complete!</h2>
              <p className="text-slate-600 mb-6">
                Your company has been successfully registered. You can now access your dashboard and start using AD-DIS Verify.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">AD-DIS Verify</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => logout()}
              className="text-slate-600 hover:text-slate-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Company Setup</h2>
            <p className="text-slate-600">
              Please provide your company information to complete the registration process.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Company Information</CardTitle>
              <CardDescription>
                Fill in your company details to complete the onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legal_name">Legal Company Name *</Label>
                    <Input
                      id="legal_name"
                      name="legal_name"
                      required
                      placeholder="Enter legal company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doing_business_as">Doing Business As (Optional)</Label>
                    <Input
                      id="doing_business_as"
                      name="doing_business_as"
                      placeholder="Enter DBA if different from legal name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_email">Company Email *</Label>
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      required
                      placeholder="Enter company email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country_of_registration">Country of Registration *</Label>
                    <Input
                      id="country_of_registration"
                      name="country_of_registration"
                      required
                      placeholder="Enter country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number *</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      required
                      placeholder="Enter registration number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_date">Registration Date *</Label>
                  <Input
                    id="registration_date"
                    name="registration_date"
                    type="date"
                    required
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Registered Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        name="street"
                        required
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        placeholder="Enter city"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        placeholder="Enter state/province"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        required
                        placeholder="Enter country"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        required
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? "Creating..." : "Complete Setup"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
