import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cardStatusSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cardStatusSchema.parse(body)

    // Check if card exists and belongs to the user
    const card = await prisma.card.findUnique({
      where: { id: params.id }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: { status: validatedData.status }
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update card status' }, { status: 500 })
  }
}
