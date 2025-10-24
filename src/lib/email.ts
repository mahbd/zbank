import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'

interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'box914.bluehost.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'test@automationsolutionz.com',
    pass: process.env.EMAIL_PASSWORD || 'will-be-provided-later'
  },
  tls: {
    ciphers: process.env.EMAIL_TLS_CIPHERS || 'SSLv3'
  }
})

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@automationsolutionz.com',
      to,
      subject,
      html,
      text
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to ZeuZ Bank!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to ZeuZ Bank, ${name}!</h1>
      <p>Thank you for joining ZeuZ Bank. Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Create virtual and physical cards</li>
        <li>Make secure payments</li>
        <li>Transfer money to other users</li>
        <li>Monitor your transactions</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The ZeuZ Bank Team</p>
    </div>
  `

  return await sendEmail({ to: email, subject, html })
}

export async function sendTransactionNotification(
  email: string,
  name: string,
  transactionType: string,
  amount: number,
  cardNumber: string
): Promise<boolean> {
  const subject = `Transaction Notification - ${transactionType}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Transaction Notification</h2>
      <p>Dear ${name},</p>
      <p>A transaction has been processed on your ZeuZ Bank account:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction Type:</strong> ${transactionType}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Card:</strong> **** **** **** ${cardNumber.slice(-4)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>If you did not authorize this transaction, please contact our support team immediately.</p>
      <p>Best regards,<br>The ZeuZ Bank Team</p>
    </div>
  `

  return await sendEmail({ to: email, subject, html })
}

export async function sendCardStatusChangeNotification(
  email: string,
  name: string,
  cardNumber: string,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  const subject = `Card Status Changed - ${cardNumber.slice(-4)}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Card Status Update</h2>
      <p>Dear ${name},</p>
      <p>Your card status has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Card:</strong> **** **** **** ${cardNumber.slice(-4)}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>If you have any questions about this change, please contact our support team.</p>
      <p>Best regards,<br>The ZeuZ Bank Team</p>
    </div>
  `

  return await sendEmail({ to: email, subject, html })
}

// OTP Functions
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createAndSendOTP(email: string, purpose: string = 'transfer'): Promise<string | null> {
  try {
    // Generate 6-digit OTP
    const otp = generateOTP()

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose,
        expiresAt,
      }
    })

    // Send OTP via email
    const success = await sendOTPEmail(email, otp, purpose)

    if (success) {
      return otp // Return OTP for testing purposes (in production, don't return it)
    }

    return null
  } catch (error) {
    console.error('Error creating OTP:', error)
    return null
  }
}

export async function verifyOTP(email: string, code: string, purpose: string = 'transfer'): Promise<boolean> {
  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        purpose,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return false
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    })

    return true
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return false
  }
}

export async function sendOTPEmail(email: string, otp: string, purpose: string = 'transfer'): Promise<boolean> {
  const subject = `ZeuZ Bank OTP - ${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Verification`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">ZeuZ Bank</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure Verification</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">One-Time Password (OTP)</h2>
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
          You requested a verification code for ${purpose === 'transfer' ? 'making a money transfer' : purpose}.
          Please use the following code to complete your verification:
        </p>

        <div style="background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </div>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Important:</strong> This OTP will expire in 5 minutes and can only be used once.
            Do not share this code with anyone.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you didn't request this verification, please ignore this email or contact our support team immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated message from ZeuZ Bank. Please do not reply to this email.</p>
          <p>© 2025 ZeuZ Bank. All rights reserved.</p>
        </div>
      </div>
    </div>
  `

  return await sendEmail({ to: email, subject, html })
}