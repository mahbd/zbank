import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transferSchema } from '@/lib/validations'
import { verifyOTP } from '@/lib/email'

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

    // Verify OTP before processing transfer
    const isOTPValid = await verifyOTP(session.user.email, validatedData.otp, 'transfer')
    if (!isOTPValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

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

    // Check if recipient has an active card (for card-to-card transfer)
    const recipientCards = await prisma.card.findMany({
      where: {
        userId: recipient.id,
        status: 'ACTIVE'
      }
    })

    // Determine which recipient card to use
    let recipientCard = null
    if (validatedData.recipientCardId) {
      // User specified which card to transfer to
      recipientCard = recipientCards.find(card => card.id === validatedData.recipientCardId!)
      if (!recipientCard) {
        return NextResponse.json({ error: 'Selected recipient card not found or not active' }, { status: 400 })
      }
    } else if (recipientCards.length === 1) {
      // Only one card, use it
      recipientCard = recipientCards[0]
    }
    // If multiple cards and no selection, recipientCard remains null (transfer to account balance)

    // Start transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create debit transaction for sender
      const debitTransaction = await tx.transaction.create({
        data: {
          amount: validatedData.amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description: `${validatedData.description}`,
          merchantName: recipient.name || recipient.email,
          category: 'Transfer',
          cardId: senderCard.id,
          userId: userId,
        }
      })

      // Update sender's card balance (debit)
      await tx.card.update({
        where: { id: senderCard.id },
        data: {
          balance: {
            decrement: validatedData.amount
          }
        }
      })

      let creditTransaction

      if (recipientCard) {
        // Card-to-card transfer: credit recipient's card
        creditTransaction = await tx.transaction.create({
          data: {
            amount: validatedData.amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
            description: `Transfer from ${userEmail}: ${validatedData.description}`,
            merchantName: userName,
            category: 'Transfer',
            cardId: recipientCard.id,
            userId: recipient.id,
          }
        })

        // Update recipient's card balance (credit)
        await tx.card.update({
          where: { id: recipientCard.id },
          data: {
            balance: {
              increment: validatedData.amount
            }
          }
        })
      } else {
        // Transfer to account balance (recipient has multiple cards or no active card)
        creditTransaction = await tx.transaction.create({
          data: {
            amount: validatedData.amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
            description: `Transfer from ${userEmail}: ${validatedData.description}`,
            merchantName: userName,
            category: 'Transfer',
            cardId: senderCard.id, // Reference sender's card for transaction history
            userId: recipient.id,
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
      }

      return { debitTransaction, creditTransaction, recipientCard: !!recipientCard, recipientCardsCount: recipientCards.length, selectedRecipientCard: recipientCard }
    })

    return NextResponse.json({
      message: result.recipientCard
        ? `Transfer completed successfully. Funds sent to recipient's ${result.selectedRecipientCard?.cardType?.toLowerCase() || 'card'}.`
        : result.recipientCardsCount > 1
        ? 'Transfer completed successfully. Funds sent to recipient\'s account balance (select a specific card to transfer directly to it).'
        : 'Transfer completed successfully. Funds sent to recipient\'s account balance.',
      transfer: {
        id: result.debitTransaction.id,
        amount: validatedData.amount,
        recipient: recipient.email,
        recipientCard: result.recipientCard,
        recipientCardsCount: result.recipientCardsCount,
        selectedRecipientCard: result.selectedRecipientCard ? {
          id: result.selectedRecipientCard.id,
          cardNumber: result.selectedRecipientCard.cardNumber,
          cardType: result.selectedRecipientCard.cardType,
          scheme: result.selectedRecipientCard.scheme
        } : null,
        transferType: result.recipientCard ? 'card-to-card' : 'account-balance',
        description: validatedData.description,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 })
  }
}