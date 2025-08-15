"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Check, Shield, Users, Building } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function SuperAdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuthStore()
  const router = useRouter()

  // Check for error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Access denied. Super admin privileges required.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await authAPI.signIn(email, password)
      
      console.log('Super admin sign-in response:', response)
      
      const accessToken = response.access_token
      
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        
        // Get user profile
        try {
          const profileResponse = await authAPI.getProfile()
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
          
          // Check if user is super admin
          if (user.role !== 'SUPER_ADMIN') {
            setError('Access denied. Super admin privileges required.')
            return
          }
          
          signIn(user, accessToken)
          
          // Redirect to admin dashboard
          router.push('/admin/dashboard')
        } catch (profileError: any) {
          console.error('Profile fetch error:', profileError)
          setError('Failed to verify user permissions')
        }
      } else {
        throw new Error('No access token received')
      }
    } catch (err: any) {
      console.error('Super admin login error:', err)
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
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">AddisVerify</span>
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Super Admin Access</h1>
            <p className="text-gray-600">Sign in to manage tenants and users</p>
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
                placeholder="admin@addisverify.com"
                required
                className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
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
                  className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
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
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <Link href="/admin/forgot-password" className="text-sm text-red-600 hover:text-red-700 font-medium">
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Access Admin Panel"}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This is a restricted area for super administrators only. 
                  Unauthorized access attempts will be logged and reported.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">© All rights reserved - AddisVerify Super Admin</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Admin Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Main Heading */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Super Admin{" "}
            <span className="text-red-600">Dashboard</span>
          </h2>

          {/* Admin Icon */}
          <div className="mb-12">
            <div className="w-full h-48 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
          </div>

          {/* Admin Capabilities */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-600">Tenant Management</p>
                <p className="text-sm text-gray-600">Create, update, and manage all tenants</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-600">User Administration</p>
                <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>



            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-purple-600">Security Controls</p>
                <p className="text-sm text-gray-600">Manage security policies and access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
