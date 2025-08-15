import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters
    const queryString = searchParams.toString()
    const url = queryString ? `${backendUrl}/admin/tenants?${queryString}` : `${backendUrl}/admin/tenants`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'x-internal-request': '1',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin tenants API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants data' },
      { status: 500 }
    )
  }
}
