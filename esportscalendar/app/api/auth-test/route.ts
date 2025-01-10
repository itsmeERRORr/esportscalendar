import { NextResponse } from 'next/server'

export async function GET() {
  console.log('Auth test endpoint called')
  return NextResponse.json({ message: 'Auth test endpoint is working' })
}

