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

    // Find users whose email or name matches the query (case-insensitive)
    const users = await prisma.$queryRaw`
      SELECT id, email, name
      FROM User
      WHERE (LOWER(email) LIKE LOWER(${`%${query}%`}) OR LOWER(name) LIKE LOWER(${`%${query}%`}))
      AND id != ${parseInt(session.user.id)}
      LIMIT 10
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
