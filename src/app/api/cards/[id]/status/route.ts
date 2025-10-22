import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cardStatusSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = cardStatusSchema.parse(body)
    
    const card = await prisma.card.update({
      where: { id: params.id },
      data: { status: validatedData.status }
    })
    
    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update card status' }, { status: 500 })
  }
}
