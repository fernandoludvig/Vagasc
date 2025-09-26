import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  type: z.enum(['SPACE_REVIEW', 'USER_REVIEW'])
})

// POST /api/reviews - Criar nova avaliação
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: {
        id: validatedData.bookingId,
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        space: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Reserva não encontrada ou não está completa' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma avaliação para esta reserva
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId: validatedData.bookingId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { message: 'Você já avaliou esta reserva' },
        { status: 400 }
      )
    }

    // Determinar o targetId baseado no tipo de avaliação
    let targetId: string
    if (validatedData.type === 'SPACE_REVIEW') {
      targetId = booking.space.ownerId
    } else {
      targetId = session.user.id
    }

    // Criar a avaliação
    const review = await prisma.review.create({
      data: {
        bookingId: validatedData.bookingId,
        spaceId: booking.spaceId,
        authorId: session.user.id,
        targetId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        type: validatedData.type
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        space: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // TODO: Implementar estatísticas da vaga quando campos estiverem no schema
    // await updateSpaceStats(booking.spaceId)

    return NextResponse.json({
      message: 'Avaliação criada com sucesso',
      review
    })

  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/reviews - Listar avaliações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (spaceId) where.spaceId = spaceId
    if (userId) where.targetId = userId
    if (type) where.type = type

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          space: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// TODO: Implementar quando campos estiverem no schema
// Função para atualizar estatísticas da vaga
// async function updateSpaceStats(spaceId: string) {
//   try {
//     const stats = await prisma.review.aggregate({
//       where: {
//         spaceId,
//         type: 'SPACE_REVIEW'
//       },
//       _avg: {
//         rating: true
//       },
//       _count: {
//         rating: true
//       }
//     })

//     const averageRating = stats._avg.rating || 0
//     const reviewCount = stats._count.rating || 0

//     // Atualizar a vaga com as novas estatísticas
//     await prisma.parkingSpace.update({
//       where: { id: spaceId },
//       data: {
//         averageRating: Math.round(averageRating * 10) / 10,
//         reviewCount
//       }
//     })
//   } catch (error) {
//     console.error('Erro ao atualizar estatísticas da vaga:', error)
//   }
// }
