import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCardSchema } from '@/lib/validations'
import { generateCardNumber, generateCVV } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cards = await prisma.card.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      include: {
        user: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // Ensure all cards have required fields with defaults
    const sanitizedCards = cards.map(card => ({
      ...card,
      cardholderName: card.cardholderName || 'Card Holder',
      dailyLimit: card.dailyLimit || 1000,
      expiryDate: card.expiryDate || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
    }))

    return NextResponse.json(sanitizedCards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCardSchema.parse(body)

    const card = await prisma.card.create({
      data: {
        balance: 10000,
        cardNumber: generateCardNumber(),
        cardType: validatedData.cardType,
        scheme: validatedData.scheme,
        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years from now
        cvv: generateCVV(),
        isVirtual: validatedData.cardType === 'VIRTUAL',
        cardholderName: validatedData.cardholderName || session.user.name || 'Card Holder',
        creditLimit: validatedData.creditLimit,
        dailyLimit: validatedData.dailyLimit || 1000,
        pin: validatedData.pin,
        deliveryAddress: validatedData.deliveryAddress,
        deliveryCity: validatedData.deliveryCity,
        deliveryState: validatedData.deliveryState,
        deliveryZipCode: validatedData.deliveryZipCode,
        deliveryCountry: validatedData.deliveryCountry,
        userId: parseInt(session.user.id)
      }
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}
