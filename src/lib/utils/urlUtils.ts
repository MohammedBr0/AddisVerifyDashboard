/**
 * Get the current base URL dynamically
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use current window location
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

/**
 * Get the admin base URL
 */
export const getAdminBaseUrl = (): string => {
  const baseUrl = getBaseUrl()
  
  // Extract hostname from base URL
  const url = new URL(baseUrl)
  const hostname = url.hostname
  
  // Construct admin URL based on hostname
  if (hostname === 'localhost' || hostname.includes('localhost')) {
    // Development: use admin.localhost:8000
    return `${url.protocol}//admin.localhost:8000`
  } else {
    // Production: use admin subdomain
    return `${url.protocol}//admin.${hostname}${url.port ? `:${url.port}` : ''}`
  }
}

/**
 * Get the admin login URL
 */
export const getAdminLoginUrl = (): string => {
  const adminBaseUrl = getAdminBaseUrl()
  return `${adminBaseUrl}/admin/login`
}

/**
 * Get the regular login URL
 */
export const getLoginUrl = (): string => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/auth/login`
}

/**
 * Get the onboarding URL
 */
export const getOnboardingUrl = (): string => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/onboarding`
}
