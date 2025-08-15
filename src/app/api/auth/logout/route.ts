import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('Logout API route called')
  
  try {
    // Try to get backend URL from environment, fallback to localhost:3000
    // Also try different common ports if the default doesn't work
    let backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const accessToken = request.headers.get('x-stack-access-token') || ''
    
    console.log('Backend URL:', backendUrl)
    console.log('Access token present:', !!accessToken)

    if (!accessToken) {
      console.log('No access token provided')
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 })
    }

    const logoutUrl = `${backendUrl}/auth/logout`
    console.log('Calling backend logout URL:', logoutUrl)

    const resp = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'x-stack-access-token': accessToken,
        'Content-Type': 'application/json'
      }
    })

    console.log('Backend response status:', resp.status)

    if (!resp.ok) {
      const errorText = await resp.text()
      console.error('Backend logout failed:', errorText)
      // Don't return error, just log it and continue with frontend logout
      console.log('Continuing with frontend logout despite backend failure')
    } else {
      const data = await resp.json()
      console.log('Backend logout successful')
    }
    
    // Always return success since frontend logout will handle token clearing
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Proxy /api/auth/logout error:', error)
    // Don't return error, just log it and continue with frontend logout
    console.log('Continuing with frontend logout despite error')
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    }, { status: 200 })
  }
}

// Also handle GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Logout endpoint is working' }, { status: 200 })
}
