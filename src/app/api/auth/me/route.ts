import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
		const accessToken = request.headers.get('x-stack-access-token') || ''

		const resp = await fetch(`${backendUrl}/auth/me`, {
			method: 'GET',
			headers: {
				'x-stack-access-token': accessToken,
				'Content-Type': 'application/json'
			}
		})

		const data = await resp.json()
		return NextResponse.json(data, { status: resp.status })
	} catch (error) {
		console.error('Proxy /api/auth/me error:', error)
		return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
	}
}
