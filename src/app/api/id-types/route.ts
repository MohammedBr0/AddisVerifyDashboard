import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend with proper headers
    const response = await fetch(`${BACKEND_URL}/api/id-types`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch ID types' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch ID types' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure we return the data in the expected format
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'ID types retrieved successfully'
    });
  } catch (error) {
    console.error('Error proxying ID types request:', error);
    
    // Return fallback ID types if backend is not available
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'ETH_PASSPORT',
          name: 'Ethiopian Passport',
          code: 'ETH_PASSPORT',
          requiresFront: true,
          requiresBack: false,
          requiresSelfie: true,
          description: 'Official Ethiopian passport'
        },
        {
          id: 'ETH_NATIONAL_ID',
          name: 'Ethiopian National ID',
          code: 'ETH_NATIONAL_ID',
          requiresFront: true,
          requiresBack: true,
          requiresSelfie: true,
          description: 'Ethiopian national identification card'
        },
        {
          id: 'ETH_DRIVERS_LICENSE',
          name: 'Ethiopian Driver\'s License',
          code: 'ETH_DRIVERS_LICENSE',
          requiresFront: true,
          requiresBack: true,
          requiresSelfie: true,
          description: 'Ethiopian driver\'s license'
        }
      ],
      message: 'Using fallback ID types'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/id-types`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create ID type' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to create ID type' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying ID type creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 