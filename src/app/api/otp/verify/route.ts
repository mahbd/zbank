import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { code, purpose = 'transfer', email, otp } = await request.json()
    
    // For signin/signup, email is required instead of session
    const otpCode = code || otp
    
    if (!otpCode) {
      return NextResponse.json({ error: 'OTP code is required' }, { status: 400 })
    }

    let userEmail = email
    
    // For authenticated requests (like transfer), get email from session
    if (!userEmail) {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userEmail = session.user.email
    }

    // Verify OTP
    const isValid = await verifyOTP(userEmail, otpCode, purpose)

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