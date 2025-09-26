import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/spaces/[id]/check-availability - Verificar disponibilidade em tempo real
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { startDateTime, endDateTime } = body

    if (!startDateTime || !endDateTime) {
      return NextResponse.json(
        { message: 'Data de início e fim são obrigatórias' },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateTime)
    const endDate = new Date(endDateTime)

    if (endDate <= startDate) {
      return NextResponse.json(
        { message: 'Data de fim deve ser posterior à data de início' },
        { status: 400 }
      )
    }

    // Verificar se a vaga existe e está ativa
    const space = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: {
        id: true,
        title: true,
        isActive: true,
        pricePerHour: true,
        pricePerDay: true,
      }
    })

    if (!space) {
      return NextResponse.json(
        { message: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (!space.isActive) {
      return NextResponse.json({
        available: false,
        reason: 'Esta vaga não está disponível para reservas',
        space: {
          id: space.id,
          title: space.title,
        }
      })
    }

    // Verificar conflitos com reservas existentes
    const conflictingBooking = await db.booking.findFirst({
      where: {
        spaceId: (await params).id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            startDateTime: {
              lt: endDate,
              gte: startDate
            }
          },
          {
            endDateTime: {
              gt: startDate,
              lte: endDate
            }
          },
          {
            startDateTime: {
              lte: startDate
            },
            endDateTime: {
              gte: endDate
            }
          }
        ]
      },
      select: {
        id: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({
        available: false,
        reason: 'Já existe uma reserva neste horário',
        conflict: {
          id: conflictingBooking.id,
          startDateTime: conflictingBooking.startDateTime,
          endDateTime: conflictingBooking.endDateTime,
          status: conflictingBooking.status,
        },
        space: {
          id: space.id,
          title: space.title,
        }
      })
    }

    // Verificar se há bloqueios de disponibilidade
    const blockedAvailability = await db.availability.findFirst({
      where: {
        spaceId: (await params).id,
        isBlocked: true,
        date: {
          gte: new Date(startDate.toDateString()),
          lte: new Date(endDate.toDateString()),
        },
        OR: [
          {
            startTime: {
              lt: endDate,
              gte: startDate
            }
          },
          {
            endTime: {
              gt: startDate,
              lte: endDate
            }
          }
        ]
      }
    })

    if (blockedAvailability) {
      return NextResponse.json({
        available: false,
        reason: 'Este horário está bloqueado pelo proprietário',
        space: {
          id: space.id,
          title: space.title,
        }
      })
    }

    // Calcular preço
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
    
    let totalAmount = 0
    if (durationHours >= 24 && space.pricePerDay) {
      const days = Math.ceil(durationHours / 24)
      totalAmount = days * Number(space.pricePerDay)
    } else {
      totalAmount = durationHours * Number(space.pricePerHour)
    }

    const platformFee = totalAmount * 0.15
    const ownerAmount = totalAmount - platformFee

    return NextResponse.json({
      available: true,
      space: {
        id: space.id,
        title: space.title,
      },
      pricing: {
        durationHours,
        totalAmount,
        platformFee,
        ownerAmount,
        pricePerHour: space.pricePerHour,
        pricePerDay: space.pricePerDay,
      },
      booking: {
        startDateTime: startDate,
        endDateTime: endDate,
      }
    })
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
