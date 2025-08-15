import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters
    const queryString = searchParams.toString()
    const url = queryString ? `${backendUrl}/admin/users?${queryString}` : `${backendUrl}/admin/users`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users data' },
      { status: 500 }
    )
  }
}
