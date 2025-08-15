import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const idTypeId = searchParams.get('idTypeId');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    if (!idTypeId) {
      return NextResponse.json(
        { error: 'ID type ID is required' },
        { status: 400 }
      );
    }

    const { sessionId } = await params;

    const response = await fetch(`${BACKEND_URL}/client/tenant/kyc/public/session/${sessionId}/id-type?token=${token}&idTypeId=${idTypeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to update session ID type' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying session ID type update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
