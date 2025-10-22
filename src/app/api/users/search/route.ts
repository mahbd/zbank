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
    const query = searchParams.get('q')?.toLowerCase() || ''

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Find users whose email or name matches the query
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } }
            ]
          },
          {
            id: { not: session.user.id } // Exclude current user
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      take: 10 // Limit results
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
