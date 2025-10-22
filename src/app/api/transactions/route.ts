import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { transactionSchema } from '@/lib/validations'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
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
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)
    const { cardId, ...transactionData } = body
    
    // Check if card exists and is active
    const card = await prisma.card.findUnique({
      where: { id: cardId }
    })
    
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    
    if (card.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }
    
    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        cardId: cardId,
        userId: card.userId,
        status: 'COMPLETED'
      }
    })
    
    // Update card balance for payments
    if (validatedData.type === 'PAYMENT' && validatedData.amount > 0) {
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
