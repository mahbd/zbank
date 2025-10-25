import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, sendWelcomeEmail, sendTransactionNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type, email, name, transactionType, amount, cardNumber } = await request.json()

    let success = false

    switch (type) {
      case 'welcome':
        if (!email || !name) {
          return NextResponse.json({ error: 'Email and name are required for welcome emails' }, { status: 400 })
        }
        success = await sendWelcomeEmail(email, name)
        break

      case 'transaction':
        if (!email || !name || !transactionType || !amount || !cardNumber) {
          return NextResponse.json({
            error: 'Email, name, transactionType, amount, and cardNumber are required for transaction notifications'
          }, { status: 400 })
        }
        success = await sendTransactionNotification(email, name, transactionType, amount, cardNumber)
        break

      case 'custom':
        const { subject, html, text } = await request.json()
        if (!email || !subject || (!html && !text)) {
          return NextResponse.json({
            error: 'Email, subject, and either html or text content are required for custom emails'
          }, { status: 400 })
        }
        success = await sendEmail({ to: email, subject, html, text })
        break

      default:
        return NextResponse.json({ error: 'Invalid email type. Use: welcome, transaction, or custom' }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({ message: 'Email sent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}