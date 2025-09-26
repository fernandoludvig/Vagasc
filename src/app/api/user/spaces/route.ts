import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/user/spaces - Buscar vagas do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeStats = searchParams.get('includeStats') === 'true'

    const skip = (page - 1) * limit

    const [spaces, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where: {
          ownerId: session.user.id
        },
        include: {
          reviews: includeStats ? {
            select: {
              rating: true,
            }
          } : false,
          _count: includeStats ? {
            select: {
              bookings: true,
              reviews: true,
            }
          } : false,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.parkingSpace.count({
        where: {
          ownerId: session.user.id
        }
      })
    ])

    // Calcular estatísticas se solicitado
    const spacesWithStats = spaces.map(space => {
      const avgRating = space.reviews && space.reviews.length > 0 
        ? space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length
        : 0

      const reviewCount = space._count?.reviews || 0
      const bookingCount = space._count?.bookings || 0

      return {
        ...space,
        averageRating: includeStats ? Math.round(avgRating * 10) / 10 : 0,
        reviewCount,
        bookingCount,
        reviews: undefined, // Remover reviews do response
        _count: undefined, // Remover _count do response
      }
    })

    return NextResponse.json({
      spaces: spacesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Erro ao buscar vagas do usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
