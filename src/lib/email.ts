import nodemailer from 'nodemailer'

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
  const subject = 'Welcome to ZBank!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to ZBank, ${name}!</h1>
      <p>Thank you for joining ZBank. Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Create virtual and physical cards</li>
        <li>Make secure payments</li>
        <li>Transfer money to other users</li>
        <li>Monitor your transactions</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The ZBank Team</p>
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
      <p>A transaction has been processed on your ZBank account:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction Type:</strong> ${transactionType}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Card:</strong> **** **** **** ${cardNumber.slice(-4)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>If you did not authorize this transaction, please contact our support team immediately.</p>
      <p>Best regards,<br>The ZBank Team</p>
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
      <p>Best regards,<br>The ZBank Team</p>
    </div>
  `

  return await sendEmail({ to: email, subject, html })
}