import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Extract subdomain
  const subdomain = extractSubdomain(hostname)
  
  // Handle admin subdomain routing
  if (subdomain === 'admin') {
    // If accessing admin routes without proper subdomain, redirect
    if (!pathname.startsWith('/admin') && pathname !== '/') {
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url))
    }
    
    // If accessing root on admin subdomain, redirect to admin login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Allow admin routes to proceed
    return NextResponse.next()
  }
  
  // Handle dashboard subdomain routing
  if (subdomain === 'dashboard') {
    // If accessing auth routes, allow them to proceed
    if (pathname.startsWith('/auth')) {
      return NextResponse.next()
    }
    
    // If accessing onboarding route, allow it to proceed
    if (pathname === '/onboarding') {
      return NextResponse.next()
    }
    
    // If accessing authenticated routes (all tenant dashboard routes), allow them to proceed
    if (pathname.startsWith('/analytics') || 
        pathname.startsWith('/users') || 
        pathname.startsWith('/id-types') || 
        pathname.startsWith('/kyc') || 
        pathname.startsWith('/verifications') || 
        pathname.startsWith('/api-keys') || 
        pathname.startsWith('/webhooks') || 
        pathname.startsWith('/billing') || 
        pathname.startsWith('/database') || 
        pathname.startsWith('/integrations')) {
      return NextResponse.next()
    }
    
    // If accessing dashboard routes without proper subdomain, redirect
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/tenant') && pathname !== '/') {
      return NextResponse.redirect(new URL(`/dashboard${pathname}`, request.url))
    }
    
    // If accessing root on dashboard subdomain, redirect to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Allow dashboard routes to proceed
    return NextResponse.next()
  }
  
  // Handle main domain routing
  if (subdomain === '') {
    // If accessing admin routes on main domain, redirect to admin subdomain
    if (pathname.startsWith('/admin')) {
      const adminUrl = new URL(request.url)
      const current = adminUrl.hostname
      // Avoid doubling admin. prefix
      adminUrl.hostname = current.startsWith('admin.') ? current : `admin.${current}`
      return NextResponse.redirect(adminUrl)
    }
    
    // If accessing dashboard routes on main domain, redirect to dashboard subdomain
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant')) {
      const dashboardUrl = new URL(request.url)
      const current = dashboardUrl.hostname
      // Avoid doubling dashboard. prefix
      dashboardUrl.hostname = current.startsWith('dashboard.') ? current : `dashboard.${current}`
      return NextResponse.redirect(dashboardUrl)
    }
    
    // If accessing auth routes on main domain, redirect to dashboard subdomain
    if (pathname.startsWith('/auth')) {
      const dashboardUrl = new URL(request.url)
      const current = dashboardUrl.hostname
      // Avoid doubling dashboard. prefix
      dashboardUrl.hostname = current.startsWith('dashboard.') ? current : `dashboard.${current}`
      return NextResponse.redirect(dashboardUrl)
    }
    
    // Allow public routes to proceed
    return NextResponse.next()
  }
  
  // For any other subdomain, redirect to main domain
  const mainUrl = new URL(request.url)
  mainUrl.hostname = mainUrl.hostname.replace(`${subdomain}.`, '')
  return NextResponse.redirect(mainUrl)
}

// Helper function to extract subdomain
function extractSubdomain(hostname: string): string {
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0]
  
  // Special-case localhost: treat first label as subdomain (admin.localhost)
  if (hostWithoutPort.endsWith('.localhost')) {
    const partsLocal = hostWithoutPort.split('.')
    if (partsLocal.length >= 2) {
      return partsLocal[0]
    }
  }

  // Split by dots
  const parts = hostWithoutPort.split('.')
  
  // If we have more than 2 parts, the first part is the subdomain
  if (parts.length > 2) {
    return parts[0]
  }
  
  // No subdomain
  return ''
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
