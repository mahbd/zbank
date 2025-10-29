import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createAndSendOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { purpose = 'transfer', email } = await request.json()
    
    let userEmail = email
    
    // For authenticated requests (like transfer), get email from session
    if (!userEmail) {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userEmail = session.user.email
    }

    // Generate and send OTP
    const otp = await createAndSendOTP(userEmail, purpose)

    if (otp) {
      return NextResponse.json({
        message: 'OTP sent successfully',
        // In production, don't include the OTP in the response
        ...(process.env.NODE_ENV === 'development' && { otp })
      })
    } else {
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }
  } catch (error) {
    console.error('OTP generation error:', error)
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
  }
}