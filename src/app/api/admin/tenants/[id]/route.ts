import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const { id } = await params
    
    const response = await fetch(`${backendUrl}/admin/tenants/${id}`, {
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
    console.error('Admin tenant detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const { id } = await params
    const body = await request.json()
    
    const response = await fetch(`${backendUrl}/admin/tenants/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'x-internal-request': '1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin tenant update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}
