import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend health check failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'ok',
      backend: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking backend health:', error);
    return NextResponse.json(
      { 
        error: 'Backend connection failed',
        message: 'Backend service is not running or not accessible'
      },
      { status: 503 }
    );
  }
} 