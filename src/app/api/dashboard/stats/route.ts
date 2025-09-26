import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const [
      totalSpaces,
      totalBookings,
      totalEarnings,
      recentBookings,
      recentSpaces,
      reviews
    ] = await Promise.all([
      db.parkingSpace.count({
        where: { ownerId: userId }
      }),
      db.booking.count({
        where: { 
          space: { ownerId: userId },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }),
      db.booking.aggregate({
        where: { 
          space: { ownerId: userId },
          paymentStatus: 'PAID'
        },
        _sum: { ownerAmount: true }
      }),
      db.booking.findMany({
        where: { 
          space: { ownerId: userId }
        },
        include: {
          space: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      db.parkingSpace.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      db.review.findMany({
        where: {
          targetId: userId,
          type: 'USER_REVIEW'
        },
        select: { rating: true }
      })
    ])

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    return NextResponse.json({
      totalSpaces,
      totalBookings,
      totalEarnings: Number(totalEarnings._sum.ownerAmount || 0),
      averageRating,
      recentBookings,
      recentSpaces,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
