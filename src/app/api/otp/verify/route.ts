import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, purpose = 'transfer' } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'OTP code is required' }, { status: 400 })
    }

    // Verify OTP
    const isValid = await verifyOTP(session.user.email, code, purpose)

    if (isValid) {
      return NextResponse.json({ message: 'OTP verified successfully' })
    } else {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}