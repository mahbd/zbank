import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's active cards
    const cards = await prisma.card.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        cardNumber: true,
        cardType: true,
        scheme: true,
        balance: true,
        cardholderName: true
      }
    })

    return NextResponse.json({
      user,
      cards
    })

  } catch (error) {
    console.error('Error fetching recipient cards:', error)
    return NextResponse.json({ error: 'Failed to fetch recipient cards' }, { status: 500 })
  }
}