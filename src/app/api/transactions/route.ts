import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transactionSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      include: {
        card: true,
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = transactionSchema.parse(body)
    const { cardId, ...transactionData } = body

    // Define payment types that require balance validation
    const paymentTypes = ['PAYMENT', 'BILL_PAYMENT', 'MOBILE_RECHARGE', 'QR_PAYMENT', 'INTERNET_BILL', 'ELECTRICITY_BILL', 'GAS_BILL', 'WATER_BILL', 'CABLE_TV', 'INSURANCE', 'EDUCATION_FEES', 'HEALTHCARE', 'TRANSPORT']

    // Check if card exists, is active, and belongs to the user
    const card = await prisma.card.findUnique({
      where: { id: cardId }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (card.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }

    // Check sufficient balance for payments
    if (paymentTypes.includes(validatedData.type) && validatedData.amount > 0) {
      if (card.balance < validatedData.amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        cardId: cardId,
        userId: parseInt(session.user.id),
        status: 'COMPLETED'
      }
    })

    // Update card balance for payments
    if (paymentTypes.includes(validatedData.type) && validatedData.amount > 0) {
      await prisma.card.update({
        where: { id: cardId },
        data: {
          balance: {
            decrement: validatedData.amount
          }
        }
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
