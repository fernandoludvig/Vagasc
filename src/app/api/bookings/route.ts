import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { bookingSchema } from '@/lib/validations'

// GET /api/bookings - Listar reservas do usuário
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
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'client' ou 'host'

    const skip = (page - 1) * limit

    // Construir filtros baseado no tipo de usuário
    const where: Record<string, unknown> = {}
    
    if (type === 'host') {
      // Reservas das vagas do proprietário
      where.space = {
        ownerId: session.user.id
      }
    } else {
      // Reservas do cliente
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          space: {
            select: {
              id: true,
              title: true,
              address: true,
              images: true,
              pricePerHour: true,
              pricePerDay: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              type: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      db.booking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Erro ao buscar reservas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Verificar se a vaga existe e está ativa
    const space = await db.parkingSpace.findUnique({
      where: { id: validatedData.spaceId },
      select: {
        id: true,
        title: true,
        isActive: true,
        autoApprove: true,
        pricePerHour: true,
        pricePerDay: true,
        ownerId: true,
      }
    })

    if (!space) {
      return NextResponse.json(
        { message: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (!space.isActive) {
      return NextResponse.json(
        { message: 'Esta vaga não está disponível para reservas' },
        { status: 400 }
      )
    }

    // Verificar se não é o próprio proprietário
    if (space.ownerId === session.user.id) {
      return NextResponse.json(
        { message: 'Você não pode reservar sua própria vaga' },
        { status: 400 }
      )
    }

    // Verificar conflitos de horário
    const conflictingBooking = await db.booking.findFirst({
      where: {
        spaceId: validatedData.spaceId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            startDateTime: {
              lt: validatedData.endDateTime,
              gte: validatedData.startDateTime
            }
          },
          {
            endDateTime: {
              gt: validatedData.startDateTime,
              lte: validatedData.endDateTime
            }
          },
          {
            startDateTime: {
              lte: validatedData.startDateTime
            },
            endDateTime: {
              gte: validatedData.endDateTime
            }
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { message: 'Já existe uma reserva neste horário' },
        { status: 400 }
      )
    }

    // Calcular duração e valor total
    const durationMs = validatedData.endDateTime.getTime() - validatedData.startDateTime.getTime()
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
    
    let totalAmount = 0
    if (durationHours >= 24 && space.pricePerDay) {
      const days = Math.ceil(durationHours / 24)
      totalAmount = days * Number(space.pricePerDay)
    } else {
      totalAmount = durationHours * Number(space.pricePerHour)
    }

    // Taxa da plataforma (15%)
    const platformFee = totalAmount * 0.15
    const ownerAmount = totalAmount - platformFee

    // Determinar status baseado na configuração da vaga
    const status = space.autoApprove ? 'CONFIRMED' : 'PENDING'

    // Criar a reserva
    const booking = await db.booking.create({
      data: {
        spaceId: validatedData.spaceId,
        userId: session.user.id,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        totalAmount,
        platformFee,
        ownerAmount,
        status,
        specialRequests: validatedData.specialRequests,
        paymentStatus: 'PENDING',
      },
      include: {
        space: {
          select: {
            id: true,
            title: true,
            address: true,
            images: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar reserva:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('Erro de validação Zod:', error.message)
      return NextResponse.json(
        { 
          message: 'Dados inválidos', 
          details: error.message,
          type: 'validation_error'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        type: 'server_error'
      },
      { status: 500 }
    )
  }
}
