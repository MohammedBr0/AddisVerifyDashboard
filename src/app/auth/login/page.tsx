"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Check, Globe, Users, Building, BarChart3 } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { getOnboardingUrl } from "@/lib/utils/urlUtils"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await authAPI.signIn(email, password)
      
      console.log('Sign-in response:', response)
      
      // Check for access_token in the response (backend returns it directly)
      const accessToken = response.access_token
      
      if (accessToken) {
        // Store token and user data
        localStorage.setItem('access_token', accessToken)
        
        // Get user profile
        try {
          const profileResponse = await authAPI.getProfile()
          console.log('Profile response:', profileResponse)
          
          // Handle different response structures
          const userData = profileResponse.data || profileResponse
          const user = {
            id: userData.user?.id || userData.id || 'unknown',
            name: `${userData.user?.firstname || userData.firstname || ''} ${userData.user?.lastname || userData.lastname || ''}`,
            email: userData.user?.email || userData.email || email,
            role: userData.user?.role || userData.role || 'USER',
            company: userData.tenant?.legal_name || '',
            avatar: userData.stackAuth?.profile_image_url || '',
            firstname: userData.user?.firstname || userData.firstname || '',
            lastname: userData.user?.lastname || userData.lastname || ''
          }
          
          // Update auth store first
          signIn(user, accessToken)
          
          // SUPER ADMIN: redirect to admin dashboard regardless of tenant
          if (user.role === 'SUPER_ADMIN') {
            router.push('/admin/dashboard')
            return
          }
          
          // Add a small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Check if user has a tenant
          if (!userData.tenant) {
            // No tenant - redirect to onboarding
            console.log('No tenant found, redirecting to onboarding')
            router.push(getOnboardingUrl())
          } else {
            // Has tenant - redirect to dashboard
            console.log('Tenant found, redirecting to dashboard')
            console.log('Current router state:', router)
            
            // Try different navigation methods
            try {
              await router.push('/dashboard')
              console.log('Router.push completed')
            } catch (navError) {
              console.error('Navigation error:', navError)
              // Fallback to window.location
              window.location.href = '/dashboard'
            }
          }
        } catch (profileError: any) {
          console.error('Profile fetch error:', profileError)
          // Even if profile fetch fails, still redirect to dashboard
          signIn({
            id: 'unknown',
            name: email,
            email: email,
            role: 'USER',
            company: '',
            avatar: '',
            firstname: '',
            lastname: ''
          }, accessToken)
          router.push('/dashboard')
        }
      } else {
        throw new Error('No access token received')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md">
          {/* Header */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
            
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                  <Check className="absolute -top-1 -right-1 h-4 w-4 text-white bg-green-500 rounded-full" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">AddisVerify</span>
          </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Log in to your account</h1>
        </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                </div>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot Password?
                </Link>
              </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Log In"}
              </Button>
            </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span>Continue with Google</span>
              </div>
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                </div>
                <span>Continue with Microsoft</span>
              </div>
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">© All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Main Heading */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Verify Individuals and Businesses{" "}
            <span className="text-blue-600">Globally</span>
          </h2>

          {/* World Map Placeholder */}
          <div className="mb-12">
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <Globe className="h-16 w-16 text-gray-400" />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-600">100+</p>
                <p className="text-sm text-gray-600">Data Sources</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">500M+</p>
                <p className="text-sm text-gray-600">Verifiable Businesses</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-purple-600">200</p>
                <p className="text-sm text-gray-600">Countries Covered</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-orange-600">5B+</p>
                <p className="text-sm text-gray-600">Verifiable Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 