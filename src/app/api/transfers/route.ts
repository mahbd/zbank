import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transferSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email
    const userName = session.user.name || session.user.email

    const body = await request.json()
    const validatedData = transferSchema.parse(body)

    // Check if sender's card exists and belongs to them
    const senderCard = await prisma.card.findUnique({
      where: { id: validatedData.cardId },
      include: { user: true }
    })

    if (!senderCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (senderCard.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (senderCard.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }

    // Check sufficient balance
    if (senderCard.balance < validatedData.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Find recipient user
    const recipient = await prisma.user.findUnique({
      where: { email: validatedData.recipientEmail }
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (recipient.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    // Start transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create debit transaction for sender
      const debitTransaction = await tx.transaction.create({
        data: {
          amount: validatedData.amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description: `Transfer to ${recipient.email}: ${validatedData.description}`,
          merchantName: recipient.name || recipient.email,
          category: 'Transfer',
          cardId: senderCard.id,
          userId: userId,
        }
      })

      // Create credit transaction for recipient (without card, as it's account credit)
      const creditTransaction = await tx.transaction.create({
        data: {
          amount: validatedData.amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description: `Transfer from ${userEmail}: ${validatedData.description}`,
          merchantName: userName,
          category: 'Transfer',
          cardId: senderCard.id, // Use sender's card for reference
          userId: recipient.id,
        }
      })

      // Update sender's card balance
      await tx.card.update({
        where: { id: senderCard.id },
        data: {
          balance: {
            decrement: validatedData.amount
          }
        }
      })

      // Update recipient's account balance
      await tx.user.update({
        where: { id: recipient.id },
        data: {
          balance: {
            increment: validatedData.amount
          }
        }
      })

      return { debitTransaction, creditTransaction }
    })

    return NextResponse.json({
      message: 'Transfer completed successfully',
      transfer: {
        id: result.debitTransaction.id,
        amount: validatedData.amount,
        recipient: recipient.email,
        description: validatedData.description,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 })
  }
}