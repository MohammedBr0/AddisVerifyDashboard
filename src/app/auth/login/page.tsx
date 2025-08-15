"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

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
           
           // Add a small delay to ensure state is updated
           await new Promise(resolve => setTimeout(resolve, 100))
           
           // Check if user has a tenant
           if (!userData.tenant) {
             // No tenant - redirect to onboarding
             console.log('No tenant found, redirecting to onboarding')
             router.push('/onboarding')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">AD-DIS Verify</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600 mt-2">Sign in to your account to continue</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm">Remember me</Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 